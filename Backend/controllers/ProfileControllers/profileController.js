const profileService = require("../../services/ProfileService/profileService");
const {
  VALIDATION,
  buildUpdateData,
  validateUpdateFields,
} = require("../../helpers/validationHelpers");

// Create or update a candidate profile (with onboarding fields support)
module.exports.createOrUpdateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const profileData = req.body;

    // Validation: profile type is required
    if (!profileData.type) {
      return res.status(400).json({ message: "Profile type is required" });
    }

    // Validation: firstName and lastName (handle both camelCase and PascalCase)
    const firstName = profileData.firstName || profileData.FirstName;
    const lastName = profileData.lastName || profileData.LastName;

    if (!firstName || !lastName) {
      return res.status(400).json({ message: "First name and last name are required" });
    }

    // Validation: age should be a valid number if provided
    if (profileData.age && isNaN(parseInt(profileData.age, 10))) {
      return res.status(400).json({ message: "Age must be a valid number" });
    }

    // Validation: preferredContractType (optional)
    if (profileData.preferredContractType && typeof profileData.preferredContractType !== "string") {
      return res.status(400).json({ message: "Preferred contract type must be a valid string" });
    }

    // Validation: location (optional)
    if (profileData.location && typeof profileData.location !== "string") {
      return res.status(400).json({ message: "Location must be a valid string" });
    }

    // Validation: expectedSalary structure (optional)
    if (profileData.expectedSalary) {
      const { min, max, currency } = profileData.expectedSalary;
      
      if (min !== null && min !== undefined && (isNaN(min) || min < 0)) {
        return res.status(400).json({ message: "Expected salary min must be a positive number" });
      }
      
      if (max !== null && max !== undefined && (isNaN(max) || max < 0)) {
        return res.status(400).json({ message: "Expected salary max must be a positive number" });
      }
      
      if (min !== null && max !== null && min > max) {
        return res.status(400).json({ message: "Expected salary min cannot be greater than max" });
      }
      
      if (currency && typeof currency !== "string") {
        return res.status(400).json({ message: "Currency must be a valid string (e.g., EUR, USD, GBP)" });
      }
    }

    // Create or update the profile
    const result = await profileService.createOrUpdateProfile(userId, profileData);

    res.status(200).json({
      success: true,
      message: "Profile created/updated successfully",
      user: result.user,
      profile: result.profile || null,
      companyMembership: result.companyMembership || null
    });
  } catch (error) {
    console.error("Error creating/updating candidate profile:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Error creating/updating candidate profile"
    });
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

    // Validate employmentType if provided
    if (profileData.employmentType && !["Remote", "Hybrid", "On-site"].includes(profileData.employmentType)) {
      return res.status(400).json({ message: "Invalid employment type. Must be 'Remote', 'Hybrid', or 'On-site'" });
    }

    // Create or update company profile with employment type support
    const result = await profileService.createOrUpdateCompanyProfile(
      userId,
      profileData
    );

    // Remove Hedera sensitive fields from user object
    if (result.user) {
      result.user = result.user.toObject ? result.user.toObject() : { ...result.user };
      delete result.user.hederaAccountId;
      delete result.user.hederaPrivateKey;
      delete result.user.hederaPublicKey;
    }

    res.status(200).json({
      success: true,
      message: "Company profile created/updated successfully",
      user: result.user,
      profile: result.profile || null,
      companyMembership: result.companyMembership || null
    });
  } catch (error) {
    console.error("Error creating/updating company profile:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Error creating/updating company profile"
    });
  }
};

exports.updateUserImage = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!req.file) {
      return res.status(400).json({ message: "No image was provided." });
    }

    const { filename } = req.file;
    console.log("New image:", filename);

    const updatedUser = await profileService.updateUserImage(userId, filename);

    res.status(200).json({
      message: "Image updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Get own profile
// controllers/profileController.js
module.exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const result = await profileService.getProfileByUserId(userId);

    res.status(200).json({
      success: true,
      message: "Profile retrieved successfully",
      user: result.user,
      profile: result.profile || null,
      companyMembership: result.companyMembership || null
    });
  } catch (error) {
    console.error("Error retrieving profile:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Internal error retrieving profile"
    });
  }
};

