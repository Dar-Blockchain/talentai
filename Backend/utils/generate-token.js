const jwt = require("jsonwebtoken");
const { EXPIRATION_HOURS } = require("../constants/auth-jwt.constants");

/**
 * Generates a signed JWT for an authenticated session.
 * 7-day expiry — short enough to limit exposure, long enough for normal use.
 */
module.exports.generateToken = (userId, companyId, role) => {
  const payload = { id: userId, role };
  if (companyId) payload.companyId = companyId;

  return jwt.sign(payload, process.env.Net_Secret, { expiresIn: "7d" });
};

module.exports.generateMemberToken = (memberEmail, senderEmail, projectId) => {
  const payload = { memberEmail, senderEmail, projectId };
  return jwt.sign(payload, process.env.Net_Secret, { expiresIn: `${EXPIRATION_HOURS}h` });
};

module.exports.verifyMemberToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.Net_Secret);
    return { valid: true, data: decoded };
  } catch (error) {
    return { valid: false, error };
  }
};
