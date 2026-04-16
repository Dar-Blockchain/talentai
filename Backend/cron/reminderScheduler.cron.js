const cron = require('node-cron');
const JobApplication = require('../models/JobApplication.model');
const Profile = require('../models/Profile.model');
const Post = require('../models/Post.model');
const User = require('../models/User.model');
const { sendInterviewInvitation } = require('../utils/email-service');
const { REMINDER_CONFIG, SCHEDULER_TIME_WINDOW } = require('../constants/scheduler.constants');

/**
 * Interview Reminder Scheduler
 * 
 * Sends EXACTLY 2 reminders to candidates:
 * 🔔 FIRST REMINDER:  24 hours after JobApplication creation
 * 🔔 SECOND REMINDER: Less than 24 hours BEFORE post expirationDate
 * 
 * Example Timeline (Post expires in 5 days):
 * - Day 0: Candidate applies → JobApplication created
 * - Day 1 at ~24h: FIRST REMINDER sent ✅
 * - Day 4 at ~4h before expiration: SECOND REMINDER sent ✅
 * - Day 5: Post expires
 * 
 * Features:
 * - Only sends between 12:00 and 21:00
 * - Each reminder sent only ONCE
 * - Stops when interview_completed
 * - Prevents duplicate reminders via firstReminderSentAt / secondReminderSentAt
 */

// Use REMINDER_TYPES from constants
const REMINDER_TYPES = REMINDER_CONFIG.TYPES;

// ========== HELPER FUNCTIONS ==========

const isWithinTimeWindow = () => {
  const currentHour = new Date().getHours();
  return currentHour >= SCHEDULER_TIME_WINDOW.START_HOUR && currentHour < SCHEDULER_TIME_WINDOW.END_HOUR;
};

const calculateHoursSinceApplication = (appliedAt) => {
  const now = new Date();
  const hoursElapsed = (now - new Date(appliedAt)) / (1000 * 60 * 60);
  return hoursElapsed;
};

const calculateHoursUntilExpiration = (expirationDate) => {
  const now = new Date();
  const hoursRemaining = (new Date(expirationDate) - now) / (1000 * 60 * 60);
  return hoursRemaining;
};

// ========== VALIDATION FUNCTIONS ==========

const shouldSendFirstReminder = (application) => {
  const hoursElapsed = calculateHoursSinceApplication(application.appliedAt);
  // Send if 24+ hours have passed and first reminder not yet sent
  const shouldSend = hoursElapsed >= REMINDER_CONFIG.FIRST_REMINDER_HOURS && !application.firstReminderSentAt;
  
  const MSG = REMINDER_CONFIG.MESSAGES;
  console.log(`   [FIRST CHECK] Hours: ${hoursElapsed.toFixed(1)}h, Already sent: ${!!application.firstReminderSentAt}, Should send: ${shouldSend}`);
  return shouldSend;
};

const shouldSendSecondReminder = (application, post) => {
  const hoursUntilExpiration = calculateHoursUntilExpiration(post.expirationDate);
  
  // Send if LESS THAN 24 hours remain until post expiration
  // (i.e., there's less than 24h left before the post expires)
  const isWithin24HoursOfExpiration = hoursUntilExpiration < REMINDER_CONFIG.SECOND_REMINDER_HOURS && hoursUntilExpiration > 0;
  const notYetSent = !application.secondReminderSentAt;
  const shouldSend = isWithin24HoursOfExpiration && notYetSent;
  
  console.log(`   [SECOND CHECK] Hours until expiration: ${hoursUntilExpiration.toFixed(1)}h`);
  console.log(`                 Within < 24h: ${isWithin24HoursOfExpiration}, Not sent: ${notYetSent}`);
  console.log(`                 Should send: ${shouldSend}`);
  return shouldSend;
};

// ========== EMAIL SENDING ==========

const sendReminderEmail = async (application, post, reminderType) => {
  try {
    console.log(`\n📧 [REMINDER - ${reminderType}] Processing application: ${application._id}`);

    // Fetch candidate profile
    const candidateProfile = await Profile.findById(application.profile).populate('userId');
    if (!candidateProfile || !candidateProfile.userId) {
      console.error(`   ❌ Candidate profile not found`);
      return false;
    }

    // Fetch company details
    const company = await User.findById(post.user);
    if (!company) {
      console.error(`   ❌ Company not found`);
      return false;
    }

    const candidateEmail = candidateProfile.userId.email;
    const candidateName = `${candidateProfile.firstName} ${candidateProfile.lastName}`;
    const jobTitle = post.jobDetails?.title || 'Position';
    const companyProfile = await Profile.findOne({ userId: post.user }).select('companyDetails').lean();
    const companyName = companyProfile?.companyDetails?.name || company.username || company.email || 'Our Company';

    // Build interview link
    const interviewLink = `https://app.talentai.bid/interview/hr/?jobId=${post._id}&companyId=${post.user}&ref=link`;

    console.log(`   📧 To: ${candidateEmail}`);
    console.log(`   👤 Candidate: ${candidateName}`);
    console.log(`   💼 Position: ${jobTitle}`);
    console.log(`   🏢 Company: ${companyName}`);
    console.log(`   🔗 Interview Link: ${interviewLink}`);

    // Send interview invitation email
    const emailSent = await sendInterviewInvitation(
      candidateEmail,
      candidateName,
      jobTitle,
      companyName,
      null, // No specific date
      null, // No specific time
      interviewLink  // Interview link
    );

    if (!emailSent) {
      console.error(`   ❌ Failed to send email`);
      return false;
    }

    console.log(`   ✅ Email sent successfully`);
    return true;

  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return false;
  }
};

