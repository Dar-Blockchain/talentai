require('dotenv').config(); // Load .env file
const { Client, PrivateKey, AccountCreateTransaction, AccountBalanceQuery, Hbar } = require("@hashgraph/sdk");

// Now process.env will include variables from .env
const client = Client.forTestnet(); // Use forMainnet() for production
client.setOperator(process.env.HEDERA_ACCOUNT_ID, process.env.HEDERA_PRIVATE_KEY);

/**
 * Creates a new Hedera wallet and returns the public and private keys.
 * @returns {Promise<{pubkey: string, privkey: string}>}
 */
module.exports.createHederaWallet = async () => {
  try {
    // Generate a new private key
    const newPrivateKey = PrivateKey.generate();
    const newPublicKey = newPrivateKey.publicKey;

    // Create a new account with the public key
    const transaction = new AccountCreateTransaction()
      .setKey(newPublicKey)
      .setInitialBalance(new Hbar(1)); // Initial balance in Hbar

    const response = await transaction.execute(client);
    const receipt = await response.getReceipt(client);
    const newAccountId = receipt.accountId;

    return {
      pubkey: newPublicKey.toString(),
      privkey: newPrivateKey.toString(),
      accountId: newAccountId.toString(),
    };
  } catch (error) {
    console.error("Error creating Hedera wallet:", error);
    throw new Error("Failed to create Hedera wallet");
  }
};
