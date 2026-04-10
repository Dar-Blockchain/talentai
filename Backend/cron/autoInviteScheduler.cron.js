const cron = require('node-cron');
const JobApplication = require('../models/JobApplication.model');
const Profile = require('../models/Profile.model');
const Post = require('../models/Post.model');
const User = require('../models/User.model');
const { sendInterviewInvitation } = require('../utils/email-service');
const jobApplicationService = require('../services/jobApplication.service');

/**
 * Auto Interview Invitation Scheduler - RECURRING
 * Sends interview invitations automatically:
 * - First: 24 hours after application
 * - Then: Daily until interview_completed status
 * - Only sends emails between 12:00 and 21:00 (noon to 9 PM)
 * 
 * Runs every hour to check for pending applications
 */

const isWithinTimeWindow = () => {
  const currentHour = new Date().getHours();
  return currentHour >= 12 && currentHour < 21; // Between 12:00 and 20:59
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
    console.log(`\n📧 [AUTO INVITATION] Processing application: ${application._id}`);

    // Fetch candidate profile
    const candidateProfile = await Profile.findById(application.profile).populate('userId');
    if (!candidateProfile || !candidateProfile.userId) {
      console.error(`❌ Candidate profile not found for application: ${application._id}`);
      return false;
    }

    // Fetch post details
    const post = await Post.findById(application.post);
    if (!post) {
      console.error(`❌ Post not found for application: ${application._id}`);
      return false;
    }

    // Fetch company details
    const company = await User.findById(post.user);
    if (!company) {
      console.error(`❌ Company not found for post: ${post._id}`);
      return false;
    }

    const candidateEmail = candidateProfile.userId.email;
    const candidateName = `${candidateProfile.firstName} ${candidateProfile.lastName}`;
    const jobTitle = post.jobDetails?.title || 'Position';
    const companyName = company.username || company.email || 'Our Company';

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
      console.error(`❌ Failed to send email to ${candidateEmail}`);
      return false;
    }

    console.log(`✅ Email sent successfully to ${candidateEmail}`);

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

    console.log(`✅ Application updated - Invitation #${invitationCount} sent`);
    return true;

  } catch (error) {
    console.error(`❌ Error sending auto invitation for application ${application._id}:`, error.message);
    return false;
  }
};

const runAutoInviteJob = async () => {
  try {
    console.log(`\n⏰ [AUTO INVITE SCHEDULER] Running at ${new Date().toLocaleString()}`);

    // Check if we're within the time window
    if (!isWithinTimeWindow()) {
      const currentHour = new Date().getHours();
      console.log(`⏭️  Outside time window (current hour: ${currentHour}). Skipping auto-invitations.`);
      console.log(`   ⏰ Auto-invitations are only sent between 12:00 and 21:00`);
      return;
    }

    console.log(`✅ Within time window (12:00 - 21:00). Processing auto-invitations...`);

    // Find applications that:
    // 1. Have status "applied" or "interview_scheduled" (NOT completed)
    // 2. Were applied 24+ hours ago
    // 3. Haven't had an invitation sent OR last sent 24+ hours ago
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Find two groups of applications:
    // Group 1: First-time invites (24+ hours since application, never invited)
    const firstTimeInvites = await JobApplication.find({
      appliedAt: { $lte: twentyFourHoursAgo },
      status: { $in: ['applied', 'interview_scheduled'] },
      autoInvitationSent: { $ne: true }
    }).populate('profile post company').limit(10);

    // Group 2: Recurring invites (24+ hours since last invite, still pending)
    const recurringInvites = await JobApplication.find({
      lastAutoInvitationSentAt: { $lte: twentyFourHoursAgo },
      status: { $in: ['applied', 'interview_scheduled'] },
      autoInvitationSent: true,
      autoInvitationCount: { $gte: 1 }
    }).populate('profile post company').limit(10);

    const pendingApplications = [...firstTimeInvites, ...recurringInvites];

    console.log(`📊 Found ${firstTimeInvites.length} first-time + ${recurringInvites.length} recurring invites`);
    console.log(`   Total: ${pendingApplications.length} application(s) eligible for auto-invitation`);

    if (pendingApplications.length === 0) {
      console.log(`✅ No pending auto-invitations at this time`);
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

    console.log(`\n📊 Auto-invitation batch complete:`);
    console.log(`   ✅ Sent: ${successCount}`);
    console.log(`   ❌ Failed: ${failureCount}`);

  } catch (error) {
    console.error(`\n❌ [AUTO INVITE SCHEDULER] Error:`, error.message);
  }
};

// Schedule the job to run every hour
const scheduleAutoInvites = () => {
  console.log(`🚀 Initializing auto-invite scheduler...`);
  
  // Run every hour at minute 0
  cron.schedule('0 * * * *', () => {
    runAutoInviteJob();
  });

  console.log(`✅ Auto-invite scheduler running: Hourly (daily between 12:00 - 21:00) until interview completed`);
};

module.exports = {
  scheduleAutoInvites,
  runAutoInviteJob,
  isWithinTimeWindow
};
