const {
  Client,
  AccountId,
  PrivateKey,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TokenMintTransaction,
  Hbar
} = require('@hashgraph/sdk');
const crypto = require('crypto');
const axios = require('axios');

class HederaNFTController {
  constructor() {
    // Initialize properties but don't create Hedera client yet
    this.client = null;
    this.operatorAccountId = null;
    this.operatorPrivateKey = null;
    this.resumeTokenId = process.env.RESUME_TOKEN_ID || null;
    this.mirrorNodeApi = 'https://testnet.mirrornode.hedera.com/api/v1';
    this.hederaConfigured = false;
    this.initializationPromise = null;

    // Bind methods to maintain 'this' context
    this.createResumeNFT = this.createResumeNFT.bind(this);
    this.verifyResumeNFT = this.verifyResumeNFT.bind(this);
    this.getResumeNFTs = this.getResumeNFTs.bind(this);
  }

  // Lazy initialization of Hedera client
  async initializeHedera() {
    // Return existing promise if already initializing
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    // Return immediately if already configured
    if (this.hederaConfigured) {
      return Promise.resolve();
    }

    this.initializationPromise = this._performInitialization();
    return this.initializationPromise;
  }

  async _performInitialization() {
    try {
      // Check if environment variables are set
      if (!process.env.HEDERA_ACCOUNT_ID || !process.env.HEDERA_PRIVATE_KEY) {
        console.warn('⚠️  Hedera environment variables not set. NFT functionality will be disabled.');
        this.hederaConfigured = false;
        return;
      }

      // Initialize Hedera client with optimized settings
      this.client = Client.forTestnet();
      
      // Set operator account
      this.operatorAccountId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);
      this.operatorPrivateKey = PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY);
      
      this.client.setOperator(this.operatorAccountId, this.operatorPrivateKey);
      
      // Set client network timeout
      this.client.setNetworkTimeout(10000); // 10 seconds timeout
      
