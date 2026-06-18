// cron/index.js
const resetQuota = require('./reset-quota');
const planReminder = require('./planReminder.cron');

function initializeCronJobs() {
  resetQuota.initialize();
  planReminder.initialize();
  console.log('✅ All cron jobs initialized');
}

module.exports = { initializeCronJobs };
