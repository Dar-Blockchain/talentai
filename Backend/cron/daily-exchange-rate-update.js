// cron/daily-exchange-rate-update.js
const cron = require('node-cron');
const axios = require('axios');
const MatchingConfig = require('../models/MatchingConfigModel');

async function fetchLiveExchangeRates() {
  try {
    const { data } = await axios.get('https://open.er-api.com/v6/latest/USD');
    if (!data || !data.rates) throw new Error('Invalid API response');

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

async function updateExchangeRatesForAll(newRates = {}) {
  try {
    const result = await MatchingConfig.updateMany({}, { $set: { exchangeRates: newRates } }, { new: true });
    console.log(`✅ [updateExchangeRatesForAll] Updated ${result.modifiedCount} MatchingConfig records`);
    return result;
  } catch (err) {
    console.error('❌ [updateExchangeRatesForAll] Error updating exchange rates:', err.message);
  }
}

function initialize() {
  cron.schedule('0 0 * * *', async () => {
    console.log('⏰ [Cron] Fetching live exchange rates...');
    const liveRates = await fetchLiveExchangeRates();
    if (!liveRates) return console.log('⚠️ No live rates available, skipping update...');
    await updateExchangeRatesForAll(liveRates);
    console.log('✅ [Cron] Live exchange rate update complete');
  });
}

module.exports = { initialize };
