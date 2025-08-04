require("dotenv").config();
const { HederaAIToolkit, AgentMode, hederaTools } = require('hedera-agent-kit');
const { Client, PrivateKey } = require('@hashgraph/sdk');

// Setup Hedera client
const client = Client.forTestnet().setOperator(
  process.env.HEDERA_ACCOUNT_ID,
  PrivateKey.fromStringECDSA(process.env.HEDERA_PRIVATE_KEY),
);

// Extract the four specific tools


// Initialize Hedera toolkit with selected tools (no LLM needed for direct tool calls)
const hederaAgentToolkit = new HederaAIToolkit({
  client,
  configuration: {
    tools: [
      
    ],
    context: {
      mode: AgentMode.AUTONOMOUS,
    },
  },
});

/**
 * Create a fungible token directly using the toolkit
 */
exports.createFungibleToken = async (req, res) => {
  try {
    const { name, symbol, decimals = 2, initialSupply = 1000, treasuryAccount } = req.body;

    if (!name || !symbol) {
      return res.status(400).json({ 
        error: "Token name and symbol are required" 
      });
    }

    // Get the tools from the toolkit
    const tools = hederaAgentToolkit.getTools();
    const createTokenTool = tools.find(tool => tool.name === 'create_fungible_token');

    if (!createTokenTool) {
      return res.status(500).json({ error: "Create token tool not found" });
    }

    // Call the tool directly without LLM
    const result = await createTokenTool.execute({
      name,
      symbol,
      decimals,
      initialSupply,
      treasuryAccount: treasuryAccount || process.env.HEDERA_ACCOUNT_ID
    });

    res.json({
      success: true,
      tokenId: result.tokenId,
      transactionId: result.transactionId,
      message: `Fungible token ${symbol} created successfully`
    });

  } catch (error) {
    res.status(500).json({
      error: "Token creation failed",
      details: error.message,
    });
  }
};

/**
 * Create a consensus topic
 */
exports.createTopic = async (req, res) => {
  try {
    const { memo, adminKey, submitKey } = req.body;

    // Get the tools from the toolkit
    const tools = hederaAgentToolkit.getTools();
    const createTopicTool = tools.find(tool => tool.name === 'create_topic');

    if (!createTopicTool) {
      return res.status(500).json({ error: "Create topic tool not found" });
    }

    // Call the tool directly without LLM
    const result = await createTopicTool.execute({
      memo: memo || `Topic created at ${new Date().toISOString()}`,
      adminKey,
      submitKey
    });

    res.json({
      success: true,
      topicId: result.topicId,
      transactionId: result.transactionId,
      message: "Consensus topic created successfully"
    });

  } catch (error) {
    res.status(500).json({
      error: "Topic creation failed",
      details: error.message,
    });
  }
};

/**
 * Submit a message to a consensus topic
 */
exports.submitTopicMessage = async (req, res) => {
  try {
    const { topicId, message } = req.body;

    if (!topicId || !message) {
      return res.status(400).json({ 
        error: "Topic ID and message are required" 
      });
    }

    // Get the tools from the toolkit
    const tools = hederaAgentToolkit.getTools();
    const submitMessageTool = tools.find(tool => tool.name === 'submit_topic_message');

    if (!submitMessageTool) {
      return res.status(500).json({ error: "Submit message tool not found" });
    }

    // Call the tool directly without LLM
    const result = await submitMessageTool.execute({
      topicId,
      message
    });

    res.json({
      success: true,
      transactionId: result.transactionId,
      topicId,
      message: "Message submitted to topic successfully"
    });

  } catch (error) {
    res.status(500).json({
      error: "Message submission failed",
      details: error.message,
    });
  }
};

/**
 * Get HBAR balance for an account
 */
exports.getHbarBalance = async (req, res) => {
  try {
    const { accountId } = req.query;

    if (!accountId) {
      return res.status(400).json({ 
        error: "Account ID is required" 
      });
    }

    // Get the tools from the toolkit
    const tools = hederaAgentToolkit.getTools();
    const balanceQueryTool = tools.find(tool => tool.name === 'get_hbar_balance');

    if (!balanceQueryTool) {
      return res.status(500).json({ error: "Balance query tool not found" });
    }

    // Call the tool directly without LLM
    const result = await balanceQueryTool.execute({
      accountId
    });

    res.json({
      success: true,
      accountId,
      balance: result.balance,
      unit: "HBAR",
      message: "Balance retrieved successfully"
    });

  } catch (error) {
    res.status(500).json({
      error: "Balance query failed",
      details: error.message,
    });
  }
};

/**
 * Get current account balance (for the configured account)
 */
exports.getMyBalance = async (req, res) => {
  try {
    const accountId = process.env.HEDERA_ACCOUNT_ID;

    // Get the tools from the toolkit
    const tools = hederaAgentToolkit.getTools();
    const balanceQueryTool = tools.find(tool => tool.name === 'get_hbar_balance');

    if (!balanceQueryTool) {
      return res.status(500).json({ error: "Balance query tool not found" });
    }

    // Call the tool directly without LLM
    const result = await balanceQueryTool.execute({
      accountId
    });

    res.json({
      success: true,
      accountId,
      balance: result.balance,
      unit: "HBAR",
      message: "Your balance retrieved successfully"
    });

  } catch (error) {
    res.status(500).json({
      error: "Balance query failed",
      details: error.message,
    });
  }
};

/**
 * Get available tools information
 */
exports.getAvailableTools = async (req, res) => {
  try {
    const tools = hederaAgentToolkit.getTools();
    
    const toolsInfo = tools.map(tool => ({
      name: tool.name,
      description: tool.description || "No description available",
      parameters: tool.parameters || {}
    }));

    res.json({
      success: true,
      tools: toolsInfo,
      count: tools.length,
      message: "Available Hedera tools retrieved successfully"
    });

  } catch (error) {
    res.status(500).json({
      error: "Failed to get tools information",
      details: error.message,
    });
  }
};