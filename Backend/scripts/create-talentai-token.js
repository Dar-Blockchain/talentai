#!/usr/bin/env node

/**
 * TalentAI Token Creation Script
 *
 * Creates a new Hedera fungible token "TalentAI" (TAI) with:
 * - Token Name: TalentAI
 * - Token Symbol: TAI
 * - Total Supply: 1,000,000,000 (1 billion tokens)
 * - Decimals: 8
 * - All tokens minted to operator account
 *
 * Usage: node scripts/createTalentAIToken.js
 * Or: npm run create-token
 */

require('dotenv').config();
const {
  Client,
  PrivateKey,
  AccountId,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TokenInfoQuery,
  AccountBalanceQuery,
  Hbar
} = require('@hashgraph/sdk');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Token configuration
const TOKEN_CONFIG = {
  name: 'TalentAI',
  symbol: 'TAI',
  decimals: 8,
  totalSupply: 1_000_000_000, // 1 billion tokens
  description: 'TalentAI platform utility token for AI-powered recruitment and talent management'
};

/**
 * Logs a message with color and timestamp
 */
function log(message, color = colors.reset) {
  const timestamp = new Date().toISOString();
  console.log(`${color}[${timestamp}] ${message}${colors.reset}`);
}

/**
 * Validates environment variables
 */
function validateEnvironment() {
  log('🔍 Validating environment configuration...', colors.blue);

  const required = [
    'HEDERA_ACCOUNT_ID',
    'HEDERA_PRIVATE_KEY',
    'HEDERA_NETWORK'
  ];

  const missing = required.filter(env => !process.env[env]);

  if (missing.length > 0) {
    log(`❌ Missing required environment variables: ${missing.join(', ')}`, colors.red);
    log('Please check your .env file and ensure all Hedera credentials are set.', colors.yellow);
    process.exit(1);
  }

  // Validate account ID format
  try {
    AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);
  } catch (error) {
    log(`❌ Invalid HEDERA_ACCOUNT_ID format: ${process.env.HEDERA_ACCOUNT_ID}`, colors.red);
    log('Expected format: 0.0.xxxxx', colors.yellow);
    process.exit(1);
  }

  // Validate private key format
  try {
    PrivateKey.fromStringECDSA(process.env.HEDERA_PRIVATE_KEY);
  } catch (error) {
    log(`❌ Invalid HEDERA_PRIVATE_KEY format`, colors.red);
    log('Expected format: ECDSA private key in hex format', colors.yellow);
    process.exit(1);
  }

  log('✅ Environment validation passed', colors.green);
}

/**
 * Initializes Hedera client
 */
function initializeClient() {
  log('🔗 Initializing Hedera client...', colors.blue);

  const operatorId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);
  const operatorKey = PrivateKey.fromStringECDSA(process.env.HEDERA_PRIVATE_KEY);
  const network = process.env.HEDERA_NETWORK.toLowerCase();

  let client;
  if (network === 'testnet') {
    client = Client.forTestnet();
    log('📡 Connected to Hedera Testnet', colors.cyan);
  } else if (network === 'mainnet') {
    client = Client.forMainnet();
    log('📡 Connected to Hedera Mainnet', colors.cyan);
  } else {
    log(`❌ Unsupported network: ${network}`, colors.red);
    log('Supported networks: testnet, mainnet', colors.yellow);
    process.exit(1);
  }

  client.setOperator(operatorId, operatorKey);

  log(`👤 Operator Account: ${operatorId}`, colors.cyan);
  log('✅ Client initialized successfully', colors.green);

  return { client, operatorId, operatorKey };
}

/**
 * Checks operator account balance
 */
async function checkOperatorBalance(client, operatorId) {
  log('💰 Checking operator account balance...', colors.blue);

  try {
    const balance = await new AccountBalanceQuery()
      .setAccountId(operatorId)
      .execute(client);

    const hbarBalance = balance.hbars.toTinybars().toNumber() / 100_000_000;
    log(`💎 HBAR Balance: ${hbarBalance.toFixed(8)} HBAR`, colors.cyan);

    if (hbarBalance < 50) {
      log('⚠️  Low HBAR balance detected. Token creation requires approximately 50 HBAR for fees.', colors.yellow);
      log('Please ensure sufficient balance before proceeding.', colors.yellow);
    }

    return hbarBalance;
  } catch (error) {
    log(`❌ Failed to check account balance: ${error.message}`, colors.red);
    throw error;
  }
}

/**
 * Creates the TalentAI token
 */
