const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'gparm9.siteground.biz',
  port: 465,
  secure: true, // SSL
  auth: {
    user: 'contact@talentai.bid',
    pass: '87h0u74HATEMUA'
  },
  logger: true, // utile pour debug
  debug: true
});

const getEmailTemplate = (otp) => `
  <html>
    <body>
      <h2>Code de vérification TalenIA</h2>
      <div style="font-size:24px;font-weight:bold;margin:20px 0;">${otp}</div>
      <p>Ce code est valide 5 minutes. Ne le partagez jamais.</p>
    </body>
  </html>
`;

module.exports.sendOTP = async (email, otp) => {
  const mailOptions = {
    from: '"TalenIA" <contact@talentai.bid>',
    to: email,
    subject: 'Code de vérification - TalenIA',
    html: getEmailTemplate(otp)
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Email envoyé avec succès à', email);
    return true;
  } catch (error) {
    console.error('❌ Échec d’envoi:', error.message);
    return false;
  }
};
