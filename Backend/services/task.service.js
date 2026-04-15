const nodemailer = require('nodemailer');
const postService = require('./PosteServices/post.service');

async function sendTask({ postId, token, candidateEmail, candidateName, stepId, candidateId, jobTitle, stepLabel }) {
  // Task sending functionality has been removed
  throw new Error('Task sending functionality is not available');
}

async function testEmailConfig() {
  const transporter = nodemailer.createTransport({
    host: process.env.Email_host,
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  await transporter.verify();
  return { email: 'contact@talentai.bid' };
}

module.exports = { sendTask, testEmailConfig };


