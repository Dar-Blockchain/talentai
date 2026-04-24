// cron/index.js
const resetQuota = require('./reset-quota');
const planReminder = require('./planReminder.cron');
//const dailyBackup = require('./daily-backup');

function initializeCronJobs() {
  resetQuota.initialize();
  planReminder.initialize();
  // dailyBackup.initialize(); // Commented out since daily backup is not currently in use
  console.log('✅ All cron jobs initialized');
}

module.exports = { initializeCronJobs };
