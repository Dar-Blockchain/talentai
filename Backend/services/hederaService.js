require("dotenv").config(); // Load .env file
const {
  Client,
  PrivateKey,
  AccountCreateTransaction,
  Hbar,
  Wallet,
  LocalProvider,
} = require("@hashgraph/sdk");

// Lazy client initialization for HederaService
let serviceClient = null;

const getServiceClient = () => {
  if (!serviceClient) {
    try {
      if (!process.env.HEDERA_ACCOUNT_ID || !process.env.HEDERA_PRIVATE_KEY) {
        console.warn('⚠️  Hedera Service: Environment variables not set.');
        return null;
      }
      
      serviceClient = Client.forTestnet(); // Use forMainnet() for production
      serviceClient.setOperator(
        process.env.HEDERA_ACCOUNT_ID,
        process.env.HEDERA_PRIVATE_KEY
      );
      serviceClient.setNetworkTimeout(10000);
      
      console.log('✅ Hedera Service client initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing Hedera Service client:', error.message);
      return null;
    }
  }
  return serviceClient;
};

/**
 * Creates a new Hedera wallet and returns the public and private keys.
 * @returns {Promise<{pubkey: string, privkey: string}>}
 */
module.exports.createHederaWallet = async () => {
  try {
    const provider = new LocalProvider(process.env.HEDERA_NETWORK);
    const wallet = new Wallet(
      process.env.HEDERA_ACCOUNT_ID,
      process.env.HEDERA_PRIVATE_KEY,
      provider
    );

    const privKey = PrivateKey.generate();
    const pubKey = privKey.publicKey;

    let transaction = await new AccountCreateTransaction()
      .setInitialBalance(new Hbar(1))
      .setKeyWithoutAlias(privKey.publicKey)
      .freezeWithSigner(wallet);

    transaction = await transaction.signWithSigner(wallet);
    const response = await transaction.executeWithSigner(wallet);
    const receipt = await response.getReceiptWithSigner(wallet);
    const newAccountId = receipt.accountId;

    return {
      pubkey: pubKey.toString(),
      privkey: privKey.toString(),
      accountId: newAccountId.toString(),
    };
  } catch (error) {
    console.error("Error creating Hedera wallet:", error);
    throw new Error("Failed to create Hedera wallet");
  }
};
