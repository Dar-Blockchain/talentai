const jwt = require("jsonwebtoken");
const { EXPIRATION_HOURS } = require("../constants/auth-jwt.constants");


// Generate JWT token
module.exports.generateToken = (userId, companyId, role) => {
  const payload = { id: userId };
  if (companyId) {
    payload.companyId = companyId;
  }
  if (role) {
    payload.role = role;
  }
  console.log(payload, "payload");
  return jwt.sign(payload, process.env.Net_Secret, {
    expiresIn: "5y", // 5 ans
  });
};


module.exports.generateMemberToken = (memberEmail, senderEmail,  projectId) => {
  const payload = {
    memberEmail,
    senderEmail,
    projectId,
  };
  const token = jwt.sign(payload, process.env.Net_Secret, {
    expiresIn: `${EXPIRATION_HOURS}h`,
  });
  return token;
};

module.exports.verifyMemberToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.Net_Secret);
    return { valid: true, data: decoded };
  } catch (error) {
    return { valid: false, error };
  }
};