const cron = require('node-cron');
const JobApplication = require('../models/JobApplication.model');
const Profile = require('../models/Profile.model');
const Post = require('../models/Post.model');
const User = require('../models/User.model');
const { sendInterviewInvitation } = require('../utils/email-service');
const { AUTO_INVITE_CONFIG, SCHEDULER_TIME_WINDOW } = require('../constants/scheduler.constants');

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

const calculateHoursSinceLastInvite = (lastSentAt) => {
  if (!lastSentAt) return null;
  const now = new Date();
  const hoursElapsed = (now - new Date(lastSentAt)) / (1000 * 60 * 60);
  return hoursElapsed;
};

const sendAutoInvitation = async (application) => {
  try {
    const MSG = AUTO_INVITE_CONFIG.MESSAGES;
    console.log(`\n${MSG.PROCESSING_APP.replace('%id%', application._id)}`);

    // Fetch candidate profile
    const candidateProfile = await Profile.findById(application.profile).populate('userId');
    if (!candidateProfile || !candidateProfile.userId) {
      console.error(`${MSG.CANDIDATE_PROFILE_NOT_FOUND.replace('%id%', application._id)}`);
      return false;
    }

    // Fetch post details
    const post = await Post.findById(application.post);
    if (!post) {
      console.error(`${MSG.POST_NOT_FOUND.replace('%id%', application._id)}`);
      return false;
    }

    // Fetch company details
    const company = await User.findById(post.user);
    if (!company) {
      console.error(`${MSG.COMPANY_NOT_FOUND.replace('%id%', post._id)}`);
      return false;
    }

    const candidateEmail = candidateProfile.userId.email;
    const candidateName = `${candidateProfile.firstName} ${candidateProfile.lastName}`;
    const jobTitle = post.jobDetails?.title || 'Position';
    const companyProfile = await Profile.findOne({ userId: post.user }).select('companyDetails').lean();
    const companyName = companyProfile?.companyDetails?.name || company.username || company.email || 'Our Company';

    console.log(`   📧 To: ${candidateEmail}`);
    console.log(`   👤 Candidate: ${candidateName}`);
    console.log(`   📋 Position: ${jobTitle}`);
    console.log(`   🏢 Company: ${companyName}`);

    // Send interview invitation email
    const emailSent = await sendInterviewInvitation(
      candidateEmail,
      candidateName,
      jobTitle,
      companyName,
      null, // No specific date
      null, // No specific time
      null  // No specific link
    );

    if (!emailSent) {
      console.error(`${MSG.EMAIL_FAILED.replace('%email%', candidateEmail)}`);
      return false;
    }

    console.log(`${MSG.EMAIL_SUCCESS.replace('%email%', candidateEmail)}`);

    // Update application with invitation tracking
    const invitationCount = (application.autoInvitationCount || 0) + 1;
    
    await JobApplication.findByIdAndUpdate(
      application._id,
      {
        autoInvitationSent: true,
        lastAutoInvitationSentAt: new Date(),
        autoInvitationCount: invitationCount,
        updatedAt: new Date()
      },
      { new: true }
    );

    console.log(`${MSG.APP_UPDATED.replace('%count%', invitationCount)}`);
    return true;

  } catch (error) {
    console.error(`${AUTO_INVITE_CONFIG.MESSAGES.ERROR.replace('%id%', application._id).replace('%error%', error.message)}`);
    return false;
  }
};

const runAutoInviteJob = async () => {
  try {
    const MSG = AUTO_INVITE_CONFIG.MESSAGES;
    const CONFIG = AUTO_INVITE_CONFIG;
    
    console.log(`\n⏰ [AUTO INVITE SCHEDULER] Running at ${new Date().toLocaleString()}`);

    // Check if we're within the time window
    if (!isWithinTimeWindow()) {
      const currentHour = new Date().getHours();
      console.log(`${MSG.OUTSIDE_WINDOW}`);
      console.log(`   ⏰ Auto-invitations are only sent between ${SCHEDULER_TIME_WINDOW.START_HOUR}:00 and ${SCHEDULER_TIME_WINDOW.END_HOUR}:00`);
      return;
    }

    console.log(`${MSG.WITHIN_WINDOW}`);

    // Find applications that:
    // 1. Have status "visited" (NOT interview_completed)
    // 2. Were applied 24+ hours ago
    // 3. Haven't had an invitation sent OR last sent 24+ hours ago
    const twentyFourHoursAgo = new Date(Date.now() - CONFIG.FIRST_INVITE_HOURS * 60 * 60 * 1000);

    // Find two groups of applications:
    // Group 1: First-time invites (24+ hours since application, never invited)
    const firstTimeInvites = await JobApplication.find({
      appliedAt: { $lte: twentyFourHoursAgo },
      status: { $in: CONFIG.VALID_STATUSES },
      autoInvitationSent: { $ne: true }
    }).populate('profile post company').limit(CONFIG.BATCH_LIMIT);

    // Group 2: Recurring invites (24+ hours since last invite, still pending)
    const recurringInvites = await JobApplication.find({
      lastAutoInvitationSentAt: { $lte: twentyFourHoursAgo },
      status: { $in: CONFIG.VALID_STATUSES },
      autoInvitationSent: true,
      autoInvitationCount: { $gte: 1 }
    }).populate('profile post company').limit(CONFIG.BATCH_LIMIT);

    const pendingApplications = [...firstTimeInvites, ...recurringInvites];

    console.log(`${MSG.FOUND_APPLICATIONS.replace('%firstTime%', firstTimeInvites.length).replace('%recurring%', recurringInvites.length)}`);
    console.log(`${MSG.TOTAL_ELIGIBLE.replace('%total%', pendingApplications.length)}`);

    if (pendingApplications.length === 0) {
      console.log(`${MSG.NO_PENDING}`);
      return;
    }

    let successCount = 0;
    let failureCount = 0;

    for (const application of pendingApplications) {
      const hoursElapsed = calculateHoursSinceApplication(application.appliedAt);
      const hoursSinceLastInvite = calculateHoursSinceLastInvite(application.lastAutoInvitationSentAt);
      
      console.log(`\n📋 Application ${application._id}`);
      console.log(`   ⏱️  Hours since application: ${hoursElapsed.toFixed(2)}`);
      if (hoursSinceLastInvite) {
        console.log(`   🔄 Hours since last invite: ${hoursSinceLastInvite.toFixed(2)}`);
      }
      console.log(`   📧 Invitation #${application.autoInvitationCount + 1}`);
      console.log(`   Status: ${application.status}`);

      const sent = await sendAutoInvitation(application);
      if (sent) {
        successCount++;
      } else {
        failureCount++;
      }
    }

    console.log(`\n${MSG.BATCH_COMPLETE}`);
    console.log(`${MSG.SENT.replace('%count%', successCount)}`);
    console.log(`${MSG.FAILED.replace('%count%', failureCount)}`);

  } catch (error) {
    console.error(`${AUTO_INVITE_CONFIG.MESSAGES.JOB_ERROR.replace('%error%', error.message)}`);
  }
};

// Schedule the job to run every hour
const scheduleAutoInvites = () => {
  const MSG = AUTO_INVITE_CONFIG.MESSAGES;
  console.log(`${MSG.INIT}`);
  
  // Run every hour at minute 0
  cron.schedule(AUTO_INVITE_CONFIG.CRON_PATTERN, () => {
    runAutoInviteJob();
  });

  console.log(`${MSG.RUNNING}`);
};

module.exports = { scheduleAutoInvites, runAutoInviteJob };
