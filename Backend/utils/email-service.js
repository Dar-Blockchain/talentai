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
  `"TalentAI" <${process.env.NO_REPLY_EMAIL || process.env.EMAIL_USER || "contact@talentai.bid"}>`;

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
const otpTemplateEn                      = compileTemplate("auth/auth-otp.hbs");
const otpTemplateFr                      = compileTemplate("auth/auth-otp.fr.hbs");
const organizationInviteTemplateEn       = compileTemplate("team/team-invitation.hbs");
const organizationInviteTemplateFr       = compileTemplate("team/team-invitation.fr.hbs");
const interviewAssessmentTemplateEn      = compileTemplate("interview/candidate-assessment-completed.hbs");
const interviewAssessmentTemplateFr      = compileTemplate("interview/candidate-assessment-completed.fr.hbs");
const interviewCompletionTemplateEn      = compileTemplate("interview/company-assessment-completed.hbs");
const interviewCompletionTemplateFr      = compileTemplate("interview/company-assessment-completed.fr.hbs");
const interviewInvitationTemplateEn      = compileTemplate("interview/candidate-invitation.hbs");
const interviewInvitationTemplateFr      = compileTemplate("interview/candidate-invitation.fr.hbs");
const contactCandidateTemplate            = compileTemplate("contact/contact-candidate.hbs");
const interviewNudge1TemplateEn          = compileTemplate("interview/nudge-1.hbs");
const interviewNudge1TemplateFr          = compileTemplate("interview/nudge-1.fr.hbs");
const interviewNudge2TemplateEn          = compileTemplate("interview/nudge-2.hbs");
const interviewNudge2TemplateFr          = compileTemplate("interview/nudge-2.fr.hbs");
const interviewNudge3TemplateEn          = compileTemplate("interview/nudge-3.hbs");
const interviewNudge3TemplateFr          = compileTemplate("interview/nudge-3.fr.hbs");
const contactEnterpriseTemplate          = compileTemplate("contact/contact-enterprise.hbs");
const campaignInviteTemplateEn           = compileTemplate("campaign/campaign-invite.hbs");
const campaignInviteTemplateFr           = compileTemplate("campaign/campaign-invite.fr.hbs");
const campaignDeadlineReminderTemplateEn = compileTemplate("campaign/campaign-deadline-reminder.hbs");
const campaignDeadlineReminderTemplateFr = compileTemplate("campaign/campaign-deadline-reminder.fr.hbs");
const planUpgradeReminderTemplateEn      = compileTemplate("company/plan-upgrade-reminder.hbs");
const planUpgradeReminderTemplateFr      = compileTemplate("company/plan-upgrade-reminder.fr.hbs");
const jobMatchTemplateEn                 = compileTemplate("job/job-match.hbs");
const jobMatchTemplateFr                 = compileTemplate("job/job-match.fr.hbs");

