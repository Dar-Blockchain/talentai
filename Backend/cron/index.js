// cron/index.js
// ⛔ ALL CRON JOBS DISABLED

const resetQuota = require('./reset-quota');
const dailyExchangeRateUpdate = require('./daily-exchange-rate-update');
//const dailyBackup = require('./daily-backup');

function initializeCronJobs() {
  console.log('⛔ Cron jobs are DISABLED - no automatic tasks running');
  // resetQuota.initialize();
  // dailyExchangeRateUpdate.initialize();
  // dailyBackup.initialize(); // Commented out since daily backup is not currently in use
}

module.exports = { initializeCronJobs };
