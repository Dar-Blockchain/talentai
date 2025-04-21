const { Client, PrivateKey, AccountCreateTransaction, Hbar } = require("@hashgraph/sdk");
const Agent = require("../models/AgentModel");

// Initialize Hedera client (replace with your credentials)
const client = Client.forTestnet();
client.setOperator(process.env.HEDERA_ACCOUNT_ID, process.env.HEDERA_PRIVATE_KEY);

/**
 * Creates a new Hedera wallet for the agent and saves it to the database.
 * @param {string} name - Name of the agent.
 * @returns {Promise<{agent: object}>}
 */
module.exports.createAgent = async (name) => {
  try {
    // Create Hedera wallet
    const newPrivateKey = PrivateKey.generate();
    const newPublicKey = newPrivateKey.publicKey;

    const transaction = new AccountCreateTransaction()
      .setKey(newPublicKey)
      .setInitialBalance(new Hbar(10));

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
      agent: {
        name: agent.name,
        accountId: agent.accountId,
        pubkey: agent.pubkey,
        // Note: In production, avoid returning the private key in responses.
        privkey: agent.privkey,
      },
    };
  } catch (error) {
    console.error("Error creating agent:", error);
    throw new Error("Failed to create agent");
  }
};
