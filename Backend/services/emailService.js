const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'studyspheretn@gmail.com',
    pass: 'nycm jlpc kkgq hsib'
  }
});

const getEmailTemplate = (otp) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Code de Vérification</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #4CAF50;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 5px 5px 0 0;
        }
        .content {
          background-color: #f9f9f9;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 0 0 5px 5px;
        }
        .otp-code {
          background-color: #fff;
          padding: 15px;
          border: 2px dashed #4CAF50;
          text-align: center;
          font-size: 24px;
          font-weight: bold;
          margin: 20px 0;
          border-radius: 5px;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          font-size: 12px;
          color: #666;
        }
        .warning {
          background-color: #fff3cd;
          color: #856404;
          padding: 10px;
          border-radius: 5px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>TalenIA</h1>
          <p>Votre Code de Vérification</p>
        </div>
        <div class="content">
          <p>Bonjour,</p>
          <p>Nous avons reçu une demande de vérification pour votre compte. Utilisez le code suivant pour compléter votre authentification :</p>
          
          <div class="otp-code">
            ${otp}
          </div>
          
          <div class="warning">
            <strong>Important :</strong>
            <ul>
              <li>Ce code est valable pendant 5 minutes</li>
              <li>Ne partagez jamais ce code avec qui que ce soit</li>
              <li>Si vous n'avez pas demandé ce code, veuillez ignorer cet email</li>
            </ul>
          </div>
          
          <p>Si vous rencontrez des problèmes, n'hésitez pas à nous contacter à <a href="mailto:support@talenia.com">support@talenia.com</a></p>
        </div>
        <div class="footer">
          <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
          <p>&copy; ${new Date().getFullYear()} TalenIA. Tous droits réservés.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports.sendOTP = async (email, otp) => {
  const mailOptions = {
    from: 'studyspheretn@gmail.com',
    to: email,
    subject: 'Code de Vérification - TalenIA',
    html: getEmailTemplate(otp)
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    return false;
  }
};
