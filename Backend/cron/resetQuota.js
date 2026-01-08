// cron/resetQuota.js
const cron = require("node-cron");
const Profile = require("../models/ProfileModel");

// 🕛 Schedule: daily at 00:00
cron.schedule("0 0 * * *", async () => {
  try {
    console.log("🔁 Checking and resetting quotas (if >30 days)...");

    const now = new Date();
    const thresholdDate = new Date(now.setDate(now.getDate() - 30)); // 30 days ago

    // Select only profiles whose quotaUpdatedAt is older than 30 days
    const result = await Profile.updateMany(
      { quotaUpdatedAt: { $lte: thresholdDate } },
      { $set: { quota: 0, quotaUpdatedAt: new Date() } }
    );

    console.log(`✅ Quotas reset for ${result.modifiedCount} profiles (inactive ≥30 days).`);
  } catch (error) {
    console.error("❌ Error resetting quotas:", error);
  }
});
