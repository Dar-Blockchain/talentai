const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");
const compileTemplate = (templateName) => {
  const filePath = path.join(__dirname, "../templates/emails", templateName);
  const source = fs.readFileSync(filePath, "utf8");
  return handlebars.compile(source);
};

// Build transport from env (EMAIL_HOST / EMAIL_PORT / EMAIL_SECURE / EMAIL_USER / EMAIL_PASSWORD).
// Defaults: port 465 + TLS. For STARTTLS use EMAIL_PORT=587 EMAIL_SECURE=false.
function getMailTransportOptions() {
  const port = parseInt(process.env.EMAIL_PORT || "465", 10) || 465;
  const secureEnv = process.env.EMAIL_SECURE;
  const secure = secureEnv !== undefined ? /^true$/i.test(String(secureEnv)) : port === 465;
  const opts = {
    host: process.env.EMAIL_HOST,
    port,
    secure,
    auth: {
      user: process.env.NO_REPLY_EMAIL || process.env.EMAIL_USER,
      pass: process.env.NO_REPLY_EMAIL_PASSWORD || process.env.EMAIL_PASSWORD,
    },
  };
  if (port === 587 && !secure) opts.requireTLS = true;
  return opts;
}

const transporter = nodemailer.createTransport(getMailTransportOptions());

// "From" must match the SMTP authenticated address (EMAIL_USER), otherwise providers
// reject the message (553 not owned). The display name signals no-reply to recipients.
const FROM_ADDRESS =
  `"TalentAI" <${process.env.NO_REPLY_EMAIL || process.env.EMAIL_USER || "contact@talentai.bid"}>`;

// Verify SMTP at startup so misconfigurations are visible immediately
transporter
  .verify()
  .catch((err) =>
    console.error("❌ SMTP verification failed:", err.message)
  );

// Locale files
const locales = {
  en: require("../locales/en.json"),
  fr: require("../locales/fr.json"),
};

// Compiled templates (loaded once at startup)
const otpTemplate                      = compileTemplate("auth/auth-otp.hbs");
const organizationInviteTemplate       = compileTemplate("team/team-invitation.hbs");
const interviewAssessmentTemplate      = compileTemplate("interview/candidate-assessment-completed.hbs");
const interviewCompletionTemplate      = compileTemplate("interview/company-assessment-completed.hbs");
const interviewInvitationTemplate      = compileTemplate("interview/candidate-invitation.hbs");
const contactCandidateTemplate         = compileTemplate("contact/contact-candidate.hbs");
const interviewNudgeTemplates          = {
  1: compileTemplate("interview/nudge-1.hbs"),
  2: compileTemplate("interview/nudge-2.hbs"),
  3: compileTemplate("interview/nudge-3.hbs"),
};
const contactEnterpriseTemplate        = compileTemplate("contact/contact-enterprise.hbs");
const campaignInviteTemplate           = compileTemplate("campaign/campaign-invite.hbs");
const campaignDeadlineReminderTemplate = compileTemplate("campaign/campaign-deadline-reminder.hbs");
const planUpgradeReminderTemplate      = compileTemplate("company/plan-upgrade-reminder.hbs");
const jobMatchTemplate                 = compileTemplate("job/job-match.hbs");

// Format role: "project_manager" → "Project Manager"
const formatRole = (role) =>
  (role || "")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

// Shared inline logo attachment
const logoAttachment = {
  filename: "logo.png",
  path: path.join(__dirname, "../templates/images/logo.png"),
  cid: "logo",
};

const year = new Date().getFullYear();

// ─── Send OTP ────────────────────────────────────────────────────────────────
const sendOTP = async (email, otp, language = "fr") => {
  const locale = locales[language] || locales.en;
  const t = { ...locale.common, ...locale.otp };
  const mailOptions = {
    from: FROM_ADDRESS,
    to: email,
    subject: locale.email_subjects.otp,
    html: otpTemplate({ t, otp, year }),
    attachments: [logoAttachment],
  };
  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("❌ OTP email failed:", error.message);
    return false;
  }
};

// ─── Send Company Invitation ──────────────────────────────────────────────────
const sendCompanyInvitation = async (to, orgName, role, inviterEmail, invitationLink = "#", language = "en") => {
  const locale = locales[language] || locales.en;
  const t = { ...locale.common, ...locale.team_invitation };
  const s = locale.email_subjects;
  const subject = `${s.team_invitation_prefix} ${orgName} ${s.team_invitation_as} ${formatRole(role)}`;
  const mailOptions = {
    from: FROM_ADDRESS,
    to,
    subject,
    html: organizationInviteTemplate({ t, orgName, role: formatRole(role), inviter: inviterEmail, invitationLink, year }),
    attachments: [logoAttachment],
  };
  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("❌ Company invitation failed:", error.message);
    return false;
  }
};

