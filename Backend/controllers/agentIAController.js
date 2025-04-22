require('dotenv').config();
const {HederaAgentKit} = require('hedera-agent-kit');
const { AccountId } = require('@hashgraph/sdk');
const agentService = require("../services/AgentService");
const Agent = require('../models/AgentModel');
const User = require('../models/UserModel');

// Initialize Hedera Agent Kit
const kit = new HederaAgentKit(
  process.env.HEDERA_ACCOUNT_ID,
  process.env.HEDERA_PRIVATE_KEY,
  process.env.HEDERA_PUBLIC_KEY,
  process.env.HEDERA_NETWORK || 'testnet'
);

// Create Agent
exports.createAgent = async (req, res) => {
  try {
    const { name } = req.body; // Agent name from request body

    if (!name) {
      return res.status(400).json({ error: "Agent name is required" });
    }

    const { agent } = await agentService.createAgent(name);

    res.json({
      success: true,
      agent,
    });
  } catch (error) {
    res.status(500).json({
      error: "Agent creation failed",
      details: error.message,
    });
  }
};

// Create Token using Agent Kit
exports.createToken = async (req, res) => {
  try {
    const { name, symbol, initialSupply } = req.body;
    
    const tokenResult = await kit.createToken({
      type: 'fungible',
      name,
      symbol,
      initialSupply: parseInt(initialSupply),
      treasury: process.env.HEDERA_ACCOUNT_ID
    });

    res.json({
      success: true,
      tokenId: tokenResult.tokenId,
      transactionId: tokenResult.transactionId
    });
  } catch (error) {
    res.status(500).json({ 
      error: "Token creation failed",
      details: error.message 
    });
  }
};

/**
 * Create TalentAI Token (TALAI) using the agent's credentials
 */
exports.createTalentAIToken = async (req, res) => {
  try {
    const { agentName } = req.body;

    if (!agentName) {
      return res.status(400).json({ error: "Agent name is required" });
    }

    // Fetch agent details from the database
    const agent = await Agent.findOne({ name: agentName });
    if (!agent) {
      return res.status(404).json({ error: "Agent not found" });
    }

    // Initialize HederaAgentKit with the agent's credentials
    const agentKit = new HederaAgentKit(
      agent.accountId,
      agent.privkey,
      agent.pubkey,
      process.env.HEDERA_NETWORK || 'testnet'
    );

    // Create TalentAI Token (TALAI)
    const tokenResult = await agentKit.createFT({
      type: 'fungible',
      name: 'TalentAI Token',
      symbol: 'TALAI',
      initialSupply: 1_000_000, // Initial supply
      treasury: agent.accountId // Use the agent's account as the treasury
    });

    // Optional: Mint additional tokens (example)
    // const mintResult = await agentKit.mintToken({
    //   tokenId: tokenResult.tokenId,
    //   amount: 100_000
    // });
    console.log(tokenResult.tokenId.toString());
    let tokenId = tokenResult.tokenId.toString();
    res.json({
      success: true,
      tokenId: tokenId,
      transactionId: tokenResult.transactionId,
      message: `TalentAI Token (TALAI) created by agent ${agentName}`,
      // mintTransactionId: mintResult?.transactionId // Uncomment if minting
    });
  } catch (error) {
    res.status(500).json({ 
      error: "TalentAI Token creation failed",
      details: error.message 
    });
  }
};

/**
 * Mint tokens to a user by agent
 */
exports.mintTokenToUser = async (req, res) => {
  try {
    const { agentName, userId, amount } = req.body;

    // Validate inputs
    if (!agentName || !userId || !amount) {
      return res.status(400).json({ error: "Agent name, user ID, and amount are required" });
    }

    // Fetch agent and user from database
    const [agent, user] = await Promise.all([
      Agent.findOne({ name: agentName }),
      User.findById(userId)
    ]);

    if (!agent) {
      return res.status(404).json({ error: "Agent not found" });
    }
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Initialize agent kit
    const agentKit = new HederaAgentKit(
      agent.accountId,
      agent.privkey,
      agent.pubkey,
      process.env.HEDERA_NETWORK || 'testnet'
    );

    // Mint tokens (assuming user.accountId exists in your User model)
    // const mintResult = await agentKit.mintToken(
    //   process.env.TALENTAI_TOKEN_ID, // Store this in .env
    //   new TextEncoder().encode("Metadata For Minted Token")
    // );
    // console.log(mintResult.transactionId);
  
    const recipients = [{ accountId:user.accountId, amount: amount }];
const airdropResult = await agentKit.airdropToken(process.env.TALENTAI_TOKEN_ID, recipients);
    res.json({
      success: true,
      transactionId: airdropResult.transactionId,
      message: `Minted ${amount} TALAI tokens to user ${userId}`,
      recipient: user.accountId
    });
  } catch (error) {
    res.status(500).json({ 
      error: "Token minting failed",
      details: error.message 
    });
  }
};
