// cron/index.js
const resetQuota = require('./reset-quota.cron');
const planReminder = require('./plan-reminder.cron');

function initializeCronJobs() {
  resetQuota.initialize();
  planReminder.initialize();
  console.log('✅ All cron jobs initialized');
}

module.exports = { initializeCronJobs };
