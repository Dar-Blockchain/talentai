/**
 * Plan Reminder Cron Job
 *
 * Runs daily at 10:00 AM and sends in-app + email reminders to Company accounts
 * that have no active paid subscription (Trial does not count).
 *
 * Each company receives a maximum of 2 reminders, spaced 7 days apart.
 * Tracked via planReminderCount and lastPlanReminderSentAt on Profile.
 */

const cron = require('node-cron');
const Profile = require('../models/Profile.model');
const Subscription = require('../models/Subscription.model');
const User = require('../models/User.model');
const notificationService = require('../services/notificationSystem.service');
const { sendPlanUpgradeReminder } = require('../utils/email-service');

const REMINDER_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const MAX_REMINDERS = 2;

async function sendPlanReminders() {
  console.log('\n🔔 [PlanReminder] Starting daily plan reminder check...');

  try {
    const now = new Date();
    const intervalThreshold = new Date(now.getTime() - REMINDER_INTERVAL_MS);

    // Find company profiles that:
    // - haven't hit the MAX_REMINDERS cap
    // - haven't been reminded within the last 7 days
    const companyProfiles = await Profile.find({
      type: 'Company',
      $or: [
        { planReminderCount: { $exists: false } },
        { planReminderCount: { $lt: MAX_REMINDERS } },
      ],
      $and: [
        {
          $or: [
            { lastPlanReminderSentAt: { $exists: false } },
            { lastPlanReminderSentAt: null },
            { lastPlanReminderSentAt: { $lte: intervalThreshold } },
          ],
        },
      ],
    }).select('_id userId lastPlanReminderSentAt planReminderCount').lean();

    console.log(`📋 [PlanReminder] Found ${companyProfiles.length} company profiles eligible for reminder check`);

    let notified = 0;
    let skipped = 0;

    for (const profile of companyProfiles) {
      try {
        // Check if this company has an active paid subscription (Trial does not count)
        const activeSub = await Subscription.findOne({
          companyProfileId: profile._id,
          status: 'active',
          endDate: { $gt: now },
        }).populate('planId', 'name').lean();

        const isPaidPlan = activeSub && activeSub.planId?.name?.toLowerCase() !== 'trial';
        if (isPaidPlan) {
          // Reset reminder count so they get reminded again if the plan expires later
          if ((profile.planReminderCount || 0) > 0) {
            await Profile.updateOne(
              { _id: profile._id },
              { $set: { planReminderCount: 0, lastPlanReminderSentAt: null } }
            );
          }
          skipped++;
          continue;
        }

        const recipientUserId = profile.userId?._id || profile.userId;
        if (!recipientUserId) {
          console.warn(`⚠️ [PlanReminder] No userId for profile ${profile._id}, skipping`);
          continue;
        }

        const reminderCount = profile.planReminderCount || 0;
        const isSecondReminder = reminderCount === 1;

        const user = await User.findById(recipientUserId).select('email username profile').lean();
        const companyName = user?.profile?.firstName || user?.username || 'there';

        // Tailor message for 1st vs 2nd reminder
        const message = isSecondReminder
          ? '⚠️ Final reminder: Your company still doesn\'t have an active plan. Upgrade now to keep using TalentAI features.'
          : '🚀 Your company doesn\'t have an active plan. Upgrade now to unlock job posts, AI interviews, and candidate matching.';

        // In-app notification
        await notificationService.createNotification(recipientUserId, message, 'warning');

        // Email reminder (best-effort, non-blocking)
        if (user?.email) {
          sendPlanUpgradeReminder(user.email, companyName).catch(err =>
            console.error(`⚠️ [PlanReminder] Email failed for ${user.email}:`, err.message)
          );
        }

        // Increment count and update timestamp
        await Profile.updateOne(
          { _id: profile._id },
          { $set: { lastPlanReminderSentAt: now }, $inc: { planReminderCount: 1 } }
        );

        notified++;
        console.log(`✅ [PlanReminder] Reminder ${reminderCount + 1}/${MAX_REMINDERS} sent to profile ${profile._id} (${user?.email || 'no email'})`);
      } catch (profileError) {
        console.error(`❌ [PlanReminder] Error processing profile ${profile._id}:`, profileError.message);
      }
    }

    console.log(`✅ [PlanReminder] Done — ${notified} reminders sent, ${skipped} skipped (have active plan)`);
  } catch (error) {
    console.error('❌ [PlanReminder] Fatal error:', error);
  }
}

function initialize() {
  cron.schedule('0 10 * * *', sendPlanReminders);
  console.log('✅ [PlanReminder] Scheduled — runs daily at 10:00 AM');
}

module.exports = { initialize, sendPlanReminders };
