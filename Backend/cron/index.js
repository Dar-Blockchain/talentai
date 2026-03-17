// cron/index.js
const resetQuota = require('./reset-quota');
//const dailyExchangeRateUpdate = require('./daily-exchange-rate-update');
//const dailyBackup = require('./daily-backup');

function initializeCronJobs() {
  resetQuota.initialize();
  // dailyExchangeRateUpdate.initialize(); // Removed: MatchingConfig model deleted
  // dailyBackup.initialize(); // Commented out since daily backup is not currently in use
  console.log('✅ All cron jobs initialized');
}

module.exports = { initializeCronJobs };
