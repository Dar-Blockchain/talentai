const cron = require("node-cron");
const InternalCampaign = require("../models/InternalCampaign.model");
const CampaignParticipant = require("../models/CampaignParticipant.model");
const Profile = require("../models/Profile.model");
const { sendCampaignDeadlineReminder } = require("../utils/email-service");
const logger = require("../utils/logger");

const MODULE_LABELS = {
  QUESTIONNAIRE: "Questionnaire",
  AI_INTERVIEW: "AI Interview",
  SKILL_TEST: "Skill Test",
  TRAINING_PATH: "Training Path",
};

// Only send emails between 08:00 and 20:00 local server time
const isWithinTimeWindow = () => {
  const h = new Date().getHours();
  return h >= 8 && h < 20;
};

const runCampaignReminderJob = async ({ force = false } = {}) => {
  try {
    if (!force && !isWithinTimeWindow()) return;

    const now = new Date();
    const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    // Find active campaigns whose deadline is within the next 48 hours
    const campaigns = await InternalCampaign.find({
      status: "ACTIVE",
      deadline: { $gte: now, $lte: in48h },
    }).lean();

    if (campaigns.length === 0) return;

    logger.info(`[Campaign Reminder] Found ${campaigns.length} campaign(s) with deadline within 48h`);

    for (const campaign of campaigns) {
      // Incomplete participants with an email who haven't received a reminder yet
      const participants = await CampaignParticipant.find({
        campaign: campaign._id,
        status: { $in: ["NOT_STARTED", "INVITED", "IN_PROGRESS"] },
        email: { $ne: null },
        reminderSentAt: null,
      }).lean();

      if (participants.length === 0) continue;

      // Fetch participant names from profiles
      const employeeIds = participants.map((p) => p.employee).filter(Boolean);
      const [profiles, companyProfile] = await Promise.all([
        Profile.find({ userId: { $in: employeeIds } }).select("userId firstName lastName").lean(),
        Profile.findOne({ userId: campaign.company }).select("companyDetails.name").lean(),
      ]);
      const profileMap = profiles.reduce((acc, p) => {
        acc[p.userId.toString()] = [p.firstName, p.lastName].filter(Boolean).join(" ") || "Participant";
        return acc;
      }, {});
      const companyName = companyProfile?.companyDetails?.name || "Your company";

      const hoursLeft = Math.max(1, Math.round((new Date(campaign.deadline) - now) / (1000 * 60 * 60)));
      const deadlineStr = new Date(campaign.deadline).toLocaleDateString("en-GB", {
        day: "numeric", month: "long", year: "numeric",
      });
      const assessmentLink = `${process.env.BASE_URL}/employee/campaigns/${campaign._id}/assessment`;
      const moduleLabel = MODULE_LABELS[campaign.module?.type] || campaign.module?.type || "Assessment";

      for (const participant of participants) {
        const participantName = profileMap[participant.employee?.toString()] || participant.providerName || "Participant";
        const sent = await sendCampaignDeadlineReminder(participant.email, {
          participantName,
          companyName,
          campaignTitle: campaign.title,
          moduleLabel,
          deadline: deadlineStr,
          hoursLeft,
          assessmentLink,
        });
        if (sent) {
          await CampaignParticipant.findByIdAndUpdate(participant._id, { reminderSentAt: new Date() });
        }
      }

      logger.info(`[Campaign Reminder] Sent reminders for "${campaign.title}" to ${participants.length} participant(s)`);
    }
  } catch (err) {
    logger.error(`[Campaign Reminder] Error: ${err.message}`);
  }
};

const scheduleCampaignReminders = () => {
  // Run every hour at minute 5
  cron.schedule("5 * * * *", () => {
    runCampaignReminderJob();
  });
  logger.info("[Campaign Reminder] Scheduler initialized — checks hourly, sends 48h deadline reminders");
};

module.exports = { scheduleCampaignReminders, runCampaignReminderJob };
