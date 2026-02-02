const nodemailer = require('nodemailer');
const postService = require('./PosteServices/post.service');

async function sendTask({ postId, token, candidateEmail, candidateName, stepId, candidateId, jobTitle, stepLabel }) {
  // Pour l'instant, on délègue à postService.createAndSendTechnicalTest
  const result = await postService.createAndSendTechnicalTest(
    postId,
    token,
    candidateEmail,
    candidateName
  );
  return result;
}

async function testEmailConfig() {
  const transporter = nodemailer.createTransport({
    host: "mail.privateemail.com",
    port: 465,
    secure: true,
    auth: {
      user: "contact@talentai.bid",
      pass: "87h0u74H",
    },
  });

  await transporter.verify();
  return { email: 'contact@talentai.bid' };
}

module.exports = { sendTask, testEmailConfig };