const isFr = (language) => language === "fr";

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
  const isFr = language === "fr";
  const mailOptions = {
    from: FROM_ADDRESS,
    to: email,
    subject: isFr ? "Code de vérification - TalentAI" : "Verification Code - TalentAI",
    html: (isFr ? otpTemplateFr : otpTemplateEn)({ otp, year }),
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
const sendCompanyInvitation = async (to, orgName, role, inviterEmail, invitationLink = "#", language = "en") => {
  const fr = isFr(language);
  const template = fr ? organizationInviteTemplateFr : organizationInviteTemplateEn;
  const subject  = fr
    ? `Invitation : Rejoignez ${orgName} en tant que ${formatRole(role)}`
    : `Invitation: Join ${orgName} as ${formatRole(role)}`;
  const mailOptions = {
    from: FROM_ADDRESS,
    to,
    subject,
    html: template({ orgName, role: formatRole(role), inviter: inviterEmail, invitationLink, year }),
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
const sendInterviewAssessmentEmail = async (candidateEmail, candidateName, postTitle, language = "en") => {
  const fr = isFr(language);
  const template = fr ? interviewAssessmentTemplateFr : interviewAssessmentTemplateEn;
  const subject  = fr
    ? `Évaluation d'entretien terminée – ${postTitle || "Nouvelle opportunité"}`
    : `Interview Assessment Completed – ${postTitle || "New Opportunity"}`;
  const mailOptions = {
    from: FROM_ADDRESS,
    to: candidateEmail,
    subject,
    html: template({ candidateName, postTitle: postTitle || (fr ? "Poste" : "Position"), year }),
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
const sendInterviewCompletionNotificationToCompany = async (companyEmail, companyName, candidateName, postTitle, candidateEmail, language = "en") => {
  const fr = isFr(language);
  const template = fr ? interviewCompletionTemplateFr : interviewCompletionTemplateEn;
  const subject  = fr
    ? `Entretien terminé – ${candidateName} pour ${postTitle || "Poste"}`
    : `Interview Completed – ${candidateName} for ${postTitle || "Position"}`;
  const mailOptions = {
    from: FROM_ADDRESS,
    to: companyEmail,
    subject,
    html: template({ companyName, candidateName, postTitle: postTitle || (fr ? "Poste" : "Position"), candidateEmail, year }),
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
const sendInterviewInvitation = async (candidateEmail, candidateName, jobTitle, companyName, interviewDate = null, interviewTime = null, interviewLink = null, language = "en") => {
  const fr = isFr(language);
  const template = fr ? interviewInvitationTemplateFr : interviewInvitationTemplateEn;
  const subject  = fr
    ? `Invitation à un entretien IA – ${jobTitle} chez ${companyName}`
    : `Interview Invitation – ${jobTitle} at ${companyName}`;
  const mailOptions = {
    from: FROM_ADDRESS,
    to: candidateEmail,
    subject,
    html: template({ candidateName, jobTitle, companyName, interviewDate, interviewTime, interviewLink, year }),
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
const sendInterviewNudge = async (candidateEmail, { firstName, jobTitle, companyName, interviewLink, deadline }, nudgeNumber, language = "en") => {
  const fr = isFr(language);
  const templatesEn = { 1: interviewNudge1TemplateEn, 2: interviewNudge2TemplateEn, 3: interviewNudge3TemplateEn };
  const templatesFr = { 1: interviewNudge1TemplateFr, 2: interviewNudge2TemplateFr, 3: interviewNudge3TemplateFr };
  const subjectsEn  = {
    1: `Your AI interview is ready — ${jobTitle} at ${companyName}`,
    2: `Still waiting for you — ${jobTitle} at ${companyName}`,
    3: `Last chance: interview closes tomorrow — ${jobTitle}`,
  };
  const subjectsFr  = {
    1: `Votre entretien IA est prêt — ${jobTitle} chez ${companyName}`,
    2: `Toujours en attente de vous — ${jobTitle} chez ${companyName}`,
    3: `Dernière chance : l'entretien se termine demain — ${jobTitle}`,
  };
  const templates = fr ? templatesFr : templatesEn;
  const subjects  = fr ? subjectsFr  : subjectsEn;
  const template  = templates[nudgeNumber];
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
  const template = contactCandidateTemplate;
  const senderAddr = process.env.NO_REPLY_EMAIL;
  const mailOptions = {
    from: `"${fromCompanyName} via TalentAI" <${senderAddr}>`,
    to,
    subject,
    html: template({ candidateName, companyName: fromCompanyName, subject, message, year }),
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
const sendPlanUpgradeReminder = async (companyEmail, companyName, language = "en") => {
  const fr = isFr(language);
  const template = fr ? planUpgradeReminderTemplateFr : planUpgradeReminderTemplateEn;
  const subject  = fr
    ? '🚀 Mettez à niveau votre plan TalentAI pour débloquer l\'accès complet'
    : '🚀 Upgrade your TalentAI plan to unlock full access';
  const upgradeUrl = `${process.env.FRONTEND_URL}company/plans`;
  const mailOptions = {
    from: FROM_ADDRESS,
    to: companyEmail,
    subject,
    html: template({ companyName, upgradeUrl, year }),
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
const sendCampaignInvitation = async (to, { participantName, companyName, campaignTitle, moduleLabel, deadline, campaignDescription, assessmentLink }, language = "en") => {
  const fr = isFr(language);
  const template = fr ? campaignInviteTemplateFr : campaignInviteTemplateEn;
  const subject  = fr
    ? `Vous avez été assigné(e) à une campagne — ${campaignTitle}`
    : `You've been assigned to a campaign — ${campaignTitle}`;
  const mailOptions = {
    from: FROM_ADDRESS,
    to,
    subject,
    html: template({ participantName, companyName, campaignTitle, moduleLabel, deadline, campaignDescription, assessmentLink, year }),
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
const sendCampaignDeadlineReminder = async (to, { participantName, companyName, campaignTitle, moduleLabel, deadline, hoursLeft, assessmentLink }, language = "en") => {
  const fr = isFr(language);
  const template = fr ? campaignDeadlineReminderTemplateFr : campaignDeadlineReminderTemplateEn;
  const subject  = fr
    ? `⏰ Date limite dans ${hoursLeft}h — terminez votre évaluation pour ${campaignTitle}`
    : `⏰ Deadline in ${hoursLeft}h — complete your assessment for ${campaignTitle}`;
  const mailOptions = {
    from: FROM_ADDRESS,
    to,
    subject,
    html: template({ participantName, companyName, campaignTitle, moduleLabel, deadline, hoursLeft, assessmentLink, year }),
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
    from: `"TalentAI" <${process.env.EMAIL_USER || "contact@talentai.bid"}>`,
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

// ─── Send Job Match Email (to candidate when a new matching post is published) ──
const sendJobMatchEmail = async (candidateEmail, { candidateName, jobTitle, companyName, experienceLevel, workMode, matchedSkills, matchScore, jobLink }, language = "en") => {
  const fr = isFr(language);
  const template = fr ? jobMatchTemplateFr : jobMatchTemplateEn;
  const subject  = fr
    ? `🎯 Nouvelle offre : ${jobTitle} chez ${companyName}`
    : `🎯 New job match: ${jobTitle} at ${companyName}`;
  const mailOptions = {
    from: FROM_ADDRESS,
    to: candidateEmail,
    subject,
    html: template({ candidateName, jobTitle, companyName, experienceLevel, workMode, matchedSkills, matchScore, jobLink, year }),
    attachments: [logoAttachment],
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Job match email sent to ${candidateEmail} (${jobTitle})`);
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
