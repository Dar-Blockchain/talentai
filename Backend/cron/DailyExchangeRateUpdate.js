const cron = require('node-cron');
const axios = require('axios'); // <-- AJOUT
const MatchingConfig = require('../models/MatchingConfigModel');

/**
 * Fetch live exchange rates from the internet
 */
async function fetchLiveExchangeRates() {
  try {
    const apiUrl = 'https://open.er-api.com/v6/latest/USD';
    const { data } = await axios.get(apiUrl);

    if (!data || !data.rates) {
      throw new Error('Invalid API response');
    }

    return {
      USD: 1,
      EUR: data.rates.EUR,
      TND: data.rates.TND
    };
  } catch (err) {
    console.error('❌ [fetchLiveExchangeRates] Error fetching exchange rates:', err.message);
    return null;
  }
}

/**
 * Update the `exchangeRates` field for all MatchingConfig records
 */
async function updateExchangeRatesForAll(newRates = {}) {
  try {
    const result = await MatchingConfig.updateMany(
      {},
      { $set: { exchangeRates: newRates } },
      { new: true }
    );
    
    console.log(`✅ [updateExchangeRatesForAll] Updated ${result.modifiedCount} MatchingConfig records`);
    return result;
  } catch (err) {
    console.error('❌ [updateExchangeRatesForAll] Error updating exchange rates:', err.message);
    throw err;
  }
}

/**
 * Cron scheduled daily
 */
cron.schedule('0 0 * * *', async () => {
  try {
    console.log('⏰ [Cron] Fetching live exchange rates...');

    // Fetch live rates from the internet
    const liveRates = await fetchLiveExchangeRates();

    if (!liveRates) {
      console.log('⚠️ No live rates available, skipping update...');
      return;
    }

    await updateExchangeRatesForAll(liveRates);
    console.log('✅ [Cron] Live exchange rate update complete');
  } catch (err) {
    console.error('❌ [Cron] Error updating exchange rates:', err.message);
  }
});

module.exports = { updateExchangeRatesForAll };