// ─── Send Interview Assessment (to candidate) ────────────────────────────────
const sendInterviewAssessmentEmail = async (candidateEmail, candidateName, postTitle, language = "en") => {
  const locale = locales[language] || locales.en;
  const t = { ...locale.common, ...locale.candidate_assessment };
  const s = locale.email_subjects;
  const subject = `${s.candidate_assessment_prefix} ${postTitle || (language === "fr" ? "Nouvelle opportunité" : "New Opportunity")}`;
  const mailOptions = {
    from: FROM_ADDRESS,
    to: candidateEmail,
    subject,
    html: interviewAssessmentTemplate({ t, candidateName, postTitle: postTitle || (language === "fr" ? "Poste" : "Position"), year }),
    attachments: [logoAttachment],
  };
  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("❌ Interview assessment email failed:", error.message);
    return false;
  }
};

// ─── Send Interview Completion Notification (to company) ────────────────────
const sendInterviewCompletionNotificationToCompany = async (companyEmail, companyName, candidateName, postTitle, candidateEmail, language = "en") => {
  const locale = locales[language] || locales.en;
  const t = { ...locale.common, ...locale.company_assessment };
  const s = locale.email_subjects;
  const subject = `${s.company_assessment_prefix} ${candidateName} ${s.company_assessment_for} ${postTitle || (language === "fr" ? "Poste" : "Position")}`;
  const mailOptions = {
    from: FROM_ADDRESS,
    to: companyEmail,
    subject,
    html: interviewCompletionTemplate({ t, companyName, candidateName, postTitle: postTitle || (language === "fr" ? "Poste" : "Position"), candidateEmail, year }),
    attachments: [logoAttachment],
  };
  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("❌ Interview completion notification failed:", error.message);
    return false;
  }
};

// ─── Send Interview Invitation (to candidate) ────────────────────────────────
const sendInterviewInvitation = async (candidateEmail, candidateName, jobTitle, companyName, interviewDate = null, interviewTime = null, interviewLink = null, language = "en") => {
  const locale = locales[language] || locales.en;
  const t = { ...locale.common, ...locale.candidate_invitation };
  const s = locale.email_subjects;
  const subject = `${s.candidate_invitation_prefix} ${jobTitle} ${s.at} ${companyName}`;
  const mailOptions = {
    from: FROM_ADDRESS,
    to: candidateEmail,
    subject,
    html: interviewInvitationTemplate({ t, candidateName, jobTitle, companyName, interviewDate, interviewTime, interviewLink, year }),
    attachments: [logoAttachment],
  };
  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("❌ Interview invitation failed:", error.message);
    return false;
  }
};

// ─── Send Interview Nudge Emails (cron-triggered reminders) ──────────────────
const sendInterviewNudge = async (candidateEmail, { firstName, jobTitle, companyName, interviewLink, deadline }, nudgeNumber, language = "en") => {
  const locale = locales[language] || locales.en;
  const nudgeKey = `nudge${nudgeNumber}`;
  const t = { ...locale.common, ...locale[nudgeKey] };
  const s = locale.email_subjects;
  const subjects = {
    1: `${s.nudge1_prefix} ${jobTitle} ${s.at} ${companyName}`,
    2: `${s.nudge2_prefix} ${jobTitle} ${s.at} ${companyName}`,
    3: `${s.nudge3_prefix} ${jobTitle}`,
  };
  const template = interviewNudgeTemplates[nudgeNumber];
  if (!template) return false;
  const mailOptions = {
    from: FROM_ADDRESS,
    to: candidateEmail,
    subject: subjects[nudgeNumber],
    html: template({ t, firstName, jobTitle, companyName, interviewLink, deadline, year }),
    attachments: [logoAttachment],
  };
  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error(`❌ Interview nudge #${nudgeNumber} failed:`, error.message);
    return false;
  }
};

