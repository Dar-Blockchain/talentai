const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");

const compileTemplate = (templateName) => {
  const filePath = path.join(__dirname, "../templates/emails", templateName);
  const source = fs.readFileSync(filePath, "utf8");
  return handlebars.compile(source);
};

const transporter = nodemailer.createTransport({
  host: process.env.Email_host,
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Compiled templates (loaded once at startup)
const otpTemplate                    = compileTemplate("auth-otp.hbs");
const organizationInviteTemplate     = compileTemplate("team-invitation.hbs");
const interviewAssessmentTemplate    = compileTemplate("interview-assessment-candidate.hbs");
const interviewCompletionTemplate    = compileTemplate("interview-assessment-company.hbs");
const interviewInvitationTemplate    = compileTemplate("interview-invite.hbs");
const contactCandidateTemplate       = compileTemplate("contact-candidate.hbs");

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
    from: '"TalentAI" <contact@talentai.bid>',
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
    from: '"TalentAI" <contact@talentai.bid>',
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
    from: '"TalentAI" <contact@talentai.bid>',
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
    from: '"TalentAI" <contact@talentai.bid>',
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
    from: '"TalentAI" <contact@talentai.bid>',
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

// ─── Send Direct Message to Candidate (from company) ─────────────────────────
const sendCandidateEmail = async (to, candidateName, fromCompanyName, subject, message) => {
  const mailOptions = {
    from: `"${fromCompanyName} via TalentAI" <contact@talentai.bid>`,
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

module.exports = {
  sendOTP,
  sendCompanyInvitation,
  sendInterviewAssessmentEmail,
  sendInterviewCompletionNotificationToCompany,
  sendInterviewInvitation,
  sendCandidateEmail,
  transporter,
};