async function createTalentAIToken(client, operatorId, operatorKey) {
  log('🚀 Creating TalentAI token...', colors.blue);

  // Calculate initial supply with decimals
  const initialSupplyWithDecimals = TOKEN_CONFIG.totalSupply * Math.pow(10, TOKEN_CONFIG.decimals);

  log(`📝 Token Configuration:`, colors.cyan);
  log(`   Name: ${TOKEN_CONFIG.name}`, colors.cyan);
  log(`   Symbol: ${TOKEN_CONFIG.symbol}`, colors.cyan);
  log(`   Decimals: ${TOKEN_CONFIG.decimals}`, colors.cyan);
  log(`   Total Supply: ${TOKEN_CONFIG.totalSupply.toLocaleString()} tokens`, colors.cyan);
  log(`   Initial Supply (with decimals): ${initialSupplyWithDecimals.toLocaleString()}`, colors.cyan);
  log(`   Treasury Account: ${operatorId}`, colors.cyan);

  try {
    // Create the token create transaction
    const tokenCreateTx = new TokenCreateTransaction()
      .setTokenName(TOKEN_CONFIG.name)
      .setTokenSymbol(TOKEN_CONFIG.symbol)
      .setTokenType(TokenType.FungibleCommon)
      .setDecimals(TOKEN_CONFIG.decimals)
      .setInitialSupply(initialSupplyWithDecimals)
      .setTreasuryAccountId(operatorId)
      .setSupplyType(TokenSupplyType.Finite)
      .setMaxSupply(initialSupplyWithDecimals)
      .setAdminKey(operatorKey.publicKey)
      .setSupplyKey(operatorKey.publicKey)
      .setFreezeDefault(false)
      .setTokenMemo(TOKEN_CONFIG.description);

    log('📤 Submitting token creation transaction...', colors.blue);

    // Freeze the transaction for manual signing
    const frozenTx = await tokenCreateTx.freezeWith(client);

    // Sign the transaction with the operator key
    const signedTx = await frozenTx.sign(operatorKey);

    // Execute the transaction
    const txResponse = await signedTx.execute(client);

    log(`📋 Transaction ID: ${txResponse.transactionId}`, colors.cyan);
    log('⏳ Waiting for transaction receipt...', colors.yellow);

    // Get the receipt
    const receipt = await txResponse.getReceipt(client);

    if (receipt.status.toString() !== 'SUCCESS') {
      throw new Error(`Transaction failed with status: ${receipt.status}`);
    }

    const tokenId = receipt.tokenId;
    log(`🎉 Token created successfully!`, colors.green);
    log(`🏷️  Token ID: ${tokenId}`, colors.bright + colors.green);

    return tokenId;

  } catch (error) {
    log(`❌ Failed to create token: ${error.message}`, colors.red);
    throw error;
  }
}

/**
 * Verifies token creation and properties
 */
async function verifyToken(client, tokenId, operatorId) {
  log('🔍 Verifying token creation...', colors.blue);

  try {
    // Query token information
    const tokenInfo = await new TokenInfoQuery()
      .setTokenId(tokenId)
      .execute(client);

    log(`✅ Token Verification Results:`, colors.green);
    log(`   Token ID: ${tokenInfo.tokenId}`, colors.cyan);
    log(`   Name: ${tokenInfo.name}`, colors.cyan);
    log(`   Symbol: ${tokenInfo.symbol}`, colors.cyan);
    log(`   Decimals: ${tokenInfo.decimals}`, colors.cyan);
    log(`   Total Supply: ${tokenInfo.totalSupply.toString()}`, colors.cyan);
    log(`   Max Supply: ${tokenInfo.maxSupply?.toString() || 'N/A'}`, colors.cyan);
    log(`   Treasury: ${tokenInfo.treasuryAccountId}`, colors.cyan);
    log(`   Supply Type: ${tokenInfo.supplyType}`, colors.cyan);
    log(`   Admin Key: ${tokenInfo.adminKey ? 'Set' : 'Not Set'}`, colors.cyan);
    log(`   Supply Key: ${tokenInfo.supplyKey ? 'Set' : 'Not Set'}`, colors.cyan);
    log(`   Freeze Default: ${tokenInfo.defaultFreezeStatus}`, colors.cyan);

    // Check operator token balance
    const balance = await new AccountBalanceQuery()
      .setAccountId(operatorId)
      .execute(client);

    const tokenBalance = balance.tokens.get(tokenId);
    const humanReadableBalance = tokenBalance
      ? tokenBalance.toNumber() / Math.pow(10, TOKEN_CONFIG.decimals)
      : 0;

    log(`💰 Operator Token Balance: ${humanReadableBalance.toLocaleString()} ${TOKEN_CONFIG.symbol}`, colors.green);

    if (Math.abs(humanReadableBalance - TOKEN_CONFIG.totalSupply) < 0.00000001) {
      log(`✅ Token balance verification passed!`, colors.green);
    } else {
      log(`⚠️  Token balance mismatch. Expected: ${TOKEN_CONFIG.totalSupply.toLocaleString()}, Got: ${humanReadableBalance.toLocaleString()}`, colors.yellow);
    }

    return tokenInfo;

  } catch (error) {
    log(`❌ Failed to verify token: ${error.message}`, colors.red);
    throw error;
  }
}

/**
 * Saves token information to file
 */
