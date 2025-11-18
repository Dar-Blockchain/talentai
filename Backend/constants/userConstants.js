const USER_ROLES = Object.freeze({
  COMPANY: "Company",
  JURY: "jury",
  CANDIDAT: "Candidate",
  ADMIN: "Admin",
});

const AUTH_METHODS = Object.freeze({
  OTP: "OTP",
  PASSWORD: "Password",
  OAUTH: "OAuth",
});

const AUTH_STATUS = Object.freeze({
  SUCCESS: "Success",
  FAILED: "Failed",
});

module.exports = {
  USER_ROLES,
  AUTH_METHODS,
  AUTH_STATUS,
};
