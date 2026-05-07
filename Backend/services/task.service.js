const nodemailer = require('nodemailer');
const postService = require('./PosteServices/post.service');

async function sendTask({ postId, token, candidateEmail, candidateName, stepId, candidateId, jobTitle, stepLabel }) {
  // Task sending functionality has been removed
  throw new Error('Task sending functionality is not available');
}

const { getMailTransportOptions } = require('../utils/mail-transport-options');

async function testEmailConfig() {
  const transporter = nodemailer.createTransport(getMailTransportOptions());

  await transporter.verify();
  return { email: 'contact@talentai.bid' };
}

module.exports = { sendTask, testEmailConfig };

