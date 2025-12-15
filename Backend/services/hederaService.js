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

      console.log('✅ Hedera Service client initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing Hedera Service client:', error.message);
      return null;
    }
  }
  return serviceClient;
};

/**
 * Creates a new Hedera account without initial balance (as per requirements)
 * @returns {Promise<{hederaPublicKey: string, hederaPrivateKey: string, hederaAccountId: string}>}
 */
module.exports.createHederaAccount = async () => {
  try {
    console.log('🔧 Creating new Hedera account...');

    const client = getServiceClient();
    if (!client) {
      throw new Error('Hedera service client not available');
    }

    // Generate new key pair
    const privateKey = PrivateKey.generate();
    const publicKey = privateKey.publicKey;

    // Create account without initial balance
    const transaction = new AccountCreateTransaction()
      .setKey(publicKey)
      .setInitialBalance(new Hbar(0)) // No initial balance as per requirements
      .setMaxAutomaticTokenAssociations(100) // Allow automatic token associations
      .setAccountMemo('TalentAI Company Account')
      .freezeWith(client);

    // Sign and execute transaction
    const signedTransaction = await transaction.sign(privateKey);
    const response = await signedTransaction.execute(client);
    const receipt = await response.getReceipt(client);

    const newAccountId = receipt.accountId;

    console.log(`✅ Hedera account created successfully: ${newAccountId}`);

    return {
      hederaAccountId: newAccountId.toString(),
      hederaPrivateKey: privateKey.toString(),
      hederaPublicKey: publicKey.toString(),
    };
  } catch (error) {
    console.error("❌ Error creating Hedera account:", error);
    throw new Error(`Failed to create Hedera account: ${error.message}`);
  }
};

/**
 * Legacy function for backward compatibility
 * @deprecated Use createHederaAccount instead
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
      .setInitialBalance(new Hbar(10)) // 10 HBAR per agent for profile creation + messages
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
