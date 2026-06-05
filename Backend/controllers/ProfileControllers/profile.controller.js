const profileService = require("../../services/ProfileService/profile.service");
const User = require("../../models/User.model.js");
const {
  VALIDATION,
  buildUpdateData,
  validateUpdateFields,
} = require("../../helpers/profileValidation.helpers.js");

// Validates candidate-specific profile fields. Returns an error message string or null.
function validateCandidateFields(profileData, requireNames = false) {
  const firstName = profileData.firstName || profileData.FirstName;
  const lastName  = profileData.lastName  || profileData.LastName;
  if (requireNames && (!firstName || !lastName)) return "First name and last name are required";
  if (firstName && typeof firstName !== "string") return "firstName must be a string";
  if (lastName  && typeof lastName  !== "string") return "lastName must be a string";
  if (profileData.age && isNaN(parseInt(profileData.age, 10))) return "Age must be a valid number";
  if (profileData.preferredContractType && typeof profileData.preferredContractType !== "string")
    return "Preferred contract type must be a valid string";
  if (profileData.location && typeof profileData.location !== "string")
    return "Location must be a valid string";
  if (profileData.expectedSalary) {
    const { min, max, currency } = profileData.expectedSalary;
    if (min != null && (isNaN(min) || min < 0))  return "Expected salary min must be a positive number";
    if (max != null && (isNaN(max) || max < 0))  return "Expected salary max must be a positive number";
    if (min != null && max != null && min > max)  return "Expected salary min cannot be greater than max";
    if (currency && typeof currency !== "string") return "Currency must be a valid string (e.g., EUR, USD, GBP)";
  }
  return null;
}

// Shared helper — fetch full profile with planLimits and build standard response payload
async function buildProfilePayload(userId) {
  const result = await profileService.getProfileByUserId(userId);
  return {
    user:              result.user              || null,
    profile:           result.profile           || null,
    planLimits:        result.planLimits        || null,
    companyMembership: result.companyMembership || null,
  };
}

// Create or update a candidate profile (with onboarding fields support)
module.exports.createOrUpdateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const profileData = req.body;

    const validationError = validateCandidateFields(profileData, true);
    if (validationError) return res.status(400).json({ success: false, message: validationError });

    await profileService.createOrUpdateProfile(userId, profileData);
    const payload = await buildProfilePayload(userId);
    res.status(200).json({ success: true, message: "Profile created/updated successfully", ...payload });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || "Error creating/updating candidate profile" });
  }
};

// Create or update a company profile
module.exports.createOrUpdateCompanyProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const profileData = req.body;
    console.log(profileData);
    if (!profileData.name) {
      return res.status(400).json({ message: "Company name is required" });
    }

    await profileService.createOrUpdateCompanyProfile(userId, profileData);
    const payload = await buildProfilePayload(userId);
    res.status(200).json({ success: true, message: "Company profile created/updated successfully", ...payload });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || "Error creating/updating company profile" });
  }
};

// Get own profile
// controllers/profileController.js
module.exports.getMyProfile = async (req, res) => {
  try {
    const payload = await buildProfilePayload(req.user._id);
    res.status(200).json({ success: true, message: "Profile retrieved successfully", ...payload });
  } catch (error) {
    return res.status(error.status || 500).json({ success: false, message: error.message || "Internal error retrieving profile" });
  }
};

// Get a profile by ID
module.exports.getProfileById = async (req, res) => {
  try {
    const { userId } = req.params;

    // Use the service to retrieve the profile
    const result = await profileService.getProfileByUserId(userId);

    // Remove sensitive fields from user object
    if (result.user) {
      result.user = result.user.toObject
        ? result.user.toObject()
        : { ...result.user };
    }

    res.status(200).json({
      success: true,
      message: "Profile retrieved successfully",
      user: result.user,
      profile: result.profile || null,
      companyMembership: result.companyMembership || null,
    });
  } catch (error) {
    console.error("Error retrieving profile:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Error retrieving profile",
    });
  }
};

// Update profile visibility (public / private)
module.exports.updateProfileVisibility = async (req, res) => {
  try {
    const userId = req.user._id;
    const { isPublicProfile } = req.body;

    if (typeof isPublicProfile !== "boolean") {
      return res
        .status(400)
        .json({ success: false, message: "isPublicProfile must be a boolean" });
    }

    const updatedProfile = await profileService.updateProfileVisibility(
      userId,
      isPublicProfile,
    );

    return res
      .status(200)
      .json({
        success: true,
        message: "Profile visibility updated",
        profile: updatedProfile,
      });
  } catch (error) {
    console.error("Error updating profile visibility:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: error.message || "Error updating profile visibility",
      });
  }
};

