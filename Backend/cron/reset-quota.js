// cron/reset-quota.js
const cron = require('node-cron');
const Profile = require('../models/Profile.model');
const logger = require('../utils/logger');

function initialize() {
  // 🕛 Schedule: daily at 00:00
  cron.schedule('0 0 * * *', async () => {
    try {
      logger.info('🔁 Checking and resetting quotas (if >30 days)...');

      const now = new Date();
      const thresholdDate = new Date(now.setDate(now.getDate() - 30));

      const result = await Profile.updateMany(
        { quotaUpdatedAt: { $lte: thresholdDate } },
        { $set: { quota: 0, quotaUpdatedAt: new Date() } }
      );

      logger.success(`Quotas reset for ${result.modifiedCount} profiles (inactive ≥30 days).`);
    } catch (error) {
      logger.error('Error resetting quotas:', error.message);
    }
  });
}

module.exports = { initialize };
