const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "mail.privateemail.com",
  port: 465, // SSL/TLS port for outgoing mail
  secure: true, // Use SSL
  auth: {
    user: "contact@talentai.bid", // your email address
    pass: "87h0u74H", // your current mailbox password
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
module.exports.sendOTP = async (email, otp) => {
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