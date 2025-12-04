const cron = require('node-cron');
const axios = require('axios'); // <-- AJOUT
const MatchingConfig = require('../models/MatchingConfigModel');

/**
 * Récupère les taux de change en direct depuis Internet
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
 * Met à jour les exchangeRates pour tous MatchingConfig
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
 * Cron chaque jour à 17h39
 */
cron.schedule('0 0 * * *', async () => {
  try {
    console.log('⏰ [Cron] Fetching live exchange rates...');

    // Récupérer les taux LIVE depuis Internet
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