// Get own profile
// controllers/profileController.js
module.exports.getMyProfileOptimizer = async (req, res) => {
  try {
    const userId = req.user._id;

    const result = await profileService.getProfileByUserIdOptimizer(userId);

    res.status(200).json({
      success: true,
      message: "Profile retrieved successfully",
      user: result.user,
      profile: result.profile || null,
      companyMembership: result.companyMembership || null
    });
  } catch (error) {
    console.error("Error retrieving profile:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Internal error retrieving profile"
    });
  }
};


// Get a profile by ID
module.exports.getProfileById = async (req, res) => {
  try {
    const { userId } = req.params;

    // Use the service to retrieve the profile
    const result = await profileService.getProfileByUserId(userId);

    res.status(200).json({
      success: true,
      message: "Profile retrieved successfully",
      user: result.user,
      profile: result.profile || null,
      companyMembership: result.companyMembership || null
    });
  } catch (error) {
    console.error("Error retrieving profile:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Error retrieving profile"
    });
  }
};

// Get all profiles
module.exports.getAllProfiles = async (req, res) => {
  try {
    // Use the service to retrieve all profiles
    const profiles = await profileService.getAllProfiles();

    res.status(200).json(profiles);
  } catch (error) {
    console.error("Error retrieving profiles:", error);
    res
      .status(500)
      .json({
        message: error.message || "Error retrieving profiles",
      });
  }
};

// Delete a profile
module.exports.deleteProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    // Use the service to delete the profile
    const result = await profileService.deleteProfile(userId);

    res.status(200).json(result);
  } catch (error) {
    console.error("Error deleting profile:", error);
    res
      .status(500)
      .json({
        message: error.message || "Error deleting profile",
      });
  }
};

// Search profiles by skills
module.exports.searchProfilesBySkills = async (req, res) => {
  try {
    const { skills } = req.query;
    if (!skills) {
      return res.status(400).json({ message: "Skills are required" });
    }

    const skillsArray = skills.split(",").map((skill) => skill.trim());

    // Use the service to search profiles
    const profiles = await profileService.searchProfilesBySkills(skillsArray);

    res.status(200).json(profiles);
  } catch (error) {
    console.error("Error searching profiles:", error);
    res
      .status(500)
      .json({
        message: error.message || "Error searching profiles",
      });
  }
};

// Add soft skills
module.exports.addSoftSkills = async (req, res) => {
  try {
    const userId = req.user._id;
    const { softSkills } = req.body;

    if (!softSkills || !Array.isArray(softSkills)) {
      return res
        .status(400)
        .json({
          message: "Soft skills must be provided as an array",
        });
    }

    const result = await profileService.addSoftSkills(userId, softSkills);

    if (result.duplicateSoftSkills.length > 0) {
      return res.status(200).json({
        message: `The following soft skills already exist: ${result.duplicateSoftSkills.join(
          ", "
        )}`,
      });
    }

    res.status(200).json({
      message: result.message,
      profile: result.profile,
    });
  } catch (error) {
    console.error("Error adding soft skills:", error);
    res
      .status(500)
      .json({
        message: error.message || "Error adding soft skills",
      });
  }
};

// Get soft skills
module.exports.getSoftSkills = async (req, res) => {
  try {
    const userId = req.user._id;
    const softSkills = await profileService.getSoftSkills(userId);
    res.status(200).json(softSkills);
  } catch (error) {
    console.error("Error retrieving soft skills:", error);
    res
      .status(500)
      .json({
        message:
          error.message || "Error retrieving soft skills",
      });
  }
};

// Update soft skills
module.exports.updateSoftSkills = async (req, res) => {
  try {
    const userId = req.user._id;
    const { softSkills } = req.body;

    if (!softSkills || !Array.isArray(softSkills)) {
      return res
        .status(400)
        .json({
          message: "Soft skills must be provided as an array",
        });
    }

    const profile = await profileService.updateSoftSkills(userId, softSkills);
    res.status(200).json({
      message: "Soft skills updated successfully",
      profile,
    });
  } catch (error) {
    console.error("Error updating soft skills:", error);
    res
      .status(500)
      .json({
        message:
          error.message || "Error updating soft skills",
      });
  }
};

