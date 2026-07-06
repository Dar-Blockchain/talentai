const resetQuota = require('./reset-quota.cron');
const planReminder = require('./plan-reminder.cron');
const { scheduleAutoInvites } = require('./auto-invite.cron');
const { scheduleReminders } = require('./reminder.cron');
const { scheduleCampaignReminders } = require('./campaign-reminder.cron');
const { scheduleWebinarReminders } = require('./webinar-reminder.cron');

function initializeCronJobs() {
  resetQuota.initialize();
  planReminder.initialize();
  scheduleAutoInvites();
  scheduleReminders();
  scheduleCampaignReminders();
  scheduleWebinarReminders();
}

module.exports = { initializeCronJobs };
