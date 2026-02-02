require('dotenv').config();
const {
  Client,
  PrivateKey,
  AccountId,
  TransferTransaction,
  TokenId,
  Status
} = require('@hashgraph/sdk');
const TokenTransaction = require('../models/TokenTransactionModel');
const { TOKEN_TRANSACTION_TYPES, TOKEN_TRANSACTION_STATUS } = require('../constants/token-transaction.constants');

/**
 * Post Payment Service
 * Handles TAI token payments for post/agent creation
 */
class PostPaymentService {
  constructor() {
    this.client = null;
    this.adminAccountId = null;
    this.adminPrivateKey = null;
    this.taiTokenId = '0.0.6955317';
    this.isInitialized = false;

    // Pricing configuration
    this.BASE_FEE = parseInt(process.env.TAI_BASE_FEE || '1000', 10);
    this.STEP_RATE = parseInt(process.env.TAI_STEP_RATE || '100', 10);
  }

  /**
   * Initialize the service with Hedera client
   */
  async initialize() {
    try {
      if (this.isInitialized) {
        return;
      }

      console.log('🔧 Initializing Post Payment Service...');

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

      console.log(`✅ Post Payment Service initialized`);
      console.log(`📍 Admin Account: ${this.adminAccountId}`);
      console.log(`🏷️  TAI Token ID: ${this.taiTokenId}`);
      console.log(`💰 Base Fee: ${this.BASE_FEE} TAI`);
      console.log(`📊 Step Rate: ${this.STEP_RATE} TAI per step`);
      console.log(`🌐 Network: ${process.env.HEDERA_NETWORK}`);

      this.isInitialized = true;
    } catch (error) {
      console.error('❌ Failed to initialize Post Payment Service:', error.message);
      throw error;
    }
  }

  /**
   * Calculate payment amount based on number of pipeline steps
   * @param {number} numberOfSteps - Number of steps in the pipeline
   * @returns {number} Total TAI tokens required
   */
  calculatePrice(numberOfSteps) {
    // Allow 0 steps for manual posts (just charge base fee)
    if (numberOfSteps === undefined || numberOfSteps === null || numberOfSteps < 0) {
      throw new Error('Invalid number of steps');
    }

    const total = this.BASE_FEE + (numberOfSteps * this.STEP_RATE);

    console.log(`💡 Price Calculation:`);
    console.log(`   Base Fee: ${this.BASE_FEE} TAI`);
    console.log(`   Steps: ${numberOfSteps} × ${this.STEP_RATE} TAI = ${numberOfSteps * this.STEP_RATE} TAI`);
    console.log(`   Total: ${total} TAI`);

    return total;
  }

  /**
   * Transfer TAI tokens from company wallet to admin wallet
   * @param {string} companyAccountId - Company's Hedera account ID
   * @param {string} companyPrivateKey - Company's private key for signing
   * @param {number} tokenAmount - Amount of TAI tokens
   * @param {string} postId - Post ID for reference
   * @param {string} userId - User ID for database record
   * @returns {Promise<Object>} Transfer result with transaction details
   */
  async processPayment(companyAccountId, companyPrivateKey, tokenAmount, postId, userId) {
    let companyClient = null;

    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      console.log(`💰 Processing payment for Post ${postId}...`);
      console.log(`   Company: ${companyAccountId}`);
      console.log(`   Amount: ${tokenAmount} TAI`);

      const tokenId = TokenId.fromString(this.taiTokenId);
      const senderAccountId = AccountId.fromString(companyAccountId);
      const senderPrivateKey = PrivateKey.fromString(companyPrivateKey); // Auto-detects DER/ECDSA format
      const adminAccountId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);

      // Create client for company (NOT admin) to avoid signature mismatch
      console.log(`🔧 Creating Hedera client for company account...`);
      companyClient = process.env.HEDERA_NETWORK === 'mainnet'
        ? Client.forMainnet()
        : Client.forTestnet();

      companyClient.setOperator(senderAccountId, senderPrivateKey);

      // Convert token amount to smallest unit (8 decimals)
      const tokenAmountInSmallestUnit = Math.floor(tokenAmount * Math.pow(10, 8));

      // Create unique transaction ID
      const transactionId = `POST_${postId}_${Date.now()}`;

