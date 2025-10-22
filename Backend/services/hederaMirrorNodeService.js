require('dotenv').config();
const axios = require('axios');

/**
 * Hedera Mirror Node Service
 * Fetches real-time data from Hedera Mirror Node REST API
 */

// Mirror Node base URLs
const MIRROR_NODE_URLS = {
  mainnet: 'https://mainnet.mirrornode.hedera.com/api/v1',
  testnet: 'https://testnet.mirrornode.hedera.com/api/v1',
  previewnet: 'https://previewnet.mirrornode.hedera.com/api/v1'
};

// TAI Token Configuration
const TAI_TOKEN_ID = '0.0.6955317';
const HEDERA_NETWORK = process.env.HEDERA_NETWORK || 'testnet';

/**
 * Get Mirror Node base URL based on network
 */
const getMirrorNodeUrl = () => {
  return MIRROR_NODE_URLS[HEDERA_NETWORK] || MIRROR_NODE_URLS.testnet;
};

/**
 * Get account's TAI token balance from Hedera Mirror Node
 * @param {string} accountId - Hedera account ID (e.g., "0.0.1234")
 * @returns {Promise<Object>} Token balance information
 */
const getAccountTaiBalance = async (accountId) => {
  try {
    if (!accountId) {
      throw new Error('Account ID is required');
    }

    console.log(`🔍 Fetching TAI balance for account ${accountId} from Hedera Mirror Node...`);

    const baseUrl = getMirrorNodeUrl();
    const url = `${baseUrl}/accounts/${accountId}/tokens`;

    console.log(`📡 Mirror Node API URL: ${url}`);

    const response = await axios.get(url, {
      params: {
        'token.id': TAI_TOKEN_ID,
        limit: 1
      },
      timeout: 10000 // 10 second timeout
    });

    if (!response.data || !response.data.tokens) {
      console.log(`ℹ️  No token data found for account ${accountId}`);
      return {
        accountId,
        tokenId: TAI_TOKEN_ID,
        balance: 0,
        decimals: 8,
        found: false,
        message: 'Account has no TAI token balance or token not associated'
      };
    }

    // Find TAI token in the list
    const taiToken = response.data.tokens.find(token => token.token_id === TAI_TOKEN_ID);

    if (!taiToken) {
      console.log(`ℹ️  TAI token not found in account ${accountId}`);
      return {
        accountId,
        tokenId: TAI_TOKEN_ID,
        balance: 0,
        decimals: 8,
        found: false,
        message: 'TAI token not associated with this account'
      };
    }

    // Convert balance from smallest unit to human-readable (accounting for decimals)
    const balanceInSmallestUnit = parseInt(taiToken.balance);
    const decimals = taiToken.decimals || 8;
    const balanceInTokens = balanceInSmallestUnit / Math.pow(10, decimals);

    console.log(`✅ TAI Balance for ${accountId}: ${balanceInTokens} TAI (${balanceInSmallestUnit} smallest units)`);

    return {
      accountId,
      tokenId: TAI_TOKEN_ID,
      balance: balanceInTokens,
      balanceInSmallestUnit: balanceInSmallestUnit,
      decimals: decimals,
      found: true,
      freezeStatus: taiToken.freeze_status,
      kycStatus: taiToken.kyc_status,
      automaticAssociation: taiToken.automatic_association,
      createdTimestamp: taiToken.created_timestamp
    };

  } catch (error) {
    console.error(`❌ Error fetching TAI balance from Mirror Node for ${accountId}:`, error.message);

    // Handle specific HTTP errors
    if (error.response) {
      if (error.response.status === 404) {
        return {
          accountId,
          tokenId: TAI_TOKEN_ID,
          balance: 0,
          decimals: 8,
          found: false,
          error: 'Account not found on Hedera network',
          statusCode: 404
        };
      }

      console.error(`Mirror Node API error (${error.response.status}):`, error.response.data);
      throw new Error(`Mirror Node API error: ${error.response.status} - ${error.response.statusText}`);
    }

    throw error;
  }
};

/**
 * Get account's HBAR balance from Hedera Mirror Node
 * @param {string} accountId - Hedera account ID (e.g., "0.0.1234")
 * @returns {Promise<Object>} HBAR balance information
 */