// Delete a specific skill
module.exports.deleteHardSkill = async (req, res) => {
  try {
    const userId = req.user._id;
    const { skillToDelete } = req.body;

    if (!skillToDelete || typeof skillToDelete !== "string") {
      return res
        .status(400)
        .json({
          message: "The skill to be deleted must be provided as a string",
        });
    }

    const profile = await profileService.deleteHardSkill(userId, skillToDelete);
    res.status(200).json({
      message: `Hard Skill "${skillToDelete}" has been successfully deleted`,
      profile,
    });
  } catch (error) {
    console.error("Error deleting soft skills:", error);
    res
      .status(500)
      .json({ message: error.message || "Error deleting soft skills" });
  }
};

// Delete a specific softSkill
module.exports.deleteSoftSkill = async (req, res) => {
  try {
    const userId = req.user._id;
    const { softSkillToDelete } = req.body;

    if (!softSkillToDelete || typeof softSkillToDelete !== "string") {
      return res
        .status(400)
        .json({
          message: "The skill to be deleted must be provided as a string",
        });
    }

    const profile = await profileService.deleteSoftSkill(
      userId,
      softSkillToDelete
    );
    res.status(200).json({
      message: `Soft Skills "${softSkillToDelete}" has been successfully deleted`,
      profile,
    });
  } catch (error) {
    console.error("Error deleting soft skills:", error);
    res
      .status(500)
      .json({ message: error.message || "Error deleting soft skills" });
  }
};

// Update finalBid
module.exports.updateFinalBid = async (req, res) => {
  try {
    const { newBid, userId, postId , companyId} = req.body;

    //const companyId = req.user._id;
    
    if (typeof newBid !== "number" || newBid <= 0) {
      return res
        .status(401)
        .json({ message: "The bid must be a positive number" });
    }

    const profile = await profileService.updateFinalBid(
      userId,
      newBid,
      companyId,
      postId
    );

    res.status(200).json({
      message: "Bid updated successfully",
      profile,
    });
  } catch (error) {
    console.error("Error updating bid:", error);
    res.status(500).json({ message: error.message || "Error updating bid" });
  }
};

// Get bidded candidates by connected company
module.exports.getCompanyBids = async (req, res) => {
  try {
    const companyId = req.user._id;
    const result = await profileService.getCompanyBids(companyId);

    res.status(200).json(result);
  } catch (error) {
    console.error("Error getting company bids:", error);
    res
      .status(500)
      .json({ message: error.message || "Error getting company bids" });
  }
};