      // Create database record first (PENDING status)
      const dbTransaction = new TokenTransaction({
        userId: userId,
        transactionId: transactionId,
        type: TOKEN_TRANSACTION_TYPES.SPEND,
        amount: -tokenAmount, // Negative for spending
        status: TOKEN_TRANSACTION_STATUS.PENDING,
        description: `Agent creation payment for post ${postId}`,
        metadata: {
          postId: postId,
          numberOfSteps: Math.floor((tokenAmount - this.BASE_FEE) / this.STEP_RATE),
          baseFee: this.BASE_FEE,
          stepRate: this.STEP_RATE
        }
      });

      await dbTransaction.save();
      console.log(`📝 Database transaction created: ${transactionId}`);

      // Create Hedera token transfer transaction
      // Using company client means transaction is auto-signed and fee paid by company
      console.log(`🔄 Creating token transfer transaction...`);
      const transferTransaction = new TransferTransaction()
        .addTokenTransfer(tokenId, senderAccountId, -tokenAmountInSmallestUnit)
        .addTokenTransfer(tokenId, adminAccountId, tokenAmountInSmallestUnit)
        .setTransactionMemo(`Agent_Creation_${postId}`);

      // Execute transaction with company's client (auto-signed, fee paid by company)
      console.log(`⚡ Executing transaction with company client...`);
      const response = await transferTransaction.execute(companyClient);
      const receipt = await response.getReceipt(companyClient);

      if (receipt.status === Status.Success) {
        // Update database record to COMPLETED
        dbTransaction.status = TOKEN_TRANSACTION_STATUS.COMPLETED;
        dbTransaction.hederaTransactionHash = response.transactionId.toString();
        dbTransaction.completedAt = new Date();
        await dbTransaction.save();

        console.log(`✅ Payment successful: ${tokenAmount} TAI from ${companyAccountId} to Admin`);
        console.log(`   Hedera TX: ${response.transactionId.toString()}`);

        return {
          success: true,
          transactionId: transactionId,
          hederaTransactionId: response.transactionId.toString(),
          status: receipt.status.toString(),
          amount: tokenAmount,
          sender: companyAccountId,
          recipient: adminAccountId.toString(),
          postId: postId,
          dbRecordId: dbTransaction._id
        };
      } else {
        // Mark as failed in database
        dbTransaction.status = TOKEN_TRANSACTION_STATUS.FAILED;
        dbTransaction.failureReason = `Hedera transaction failed: ${receipt.status}`;
        await dbTransaction.save();

        throw new Error(`Payment failed: ${receipt.status}`);
      }
    } catch (error) {
      console.error(`❌ Payment processing failed:`, error.message);

      // Try to mark transaction as failed if it exists
      if (error.dbTransaction) {
        try {
          error.dbTransaction.status = TOKEN_TRANSACTION_STATUS.FAILED;
          error.dbTransaction.failureReason = error.message;
          await error.dbTransaction.save();
        } catch (dbError) {
          console.error('Failed to update transaction status:', dbError.message);
        }
      }

      throw error;
    } finally {
      // Always close company client to free resources
      if (companyClient) {
        try {
          companyClient.close();
          console.log(`🔌 Company Hedera client closed`);
        } catch (closeError) {
          console.error('Error closing company client:', closeError.message);
        }
      }
    }
  }

  /**
   * Get payment history for a post/company
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Payment history
   */
  async getPaymentHistory(userId, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        postId = null
      } = options;

      const query = {
        userId,
        type: TOKEN_TRANSACTION_TYPES.SPEND
      };

      if (postId) {
        query['metadata.postId'] = postId;
      }

      const skip = (page - 1) * limit;

      const [transactions, totalCount] = await Promise.all([
        TokenTransaction.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        TokenTransaction.countDocuments(query)
      ]);

      return {
        transactions,
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit)
      };
    } catch (error) {
      console.error('❌ Failed to get payment history:', error.message);
      throw error;
    }
  }

  /**
   * Close the Hedera client connection
   */
  close() {
    if (this.client) {
      this.client.close();
      console.log('🔌 Post Payment Service connection closed');
    }
  }
}

// Create singleton instance
const postPaymentService = new PostPaymentService();

module.exports = postPaymentService;
