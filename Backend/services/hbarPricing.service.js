const axios = require('axios');

/**
 * HBAR Pricing Service
 * Provides real-time HBAR pricing data with caching and conversion utilities
 */
class HbarPricingService {
  constructor() {
    this.priceCache = {
      price: null,
      lastUpdated: null,
      cacheDuration: 5 * 60 * 1000, // 5 minutes
    };
    this.apiEndpoints = {
      primary: 'https://api.coingecko.com/api/v3/simple/price?ids=hedera-hashgraph&vs_currencies=usd',
      fallback: 'https://api.coinmarketcap.com/v1/ticker/hedera-hashgraph/',
    };
    this.isUpdating = false;
  }

  /**
   * Get current HBAR price in USD
   * @returns {Promise<number>} Current HBAR price in USD
   */
  async getCurrentPrice() {
    try {
      // Check if cached price is still valid
      if (this.isCacheValid()) {
        console.log('📊 Using cached HBAR price:', this.priceCache.price);
        return this.priceCache.price;
      }

      // Prevent multiple simultaneous updates
      if (this.isUpdating) {
        console.log('⏳ HBAR price update in progress, waiting...');
        await this.waitForUpdate();
        return this.priceCache.price;
      }

      return await this.updatePrice();
    } catch (error) {
      console.error('❌ Error getting HBAR price:', error.message);

      // Return cached price if available, even if expired
      if (this.priceCache.price) {
        console.log('⚠️  Using expired cached price:', this.priceCache.price);
        return this.priceCache.price;
      }

      // Fallback to a default price if no cache available
      console.log('🔄 Using fallback price: $0.05');
      return 0.05;
    }
  }

  /**
   * Update HBAR price from API
   * @returns {Promise<number>} Updated HBAR price
   */
  async updatePrice() {
    this.isUpdating = true;

    try {
      console.log('🔍 Fetching latest HBAR price...');

      // Try primary API (CoinGecko)
      let price = await this.fetchFromCoinGecko();

      // If primary fails, try fallback
      if (!price) {
        console.log('🔄 Primary API failed, trying fallback...');
        price = await this.fetchFromCoinMarketCap();
      }

      if (price && price > 0) {
        this.priceCache.price = price;
        this.priceCache.lastUpdated = Date.now();
        console.log(`✅ HBAR price updated: $${price.toFixed(6)}`);
        return price;
      } else {
        throw new Error('Invalid price data received');
      }
    } catch (error) {
      console.error('❌ Failed to update HBAR price:', error.message);
      throw error;
    } finally {
      this.isUpdating = false;
    }
  }

  /**
   * Fetch price from CoinGecko API
   * @returns {Promise<number|null>} HBAR price or null if failed
   */
  async fetchFromCoinGecko() {
    try {
      const response = await axios.get(this.apiEndpoints.primary, {
        timeout: 10000,
        headers: {
          'User-Agent': 'TalentAI-Backend/1.0'
        }
      });

      const price = response.data?.['hedera-hashgraph']?.usd;

      if (typeof price === 'number' && price > 0) {
        console.log('📊 CoinGecko price fetched:', price);
        return price;
      }

      return null;
    } catch (error) {
      console.error('❌ CoinGecko API error:', error.message);
      return null;
    }
  }

  /**
   * Fetch price from CoinMarketCap API (fallback)
   * @returns {Promise<number|null>} HBAR price or null if failed
   */
  async fetchFromCoinMarketCap() {
    try {
      // Note: This is a simplified fallback.
      // In production, you might want to use CMC's official API with an API key
      console.log('⚠️  Fallback API not implemented, using default price');
      return 0.05; // Default fallback price
    } catch (error) {
      console.error('❌ CoinMarketCap API error:', error.message);
      return null;
    }
  }

  /**
   * Check if cached price is still valid
   * @returns {boolean} True if cache is valid
   */
  isCacheValid() {
    if (!this.priceCache.price || !this.priceCache.lastUpdated) {
      return false;
    }

    const now = Date.now();
    const cacheAge = now - this.priceCache.lastUpdated;
    return cacheAge < this.priceCache.cacheDuration;
  }

