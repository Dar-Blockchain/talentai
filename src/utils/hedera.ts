import {
  Client,
  AccountId,
  PrivateKey,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TokenMintTransaction,
  TransferTransaction,
  TokenAssociateTransaction,
  Hbar
} from '@hashgraph/sdk';

export interface ResumeNFTMetadata {
  name: string;
  description: string;
  image: string;
  properties: {
    fullName: string;
    profession: string;
    email: string;
    phone: string;
    verificationDate: string;
    resumeHash: string;
  };
}

export class HederaNFTService {
  private client: Client;
  private operatorAccountId: AccountId;
  private operatorPrivateKey: PrivateKey;

  constructor() {
    // Initialize with testnet - you should move these to environment variables
    this.client = Client.forTestnet();
    
    // You'll need to replace these with your actual Hedera account credentials
    this.operatorAccountId = AccountId.fromString(process.env.NEXT_PUBLIC_HEDERA_ACCOUNT_ID || '');
    this.operatorPrivateKey = PrivateKey.fromString(process.env.NEXT_PUBLIC_HEDERA_PRIVATE_KEY || '');
    
    this.client.setOperator(this.operatorAccountId, this.operatorPrivateKey);
  }

  async createResumeNFTToken(tokenName: string, tokenSymbol: string): Promise<string> {
    try {
      const tokenCreateTx = new TokenCreateTransaction()
        .setTokenName(tokenName)
        .setTokenSymbol(tokenSymbol)
        .setTokenType(TokenType.NonFungibleUnique)
        .setSupplyType(TokenSupplyType.Finite)
        .setMaxSupply(1000) // Maximum number of NFTs
        .setTreasuryAccountId(this.operatorAccountId)
        .setSupplyKey(this.operatorPrivateKey)
        .setAdminKey(this.operatorPrivateKey)
        .setFreezeDefault(false);

      const tokenCreateSubmit = await tokenCreateTx.execute(this.client);
      const tokenCreateReceipt = await tokenCreateSubmit.getReceipt(this.client);
      const tokenId = tokenCreateReceipt.tokenId;

      if (!tokenId) {
        throw new Error('Failed to create token');
      }

      return tokenId.toString();
    } catch (error) {
      console.error('Error creating NFT token:', error);
      throw error;
    }
  }

  async mintResumeNFT(tokenId: string, metadata: ResumeNFTMetadata): Promise<string> {
    try {
      // Convert metadata to bytes
      const metadataBytes = new TextEncoder().encode(JSON.stringify(metadata));

      const mintTx = new TokenMintTransaction()
        .setTokenId(tokenId)
        .setMetadata([metadataBytes]);

      const mintSubmit = await mintTx.execute(this.client);
      const mintReceipt = await mintSubmit.getReceipt(this.client);
      
      if (!mintReceipt.serials || mintReceipt.serials.length === 0) {
        throw new Error('Failed to mint NFT');
      }

      const serial = mintReceipt.serials[0];
      return `${tokenId}/${serial}`;
    } catch (error) {
      console.error('Error minting NFT:', error);
      throw error;
    }
  }

  async verifyResumeNFT(tokenId: string, serial: number): Promise<ResumeNFTMetadata | null> {
    try {
      // In a real implementation, you would query the Hedera network
      // for the NFT metadata. This is a simplified version.
      
      // For now, we'll return a placeholder - you'll need to implement
      // the actual verification logic using Hedera mirror node APIs
      return null;
    } catch (error) {
      console.error('Error verifying NFT:', error);
      return null;
    }
  }

  generateVerificationURL(tokenId: string, serial: string): string {
    // Generate URL that points to Hedera explorer or your verification page
    return `https://hashscan.io/testnet/token/${tokenId}/${serial}`;
  }
}

export const hederaService = new HederaNFTService(); 