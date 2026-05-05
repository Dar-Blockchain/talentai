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

// Default "From" header: provider often rejects mismatched from/auth, so fall back to EMAIL_USER.
const FROM_ADDRESS =
  process.env.EMAIL_FROM ||
  `"TalentAI" <${process.env.EMAIL_USER || "contact@talentai.bid"}>`;

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
const otpTemplate                    = compileTemplate("auth-otp.hbs");
const organizationInviteTemplate     = compileTemplate("team-invitation.hbs");
const interviewAssessmentTemplate    = compileTemplate("interview-assessment-candidate.hbs");
const interviewCompletionTemplate    = compileTemplate("interview-assessment-company.hbs");
const interviewInvitationTemplate    = compileTemplate("interview-invite.hbs");
const contactCandidateTemplate       = compileTemplate("contact-candidate.hbs");
const interviewNudge1Template        = compileTemplate("interview-nudge-1.hbs");
const interviewNudge2Template        = compileTemplate("interview-nudge-2.hbs");
const interviewNudge3Template        = compileTemplate("interview-nudge-3.hbs");
const contactEnterpriseTemplate      = compileTemplate("contact-enterprise.hbs");

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
  const mailOptions = {
    from: FROM_ADDRESS,
    to: companyEmail,
    subject: '🚀 Upgrade your TalentAI plan to unlock full access',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
        <div style="background:linear-gradient(135deg,#0D9488,#0891B2);padding:32px 40px;text-align:center;">
          <img src="cid:logocompany" alt="TalentAI" style="height:40px;margin-bottom:12px;" />
          <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;">Your plan needs an upgrade</h1>
        </div>
        <div style="padding:32px 40px;">
          <p style="color:#374151;font-size:15px;margin-top:0;">Hi <strong>${companyName}</strong>,</p>
          <p style="color:#6B7280;font-size:14px;line-height:1.7;">
            Your company is currently on a <strong>Trial</strong> plan. To continue posting jobs, running AI interviews, and accessing candidate matching, you'll need to upgrade to a paid plan.
          </p>
          <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:10px;padding:20px;margin:24px 0;">
            <p style="margin:0;color:#065F46;font-size:14px;font-weight:600;">✅ What you unlock with a paid plan:</p>
            <ul style="color:#374151;font-size:13px;line-height:2;margin:8px 0 0 0;padding-left:20px;">
              <li>More job posts &amp; monthly interviews</li>
              <li>Priority candidate matching</li>
              <li>Advanced analytics &amp; reporting</li>
            </ul>
          </div>
          <div style="text-align:center;margin:28px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://talentai.bid'}/company/plans"
               style="background:linear-gradient(135deg,#0D9488,#0891B2);color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:700;font-size:15px;display:inline-block;">
              View Plans &amp; Upgrade
            </a>
          </div>
          <p style="color:#9CA3AF;font-size:12px;text-align:center;margin-bottom:0;">
            If you have questions, reply to this email or contact our support team.<br/>
            © ${year} TalentAI. All rights reserved.
          </p>
        </div>
      </div>
    `,
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
  transporter,
};
