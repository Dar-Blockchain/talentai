const NAME_REGEX    = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/;
const VALID_GENDERS = ["Male", "Female", "Other", "Prefer not to say"];

// Returns an error message string, or null if valid
const validateCandidateFields = (data, requireNames = false) => {
  const firstName = data.firstName || data.FirstName;
  const lastName  = data.lastName  || data.LastName;
  if (requireNames && (!firstName || !lastName)) return "First name and last name are required";
  if (firstName && typeof firstName !== "string") return "firstName must be a string";
  if (lastName  && typeof lastName  !== "string") return "lastName must be a string";
  if (data.age && isNaN(parseInt(data.age, 10)))  return "Age must be a valid number";
  if (data.preferredContractType && typeof data.preferredContractType !== "string")
    return "Preferred contract type must be a valid string";
  if (data.location && typeof data.location !== "string")
    return "Location must be a valid string";
  return null;
};

const validateCandidateProfile = (req, res, next) => {
  const data = req.body;
  const firstName = data.firstName || data.FirstName;
  const lastName  = data.lastName  || data.LastName;

  if (!firstName || !lastName) {
    return res.status(400).json({ success: false, message: "First name and last name are required" });
  }
  if (firstName && !NAME_REGEX.test(firstName)) {
    return res.status(400).json({ success: false, message: "First name must not contain special characters" });
  }
  if (lastName && !NAME_REGEX.test(lastName)) {
    return res.status(400).json({ success: false, message: "Last name must not contain special characters" });
  }
  if (data.gender && !VALID_GENDERS.includes(data.gender)) {
    return res.status(400).json({ success: false, message: "Invalid gender value" });
  }
  next();
};

const validateProfileUpdate = (req, res, next) => {
  const data = req.body;
  const firstName = data.firstName || data.FirstName;
  const lastName  = data.lastName  || data.LastName;

  if (firstName && !NAME_REGEX.test(firstName)) {
    return res.status(400).json({ success: false, message: "First name must not contain special characters" });
  }
  if (lastName && !NAME_REGEX.test(lastName)) {
    return res.status(400).json({ success: false, message: "Last name must not contain special characters" });
  }
  if (data.gender && !VALID_GENDERS.includes(data.gender)) {
    return res.status(400).json({ success: false, message: "Invalid gender value" });
  }
  next();
};

module.exports = { validateCandidateFields, validateCandidateProfile, validateProfileUpdate };