// Unified update profile API - handles all profile updates including image upload
module.exports.updateProfileComplete = async (req, res) => {
  try {
    const userId      = req.params.userId;
    const profileData = req.body;
    const file        = req.file;

    if (!file && !Object.values(profileData).some(Boolean)) {
      return res.status(400).json({ success: false, message: "At least one field must be provided for update" });
    }

    // Language validation and update
    if (profileData.language) {
      if (!['fr', 'en'].includes(profileData.language)) {
        return res.status(400).json({ success: false, error: "Invalid language. Must be 'fr' or 'en'." });
      }
      await User.findByIdAndUpdate(userId, { language: profileData.language });
    }

    // Image update
    if (file) {
      await profileService.updateUserImage(userId, file.filename);
    }

    // Determine account type from DB — never trust client-sent type
    if (Object.values(profileData).some(Boolean)) {
      const existing = await profileService.getProfileByUserId(userId).catch(() => null);
      let accountType = "Candidate";
      if (existing?.profile?.type) {
        accountType = existing.profile.type;
      } else if (existing?.user?.role) {
        accountType = existing.user.role === "Company" ? "Company" : existing.user.role === "Member" ? "Member" : "Candidate";
      }

      if (accountType === "Company") {
        if (profileData.name && typeof profileData.name !== "string")
          return res.status(400).json({ success: false, message: "Company name must be a string" });
        if (profileData.employmentType && !["Remote", "Hybrid", "On-site"].includes(profileData.employmentType))
          return res.status(400).json({ success: false, message: "Invalid employment type. Must be 'Remote', 'Hybrid', or 'On-site'" });
        await profileService.createOrUpdateCompanyProfile(userId, profileData);

      } else {
        const err = validateCandidateFields(profileData, false);
        if (err) return res.status(400).json({ success: false, message: err });
        await profileService.createOrUpdateProfile(userId, profileData);
      }
    }

    const payload = await buildProfilePayload(userId);
    res.status(200).json({ success: true, message: "Profile updated successfully", ...payload });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || "Failed to update profile" });
  }
};


module.exports.deleteResume = async (req, res) => {
  try {
    const userId  = req.user._id;
    const fs      = require("fs");
    const path    = require("path");
    const Profile = require("../../models/Profile.model");

    const profile = await Profile.findOne({ userId }).select("resume");
    if (!profile) return res.status(404).json({ success: false, error: "Profile not found." });

    if (profile.resume) {
      const filePath = path.join(__dirname, "..", "..", "uploads", "resumes", profile.resume);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      await Profile.findOneAndUpdate({ userId }, { resume: "" });
    }

    return res.status(200).json({ success: true, message: "Resume deleted." });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

module.exports.updateResume = async (req, res) => {
  try {
    const userId = req.user._id;
    const file   = req.file;

    if (!file) {
      return res.status(400).json({ success: false, error: "No resume file provided." });
    }

    const Profile = require("../../models/Profile.model");
    const profile = await Profile.findOneAndUpdate(
      { userId },
      { resume: file.filename },
      { new: true }
    ).select("_id resume firstName lastName");

    if (!profile) {
      return res.status(404).json({ success: false, error: "Profile not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Resume updated successfully.",
      data: { resume: profile.resume },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

module.exports.getProfilePayments = async (req, res) => {
  try {
    const { profileId } = req.params;

    if (!profileId) {
      return res.status(400).json({ success: false, message: "Profile ID is required" });
    }

    const result = await profileService.getProfilePayments(profileId);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error retrieving profile payments:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to retrieve profile payments",
    });
  }
};

module.exports.getActiveProfilePayment = async (req, res) => {
  try {
    const { profileId } = req.params;

    if (!profileId) {
      return res.status(400).json({ success: false, message: "Profile ID is required" });
    }

    const result = await profileService.getActiveProfilePayment(profileId);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error retrieving active profile payment:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to retrieve active profile payment",
    });
  }
};

module.exports.addPaymentToProfile = async (req, res) => {
  try {
    const { profileId } = req.params;
    const { paymentId } = req.body;

    if (!profileId) {
      return res.status(400).json({ success: false, message: "Profile ID is required" });
    }
    if (!paymentId) {
      return res.status(400).json({ success: false, message: "Payment ID is required" });
    }

    const result = await profileService.addPaymentToProfile(profileId, paymentId);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error adding payment to profile:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to add payment to profile",
    });
  }
};
