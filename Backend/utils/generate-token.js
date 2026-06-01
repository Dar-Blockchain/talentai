const jwt            = require("jsonwebtoken");
const { randomUUID } = require("crypto");

const MEMBER_TOKEN_EXPIRY = "24h";

module.exports.generateToken = (userId, companyId, role) => {
  const payload = { id: userId, role, jti: randomUUID() };
  if (companyId) payload.companyId = companyId;
  return jwt.sign(payload, process.env.Net_Secret, { expiresIn: "7d" });
};

module.exports.generateMemberToken = (memberEmail, senderEmail, projectId) =>
  jwt.sign({ memberEmail, senderEmail, projectId }, process.env.Net_Secret, { expiresIn: MEMBER_TOKEN_EXPIRY });

module.exports.verifyMemberToken = (token) => {
  try {
    return { valid: true, data: jwt.verify(token, process.env.Net_Secret) };
  } catch (error) {
    return { valid: false, error };
  }
};
