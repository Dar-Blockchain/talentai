// cron/reset-quota.js
const cron = require('node-cron');
const Profile = require('../features/users/profile.model');
const logger = require('../utils/logger');
const { QUOTA_RESET_DAYS, QUOTA_RESET_MS } = require('./quota.constants');

function initialize() {
  // Runs every 10 minutes. The reset is a rolling window of QUOTA_RESET_DAYS
  // anchored to the first test of each cycle (skill-interview.service.js
  // stamps quotaUpdatedAt when quota goes 0 -> 1), so a short window like
  // QUOTA_RESET_DAYS=1 actually clears ~1 day later, not "at the next
  // midnight after a day" (which a daily-only schedule would cause).
  cron.schedule('*/10 * * * *', async () => {
    try {
      const thresholdDate = new Date(Date.now() - QUOTA_RESET_MS);

      const result = await Profile.updateMany(
        { quota: { $gt: 0 }, quotaUpdatedAt: { $lte: thresholdDate } },
        { $set: { quota: 0, quotaUpdatedAt: new Date() } }
      );

      if (result.modifiedCount > 0) {
        logger.success(
          `Quotas reset for ${result.modifiedCount} profiles (window: ${QUOTA_RESET_DAYS} day(s)).`
        );
      }
    } catch (error) {
      logger.error('Error resetting quotas:', error.message);
    }
  });
}

module.exports = { initialize };
