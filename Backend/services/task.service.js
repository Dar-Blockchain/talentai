const nodemailer = require('nodemailer');
const postService = require('./PosteServices/post.service');

async function sendTask({ postId, token, candidateEmail, candidateName, stepId, candidateId, jobTitle, stepLabel }) {
  // Task sending functionality has been removed
  throw new Error('Task sending functionality is not available');
}

const { getMailTransportOptions } = require('../utils/mail-transport-options');

module.exports = { sendTask };

