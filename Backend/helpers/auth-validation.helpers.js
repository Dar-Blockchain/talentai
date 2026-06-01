const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_REGEX   = /^\d{6}$/;

const validateEmail = (email) => {
  if (!email || typeof email !== "string")
    throw Object.assign(new Error("Email is required."), { status: 400 });
  const trimmed = email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(trimmed))
    throw Object.assign(new Error("Invalid email format."), { status: 400 });
  return trimmed;
};

const validateOTPInput = (email, otp) => {
  const validEmail = validateEmail(email);
  if (!otp || typeof otp !== "string")
    throw Object.assign(new Error("OTP is required."), { status: 400 });
  const trimmed = otp.trim();
  if (!OTP_REGEX.test(trimmed))
    throw Object.assign(new Error("OTP must be exactly 6 digits."), { status: 400 });
  return { email: validEmail, otp: trimmed };
};

const validateIdToken = (id_token) => {
  if (!id_token || typeof id_token !== "string" || !id_token.trim())
    throw Object.assign(new Error("id_token is required."), { status: 400 });
  return id_token.trim();
};

const extractUsernameFromEmail = (email) => {
  if (!email || typeof email !== "string")
    throw Object.assign(new Error("Email is required."), { status: 400 });
  const username = email.split("@")[0];
  if (!username) throw Object.assign(new Error("Invalid email format."), { status: 400 });
  return username.toLowerCase().replace(/[^a-z0-9._-]/g, "");
};

const formatLocation = (location) => {
  if (!location) return "";
  try {
    const { city = "", region = "", country = "" } = location;
    return [city, region, country].filter(Boolean).join(", ");
  } catch {
    return "";
  }
};

module.exports = { validateEmail, validateOTPInput, validateIdToken, extractUsernameFromEmail, formatLocation };