// ─── Send Direct Message to Candidate (from company) ─────────────────────────
const sendCandidateEmail = async (to, candidateName, fromCompanyName, subject, message, language = "en") => {
  const locale = locales[language] || locales.en;
  const t = { ...locale.common, ...locale.contact_candidate };
  const senderAddr = process.env.NO_REPLY_EMAIL;
  const mailOptions = {
    from: `"${fromCompanyName} via TalentAI" <${senderAddr}>`,
    to,
    subject,
    html: contactCandidateTemplate({ t, candidateName, companyName: fromCompanyName, subject, message, year }),
    attachments: [logoAttachment],
  };
  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("❌ Candidate email failed:", error.message);
    return false;
  }
};

// ─── Send Plan Upgrade Reminder to Company ───────────────────────────────────
const sendPlanUpgradeReminder = async (companyEmail, companyName, language = "en") => {
  const locale = locales[language] || locales.en;
  const t = { ...locale.common, ...locale.plan_upgrade };
  const upgradeUrl = `${process.env.FRONTEND_URL}company/plans`;
  const mailOptions = {
    from: FROM_ADDRESS,
    to: companyEmail,
    subject: locale.email_subjects.plan_upgrade,
    html: planUpgradeReminderTemplate({ t, companyName, upgradeUrl, year }),
    attachments: [logoAttachment],
  };
  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error(`❌ Plan upgrade reminder failed for ${companyEmail}:`, error.message);
    return false;
  }
};

// ─── Send Campaign Invitation ────────────────────────────────────────────────
const sendCampaignInvitation = async (to, { participantName, companyName, campaignTitle, moduleLabel, deadline, campaignDescription, assessmentLink }, language = "en") => {
  const locale = locales[language] || locales.en;
  const t = { ...locale.common, ...locale.campaign_invite };
  const subject = `${locale.email_subjects.campaign_invite_prefix} ${campaignTitle}`;
  const mailOptions = {
    from: FROM_ADDRESS,
    to,
    subject,
    html: campaignInviteTemplate({ t, participantName, companyName, campaignTitle, moduleLabel, deadline, campaignDescription, assessmentLink, year }),
    attachments: [logoAttachment],
  };
  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("❌ Campaign invitation failed:", error.message);
    return false;
  }
};

// ─── Send Campaign Deadline Reminder ─────────────────────────────────────────
const sendCampaignDeadlineReminder = async (to, { participantName, companyName, campaignTitle, moduleLabel, deadline, hoursLeft, assessmentLink }, language = "en") => {
  const locale = locales[language] || locales.en;
  const t = { ...locale.common, ...locale.campaign_deadline };
  const s = locale.email_subjects;
  const subject = `${s.campaign_deadline_p1} ${hoursLeft}${s.campaign_deadline_p2} ${campaignTitle}`;
  const mailOptions = {
    from: FROM_ADDRESS,
    to,
    subject,
    html: campaignDeadlineReminderTemplate({ t, participantName, companyName, campaignTitle, moduleLabel, deadline, hoursLeft, assessmentLink, year }),
    attachments: [logoAttachment],
  };
  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("❌ Campaign deadline reminder failed:", error.message);
    return false;
  }
};

// ─── Send Enterprise Inquiry (to TalentAI team) ──────────────────────────────
const sendEnterpriseInquiry = async ({ name, email, company, message }) => {
  const mailOptions = {
    from: `"TalentAI" <${process.env.EMAIL_USER || "contact@talentai.bid"}>`,
    to: process.env.EMAIL_USER || "contact@talentai.bid",
    replyTo: email,
    subject: `[TalentAI Enterprise] ${name}${company ? ` — ${company}` : ""}`,
    html: contactEnterpriseTemplate({ name, email, company, message, year }),
    attachments: [logoAttachment],
  };
  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("❌ Enterprise inquiry email failed:", error.message);
    return false;
  }
};

// ─── Send Job Match Email (to candidate when a new matching post is published) ──
const sendJobMatchEmail = async (candidateEmail, { candidateName, jobTitle, companyName, experienceLevel, workMode, matchedSkills, matchScore, jobLink }, language = "en") => {
  const locale = locales[language] || locales.en;
  const t = { ...locale.common, ...locale.job_match };
  const subject = `${locale.email_subjects.job_match_prefix} ${jobTitle} ${locale.email_subjects.at} ${companyName}`;
  const mailOptions = {
    from: FROM_ADDRESS,
    to: candidateEmail,
    subject,
    html: jobMatchTemplate({ t, candidateName, jobTitle, companyName, experienceLevel, workMode, matchedSkills, matchScore, jobLink, year }),
    attachments: [logoAttachment],
  };
  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error(`❌ Job match email failed for ${candidateEmail}:`, error.message);
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
  sendJobMatchEmail,
  transporter,
};
