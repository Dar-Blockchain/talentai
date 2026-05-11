const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");
const { getMailTransportOptions } = require("./mail-transport-options");

const compileTemplate = (templateName) => {
  const filePath = path.join(__dirname, "../templates/emails", templateName);
  const source = fs.readFileSync(filePath, "utf8");
  return handlebars.compile(source);
};

// Build transport from env (EMAIL_HOST / EMAIL_PORT / EMAIL_SECURE / EMAIL_USER / EMAIL_PASSWORD).
// Defaults: port 465 + TLS. For STARTTLS use EMAIL_PORT=587 EMAIL_SECURE=false.
const transporter = nodemailer.createTransport(getMailTransportOptions());

// "From" must match the SMTP authenticated address (EMAIL_USER), otherwise providers
// reject the message (553 not owned). The display name signals no-reply to recipients.
const FROM_ADDRESS =
  `"TalentAI (no-reply)" <${process.env.NO_REPLY_EMAIL || "contact@talentai.bid"}>`;

// Verify SMTP at startup so misconfigurations are visible immediately
transporter
  .verify()
  .then(() =>
    console.log(
      `📧 SMTP ready: ${process.env.EMAIL_HOST}:${process.env.EMAIL_PORT || 465}`
    )
  )
  .catch((err) =>
    console.error("❌ SMTP verification failed:", err.message)
  );

// Compiled templates (loaded once at startup)
const otpTemplate                    = compileTemplate("auth/auth-otp.hbs");
const organizationInviteTemplate     = compileTemplate("team/team-invitation.hbs");
const interviewAssessmentTemplate    = compileTemplate("interview/candidate-assessment-completed.hbs");
const interviewCompletionTemplate    = compileTemplate("interview/company-assessment-completed.hbs");
const interviewInvitationTemplate    = compileTemplate("interview/candidate-invitation.hbs");
const contactCandidateTemplate       = compileTemplate("contact/contact-candidate.hbs");
const interviewNudge1Template        = compileTemplate("interview/nudge-1.hbs");
const interviewNudge2Template        = compileTemplate("interview/nudge-2.hbs");
const interviewNudge3Template        = compileTemplate("interview/nudge-3.hbs");
const contactEnterpriseTemplate      = compileTemplate("contact/contact-enterprise.hbs");
const campaignInviteTemplate           = compileTemplate("campaign/campaign-invite.hbs");
const campaignDeadlineReminderTemplate = compileTemplate("campaign/campaign-deadline-reminder.hbs");
const planUpgradeReminderTemplate      = compileTemplate("company/plan-upgrade-reminder.hbs");

// Format role: "project_manager" → "Project Manager"
const formatRole = (role) =>
  (role || "")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

// Shared inline logo attachment
const logoAttachment = {
  filename: "logocompany.png",
  path: path.join(__dirname, "../templates/images/logocompany.png"),
  cid: "logocompany",
};

const year = new Date().getFullYear();

// ─── Send OTP ────────────────────────────────────────────────────────────────
const sendOTP = async (email, otp) => {
  const mailOptions = {
    from: FROM_ADDRESS,
    to: email,
    subject: "Verification Code - TalentAI",
    html: otpTemplate({ otp, year }),
    attachments: [logoAttachment],
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ OTP email sent to", email);
    return true;
  } catch (error) {
    console.error("❌ OTP email failed:", error.message);
    return false;
  }
};

// ─── Send Company Invitation ──────────────────────────────────────────────────
const sendCompanyInvitation = async (to, orgName, role, inviterEmail, invitationLink = "#") => {
  const mailOptions = {
    from: FROM_ADDRESS,
    to,
    subject: `Invitation: Join ${orgName} as ${role}`,
    html: organizationInviteTemplate({ orgName, role: formatRole(role), inviter: inviterEmail, invitationLink, year }),
    attachments: [logoAttachment],
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Company invitation sent to ${to}`);
    return true;
  } catch (error) {
    console.error("❌ Company invitation failed:", error.message);
    return false;
  }
};

// ─── Send Interview Assessment (to candidate) ────────────────────────────────
const sendInterviewAssessmentEmail = async (candidateEmail, candidateName, postTitle) => {
  const mailOptions = {
    from: FROM_ADDRESS,
    to: candidateEmail,
    subject: `Interview Assessment Completed – ${postTitle || "New Opportunity"}`,
    html: interviewAssessmentTemplate({ candidateName, postTitle: postTitle || "Position", year }),
    attachments: [logoAttachment],
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Interview assessment email sent to ${candidateEmail}`);
    return true;
  } catch (error) {
    console.error("❌ Interview assessment email failed:", error.message);
    return false;
  }
};

// ─── Send Interview Completion Notification (to company) ────────────────────
const sendInterviewCompletionNotificationToCompany = async (companyEmail, companyName, candidateName, postTitle, candidateEmail) => {
  const mailOptions = {
    from: FROM_ADDRESS,
    to: companyEmail,
    subject: `Interview Completed – ${candidateName} for ${postTitle || "Position"}`,
    html: interviewCompletionTemplate({ companyName, candidateName, postTitle: postTitle || "Position", candidateEmail, year }),
    attachments: [logoAttachment],
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Interview completion notification sent to ${companyEmail}`);
    return true;
  } catch (error) {
    console.error("❌ Interview completion notification failed:", error.message);
    return false;
  }
};

// ─── Send Interview Invitation (to candidate) ────────────────────────────────
const sendInterviewInvitation = async (candidateEmail, candidateName, jobTitle, companyName, interviewDate = null, interviewTime = null, interviewLink = null) => {
  const mailOptions = {
    from: FROM_ADDRESS,
    to: candidateEmail,
    subject: `Interview Invitation – ${jobTitle} at ${companyName}`,
    html: interviewInvitationTemplate({ candidateName, jobTitle, companyName, interviewDate, interviewTime, interviewLink, year }),
    attachments: [logoAttachment],
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Interview invitation sent to ${candidateEmail}`);
    return true;
  } catch (error) {
    console.error("❌ Interview invitation failed:", error.message);
    return false;
  }
};

