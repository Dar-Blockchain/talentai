require('dotenv').config();
const {HederaAgentKit} = require('hedera-agent-kit');
const { AccountId } = require('@hashgraph/sdk');

// Initialize Hedera Agent Kit
const kit = new HederaAgentKit(
  process.env.HEDERA_ACCOUNT_ID,
  process.env.HEDERA_PRIVATE_KEY,
  process.env.HEDERA_PUBLIC_KEY,
  process.env.HEDERA_NETWORK || 'testnet'
);

// Create Agent with DID capabilities
exports.createAgent = async (req, res) => {
  try {
    const agent = await kit.createAgent({
      type: 'autonomous',
      capabilities: ['did', 'tokens']
    });

    res.json({
      success: true,
      agent: {
        did: agent.did,
        publicKey: agent.publicKey,
        // Note: In production, never expose private keys in API responses
        privateKey: agent.privateKey 
      }
    });
  } catch (error) {
    res.status(500).json({ 
      error: "Agent creation failed",
      details: error.message 
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
