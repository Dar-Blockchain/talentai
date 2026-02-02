/**
 * Validate email format
 * @param {string} email - Email to validate
 * @throws {Error} If email is invalid
 */
const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    const err = new Error('Email is required and must be a string');
    err.status = 400;
    throw err;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    const err = new Error('Invalid email format');
    err.status = 400;
    throw err;
  }

  return email.trim().toLowerCase();
};

/**
 * Validate OTP and email
 * @param {string} email - Email to validate
 * @param {string} otp - OTP code to validate
 * @throws {Error} If validation fails
 */
const validateOTPInput = (email, otp) => {
  validateEmail(email);

  if (!otp || typeof otp !== 'string') {
    const err = new Error('OTP is required and must be a string');
    err.status = 400;
    throw err;
  }

  if (otp.trim().length !== 6 || !/^\d{6}$/.test(otp.trim())) {
    const err = new Error('OTP must be a 6-digit number');
    err.status = 400;
    throw err;
  }

  return { email: validateEmail(email), otp: otp.trim() };
};

/**
 * Validate ID token for Gmail
 * @param {string} id_token - Gmail ID token
 * @throws {Error} If token is invalid
 */
const validateIdToken = (id_token) => {
  if (!id_token || typeof id_token !== 'string') {
    const err = new Error('id_token is required and must be a string');
    err.status = 400;
    throw err;
  }

  if (id_token.trim().length === 0) {
    const err = new Error('id_token cannot be empty');
    err.status = 400;
    throw err;
  }

  return id_token.trim();
};

/**
 * Extract username from email
 * @param {string} email - Email address
 * @returns {string} Username (part before @)
 */
const extractUsernameFromEmail = (email) => {
  if (!email || typeof email !== 'string') {
    const err = new Error('Email is required');
    err.status = 400;
    throw err;
  }
  const username = email.split('@')[0];
  if (!username || username.length === 0) {
    const err = new Error('Invalid email format');
    err.status = 400;
    throw err;
  }
  return username;
};

/**
 * Validate location object
 * @param {Object} location - Location object from IP service
 * @returns {string} Formatted location string
 */
const formatLocation = (location) => {
  if (!location) return '';
  try {
    const { city = '', region = '', country = '' } = location;
    return [city, region, country].filter(Boolean).join(', ');
  } catch (err) {
    return '';
  }
};

module.exports = {
  validateEmail,
  validateOTPInput,
  validateIdToken,
  extractUsernameFromEmail,
  formatLocation
};
