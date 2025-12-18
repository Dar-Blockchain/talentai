require('dotenv').config();
const {
  Client,
  PrivateKey,
  AccountId,
  TransferTransaction,
  TokenId,
  Status
} = require('@hashgraph/sdk');
const Agent = require('../../models/AgentModel');
const TokenTransaction = require('../../models/TokenTransactionModel');
const { TOKEN_TRANSACTION_TYPES, TOKEN_TRANSACTION_STATUS } = require('../../constants/tokenTransactionConstants');

/**
 * Agent Funding Service
 * Handles initial TAI token funding for newly created agents
 */
class AgentFundingService {
  constructor() {
    this.client = null;
    this.adminAccountId = null;
    this.adminPrivateKey = null;
    this.taiTokenId = '0.0.6955317';
    this.isInitialized = false;

    // Initial funding amount for new agents (10,000 TAI)
    this.INITIAL_FUNDING_AMOUNT = parseInt(process.env.AGENT_INITIAL_FUNDING || '10000', 10);
  }

  /**
   * Initialize the service with Hedera client
   */
  async initialize() {
    try {
      if (this.isInitialized) {
        return;
      }

      console.log('🔧 Initializing Agent Funding Service...');

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

      console.log(`✅ Agent Funding Service initialized`);
      console.log(`📍 Admin Account: ${this.adminAccountId}`);
      console.log(`🏷️  TAI Token ID: ${this.taiTokenId}`);
      console.log(`💰 Initial Funding Amount: ${this.INITIAL_FUNDING_AMOUNT} TAI`);
      console.log(`🌐 Network: ${process.env.HEDERA_NETWORK}`);

      this.isInitialized = true;
    } catch (error) {
      console.error('❌ Failed to initialize Agent Funding Service:', error.message);
      throw error;
    }
  }

  /**
   * Fund a newly created agent with initial TAI tokens
   * @param {string} agentId - MongoDB Agent ID
   * @param {string} agentAccountId - Agent's Hedera account ID
   * @param {string} userId - User ID (company) for database record
   * @returns {Promise<Object>} Funding result with transaction details
   */
  async fundNewAgent(agentId, agentAccountId, userId) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      console.log(`💰 Funding new agent ${agentId}...`);
      console.log(`   Agent Account: ${agentAccountId}`);
      console.log(`   Amount: ${this.INITIAL_FUNDING_AMOUNT} TAI`);

      const tokenId = TokenId.fromString(this.taiTokenId);
      const recipientAccountId = AccountId.fromString(agentAccountId);

      // Convert token amount to smallest unit (8 decimals)
      const tokenAmountInSmallestUnit = Math.floor(this.INITIAL_FUNDING_AMOUNT * Math.pow(10, 8));

      // Create unique transaction ID
      const transactionId = `AGENT_FUNDING_${agentId}_${Date.now()}`;

      // Create database record first (PENDING status)
      const dbTransaction = new TokenTransaction({
        userId: userId,
        transactionId: transactionId,
        type: TOKEN_TRANSACTION_TYPES.INITIAL_FUNDING,
        amount: this.INITIAL_FUNDING_AMOUNT, // Positive for receiving
        status: TOKEN_TRANSACTION_STATUS.PENDING,
        description: `Initial funding for agent ${agentId}`,
        metadata: {
          agentId: agentId,
          agentAccountId: agentAccountId,
          initialFundingAmount: this.INITIAL_FUNDING_AMOUNT
        }
      });

      await dbTransaction.save();
      console.log(`📝 Database transaction created: ${transactionId}`);

      // Create Hedera token transfer transaction (admin → agent)
      console.log(`🔄 Creating token transfer transaction...`);
      const transferTransaction = new TransferTransaction()
        .addTokenTransfer(tokenId, this.adminAccountId, -tokenAmountInSmallestUnit)
        .addTokenTransfer(tokenId, recipientAccountId, tokenAmountInSmallestUnit)
        .setTransactionMemo(`Agent_Initial_Funding_${agentId}`);

      // Execute transaction with admin client (admin pays fees)
      console.log(`⚡ Executing transaction with admin client...`);
      const response = await transferTransaction.execute(this.client);
      const receipt = await response.getReceipt(this.client);

      if (receipt.status === Status.Success) {
        // Update database record to COMPLETED
        dbTransaction.status = TOKEN_TRANSACTION_STATUS.COMPLETED;
        dbTransaction.hederaTransactionHash = response.transactionId.toString();
        dbTransaction.completedAt = new Date();
        await dbTransaction.save();

        // Update agent's TAI token balance
        await Agent.findByIdAndUpdate(agentId, {
          taiTokenBalance: this.INITIAL_FUNDING_AMOUNT
        });

        console.log(`✅ Agent funded successfully: ${this.INITIAL_FUNDING_AMOUNT} TAI to ${agentAccountId}`);
        console.log(`   Hedera TX: ${response.transactionId.toString()}`);

        return {
          success: true,
          transactionId: transactionId,
          hederaTransactionId: response.transactionId.toString(),
          status: receipt.status.toString(),
          amount: this.INITIAL_FUNDING_AMOUNT,
          sender: this.adminAccountId.toString(),
          recipient: agentAccountId,
          agentId: agentId,
          dbRecordId: dbTransaction._id
        };
      } else {
        // Mark as failed in database
        dbTransaction.status = TOKEN_TRANSACTION_STATUS.FAILED;
        dbTransaction.failureReason = `Hedera transaction failed: ${receipt.status}`;
        await dbTransaction.save();

        throw new Error(`Funding failed: ${receipt.status}`);
      }
    } catch (error) {
      console.error(`❌ Agent funding failed:`, error.message);
      throw error;
    }
  }

  /**
   * Check if an agent has sufficient balance
   * @param {string} agentId - MongoDB Agent ID
   * @param {number} requiredAmount - Required TAI amount
   * @returns {Promise<boolean>} True if agent has sufficient balance
   */
  async hasSufficientBalance(agentId, requiredAmount) {
    try {
      const agent = await Agent.findById(agentId);
      if (!agent) {
        throw new Error('Agent not found');
      }

      const balance = agent.taiTokenBalance || 0;
      console.log(`💰 Agent ${agentId} balance: ${balance} TAI (required: ${requiredAmount} TAI)`);

      return balance >= requiredAmount;
    } catch (error) {
      console.error(`❌ Error checking agent balance:`, error.message);
      throw error;
    }
  }

  /**
   * Get agent's current TAI token balance
   * @param {string} agentId - MongoDB Agent ID
   * @returns {Promise<number>} Current balance
   */
  async getAgentBalance(agentId) {
    try {
      const agent = await Agent.findById(agentId);
      if (!agent) {
        throw new Error('Agent not found');
      }

      return agent.taiTokenBalance || 0;
    } catch (error) {
      console.error(`❌ Error getting agent balance:`, error.message);
      throw error;
    }
  }
}

// Export singleton instance
module.exports = new AgentFundingService();
