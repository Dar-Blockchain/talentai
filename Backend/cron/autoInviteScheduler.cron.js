const cron = require('node-cron');
const JobApplication = require('../models/JobApplication.model');
const Profile = require('../models/Profile.model');
const Post = require('../models/Post.model');
const User = require('../models/User.model');
const { sendInterviewNudge } = require('../utils/email-service');
const { AUTO_INVITE_CONFIG, SCHEDULER_TIME_WINDOW } = require('../constants/scheduler.constants');
const logger = require('../utils/logger');

/**
 * Auto Interview Invitation Scheduler
 * 
 * Sends automatic invitations to candidates:
 * - First: 24 hours after application
 * - Then: Every 24 hours until interview_completed
 * 
 * Features:
 * - Only sends between 12:00 and 21:00
 * - Prevents duplicate invitations
 * - Tracks invitation count
 */

const isWithinTimeWindow = () => {
  const currentHour = new Date().getHours();
  return currentHour >= SCHEDULER_TIME_WINDOW.START_HOUR && currentHour < SCHEDULER_TIME_WINDOW.END_HOUR;
};

const calculateHoursSinceApplication = (appliedAt) => {
  const now = new Date();
  const hoursElapsed = (now - new Date(appliedAt)) / (1000 * 60 * 60);
  return hoursElapsed;
};

const sendAutoInvitation = async (application) => {
  try {
    const MSG = AUTO_INVITE_CONFIG.MESSAGES;
    logger.debug(`${MSG.PROCESSING_APP.replace('%id%', application._id)}`);

    // Fetch candidate profile
    const candidateProfile = await Profile.findById(application.profile).populate('userId');
    if (!candidateProfile || !candidateProfile.userId) {
      logger.error(`${MSG.CANDIDATE_PROFILE_NOT_FOUND.replace('%id%', application._id)}`);
      return false;
    }

    // Fetch post details
    const post = await Post.findById(application.post);
    if (!post) {
      logger.error(`${MSG.POST_NOT_FOUND.replace('%id%', application._id)}`);
      return false;
    }

    // Fetch company details
    const company = await User.findById(post.user);
    if (!company) {
      logger.error(`${MSG.COMPANY_NOT_FOUND.replace('%id%', post._id)}`);
      return false;
    }

    const candidateEmail = candidateProfile.userId.email;
    const firstName = candidateProfile.firstName || candidateProfile.userId.username || 'there';
    const jobTitle = post.jobDetails?.title || 'Position';
    const companyProfile = await Profile.findOne({ userId: post.user }).select('companyDetails').lean();
    const companyName = companyProfile?.companyDetails?.name || company.username || company.email || 'Our Company';
    const interviewLink = `${process.env.BASE_URL}candidate/interview/hr/?jobId=${post._id}&companyId=${post.user}&ref=link`;

    logger.debug(`   📧 To: ${candidateEmail}`);
    logger.debug(`   👤 Candidate: ${firstName}`);
    logger.debug(`   📋 Position: ${jobTitle}`);
    logger.debug(`   🏢 Company: ${companyName}`);
    logger.debug(`   🔗 Interview Link: ${interviewLink}`);

    // Nudge #1 — welcoming first invitation (24h after applying)
    const emailSent = await sendInterviewNudge(
      candidateEmail,
      { firstName, jobTitle, companyName, interviewLink, deadline: null },
      1
    );

    if (!emailSent) {
      logger.error(`${MSG.EMAIL_FAILED.replace('%email%', candidateEmail)}`);
      return false;
    }

    logger.info(`${MSG.EMAIL_SUCCESS.replace('%email%', candidateEmail)}`);

    // Update application with invitation tracking
    await JobApplication.findByIdAndUpdate(
      application._id,
      {
        firstInvitationSentAt: new Date(),
        updatedAt: new Date()
      },
      { new: true }
    );

    logger.info(`${MSG.APP_UPDATED.replace('%count%', '1')}`);
    return true;

  } catch (error) {
    logger.error(`${AUTO_INVITE_CONFIG.MESSAGES.ERROR.replace('%id%', application._id).replace('%error%', error.message)}`);
    return false;
  }
};

const runAutoInviteJob = async ({ force = false } = {}) => {
  try {
    const MSG = AUTO_INVITE_CONFIG.MESSAGES;
    const CONFIG = AUTO_INVITE_CONFIG;

   // logger.debug(`⏰ [AUTO INVITE SCHEDULER] Running at ${new Date().toLocaleString()}${force ? ' (FORCED)' : ''}`);

    // Check if we're within the time window (skip when forced or in test mode)
    if (!force && !isWithinTimeWindow()) {
      const currentHour = new Date().getHours();
     // logger.debug(`${MSG.OUTSIDE_WINDOW}`);
     // logger.debug(`   ⏰ Auto-invitations are only sent between ${SCHEDULER_TIME_WINDOW.START_HOUR}:00 and ${SCHEDULER_TIME_WINDOW.END_HOUR}:00`);
      return;
    }

    // logger.debug(`${MSG.WITHIN_WINDOW}`);

    // Find applications that need first-time invitations
    // (Applied FIRST_INVITE_HOURS hours ago and never invited)
    const firstTimeInvites = await JobApplication.find({
      appliedAt: { $lte: new Date(Date.now() - AUTO_INVITE_CONFIG.FIRST_INVITE_HOURS * 60 * 60 * 1000) },
      status: { $in: AUTO_INVITE_CONFIG.VALID_STATUSES },
      firstInvitationSentAt: null,
      isArchived: false,
      isWithdrawn: false
    }).populate('profile post company').limit(AUTO_INVITE_CONFIG.BATCH_LIMIT);

    const pendingApplications = firstTimeInvites;

    logger.info(`${MSG.FOUND_APPLICATIONS.replace('%firstTime%', firstTimeInvites.length).replace('%recurring%', '0')}`);
    logger.info(`${MSG.TOTAL_ELIGIBLE.replace('%total%', pendingApplications.length)}`);
    
    if (pendingApplications.length === 0) {
      logger.info(`${MSG.NO_PENDING}`);
      return;
    }

    let successCount = 0;
    let failureCount = 0;

    for (const application of pendingApplications) {
      const hoursElapsed = calculateHoursSinceApplication(application.appliedAt);
      
      // logger.debug(`\n📋 Application ${application._id}`);
      // logger.debug(`   ⏱️  Hours since application: ${hoursElapsed.toFixed(2)}`);
      // logger.debug(`   📧 Invitation #1`);
      // logger.debug(`   Status: ${application.status}`);

      const sent = await sendAutoInvitation(application);
      if (sent) {
        successCount++;
      } else {
        failureCount++;
      }
    }

    // logger.debug(`\n${MSG.BATCH_COMPLETE}`);
    // logger.debug(`${MSG.SENT.replace('%count%', successCount)}`);
    // logger.debug(`${MSG.FAILED.replace('%count%', failureCount)}`);

  } catch (error) {
    logger.error(`${AUTO_INVITE_CONFIG.MESSAGES.JOB_ERROR.replace('%error%', error.message)}`);
  }
};

// Schedule the job to run every hour
const scheduleAutoInvites = () => {
  const MSG = AUTO_INVITE_CONFIG.MESSAGES;
  // logger.debug(`${MSG.INIT}`);
  
  // Run every hour at minute 0
  cron.schedule(AUTO_INVITE_CONFIG.CRON_PATTERN, () => {
    runAutoInviteJob();
  });

  //logger.debug(`${MSG.RUNNING}`);
};

module.exports = { scheduleAutoInvites, runAutoInviteJob };
