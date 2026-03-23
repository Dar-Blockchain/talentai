const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.Email_host,
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const getEmailTemplate = (otp) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verification Code</title>
      <style>
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          line-height: 1.6;
          color: #2D3748;
          margin: 0;
          padding: 0;
          background-color: #F7FAFC;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          padding: 0;
          background-color: #FFFFFF;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
        }
        .header {
          background: linear-gradient(135deg, #2B6CB0 0%, #1A365D 100%);
          color: white;
          padding: 30px 20px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }
        .header p {
          margin: 10px 0 0;
          opacity: 0.9;
        }
        .content {
          padding: 30px;
          background-color: #FFFFFF;
        }
        .otp-code {
          background-color: #EBF8FF;
          padding: 20px;
          border: 2px solid #BEE3F8;
          text-align: center;
          font-size: 32px;
          font-weight: bold;
          margin: 25px 0;
          border-radius: 8px;
          color: #2B6CB0;
          letter-spacing: 4px;
        }
        .warning {
          background-color: #F7FAFC;
          border-left: 4px solid #2B6CB0;
          padding: 15px;
          border-radius: 4px;
          margin: 20px 0;
        }
        .warning strong {
          color: #2B6CB0;
          display: block;
          margin-bottom: 8px;
        }
        .warning ul {
          margin: 0;
          padding-left: 20px;
        }
        .warning li {
          margin: 5px 0;
          color: #4A5568;
        }
        .footer {
          text-align: center;
          padding: 20px;
          background-color: #F7FAFC;
          border-radius: 0 0 8px 8px;
          font-size: 13px;
          color: #718096;
        }
        a {
          color: #2B6CB0;
          text-decoration: none;
        }
        a:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>TalenIA</h1>
          <p>Your Verification Code</p>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>We received a verification request for your account. Here is your authentication code:</p>
          
          <div class="otp-code">
            ${otp}
          </div>
          
          <div class="warning">
            <strong>Important:</strong>
            <ul>
              <li>This code is valid for 5 minutes</li>
              <li>Never share this code with anyone</li>
              <li>If you did not request this code, please ignore this email</li>
            </ul>
          </div>
          
          <p>If you experience any difficulties, our support team is here to help at <a href="mailto:support@talenia.com">support@talenia.com</a></p>
        </div>
        <div class="footer">
          <p>This email was sent automatically, please do not reply.</p>
          <p>&copy; ${new Date().getFullYear()} TalenIA. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
`;
const sendOTP = async (email, otp) => {
  const mailOptions = {
    from: '"TalenIA" <contact@talentai.bid>',
    to: email,
    subject: "Code de vérification - TalenIA",
    html: getEmailTemplate(otp),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Email envoyé avec succès à", email);
    return true;
  } catch (error) {
    console.error("❌ Échec d’envoi:", error.message);
    return false;
  }
};

const getActivationTemplate = (activationLink, project) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Invitation to Confirm Your Contribution to – ${project.name}</title>
  </head>
  <body style="font-family: Arial, sans-serif; margin:0; padding:0; background-color:#F7FAFC;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F7FAFC;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color:#FFFFFF; border-collapse:collapse;">
            <!-- Header -->
            <tr>
              <td style="background-color:#2B6CB0; color:#ffffff; text-align:center; padding:32px 20px 20px 20px;">
                <img src="https://talentai.bid/images/favicon.ico" alt="TalenIA Logo" width="64" height="64" style="display:block; margin:0 auto 12px auto;" onerror="this.style.display='none'" />
                <h1 style="margin:0; font-size:24px;">Confirm your contribution to project <strong>${project.name}</strong></h1>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding:36px 32px 24px 32px; color:#2D3748;">
                <p style="font-size:16px; margin:18px 0;">Hello,</p>
                <p style="font-size:16px; margin:18px 0;">
                 
                  To validate your role as a contributor and access the project <strong>${project.name}</strong>'s evaluation on TalenIA, please confirm your participation by clicking the button below.
                 </p>

                <table align="center" cellpadding="0" cellspacing="0" role="presentation" style="margin:32px auto 18px auto;">
                  <tr>
                    <td bgcolor="#2B6CB0" style="padding:14px 24px; text-align:center;">
                      <a href="${activationLink}" target="_blank" style="color:#ffffff; font-size:16px; font-weight:bold; text-decoration:none; display:inline-block;">
                        Confirm
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="font-size:14px; color:#4A5568; margin-top:18px;">
                  If you are not involved in this project, you may safely ignore this message.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="text-align:center; color:#718096; font-size:14px; background-color:#F7FAFC; padding:20px 10px 16px 10px;">
                Need help? Contact us at 
                <a href="mailto:support@talentai.bid" style="color:#2B6CB0; text-decoration:none;">support@talentai.bid</a><br/>
o                <span style="display:block; margin-top:8px;">&copy; ${new Date().getFullYear()} TalenIA. All rights reserved.</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;


// Fonction d’envoi d’email d’activation
const sendActivationEmail = async (to, activationLink, project) => {
  const mailOptions = {
    from: '"TalenIA" <contact@talentai.bid>',
    to,
    subject: `Confirm your contributor role – Project: ${project.name}`,
    html: getActivationTemplate(activationLink, project),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email d'activation envoyé à ${to}`);
    return true;
  } catch (error) {
    console.error("❌ Échec d'envoi:", error.message);
    return false;
  }
};