      this.hederaConfigured = true;
      console.log('✅ Hedera NFT client initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing Hedera NFT client:', error.message);
      this.hederaConfigured = false;
      throw error;
    }
  }

  // Ensure client is initialized before any operation
  async ensureInitialized() {
    if (!this.hederaConfigured) {
      await this.initializeHedera();
    }
    if (!this.hederaConfigured) {
      throw new Error('Hedera client is not configured. Please check your environment variables.');
    }
  }

  // Query Hedera Mirror Node for NFT metadata
  async queryNFTMetadata(tokenId, serial) {
    try {
      const response = await axios.get(
        `${this.mirrorNodeApi}/tokens/${tokenId}/nfts/${serial}`
      );
      return response.data;
    } catch (error) {
      console.error('❌ Error querying mirror node:', error.message);
      return null;
    }
  }

  // Decode NFT metadata from base64
  decodeMetadata(metadata) {
    try {
      if (!metadata) return null;
      
      // Convert from base64 to string
      const decodedString = Buffer.from(metadata, 'base64').toString('utf-8');
      return JSON.parse(decodedString);
    } catch (error) {
      console.error('❌ Error decoding metadata:', error.message);
      return null;
    }
  }

  // Create NFT token (run once to create the token collection)
  async createResumeToken() {
    try {
      const tokenCreateTx = new TokenCreateTransaction()
        .setTokenName('TalentAI Resume Verification')
        .setTokenSymbol('TAIRS')
        .setTokenType(TokenType.NonFungibleUnique)
        .setSupplyType(TokenSupplyType.Infinite)
        .setTreasuryAccountId(this.operatorAccountId)
        .setSupplyKey(this.operatorPrivateKey)
        .setAdminKey(this.operatorPrivateKey)
        .setFreezeDefault(false);

      const tokenCreateSubmit = await tokenCreateTx.execute(this.client);
      const tokenCreateReceipt = await tokenCreateSubmit.getReceipt(this.client);
      const tokenId = tokenCreateReceipt.tokenId;

      console.log('✅ Resume NFT Token created with ID:', tokenId.toString());
      return tokenId.toString();
    } catch (error) {
      console.error('❌ Error creating token:', error);
      throw error;
    }
  }

  // Enhanced resume hash with additional security
  generateResumeFingerprint(resumeData, userInfo) {
    // Extract only essential skills data instead of full resume
    const skillsData = resumeData
      .filter(section => section.type === 'skills')
      .map(section => section.skills)
      .flat();
    
    const essentialData = {
      skills: skillsData.slice(0, 5), // Limit to top 5 skills
      userInfo: {
        fullName: userInfo.fullName,
        email: userInfo.email,
        profession: userInfo.profession
      },
      timestamp: new Date().toISOString().split('T')[0] // Date only
    };
    
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(essentialData))
      .digest('hex');
  }

  // Create resume NFT
  async createResumeNFT(req, res) {
    try {
      console.log('🔄 Processing NFT creation request...');
      
      // Ensure Hedera client is initialized
      try {
        await this.ensureInitialized();
      } catch (error) {
        console.log('⚠️  Hedera initialization failed:', error.message);
        return res.status(503).json({
          success: false,
          message: 'Hedera blockchain service is not available. Please try again later.',
          details: error.message
        });
      }

      const { resumeData, userInfo } = req.body;
      
      if (!resumeData || !userInfo) {
        return res.status(400).json({
          success: false,
          message: 'Resume data and user info are required'
        });
      }

      console.log('📝 Creating NFT for user:', userInfo.fullName);

      // If no token ID exists, create one
      if (!this.resumeTokenId) {
        console.log('🔄 Creating new resume token collection...');
        this.resumeTokenId = await this.createResumeToken();
        console.log('📝 Note: Save this token ID to your .env file as RESUME_TOKEN_ID=' + this.resumeTokenId);
      }

      // Extract skills from resume data
      const skills = resumeData
        .filter(section => section.type === 'skills')
        .map(section => section.skills)
        .flat()
        .slice(0, 3); // Only top 3 skills

      // Generate compact resume fingerprint
      const resumeFingerprint = this.generateResumeFingerprint(resumeData, userInfo);

      // Create ultra-minimal metadata to fit Hedera's ~100 byte limit
      const minimalMetadata = {
        n: userInfo.fullName.substring(0, 20), // name (shortened)
        s: skills.join(',').substring(0, 30), // skills (shortened)
        h: resumeFingerprint.substring(0, 8), // hash (8 chars)
        d: new Date().toISOString().split('T')[0] // date
      };

      const metadataString = JSON.stringify(minimalMetadata);
      console.log('📏 Ultra-minimal metadata:', metadataString);
      console.log('📏 Metadata size:', metadataString.length, 'characters');

      // Convert to bytes for Hedera
      const metadataBytes = new TextEncoder().encode(metadataString);
      console.log('📏 Metadata bytes size:', metadataBytes.length, 'bytes');

      // Final check - if still too large, make it even smaller
      let finalMetadataBytes;
      if (metadataBytes.length > 95) {
        console.log('⚠️ Still too large, using absolute minimal metadata...');
        const absoluteMinimal = {
          n: userInfo.fullName.substring(0, 15),
          h: resumeFingerprint.substring(0, 6)
        };
        finalMetadataBytes = new TextEncoder().encode(JSON.stringify(absoluteMinimal));
        console.log('📏 Absolute minimal metadata:', JSON.stringify(absoluteMinimal));
        console.log('📏 Final size:', finalMetadataBytes.length, 'bytes');
      } else {
        finalMetadataBytes = metadataBytes;
      }

      // Mint NFT with ultra-compact metadata
      const mintTx = new TokenMintTransaction()
        .setTokenId(this.resumeTokenId)
        .setMetadata([finalMetadataBytes]);

      const mintSubmit = await mintTx.execute(this.client);
      const mintReceipt = await mintSubmit.getReceipt(this.client);
      
      if (!mintReceipt.serials || mintReceipt.serials.length === 0) {
        throw new Error('Failed to mint NFT');
      }

      const serial = mintReceipt.serials[0];
      const nftId = `${this.resumeTokenId}/${serial}`;
      
      // Generate multiple verification URLs
      const verificationUrls = {
        custom: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/resume-builder/verify/${nftId}`,
        hedera: `https://hashscan.io/testnet/token/${this.resumeTokenId}/${serial}`,
        mirror: `${this.mirrorNodeApi}/tokens/${this.resumeTokenId}/nfts/${serial}`
      };

      console.log('✅ NFT created successfully:', nftId);

      // Return comprehensive metadata in response (not stored on-chain)
      const responseMetadata = {
        name: `${userInfo.fullName} - Resume Verification`,
        description: `Blockchain-verified resume for ${userInfo.fullName}`,
        properties: {
          fullName: userInfo.fullName,
          profession: userInfo.profession || 'Professional',
          email: userInfo.email,
          skills: skills.join(', '),
          verificationDate: new Date().toISOString().split('T')[0],
          resumeFingerprint: resumeFingerprint.substring(0, 16),
          platform: 'TalentAI',
          version: '1.0'
        }
      };

      res.json({
        success: true,
        nftId: nftId,
        verificationUrl: verificationUrls.custom, // Primary URL for QR code
        verificationUrls: verificationUrls, // All available URLs
        metadata: responseMetadata, // Full metadata for frontend
        onChainMetadata: minimalMetadata, // What's actually stored on-chain
        message: 'Resume NFT created successfully on Hedera blockchain with ultra-compact metadata'
      });

    } catch (error) {
      console.error('❌ Error creating resume NFT:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create resume NFT: ' + error.message
      });
    }
  }

  // Enhanced verify resume NFT using Mirror Node API
  async verifyResumeNFT(req, res) {
    try {
      const { nftId } = req.params;
      
      if (!nftId || !nftId.includes('/')) {
        return res.status(400).json({
          success: false,
          message: 'Invalid NFT ID format. Expected format: tokenId/serial'
        });
      }

      // Parse token ID and serial from nftId
      const [tokenId, serial] = nftId.split('/');
      
      console.log('🔍 Verifying NFT:', { tokenId, serial });

      // Query Hedera Mirror Node for real verification
      const nftData = await this.queryNFTMetadata(tokenId, serial);
      
      if (!nftData) {
        return res.status(404).json({
          success: false,
          verified: false,
          message: 'NFT not found on Hedera blockchain'
        });
      }

      // Decode metadata
      const metadata = this.decodeMetadata(nftData.metadata);
      
      res.json({
        success: true,
        verified: true,
        metadata: metadata,
        nftData: {
          tokenId: nftData.token_id,
          serial: nftData.serial_number,
          accountId: nftData.account_id,
          createdTimestamp: nftData.created_timestamp,
          modifiedTimestamp: nftData.modified_timestamp
        },
        explorerUrls: {
          hedera: `https://hashscan.io/testnet/token/${tokenId}/${serial}`,
          mirror: `${this.mirrorNodeApi}/tokens/${tokenId}/nfts/${serial}`
        },
        message: 'Resume NFT verified successfully on Hedera blockchain'
      });

    } catch (error) {
      console.error('❌ Error verifying resume NFT:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify resume NFT: ' + error.message
      });
    }
  }

  // Get NFTs for a resume
  async getResumeNFTs(req, res) {
    try {
      const { resumeId } = req.params;
      
      // In a real implementation, query from database
      // const nfts = await NFT.find({ resumeId });
      
      res.json({
        success: true,
        nfts: [] // Return actual NFTs from database
      });

    } catch (error) {
      console.error('❌ Error fetching resume NFTs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch resume NFTs: ' + error.message
      });
    }
  }
}

// Create a single instance and export it
const hederaNFTController = new HederaNFTController();
module.exports = hederaNFTController; 