// ========== DATABASE UPDATES ==========

const updateApplicationWithReminder = async (applicationId, reminderType) => {
  try {
    const updateData = {
      updatedAt: new Date()
    };

    if (reminderType === REMINDER_TYPES.FIRST_REMINDER) {
      updateData.firstReminderSentAt = new Date();
    } else if (reminderType === REMINDER_TYPES.SECOND_REMINDER) {
      updateData.secondReminderSentAt = new Date();
    }

    await JobApplication.findByIdAndUpdate(applicationId, updateData, { new: true });
    console.log(`   ✅ Database updated - ${reminderType} reminder tracked`);
    return true;

  } catch (error) {
    console.error(`   ❌ Error updating database: ${error.message}`);
    return false;
  }
};

// ========== MAIN SCHEDULER JOB ==========

const runReminderJob = async () => {
  try {
    const MSG = REMINDER_CONFIG.MESSAGES;
    
    console.log(`\n⏰ [REMINDER SCHEDULER] Running at ${new Date().toLocaleString()}`);

    // Check if we're within the time window
    if (!isWithinTimeWindow()) {
      const currentHour = new Date().getHours();
      console.log(`⏭️  Outside time window (current hour: ${currentHour}). Skipping.`);
      return;
    }

    console.log(`✅ Within time window. Processing reminders...`);

    // Find active applications that haven't completed interview
    const pendingApplications = await JobApplication.find({
      status: { $in: REMINDER_CONFIG.VALID_STATUSES },
      isArchived: false,
      isWithdrawn: false
    }).populate({
      path: 'profile',
      select: '_id'
    }).populate({
      path: 'post',
      select: 'expirationDate _id user jobDetails'
    });

    console.log(`📊 Found ${pendingApplications.length} pending applications\n`);

    let firstReminderCount = 0;
    let secondReminderCount = 0;
    let skippedCount = 0;

    for (const application of pendingApplications) {
      if (!application.post) {
        console.log(`⏭️  Skipping - post not found`);
        skippedCount++;
        continue;
      }

      const hoursElapsed = calculateHoursSinceApplication(application.appliedAt);
      const hoursUntilExp = calculateHoursUntilExpiration(application.post.expirationDate);

      console.log(`📋 Application: ${application._id}`);
      console.log(`   ⏱️  Since application: ${hoursElapsed.toFixed(1)}h`);
      console.log(`   ⏳ Until expiration: ${hoursUntilExp.toFixed(1)}h`);
      console.log(`   Status: ${application.status}`);

      // ===== FIRST REMINDER (24 hours) =====
      if (shouldSendFirstReminder(application)) {
        const sent = await sendReminderEmail(application, application.post, REMINDER_TYPES.FIRST_REMINDER);
        
        if (sent) {
          const updated = await updateApplicationWithReminder(application._id, REMINDER_TYPES.FIRST_REMINDER);
          if (updated) {
            firstReminderCount++;
          }
        }
      }

      // ===== SECOND REMINDER (48 hours or near expiration) =====
      if (shouldSendSecondReminder(application, application.post)) {
        const sent = await sendReminderEmail(application, application.post, REMINDER_TYPES.SECOND_REMINDER);
        
        if (sent) {
          const updated = await updateApplicationWithReminder(application._id, REMINDER_TYPES.SECOND_REMINDER);
          if (updated) {
            secondReminderCount++;
          }
        }
      }

      console.log('');
    }

    console.log(`\n📊 Reminder job complete:`);
    console.log(`   🔔 First reminders (24h):  ${firstReminderCount}`);
    console.log(`   🔔 Second reminders (48h): ${secondReminderCount}`);
    console.log(`   ⏭️  Skipped: ${skippedCount}`);
    console.log(`   📈 Total reminders sent: ${firstReminderCount + secondReminderCount}`);

  } catch (error) {
    console.error(`\n❌ [REMINDER SCHEDULER] Critical error:`, error.message);
    console.error(error.stack);
  }
};

// ========== CRON SCHEDULE ==========

const scheduleReminders = () => {
  const MSG = REMINDER_CONFIG.MESSAGES;
  console.log(`\n${MSG.INIT}`);

  // Run every hour at minute 0
  cron.schedule(REMINDER_CONFIG.CRON_PATTERN, () => {
    runReminderJob();
  });

  console.log(`${MSG.INITIALIZED}`);
  console.log(`${MSG.FREQUENCY}`);
  console.log(`${MSG.FIRST_REMINDER_DESC}`);
  console.log(`${MSG.SECOND_REMINDER_DESC}`);
  console.log(`${MSG.STOPS_WHEN}`);
  console.log(`${MSG.EMAIL_WINDOW}\n`);
};

module.exports = { scheduleReminders };