// ─── Send Interview Nudge Emails (cron-triggered reminders) ──────────────────
const sendInterviewNudge = async (candidateEmail, { firstName, jobTitle, companyName, interviewLink, deadline }, nudgeNumber) => {
  const templates = { 1: interviewNudge1Template, 2: interviewNudge2Template, 3: interviewNudge3Template };
  const subjects  = {
    1: `Your AI interview is ready — ${jobTitle} at ${companyName}`,
    2: `Still waiting for you — ${jobTitle} at ${companyName}`,
    3: `Last chance: interview closes tomorrow — ${jobTitle}`,
  };
  const template = templates[nudgeNumber];
  if (!template) return false;
  const mailOptions = {
    from: FROM_ADDRESS,
    to: candidateEmail,
    subject: subjects[nudgeNumber],
    html: template({ firstName, jobTitle, companyName, interviewLink, deadline, year }),
    attachments: [logoAttachment],
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Interview nudge #${nudgeNumber} sent to ${candidateEmail}`);
    return true;
  } catch (error) {
    console.error(`❌ Interview nudge #${nudgeNumber} failed:`, error.message);
    return false;
  }
};

// ─── Send Direct Message to Candidate (from company) ─────────────────────────
const sendCandidateEmail = async (to, candidateName, fromCompanyName, subject, message) => {
  const senderAddr = process.env.EMAIL_USER || "contact@talentai.bid";
  const mailOptions = {
    from: `"${fromCompanyName} via TalentAI" <${senderAddr}>`,
    to,
    subject,
    html: contactCandidateTemplate({ candidateName, companyName: fromCompanyName, subject, message, year }),
    attachments: [logoAttachment],
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Candidate email sent to ${to}`);
    return true;
  } catch (error) {
    console.error("❌ Candidate email failed:", error.message);
    return false;
  }
};

// ─── Send Plan Upgrade Reminder to Company ───────────────────────────────────
const sendPlanUpgradeReminder = async (companyEmail, companyName) => {
  const upgradeUrl = `${process.env.FRONTEND_URL || 'https://talentai.bid/'}company/plans`;
  const mailOptions = {
    from: FROM_ADDRESS,
    to: companyEmail,
    subject: '🚀 Upgrade your TalentAI plan to unlock full access',
    html: planUpgradeReminderTemplate({ companyName, upgradeUrl, year }),
    attachments: [logoAttachment],
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Plan upgrade reminder sent to ${companyEmail}`);
    return true;
  } catch (error) {
    console.error(`❌ Plan upgrade reminder failed for ${companyEmail}:`, error.message);
    return false;
  }
};

// ─── Send Campaign Invitation ────────────────────────────────────────────────
const sendCampaignInvitation = async (to, { participantName, companyName, campaignTitle, moduleLabel, deadline, campaignDescription, assessmentLink }) => {
  const mailOptions = {
    from: FROM_ADDRESS,
    to,
    subject: `You've been assigned to a campaign — ${campaignTitle}`,
    html: campaignInviteTemplate({ participantName, companyName, campaignTitle, moduleLabel, deadline, campaignDescription, assessmentLink, year }),
    attachments: [logoAttachment],
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Campaign invitation sent to ${to}`);
    return true;
  } catch (error) {
    console.error("❌ Campaign invitation failed:", error.message);
    return false;
  }
};

// ─── Send Campaign Deadline Reminder ─────────────────────────────────────────
const sendCampaignDeadlineReminder = async (to, { participantName, companyName, campaignTitle, moduleLabel, deadline, hoursLeft, assessmentLink }) => {
  const mailOptions = {
    from: FROM_ADDRESS,
    to,
    subject: `⏰ Deadline in ${hoursLeft}h — complete your assessment for ${campaignTitle}`,
    html: campaignDeadlineReminderTemplate({ participantName, companyName, campaignTitle, moduleLabel, deadline, hoursLeft, assessmentLink, year }),
    attachments: [logoAttachment],
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Campaign deadline reminder sent to ${to}`);
    return true;
  } catch (error) {
    console.error("❌ Campaign deadline reminder failed:", error.message);
    return false;
  }
};

// ─── Send Enterprise Inquiry (to TalentAI team) ──────────────────────────────
const sendEnterpriseInquiry = async ({ name, email, company, message }) => {
  const mailOptions = {
    from: FROM_ADDRESS,
    to: process.env.EMAIL_USER || "contact@talentai.bid",
    replyTo: email,
    subject: `[TalentAI Enterprise] ${name}${company ? ` — ${company}` : ""}`,
    html: contactEnterpriseTemplate({ name, email, company, message, year }),
    attachments: [logoAttachment],
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Enterprise inquiry email received from ${email}`);
    return true;
  } catch (error) {
    console.error("❌ Enterprise inquiry email failed:", error.message);
    return false;
  }
};

module.exports = {
  sendOTP,
  sendCompanyInvitation,
  sendInterviewAssessmentEmail,
  sendInterviewCompletionNotificationToCompany,
  sendInterviewInvitation,
  sendInterviewNudge,
  sendCandidateEmail,
  sendPlanUpgradeReminder,
  sendEnterpriseInquiry,
  sendCampaignInvitation,
  sendCampaignDeadlineReminder,
  transporter,
};
