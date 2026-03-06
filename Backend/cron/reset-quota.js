// cron/reset-quota.js
// ⛔ DISABLED - daily quota reset
const cron = require('node-cron');
const Profile = require('../models/Profile.model');

function initialize() {
  console.log('⛔ Reset quota cron is DISABLED');
  // 🕛 Schedule: daily at 00:00
  // cron.schedule('0 0 * * *', async () => {
  //   try {
  //     console.log('🔁 Checking and resetting quotas (if >30 days)...');
  //
  //     const now = new Date();
  //     const thresholdDate = new Date(now.setDate(now.getDate() - 30));
  //
  //     const result = await Profile.updateMany(
  //       { quotaUpdatedAt: { $lte: thresholdDate } },
  //       { $set: { quota: 0, quotaUpdatedAt: new Date() } }
  //     );
  //
  //     console.log(`✅ Quotas reset for ${result.modifiedCount} profiles (inactive ≥30 days).`);
  //   } catch (error) {
  //     console.error('❌ Error resetting quotas:', error);
  //   }
  // });
}

module.exports = { initialize };