const getAccountHbarBalance = async (accountId) => {
  try {
    if (!accountId) {
      throw new Error('Account ID is required');
    }

    console.log(`🔍 Fetching HBAR balance for account ${accountId} from Hedera Mirror Node...`);

    const baseUrl = getMirrorNodeUrl();
    const url = `${baseUrl}/accounts/${accountId}`;

    console.log(`📡 Mirror Node API URL: ${url}`);

    const response = await axios.get(url, {
      timeout: 10000 // 10 second timeout
    });

    if (!response.data) {
      throw new Error('No data returned from Mirror Node');
    }

    const account = response.data;

    // Balance is in tinybars, convert to HBAR (1 HBAR = 100,000,000 tinybars)
    const balanceInTinybars = parseInt(account.balance?.balance || 0);
    const balanceInHbar = balanceInTinybars / 100000000;

    console.log(`✅ HBAR Balance for ${accountId}: ${balanceInHbar} HBAR (${balanceInTinybars} tinybars)`);

    return {
      accountId: account.account,
      balance: balanceInHbar,
      balanceInTinybars: balanceInTinybars,
      alias: account.alias,
      evmAddress: account.evm_address,
      expiryTimestamp: account.expiry_timestamp,
      autoRenewPeriod: account.auto_renew_period,
      key: account.key,
      maxAutomaticTokenAssociations: account.max_automatic_token_associations
    };

  } catch (error) {
    console.error(`❌ Error fetching HBAR balance from Mirror Node for ${accountId}:`, error.message);

    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('Account not found on Hedera network');
      }

      console.error(`Mirror Node API error (${error.response.status}):`, error.response.data);
      throw new Error(`Mirror Node API error: ${error.response.status} - ${error.response.statusText}`);
    }

    throw error;
  }
};

/**
 * Get all token balances for an account from Hedera Mirror Node
 * @param {string} accountId - Hedera account ID
 * @returns {Promise<Object>} All token balances
 */
const getAllTokenBalances = async (accountId) => {
  try {
    if (!accountId) {
      throw new Error('Account ID is required');
    }

    console.log(`🔍 Fetching all token balances for account ${accountId}...`);

    const baseUrl = getMirrorNodeUrl();
    const url = `${baseUrl}/accounts/${accountId}/tokens`;

    const response = await axios.get(url, {
      params: {
        limit: 100 // Maximum allowed
      },
      timeout: 10000
    });

    const tokens = response.data.tokens || [];

    // Convert balances from smallest unit to human-readable
    const tokenBalances = tokens.map(token => {
      const balanceInSmallestUnit = parseInt(token.balance);
      const decimals = token.decimals || 0;
      const balanceInTokens = balanceInSmallestUnit / Math.pow(10, decimals);

      return {
        tokenId: token.token_id,
        balance: balanceInTokens,
        balanceInSmallestUnit: balanceInSmallestUnit,
        decimals: decimals,
        freezeStatus: token.freeze_status,
        kycStatus: token.kyc_status,
        automaticAssociation: token.automatic_association,
        createdTimestamp: token.created_timestamp
      };
    });

    console.log(`✅ Found ${tokenBalances.length} token(s) for account ${accountId}`);

    return {
      accountId,
      tokens: tokenBalances,
      count: tokenBalances.length
    };

  } catch (error) {
    console.error(`❌ Error fetching token balances from Mirror Node for ${accountId}:`, error.message);

    if (error.response && error.response.status === 404) {
      throw new Error('Account not found on Hedera network');
    }

    throw error;
  }
};

/**
 * Get token information from Hedera Mirror Node
 * @param {string} tokenId - Token ID (e.g., "0.0.6955317")
 * @returns {Promise<Object>} Token information
 */
const getTokenInfo = async (tokenId) => {
  try {
    console.log(`🔍 Fetching token info for ${tokenId}...`);

    const baseUrl = getMirrorNodeUrl();
    const url = `${baseUrl}/tokens/${tokenId}`;

    const response = await axios.get(url, {
      timeout: 10000
    });

    const token = response.data;

    console.log(`✅ Token info retrieved: ${token.name} (${token.symbol})`);

    return {
      tokenId: token.token_id,
      name: token.name,
      symbol: token.symbol,
      decimals: token.decimals,
      totalSupply: token.total_supply,
      treasuryAccountId: token.treasury_account_id,
      type: token.type,
      supplyType: token.supply_type,
      maxSupply: token.max_supply,
      createdTimestamp: token.created_timestamp,
      modifiedTimestamp: token.modified_timestamp
    };

  } catch (error) {
    console.error(`❌ Error fetching token info from Mirror Node for ${tokenId}:`, error.message);

    if (error.response && error.response.status === 404) {
      throw new Error('Token not found on Hedera network');
    }

    throw error;
  }
};

module.exports = {
  getAccountTaiBalance,
  getAccountHbarBalance,
  getAllTokenBalances,
  getTokenInfo,
  getMirrorNodeUrl,
  TAI_TOKEN_ID
};
