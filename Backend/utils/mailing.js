const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "mail.privateemail.com",
//  host: process.env.Email_host,
  port: 465, // SSL/TLS port for outgoing mail
  secure: true, // Use SSL
  auth: {
    user: "contact@talentai.bid", // your email address
    pass: "87h0u74H", // your current mailbox password
    //user: process.env.EMAIL_USER, // your email address
    //pass: process.env.EMAIL_PASSWORD, // your current mailbox password
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

// Générateur du template HTML avec lien d’activation
// const getActivationTemplate = (activationLink, projet) => `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <meta charset="utf-8">
//       <title>Confirmation de votre role en tant que contributeur au projet ${projet.name} </title>
//       <style>
//         body { font-family: 'Segoe UI', Arial, sans-serif; background: #F7FAFC; margin: 0; padding: 0; }
//         .container { max-width: 600px; margin: 40px auto; background: #FFF; border-radius: 12px; box-shadow: 0 8px 32px #0002; padding: 0; overflow: hidden; }
//         .header {
//           background: linear-gradient(135deg, #2B6CB0 0%, #1A365D 100%);
//           color: #fff;
//           text-align: center;
//           padding: 32px 20px 20px 20px;
//         }
//         .logo {
//           display: block;
//           margin: 0 auto 12px auto;
//           width: 64px;
//           height: 64px;
//         }
//         .header-title {
//           font-size: 2rem;
//           font-weight: 700;
//           margin: 0 0 8px 0;
//           letter-spacing: 1px;
//         }
//         .header-desc {
//           font-size: 1.1rem;
//           opacity: 0.95;
//           margin: 0;
//         }
//         .content { padding: 36px 32px 24px 32px; color: #2D3748; }
//         .content p { margin: 18px 0; font-size: 1.08rem; }
//         .btn {
//           background: linear-gradient(90deg, #4299E1 0%, #2B6CB0 100%);
//           color: #fff;
//           padding: 18px 40px;
//           border-radius: 8px;
//           text-decoration: none;
//           font-size: 1.15rem;
//           font-weight: 600;
//           display: inline-block;
//           margin: 32px 0 18px 0;
//           box-shadow: 0 2px 8px #4299e133;
//           transition: background 0.2s, box-shadow 0.2s;
//         }
//         .btn:hover {
//           background: linear-gradient(90deg, #2B6CB0 0%, #4299E1 100%);
//           box-shadow: 0 4px 16px #2B6CB044;
//         }
//         .footer {
//           text-align: center;
//           color: #718096;
//           font-size: 14px;
//           background: #F7FAFC;
//           padding: 20px 10px 16px 10px;
//           border-radius: 0 0 12px 12px;
//         }
//         .footer a { color: #2B6CB0; text-decoration: none; }
//         .footer a:hover { text-decoration: underline; }
//       </style>
//     </head>
//     <body>
//       <div class="container">
//         <div class="header">
//           <img src="https://talentai.bid/logo.svg" alt="TalenIA Logo" class="logo" onerror="this.style.display='none'"/>
//           <div class="header-title">Confirmation de contribution au projet&nbsp;<strong>${project.name}</strong></div>
//           <div class="header-desc">Bienvenue chez TalenIA !</div>
//         </div>
//         <div class="content">
//           <p>Bonjour,</p>
//           <p>Pour confirmer votre contribution au projet ${project.name}, veuillez cliquez sur le bouton ci-dessous :</p>
//           <p style="text-align:center;">
//             <a href="${activationLink}" class="btn">Confirmer</a>
//           </p>
//           <p style="font-size:0.98rem;color:#4A5568;">Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer ce message.</p>
//         </div>
//         <div class="footer">
//           Besoin d'aide ? Contactez-nous à <a href="mailto:support@talentai.bid">support@talentai.bid</a><br/>
//           <span style="display:block;margin-top:8px;">&copy; ${new Date().getFullYear()} TalenIA. Tous droits réservés.</span>
//         </div>
//       </div>
//     </body>
//     </html>
//   `;

const getActivationTemplate = (activationLink, project) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Invitation à confirmer votre contribution au projet – ${project.name}</title>
  </head>
  <body style="font-family: Arial, sans-serif; margin:0; padding:0; background-color:#F7FAFC;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F7FAFC;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color:#FFFFFF; border-collapse:collapse;">
            <!-- Header -->
            <tr>
              <td style="background-color:#2B6CB0; color:#ffffff; text-align:center; padding:32px 20px 20px 20px;">
                <img src="https://talentai.bid/logo.svg" alt="TalenIA Logo" width="64" height="64" style="display:block; margin:0 auto 12px auto;" onerror="this.style.display='none'" />
                <h1 style="margin:0; font-size:24px;">Confirmation de votre contribution au projet <strong>${project.name}</strong></h1>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding:36px 32px 24px 32px; color:#2D3748;">
                <p style="font-size:16px; margin:18px 0;">Bonjour,</p>
                <p style="font-size:16px; margin:18px 0;">
                 Afin de valider votre rôle de contributeur et de vous permettre de suivre l’évaluation du projet <strong>${project.name}</strong> sur TalentAI, veuillez confirmer votre participation en cliquant sur le bouton ci-dessous.
                 </p>

                <table align="center" cellpadding="0" cellspacing="0" role="presentation" style="margin:32px auto 18px auto;">
                  <tr>
                    <td bgcolor="#2B6CB0" style="padding:14px 24px; text-align:center;">
                      <a href="${activationLink}" target="_blank" style="color:#ffffff; font-size:16px; font-weight:bold; text-decoration:none; display:inline-block;">
                        Confirmer
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="font-size:14px; color:#4A5568; margin-top:18px;">
                  Si vous n'êtes pas concerné·e par ce projet, vous pouvez ignorer ce message.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="text-align:center; color:#718096; font-size:14px; background-color:#F7FAFC; padding:20px 10px 16px 10px;">
                Besoin d'aide ? Contactez-nous à 
                <a href="mailto:support@talentai.bid" style="color:#2B6CB0; text-decoration:none;">support@talentai.bid</a><br/>
                <span style="display:block; margin-top:8px;">&copy; ${new Date().getFullYear()} TalenIA. Tous droits réservés.</span>
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
    subject: `Confirmation contributeur - Projet: ${project.name} `,
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

// Exporter la fonction
module.exports = { sendActivationEmail , sendOTP };