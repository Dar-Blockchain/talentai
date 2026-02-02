require('dotenv').config();
const {
  Client,
  PrivateKey,
  AccountId,
  TokenAssociateTransaction,
  TransferTransaction,
  TokenId,
  Hbar,
  Status
} = require('@hashgraph/sdk');

/**
 * TAI Token Distribution Service
 * Handles distribution of TAI tokens from admin account to user accounts
 */
class TaiTokenDistributionService {
  constructor() {
    this.client = null;
    this.adminAccountId = null;
    this.adminPrivateKey = null;
    this.taiTokenId = '0.0.6955317';
    this.isInitialized = false;
  }

  /**
   * Initialize the service with Hedera client
   */
  async initialize() {
    try {
      if (this.isInitialized) {
        return;
      }

      console.log('🔧 Initializing TAI Token Distribution Service...');

      // Validate environment variables
      if (!process.env.HEDERA_ACCOUNT_ID || !process.env.HEDERA_PRIVATE_KEY) {
        throw new Error('Missing Hedera credentials in environment variables');
      }

      // Initialize Hedera client
      this.client = process.env.HEDERA_NETWORK === 'mainnet'
        ? Client.forMainnet()
        : Client.forTestnet();

      this.adminAccountId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);
      this.adminPrivateKey = PrivateKey.fromStringECDSA(process.env.HEDERA_PRIVATE_KEY);

      this.client.setOperator(this.adminAccountId, this.adminPrivateKey);

      console.log(`✅ TAI Distribution Service initialized`);
      console.log(`📍 Admin Account: ${this.adminAccountId}`);
      console.log(`🏷️  TAI Token ID: ${this.taiTokenId}`);
      console.log(`🌐 Network: ${process.env.HEDERA_NETWORK}`);

      this.isInitialized = true;
    } catch (error) {
      console.error('❌ Failed to initialize TAI Distribution Service:', error.message);
      throw error;
    }
  }

  /**
   * Associate TAI token with user account (required before receiving tokens)
   * @param {string} userAccountId - User's Hedera account ID
   * @param {string} userPrivateKey - User's private key for signing
   * @returns {Promise<Object>} Association result
   */
  async associateTokenWithAccount(userAccountId, userPrivateKey) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      console.log(`🔗 Associating TAI token with account ${userAccountId}...`);

      const userKey = PrivateKey.fromStringECDSA(userPrivateKey);
      const tokenId = TokenId.fromString(this.taiTokenId);

      // Create a temporary client without operator for user-only signed transaction
      const tempClient = process.env.HEDERA_NETWORK === 'mainnet'
        ? Client.forMainnet()
        : Client.forTestnet();

      // Create token association transaction (must be signed only by user, not operator)
      const associateTransaction = new TokenAssociateTransaction()
        .setAccountId(userAccountId)
        .setTokenIds([tokenId])
        .freezeWith(tempClient);

      // Sign with user's private key
      const signedTransaction = await associateTransaction.sign(userKey);

      // Execute transaction
      const response = await signedTransaction.execute(tempClient);
      const receipt = await response.getReceipt(tempClient);

      // Close temporary client
      tempClient.close();

      if (receipt.status === Status.Success) {
        console.log(`✅ Token association successful for ${userAccountId}`);
        return {
          success: true,
          transactionId: response.transactionId.toString(),
          status: receipt.status.toString()
        };
      } else {
        throw new Error(`Token association failed: ${receipt.status}`);
      }
    } catch (error) {
      console.error(`❌ Token association failed for ${userAccountId}:`, error.message);

      // Check if token is already associated
      if (error.message.includes('TOKEN_ALREADY_ASSOCIATED_TO_ACCOUNT')) {
        console.log(`ℹ️  Token already associated with ${userAccountId}`);
        return {
          success: true,
          alreadyAssociated: true,
          message: 'Token already associated with account'
        };
      }

      throw error;
    }
  }

  /**
   * Transfer TAI tokens from admin account to user account
   * @param {string} userAccountId - Recipient account ID
   * @param {number} tokenAmount - Amount of TAI tokens (with decimals)
   * @param {string} memo - Transaction memo
   * @returns {Promise<Object>} Transfer result
   */
  async transferTokensToUser(userAccountId, tokenAmount, memo = '') {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      console.log(`💰 Transferring ${tokenAmount} TAI tokens to ${userAccountId}...`);

      const tokenId = TokenId.fromString(this.taiTokenId);
      const recipientAccountId = AccountId.fromString(userAccountId);

      // Convert token amount to smallest unit (considering 8 decimals)
      const tokenAmountInSmallestUnit = Math.floor(tokenAmount * Math.pow(10, 8));

      // Create transfer transaction
      const transferTransaction = new TransferTransaction()
        .addTokenTransfer(tokenId, this.adminAccountId, -tokenAmountInSmallestUnit)
        .addTokenTransfer(tokenId, recipientAccountId, tokenAmountInSmallestUnit)
        .setTransactionMemo(memo)
        .freezeWith(this.client);

      // Sign with admin private key
      const signedTransaction = await transferTransaction.sign(this.adminPrivateKey);

      // Execute transaction
      const response = await signedTransaction.execute(this.client);
      const receipt = await response.getReceipt(this.client);

      if (receipt.status === Status.Success) {
        console.log(`✅ Token transfer successful: ${tokenAmount} TAI to ${userAccountId}`);
        return {
          success: true,
          transactionId: response.transactionId.toString(),
          status: receipt.status.toString(),
          amount: tokenAmount,
          recipient: userAccountId,
          memo: memo
        };
      } else {
        throw new Error(`Token transfer failed: ${receipt.status}`);
      }
    } catch (error) {
      console.error(`❌ Token transfer failed to ${userAccountId}:`, error.message);
      throw error;
    }
  }

  /**
   * Transfer HBAR for gas fees to user account
   * @param {string} userAccountId - Recipient account ID
   * @param {number} hbarAmount - Amount of HBAR for gas fees
   * @param {string} memo - Transaction memo
   * @returns {Promise<Object>} Transfer result
   */
  async transferGasFeeToUser(userAccountId, hbarAmount, memo = '') {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      console.log(`⛽ Transferring ${hbarAmount} HBAR as gas fee to ${userAccountId}...`);

      const recipientAccountId = AccountId.fromString(userAccountId);
      const hbarAmountInTinybars = new Hbar(hbarAmount);

      // Create HBAR transfer transaction
      const transferTransaction = new TransferTransaction()
        .addHbarTransfer(this.adminAccountId, hbarAmountInTinybars.negated())
        .addHbarTransfer(recipientAccountId, hbarAmountInTinybars)
        .setTransactionMemo(memo)
        .freezeWith(this.client);

      // Sign with admin private key
      const signedTransaction = await transferTransaction.sign(this.adminPrivateKey);

      // Execute transaction
      const response = await signedTransaction.execute(this.client);
      const receipt = await response.getReceipt(this.client);

      if (receipt.status === Status.Success) {
        console.log(`✅ Gas fee transfer successful: ${hbarAmount} HBAR to ${userAccountId}`);
        return {
          success: true,
          transactionId: response.transactionId.toString(),
          status: receipt.status.toString(),
          amount: hbarAmount,
          recipient: userAccountId,
          memo: memo
        };
      } else {
        throw new Error(`Gas fee transfer failed: ${receipt.status}`);
      }
    } catch (error) {
      console.error(`❌ Gas fee transfer failed to ${userAccountId}:`, error.message);
      throw error;
    }
  }

  /**
   * Complete distribution process (associate token + transfer tokens + transfer gas fee)
   * @param {string} userAccountId - User's Hedera account ID
   * @param {string} userPrivateKey - User's private key
   * @param {number} tokenAmount - Amount of TAI tokens
   * @param {number} gasFeeAmount - Amount of HBAR for gas fees
   * @param {string} transactionId - Original payment transaction ID
   * @returns {Promise<Object>} Complete distribution result
   */
  async completeDistribution(userAccountId, userPrivateKey, tokenAmount, gasFeeAmount, transactionId) {
    try {
      console.log(`🚀 Starting complete distribution for ${userAccountId}...`);
      console.log(`📊 Token Amount: ${tokenAmount} TAI`);
      console.log(`⛽ Gas Fee: ${gasFeeAmount} HBAR`);

      const results = {
        userAccountId,
        tokenAmount,
        gasFeeAmount,
        transactionId,
        steps: {}
      };

      // Step 1: Associate token with account
      try {
        console.log('📋 Step 1: Associating TAI token...');
        const associationResult = await this.associateTokenWithAccount(userAccountId, userPrivateKey);
        results.steps.tokenAssociation = associationResult;
      } catch (error) {
        console.error('❌ Token association failed:', error.message);
        results.steps.tokenAssociation = { success: false, error: error.message };
        // Continue with transfer even if association fails (might already be associated)
      }

      // Step 2: Transfer TAI tokens
      console.log('💰 Step 2: Transferring TAI tokens...');
      const tokenTransferResult = await this.transferTokensToUser(
        userAccountId,
        tokenAmount,
        `TAI_Distribution_${transactionId}`
      );
      results.steps.tokenTransfer = tokenTransferResult;

      // Step 3: Transfer gas fee HBAR
      console.log('⛽ Step 3: Transferring gas fee...');
      const gasFeeTransferResult = await this.transferGasFeeToUser(
        userAccountId,
        gasFeeAmount,
        `Gas_Fee_${transactionId}`
      );
      results.steps.gasFeeTransfer = gasFeeTransferResult;

      // Check overall success
      const allSuccessful =
        tokenTransferResult.success &&
        gasFeeTransferResult.success;

      results.success = allSuccessful;
      results.completedAt = new Date().toISOString();

      if (allSuccessful) {
        console.log(`🎉 Distribution completed successfully for ${userAccountId}`);
      } else {
        console.log(`⚠️  Distribution partially completed for ${userAccountId}`);
      }

      return results;
    } catch (error) {
      console.error(`❌ Distribution failed for ${userAccountId}:`, error.message);
      throw error;
    }
  }

  /**
   * Get admin account TAI token balance
   * @returns {Promise<number>} TAI token balance
   */
  async getAdminTokenBalance() {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // This would require implementing a balance query
      // For now, return a placeholder
      console.log('📊 Checking admin TAI token balance...');
      return 0; // Placeholder - implement actual balance query
    } catch (error) {
      console.error('❌ Failed to get admin token balance:', error.message);
      throw error;
    }
  }

  /**
   * Close the Hedera client connection
   */
  close() {
    if (this.client) {
      this.client.close();
      console.log('🔌 TAI Distribution Service connection closed');
    }
  }
}

// Create singleton instance
const taiTokenDistributionService = new TaiTokenDistributionService();

module.exports = taiTokenDistributionService;