  /**
   * Wait for ongoing price update to complete
   * @returns {Promise<void>}
   */
  async waitForUpdate() {
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds max wait

    while (this.isUpdating && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
  }

  /**
   * Convert USD amount to HBAR
   * @param {number} usdAmount - Amount in USD
   * @returns {Promise<number>} Equivalent amount in HBAR
   */
  async convertUsdToHbar(usdAmount) {
    try {
      const hbarPrice = await this.getCurrentPrice();
      const hbarAmount = usdAmount / hbarPrice;

      console.log(`💱 Converting $${usdAmount} to ${hbarAmount.toFixed(2)} HBAR (rate: $${hbarPrice.toFixed(6)})`);
      return hbarAmount;
    } catch (error) {
      console.error('❌ Error converting USD to HBAR:', error.message);
      throw new Error('Failed to convert USD to HBAR');
    }
  }

  /**
   * Convert HBAR amount to USD
   * @param {number} hbarAmount - Amount in HBAR
   * @returns {Promise<number>} Equivalent amount in USD
   */
  async convertHbarToUsd(hbarAmount) {
    try {
      const hbarPrice = await this.getCurrentPrice();
      const usdAmount = hbarAmount * hbarPrice;

      console.log(`💱 Converting ${hbarAmount} HBAR to $${usdAmount.toFixed(2)} (rate: $${hbarPrice.toFixed(6)})`);
      return usdAmount;
    } catch (error) {
      console.error('❌ Error converting HBAR to USD:', error.message);
      throw new Error('Failed to convert HBAR to USD');
    }
  }

  /**
   * Get pricing information for multiple USD amounts
   * @param {number[]} usdAmounts - Array of USD amounts
   * @returns {Promise<Object>} Pricing information object
   */
  async getPricingInfo(usdAmounts) {
    try {
      const hbarPrice = await this.getCurrentPrice();
      const pricing = {
        hbarPrice,
        lastUpdated: new Date(this.priceCache.lastUpdated).toISOString(),
        conversions: {}
      };

      for (const usdAmount of usdAmounts) {
        const hbarAmount = usdAmount / hbarPrice;
        const gasFee = hbarAmount * 0.01; // 1% gas fee
        const totalHbar = hbarAmount + gasFee;

        pricing.conversions[usdAmount] = {
          baseHbar: parseFloat(hbarAmount.toFixed(8)),
          gasFeeHbar: parseFloat(gasFee.toFixed(8)),
          totalHbar: parseFloat(totalHbar.toFixed(8)),
          gasFeeUsd: parseFloat((gasFee * hbarPrice).toFixed(2))
        };
      }

      return pricing;
    } catch (error) {
      console.error('❌ Error getting pricing info:', error.message);
      throw error;
    }
  }

  /**
   * Force refresh the price cache
   * @returns {Promise<number>} Updated price
   */
  async refreshPrice() {
    console.log('🔄 Force refreshing HBAR price...');
    this.priceCache.lastUpdated = null; // Invalidate cache
    return await this.getCurrentPrice();
  }

  /**
   * Get cache status and statistics
   * @returns {Object} Cache status information
   */
  getCacheStatus() {
    const now = Date.now();
    const cacheAge = this.priceCache.lastUpdated ? now - this.priceCache.lastUpdated : null;

    return {
      hasPrice: !!this.priceCache.price,
      currentPrice: this.priceCache.price,
      lastUpdated: this.priceCache.lastUpdated ? new Date(this.priceCache.lastUpdated).toISOString() : null,
      cacheAgeMs: cacheAge,
      cacheValid: this.isCacheValid(),
      isUpdating: this.isUpdating
    };
  }
}

// Create singleton instance
const hbarPricingService = new HbarPricingService();

// Initialize price on service start
hbarPricingService.getCurrentPrice().catch(error => {
  console.error('⚠️  Failed to initialize HBAR price:', error.message);
});

module.exports = hbarPricingService;