// Gabarit email pour un Post
const getPostEmailTemplate = (post) => {
  const title = post?.jobDetails?.title || "Job Post";
  const description = post?.jobDetails?.description || "";
  const requirements = Array.isArray(post?.jobDetails?.requirements) ? post.jobDetails.requirements : [];
  const responsibilities = Array.isArray(post?.jobDetails?.responsibilities) ? post.jobDetails.responsibilities : [];
  const location = post?.jobDetails?.location || "";
  const employmentType = post?.jobDetails?.employmentType || "";
  const experienceLevel = post?.jobDetails?.experienceLevel || "";
  const salary = post?.jobDetails?.salary;

  const salaryText = salary ? `${salary.min} - ${salary.max} ${salary.currency}` : "";

  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>${title}</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #2D3748; background:#F7FAFC; margin:0; padding:0; }
        .container { max-width: 720px; margin: 20px auto; background:#fff; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.08); overflow:hidden; }
        .header { background: linear-gradient(135deg, #2B6CB0 0%, #1A365D 100%); color:#fff; padding:24px; }
        .header h1 { margin:0; font-size:22px; }
        .section { padding:20px 24px; }
        h2 { font-size:18px; margin:0 0 10px; color:#1A365D; }
        p { line-height:1.6; }
        ul { padding-left: 18px; margin: 8px 0; }
        .meta { display:flex; flex-wrap:wrap; gap:12px; color:#4A5568; font-size:14px; }
        .footer { padding:16px 24px; font-size:12px; color:#718096; background:#F7FAFC; }
        .badge { background:#EBF8FF; border:1px solid #BEE3F8; color:#2B6CB0; padding:6px 10px; border-radius:16px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${title}</h1>
        </div>
        <div class="section">
          <div class="meta">
            ${location ? `<span class="badge">📍 ${location}</span>` : ''}
            ${employmentType ? `<span class="badge">💼 ${employmentType}</span>` : ''}
            ${experienceLevel ? `<span class="badge">⭐ ${experienceLevel}</span>` : ''}
            ${salaryText ? `<span class="badge">💰 ${salaryText}</span>` : ''}
          </div>
        </div>
        <div class="section">
          <h2>Description</h2>
          <p>${description}</p>
        </div>
        ${requirements.length ? `
        <div class="section">
          <h2>Exigences</h2>
          <ul>
            ${requirements.map(r => `<li>${r}</li>`).join('')}
          </ul>
        </div>` : ''}
        ${responsibilities.length ? `
        <div class="section">
          <h2>Responsabilités</h2>
          <ul>
            ${responsibilities.map(r => `<li>${r}</li>`).join('')}
          </ul>
        </div>` : ''}
        <div class="footer">
          Cet email a été envoyé automatiquement par TalenIA.
        </div>
      </div>
    </body>
  </html>`;
};

// Envoi d'un email contenant les détails d'un Post
const sendPostEmail = async (to, post) => {
  const subject = post?.jobDetails?.title || 'Job Post';
  const html = getPostEmailTemplate(post);
  const mailOptions = {
    from: '"TalenIA" <contact@talentai.bid>',
    to,
    subject,
    html,
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de post envoyé à ${to} (sujet: ${subject})`);
    return true;
  } catch (error) {
    console.error('❌ Échec d’envoi email post:', error.message);
    return false;
  }
};

// Modèle d'email d'invitation à rejoindre une organisation
const getOrganizationInviteTemplate = (orgName, role, inviter, invitationLink = '#') => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Invitation to join ${orgName}</title>
  </head>
      <body style="font-family: Arial, sans-serif; margin:0; padding:20px; background-color:#F7FAFC;">
    <div style="max-width:600px; margin:0 auto; background:#fff; padding:24px; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.08);">
      <h2 style="color:#1A365D;">You're invited to join <strong>${orgName}</strong></h2>
      <p>Hello,</p>
      <p>You have been invited to join the company <strong>${orgName}</strong> as <strong>${role}</strong>.</p>
      ${inviter ? `<p>Invited by: ${orgName}</p>` : ''}
      <p>Please confirm your participation by clicking the button below. The invitation expires in 48 hours.</p>

      <table role="presentation" width="100%" style="margin:20px 0;">
        <tr>
          <td align="center">
            <a href="${invitationLink}" style="background-color:#2B6CB0;color:#ffffff;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:600;display:inline-block;">Accept Invitation</a>
          </td>
        </tr>
      </table>

      <p>If the button does not work, you can copy and paste the following link into your browser:</p>
      <p style="font-size:13px;color:#718096;word-break:break-all;"><a href="${invitationLink}">${invitationLink}</a></p>

      <p>If you did not request this invitation, you may ignore this message.</p>
      <p style="margin-top:18px; color:#718096; font-size:13px;">This email was generated automatically by TalenIA.</p>
    </div>
  </body>
</html>
`;

// Envoi d'un email d'invitation à rejoindre une organisation
const sendCompanyInvitation = async (to, orgName, role, inviterEmail, invitationLink = '#') => {
  const mailOptions = {
    from: '"TalenIA" <contact@talentai.bid>',
    to,
    subject: `Invitation: Join ${orgName} as ${role}`,
    html: getOrganizationInviteTemplate(orgName, role, inviterEmail, invitationLink),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Invitation sent to ${to} to join ${orgName} as ${role}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send invitation:', error.message);
    return false;
  }
};

// Template pour l'email après évaluation d'interview
const getInterviewAssessmentTemplate = (candidateName, postTitle) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Interview Assessment Confirmation</title>
  <style>
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      line-height: 1.6;
      color: #2D3748;
      margin: 0;
      padding: 0;
      background-color: #F7FAFC;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      padding: 0;
      background-color: #FFFFFF;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      border-radius: 8px;
    }
    .header {
      background: linear-gradient(135deg, #2B6CB0 0%, #1A365D 100%);
      color: white;
      padding: 30px 20px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .content {
      padding: 30px;
      background-color: #FFFFFF;
    }
    .success-badge {
      background-color: #C6F6D5;
      border: 2px solid #9AE6B4;
      padding: 15px;
      border-radius: 8px;
      text-align: center;
      color: #22543D;
      font-weight: bold;
      margin: 20px 0;
    }
    .info-box {
      background-color: #EBF8FF;
      border-left: 4px solid #2B6CB0;
      padding: 15px;
      border-radius: 4px;
      margin: 20px 0;
    }
    .info-box strong {
      color: #2B6CB0;
      display: block;
      margin-bottom: 8px;
    }
    .footer {
      text-align: center;
      padding: 20px;
      background-color: #F7FAFC;
      border-radius: 0 0 8px 8px;
      font-size: 13px;
      color: #718096;
    }
    a {
      color: #2B6CB0;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>TalenAI</h1>
      <p>Interview Assessment Completed</p>
    </div>
    <div class="content">
      <p>Hello ${candidateName},</p>
      
      <div class="success-badge">
        ✓ Your interview assessment has been successfully completed!
      </div>
      
      <p>Thank you for completing the interview assessment for the position:</p>
      
      <div class="info-box">
        <strong>📋 Position:</strong>
        ${postTitle || 'Position Title'}
      </div>
      
      <p>Your assessment has been recorded and the hiring team will review your responses. You will be notified about the next steps in the hiring process.</p>
      
      <p>If you have any questions or concerns, please don't hesitate to contact us at <a href="mailto:support@talentai.bid">support@talentai.bid</a></p>
    </div>
    <div class="footer">
      <p>This email was sent automatically, please do not reply.</p>
      <p>&copy; ${new Date().getFullYear()} TalenIA. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

// Fonction pour envoyer un email après une évaluation d'interview
const sendInterviewAssessmentEmail = async (candidateEmail, candidateName, postTitle) => {
  const html = getInterviewAssessmentTemplate(candidateName, postTitle);
  const mailOptions = {
    from: '"TalenAI" <contact@talentai.bid>',
    to: candidateEmail,
    subject: `Interview Assessment Completed - ${postTitle || 'New Opportunity'}`,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Interview assessment email sent to ${candidateEmail}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send interview assessment email:', error.message);
    return false;
  }
};

// Template pour notifier la compagnie quand un candidat complète une interview
const getInterviewCompletionNotificationTemplate = (companyName, candidateName, postTitle, candidateEmail) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Candidate Interview Completed</title>
  <style>
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      line-height: 1.6;
      color: #2D3748;
      margin: 0;
      padding: 0;
      background-color: #F7FAFC;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      padding: 0;
      background-color: #FFFFFF;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      border-radius: 8px;
    }
    .header {
      background: linear-gradient(135deg, #2B6CB0 0%, #1A365D 100%);
      color: white;
      padding: 30px 20px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .header p {
      margin: 10px 0 0;
      opacity: 0.9;
    }
    .content {
      padding: 30px;
      background-color: #FFFFFF;
    }
    .alert-badge {
      background-color: #FEF5E7;
      border: 2px solid #F8D7A1;
      padding: 15px;
      border-radius: 8px;
      text-align: center;
      color: #7D6608;
      font-weight: bold;
      margin: 20px 0;
    }
    .info-box {
      background-color: #EBF8FF;
      border-left: 4px solid #2B6CB0;
      padding: 15px;
      border-radius: 4px;
      margin: 20px 0;
    }
    .info-box strong {
      color: #2B6CB0;
      display: block;
      margin-bottom: 5px;
    }
    .info-box p {
      margin: 5px 0;
      color: #2D3748;
    }
    .candidate-details {
      background-color: #F7FAFC;
      padding: 15px;
      border-radius: 4px;
      margin: 15px 0;
    }
    .candidate-details p {
      margin: 8px 0;
    }
    .cta-button {
      text-align: center;
      margin: 25px 0;
    }
    .cta-button a {
      display: inline-block;
      background-color: #2B6CB0;
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 4px;
      font-weight: bold;
    }
    .cta-button a:hover {
      background-color: #1A365D;
    }
    .footer {
      text-align: center;
      padding: 20px;
      background-color: #F7FAFC;
      border-radius: 0 0 8px 8px;
      font-size: 13px;
      color: #718096;
    }
    a {
      color: #2B6CB0;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>TalenIA</h1>
      <p>Interview Assessment Completed</p>
    </div>
    <div class="content">
      <p>Hello ${companyName},</p>
      
      <div class="alert-badge">
        ⚡ Candidate has completed interview assessment
      </div>
      
      <div class="info-box">
        <strong>📋 Position:</strong>
        <p>${postTitle || 'New Opportunity'}</p>
      </div>
      
      <div class="candidate-details">
        <strong style="color: #2B6CB0;">Candidate Details:</strong>
        <p><strong>Name:</strong> ${candidateName}</p>
        <p><strong>Email:</strong> ${candidateEmail}</p>
      </div>
      
      <p>The candidate has successfully completed the interview assessment for the position above. You can now review their responses and evaluation scores in the TalenIA dashboard.</p>
      
      <div class="cta-button">
        <a href="https://talentai.bid/dashboard/interviews" target="_blank">View Assessment Results</a>
      </div>
      
      <p>If you have any questions, please contact our support team at <a href="mailto:support@talentai.bid">support@talentai.bid</a></p>
    </div>
    <div class="footer">
      <p>This email was sent automatically, please do not reply.</p>
      <p>&copy; ${new Date().getFullYear()} TalenIA. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

// Fonction pour envoyer une notification à la compagnie quand un candidat complète une interview
const sendInterviewCompletionNotificationToCompany = async (companyEmail, companyName, candidateName, postTitle, candidateEmail) => {
  const html = getInterviewCompletionNotificationTemplate(companyName, candidateName, postTitle, candidateEmail);
  const mailOptions = {
    from: '"TalenAI" <contact@talentai.bid>',
    to: companyEmail,
    subject: `Interview Completed - ${candidateName} for ${postTitle || 'Position'}`,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Interview completion notification sent to company: ${companyEmail}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send interview completion notification to company:', error.message);
    return false;
  }
};

// Exporter les fonctions
module.exports = { sendActivationEmail , sendOTP, sendPostEmail, sendCompanyInvitation, sendInterviewAssessmentEmail, sendInterviewCompletionNotificationToCompany, transporter };