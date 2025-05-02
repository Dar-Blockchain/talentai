require('dotenv').config();
const { Client, PrivateKey, AccountCreateTransaction, Hbar } = require('@hashgraph/sdk');
const Agent = require("../models/AgentModel");

// Initialize Hedera client (replace with your credentials)
const client = Client.forTestnet();
client.setOperator(process.env.HEDERA_ACCOUNT_ID, process.env.HEDERA_PRIVATE_KEY);



/**
 * createAgent creates a new agent using the Hedera SDK and stores it in the database
 * @param {object} operatorClient - the operator client from Hedera
 * @param {number} initialHbar - initial balance for the agent (default 50 HBAR)
 * @returns {object} The newly created agent object
 */


/**
 * getAgentByName returns the agent with the specified name from the database
 * @param {string} name - the name of the agent
 * @returns {object|null} The agent object if found, otherwise null
 */
async function getAgentByName(name) {
  try {
    // Query the database for agent by name
    const agent = await Agent.findOne({ name });
    if (!agent) {
      console.log(`Agent with name ${name} not found`);
      return null;
    }
    return agent;
  } catch (error) {
    console.error('Error finding agent by name:', error);
    throw error;
  }
}

/**
 * Creates a new Hedera wallet for the agent and saves it to the database.
 * @param {string} name - Name of the agent.
 * @returns {Promise<{agent: object}>}
 */
async function createAgent(name)  {
  try {
    // Create Hedera wallet
    const newPrivateKey = PrivateKey.generate();
    const newPublicKey = newPrivateKey.publicKey;

    
    const transaction = new AccountCreateTransaction()
      .setKey(newPublicKey)
      .setInitialBalance(new Hbar(1));

    const response = await transaction.execute(client);
    const receipt = await response.getReceipt(client);
    const accountId = receipt.accountId.toString();

    // Save agent to database
    const agent = new Agent({
      name,
      accountId,
      privkey: newPrivateKey.toString(),
      pubkey: newPublicKey.toString(),
    });

    await agent.save();

    return {
        name: agent.name,
        accountId: agent.accountId,
        pubkey: agent.pubkey,
        // Note: In production, avoid returning the private key in responses.
        privkey: agent.privkey
      
    };
  } catch (error) {
    console.error("Error creating agent:", error);
    throw new Error("Failed to create agent");
  }
};

module.exports = { createAgent,getAgentByName };