async function saveTokenInfo(tokenId, tokenInfo) {
  log('💾 Saving token information...', colors.blue);

  const fs = require('fs').promises;
  const path = require('path');

  const tokenData = {
    tokenId: tokenId.toString(),
    name: TOKEN_CONFIG.name,
    symbol: TOKEN_CONFIG.symbol,
    decimals: TOKEN_CONFIG.decimals,
    totalSupply: TOKEN_CONFIG.totalSupply,
    description: TOKEN_CONFIG.description,
    network: process.env.HEDERA_NETWORK,
    treasuryAccount: process.env.HEDERA_ACCOUNT_ID,
    createdAt: new Date().toISOString(),
    transactionDetails: {
      name: tokenInfo.name,
      symbol: tokenInfo.symbol,
      decimals: tokenInfo.decimals,
      totalSupply: tokenInfo.totalSupply.toString(),
      maxSupply: tokenInfo.maxSupply?.toString(),
      treasuryAccountId: tokenInfo.treasuryAccountId.toString(),
      supplyType: tokenInfo.supplyType.toString(),
      adminKey: tokenInfo.adminKey ? tokenInfo.adminKey.toString() : null,
      supplyKey: tokenInfo.supplyKey ? tokenInfo.supplyKey.toString() : null
    }
  };

  try {
    const outputPath = path.join(__dirname, '..', 'data');
    await fs.mkdir(outputPath, { recursive: true });

    const filePath = path.join(outputPath, 'talentai-token.json');
    await fs.writeFile(filePath, JSON.stringify(tokenData, null, 2));

    log(`📄 Token information saved to: ${filePath}`, colors.green);

    // Also save a simple env file format for easy integration
    const envContent = `# TalentAI Token Configuration
TALENTAI_TOKEN_ID=${tokenId}
TALENTAI_TOKEN_NAME=${TOKEN_CONFIG.name}
TALENTAI_TOKEN_SYMBOL=${TOKEN_CONFIG.symbol}
TALENTAI_TOKEN_DECIMALS=${TOKEN_CONFIG.decimals}
TALENTAI_TOKEN_TOTAL_SUPPLY=${TOKEN_CONFIG.totalSupply}
TALENTAI_TOKEN_TREASURY=${process.env.HEDERA_ACCOUNT_ID}
TALENTAI_TOKEN_NETWORK=${process.env.HEDERA_NETWORK}
`;

    const envFilePath = path.join(outputPath, 'talentai-token.env');
    await fs.writeFile(envFilePath, envContent);

    log(`🔧 Environment variables saved to: ${envFilePath}`, colors.green);

  } catch (error) {
    log(`⚠️  Failed to save token information: ${error.message}`, colors.yellow);
  }
}

/**
 * Main execution function
 */
async function main() {
  const startTime = Date.now();

  log('🎯 Starting TalentAI Token Creation Process', colors.bright + colors.magenta);
  log('============================================', colors.magenta);

  try {
    // Step 1: Validate environment
    validateEnvironment();

    // Step 2: Initialize client
    const { client, operatorId, operatorKey } = initializeClient();

    // Step 3: Check operator balance
    await checkOperatorBalance(client, operatorId);

    // Step 4: Create the token
    const tokenId = await createTalentAIToken(client, operatorId, operatorKey);

    // Step 5: Verify token creation
    const tokenInfo = await verifyToken(client, tokenId, operatorId);

    // Step 6: Save token information
    await saveTokenInfo(tokenId, tokenInfo);

    // Success summary
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    log('============================================', colors.green);
    log('🎉 TalentAI Token Creation Completed Successfully!', colors.bright + colors.green);
    log('============================================', colors.green);
    log(`🏷️  Token ID: ${tokenId}`, colors.bright + colors.green);
    log(`⏱️  Total Time: ${duration} seconds`, colors.green);
    log(`🌐 Network: ${process.env.HEDERA_NETWORK}`, colors.green);
    log(`💰 Total Supply: ${TOKEN_CONFIG.totalSupply.toLocaleString()} ${TOKEN_CONFIG.symbol}`, colors.green);
    log(`🏦 Treasury: ${operatorId}`, colors.green);
    log('', colors.reset);
    log('Next steps:', colors.cyan);
    log('1. Add the token ID to your frontend configuration', colors.cyan);
    log('2. Update your token purchase system to use the new token', colors.cyan);
    log('3. Test token transfers and integration', colors.cyan);

    // Close client
    client.close();

  } catch (error) {
    log('============================================', colors.red);
    log('❌ Token Creation Failed', colors.bright + colors.red);
    log('============================================', colors.red);
    log(`Error: ${error.message}`, colors.red);

    if (error.stack) {
      log('Stack trace:', colors.yellow);
      console.log(error.stack);
    }

    process.exit(1);
  }
}

// Execute the script
if (require.main === module) {
  main();
}

module.exports = {
  createTalentAIToken: main,
  TOKEN_CONFIG
};