exports.getCompanyWithAssessments = async (req, res) => {
  try {
    const { id } = req.user.profile;
    //const id = "68ff674d5d0454e0505e4d75"; // For testing purpose
    
    const { jobId } = req.params; 
    
    const profile = await profileService.getCompanyProfileWithAssessments(id, jobId);

    if (!profile) {
      return res.status(404).json({ message: "Profile not found or not a company." });
    }

    return res.status(200).json(profile);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getTotalCompanies = async (req, res) => {
  try {
    const total = await profileService.getTotalCompanies();
    res.json({ totalCompanies: total });
  } catch (error) {
    console.error("Error getting total companies:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getCompaniesWithActivePosts = async (req, res) => {
  try {
    const companies = await profileService.getCompaniesWithActivePosts();
    res.json({ companiesWithActivePosts: companies });
  } catch (error) {
    console.error("Error getting companies with active posts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getTopHiringCompanies = async (req, res) => {
  try {
    const topCompanies = await profileService.getTopHiringCompanies();
    res.json({ topHiringCompanies: topCompanies });
  } catch (error) {
    console.error("Error getting top hiring companies:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getRecentActiveCompanies = async (req, res) => {
  try {
    const recentCompanies = await profileService.getRecentActiveCompanies();
    res.json({ recentActiveCompanies: recentCompanies });
  } catch (error) {
    console.error("Error getting recent active companies:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getTopIndustries = async (req, res) => {
  try {
    const industries = await profileService.getTopIndustries();
    res.json({ topIndustries: industries });
  } catch (error) {
    console.error("Error getting top industries:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Optimized update profile API
module.exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      username, email, requiredExperienceLevel, targetRole,
      firstName, lastName, gender, country, language, timeZone,
      contactInformation,
    } = req.body;

    // Prepare potential updates
    const allUpdates = {
      username, email, requiredExperienceLevel, targetRole,
      firstName, lastName, gender, country, language, timeZone,
    };

    // Check if at least one field is provided
    if (!Object.values(allUpdates).some(val => val) && !contactInformation) {
      return res.status(400).json({
        success: false,
        message: "At least one field must be provided for update",
      });
    }

    // Validate fields
    const validationError = validateUpdateFields(allUpdates);
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    // Separate user and profile updates
    const userUpdateData = buildUpdateData({ username, email });
    const profileUpdateData = buildUpdateData({
      requiredExperienceLevel, targetRole, firstName, lastName,
      gender, country, language, timeZone,
    });

    // Add contactInformation if provided
    if (contactInformation) {
      profileUpdateData.contactInformation = contactInformation;
    }

    // Execute updates in parallel
    const updatePromises = [];
    if (Object.keys(userUpdateData).length > 0) {
      updatePromises.push(profileService.updateUserFields(userId, userUpdateData));
    }
    if (Object.keys(profileUpdateData).length > 0) {
      updatePromises.push(profileService.updateProfileFields(userId, profileUpdateData));
    }

    if (updatePromises.length > 0) {
      await Promise.all(updatePromises);
    }

    // Fetch and return updated profile
    const updatedProfile = await profileService.getProfileByUserId(userId);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedProfile.user,
      profile: updatedProfile.profile || null,
      companyMembership: updatedProfile.companyMembership || null
    });

  } catch (error) {
    console.error('❌ Error updating profile:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to update profile"
    });
  }
};

// Update profile visibility (public / private)
module.exports.updateProfileVisibility = async (req, res) => {
  try {
    const userId = req.user._id;
    const { isPublicProfile } = req.body;

    if (typeof isPublicProfile !== 'boolean') {
      return res.status(400).json({ success: false, message: 'isPublicProfile must be a boolean' });
    }

    const updatedProfile = await profileService.updateProfileVisibility(userId, isPublicProfile);

    return res.status(200).json({ success: true, message: 'Profile visibility updated', profile: updatedProfile });
  } catch (error) {
    console.error('Error updating profile visibility:', error);
    return res.status(500).json({ success: false, message: error.message || 'Error updating profile visibility' });
  }
};

// Unified update profile API - handles all profile updates including image upload
module.exports.updateProfileComplete = async (req, res) => {
  try {
    const userId = req.user._id;
    const profileData = req.body;
    const file = req.file;
    let result;

    console.log("🔄 [updateProfileComplete] Starting profile update for userId:", userId);
    console.log("📋 [updateProfileComplete] Profile data received:", JSON.stringify(profileData, null, 2));
    console.log("📁 [updateProfileComplete] File provided:", file ? `${file.filename} (${file.size} bytes)` : "None");

    // Update user image if provided
    if (file) {
      const { filename } = file;
      console.log("🖼️  [updateProfileComplete] Updating image:", filename);
      await profileService.updateUserImage(userId, filename);
      console.log("✅ [updateProfileComplete] Image updated successfully");
    }

    // Determine account type from DB (profile.type or user.role). Do NOT rely on profileData.type from client.
    console.log("🔍 [updateProfileComplete] Fetching existing profile to determine account type...");
    const existing = await profileService.getProfileByUserId(userId).catch(() => null);
    let accountType = "Candidate";
    if (existing && existing.profile && existing.profile.type) {
      accountType = existing.profile.type;
    } else if (existing && existing.user && existing.user.role) {
      accountType = existing.user.role === "Company" ? "Company" : "Candidate";
    }
    console.log("👤 [updateProfileComplete] Account type determined:", accountType);

    // If there are profile fields to update, route to the correct service based on accountType
    if (Object.values(profileData).some((val) => val)) {
      console.log("📝 [updateProfileComplete] Profile fields detected, processing updates...");
      if (accountType === "Company") {
        console.log("🏢 [updateProfileComplete] Processing COMPANY profile update");
        // Validate company profile
        if (profileData.name && typeof profileData.name !== "string") {
          console.log("❌ [updateProfileComplete] Company name validation failed");
          return res.status(400).json({ success: false, message: "Company name must be a string" });
        }
        if (profileData.employmentType && !["Remote", "Hybrid", "On-site"].includes(profileData.employmentType)) {
          console.log("❌ [updateProfileComplete] Employment type validation failed");
          return res.status(400).json({ success: false, message: "Invalid employment type. Must be 'Remote', 'Hybrid', or 'On-site'" });
        }

        console.log("✏️  [updateProfileComplete] Updating company profile with data:", JSON.stringify(profileData, null, 2));
        result = await profileService.createOrUpdateCompanyProfile(userId, profileData);
        console.log("✅ [updateProfileComplete] Company profile updated successfully");
      } else {
        console.log("👥 [updateProfileComplete] Processing CANDIDATE profile update");
        // Candidate validations - Allow single field updates (no requirement for both first+last)
        const firstName = profileData.firstName || profileData.FirstName;
        const lastName = profileData.lastName || profileData.LastName;

        // Validate types when provided (but not required to provide both)
        if (firstName && typeof firstName !== "string") {
          console.log("❌ [updateProfileComplete] First name validation failed");
          return res.status(400).json({ success: false, message: "firstName must be a string" });
        }
        if (lastName && typeof lastName !== "string") {
          console.log("❌ [updateProfileComplete] Last name validation failed");
          return res.status(400).json({ success: false, message: "lastName must be a string" });
        }

        if (profileData.age && isNaN(parseInt(profileData.age, 10))) {
          console.log("❌ [updateProfileComplete] Age validation failed");
          return res.status(400).json({ success: false, message: "Age must be a valid number" });
        }

        if (profileData.preferredContractType && typeof profileData.preferredContractType !== "string") {
          console.log("❌ [updateProfileComplete] Preferred contract type validation failed");
          return res.status(400).json({ success: false, message: "Preferred contract type must be a valid string" });
        }

        if (profileData.location && typeof profileData.location !== "string") {
          console.log("❌ [updateProfileComplete] Location validation failed");
          return res.status(400).json({ success: false, message: "Location must be a valid string" });
        }

        if (profileData.expectedSalary) {
          console.log("💰 [updateProfileComplete] Validating expected salary:", JSON.stringify(profileData.expectedSalary));
          const { min, max, currency } = profileData.expectedSalary;
          if (min !== null && min !== undefined && (isNaN(min) || min < 0)) {
            console.log("❌ [updateProfileComplete] Salary min validation failed");
            return res.status(400).json({ success: false, message: "Expected salary min must be a positive number" });
          }
          if (max !== null && max !== undefined && (isNaN(max) || max < 0)) {
            console.log("❌ [updateProfileComplete] Salary max validation failed");
            return res.status(400).json({ success: false, message: "Expected salary max must be a positive number" });
          }
          if (min !== null && max !== null && min > max) {
            console.log("❌ [updateProfileComplete] Salary min > max validation failed");
            return res.status(400).json({ success: false, message: "Expected salary min cannot be greater than max" });
          }
          if (currency && typeof currency !== "string") {
            console.log("❌ [updateProfileComplete] Currency validation failed");
            return res.status(400).json({ success: false, message: "Currency must be a valid string (e.g., EUR, USD, GBP)" });
          }
        }

        console.log("✏️  [updateProfileComplete] Updating candidate profile with data:", JSON.stringify(profileData, null, 2));
        result = await profileService.createOrUpdateProfile(userId, profileData);
        console.log("✅ [updateProfileComplete] Candidate profile updated successfully");
      }
    } else if (file) {
      // Only image was updated
      console.log("🖼️  [updateProfileComplete] Only image was updated, fetching profile...");
      result = await profileService.getProfileByUserId(userId);
      console.log("✅ [updateProfileComplete] Profile fetched after image update");
    } else {
      console.log("⚠️  [updateProfileComplete] No fields or file provided for update");
      return res.status(400).json({
        success: false,
        message: "At least one field must be provided for update",
      });
    }

    // Build list of fields that were sent and thus considered updated
    const sentFields = Object.keys(profileData || {}).filter(
      (k) => profileData[k] !== undefined && profileData[k] !== null && profileData[k] !== ""
    );
    if (file) sentFields.push("file");
    const updatedFields = [...new Set(sentFields)];

    console.log("📊 [updateProfileComplete] Updated fields:", updatedFields);
    console.log("✅ [updateProfileComplete] Profile update completed successfully");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      updatedFields,
      user: result.user,
      profile: result.profile || null,
      companyMembership: result.companyMembership || null,
    });

  } catch (error) {
    console.error('❌ [updateProfileComplete] Error updating profile:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to update profile"
    });
  }
};