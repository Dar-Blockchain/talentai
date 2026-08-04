const cron = require("node-cron");
const Webinar = require("../features/webinar-agent/webinar.model");
const WebinarSubmission = require("../features/webinar-agent/webinar-submission.model");
const { sendWebinarReminderEmail } = require("../utils/email.service");
const logger = require("../utils/logger");

/**
 * Webinar Reminder Scheduler
 *
 * Sends a reminder email to every participant who completed the webinar form,
 * exactly when the webinar is between 20h and 28h away (centred on 24h).
 * Each submission receives at most ONE reminder (tracked via reminder_sent_at).
 *
 * Runs every hour.
 */

const runWebinarReminderJob = async () => {
  try {
    const now = new Date();

    // Find active webinars whose date is between 20h and 28h from now
    const from = new Date(now.getTime() + 20 * 60 * 60 * 1000);
    const to   = new Date(now.getTime() + 28 * 60 * 60 * 1000);

    const webinars = await Webinar.find({
      status: "active",
      date:   { $gte: from, $lte: to },
    }).lean();

    if (webinars.length === 0) return;

    for (const webinar of webinars) {
      // Find completed submissions that haven't received a reminder yet and have an email
      const submissions = await WebinarSubmission.find({
        webinar_id:       String(webinar._id),
        completed:        true,
        reminder_sent_at: null,
        "contact.email":  { $ne: null, $exists: true },
      }).lean();

      logger.info(`[WEBINAR REMINDER] Webinar "${webinar.title}" — ${submissions.length} reminder(s) to send`);

      for (const submission of submissions) {
        const sent = await sendWebinarReminderEmail(submission, webinar).catch(() => false);

        if (sent) {
          await WebinarSubmission.findByIdAndUpdate(submission._id, {
            reminder_sent_at: new Date(),
          });
          logger.info(`[WEBINAR REMINDER] Sent to ${submission.contact.email}`);
        } else {
          logger.error(`[WEBINAR REMINDER] Failed for ${submission.contact.email}`);
        }
      }
    }
  } catch (err) {
    logger.error(`[WEBINAR REMINDER] Critical error: ${err.message}`);
  }
};

const scheduleWebinarReminders = () => {
  // Run every hour at minute 0
  cron.schedule("0 * * * *", () => {
    runWebinarReminderJob();
  });
  logger.info("[WEBINAR REMINDER] Scheduler initialised — checks every hour");
};

module.exports = { scheduleWebinarReminders, runWebinarReminderJob };
