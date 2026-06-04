const Profile = require("../../models/Profile.model");
const User = require("../../models/User.model");
const Post = require("../../models/Post.model");
// const { POST_STATUS } = require("../../constants/posts.constants");
const fs = require("fs");
const path = require("path");

// Create or update a candidate profile
module.exports.createOrUpdateProfile = async (userId, profileData) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Map frontend camelCase to backend field names and ensure proper updates
    const updateUserData = {
      FirstName: profileData.firstName || profileData.FirstName,
      LastName: profileData.lastName || profileData.LastName,
      role: "Candidate",
    };

    // Update user with correct field names
    await User.findByIdAndUpdate(userId, updateUserData);

    // Find or create profile
    let profile = await Profile.findOne({ userId });

    if (!profile) {
      // Create new profile
      profile = await Profile.create({
        userId,
        type: profileData.type ,
        firstName: profileData.firstName || profileData.FirstName,
        lastName: profileData.lastName || profileData.LastName,
        age: profileData.age,
        gender: profileData.gender,
        educationLevel: profileData.educationLevel,
        country: profileData.country,
        language: profileData.language,
        timeZone: profileData.timeZone,
        expectedSalary: profileData.expectedSalary ? {
          min: profileData.expectedSalary.min,
          max: profileData.expectedSalary.max,
          currency: profileData.expectedSalary.currency || "EUR"
        } : undefined,
        preferredContractType: profileData.preferredContractType,
        workModePreference: profileData.workModePreference,
        skills: profileData.skills || [],
        overallScore: profileData.overallScore || 0,
        targetRole: profileData.targetRole || "",
      });

      if (
        profileData.skills.length === 1 &&
        typeof profileData.skills[0]?.skill === "string"
      ) {
        profile.skills = [];
        await profile.save();
      }
    } else {
      // Update existing profile
      console.log("🔄 [createOrUpdateProfile] Updating existing profile for userId:", userId);
      console.log("📝 [createOrUpdateProfile] Profile data to update:", JSON.stringify(profileData, null, 2));

      profile.firstName = profileData.firstName || profileData.FirstName || profile.firstName;
      profile.lastName = profileData.lastName || profileData.LastName || profile.lastName;
      profile.age = profileData.age || profile.age;
      profile.gender = profileData.gender || profile.gender;
      profile.educationLevel = profileData.educationLevel || profile.educationLevel;
      profile.country = profileData.country || profile.country;
      profile.language = profileData.language || profile.language;
      profile.timeZone = profileData.timeZone || profile.timeZone;
      profile.targetRole = profileData.targetRole || profile.targetRole;
      profile.requiredExperienceLevel = profileData.requiredExperienceLevel || profile.requiredExperienceLevel;
      // Update salary expectations
      if (profileData.expectedSalary) {
        console.log("💰 [createOrUpdateProfile] Updating expectedSalary:", profileData.expectedSalary);
        profile.expectedSalary = {
          min: profileData.expectedSalary.min,
          max: profileData.expectedSalary.max,
          currency: profileData.expectedSalary.currency || "EUR"
        };
      }

      profile.preferredContractType = profileData.preferredContractType || profile.preferredContractType;
      profile.workModePreference = profileData.workModePreference || profile.workModePreference;

      // Update contact information
      if (profileData.contactInformation) {
        console.log("📧 [createOrUpdateProfile] Updating contactInformation:", JSON.stringify(profileData.contactInformation, null, 2));
        profile.contactInformation = {
          email: profileData.contactInformation.email !== undefined ? profileData.contactInformation.email : (profile.contactInformation?.email || ''),
          phone: profileData.contactInformation.phone !== undefined ? profileData.contactInformation.phone : (profile.contactInformation?.phone || ''),
          address: profileData.contactInformation.address !== undefined ? profileData.contactInformation.address : (profile.contactInformation?.address || ''),
          linkedinUrl: profileData.contactInformation.linkedinUrl !== undefined ? profileData.contactInformation.linkedinUrl : (profile.contactInformation?.linkedinUrl || ''),
          githubUrl: profileData.contactInformation.githubUrl !== undefined ? profileData.contactInformation.githubUrl : (profile.contactInformation?.githubUrl || ''),
          personalWebsite: profileData.contactInformation.personalWebsite !== undefined ? profileData.contactInformation.personalWebsite : (profile.contactInformation?.personalWebsite || ''),
          location: profileData.contactInformation.location !== undefined ? profileData.contactInformation.location : (profile.contactInformation?.location || ''),
        };
        console.log("✅ [createOrUpdateProfile] contactInformation updated successfully:", profile.contactInformation);
      }

      // Update overall score if provided
      if (typeof profileData.overallScore === "number") {
        profile.overallScore = profileData.overallScore;
      }

      // Merge skills
      if (Array.isArray(profileData.skills)) {
        console.log("🎯 [createOrUpdateProfile] Updating skills:", profileData.skills);
        profileData.skills.forEach((newSkill) => {
          const existingSkill = profile.skills.find(
            (skill) => skill.name === newSkill.name
          );
          if (existingSkill) {
            existingSkill.proficiencyLevel = newSkill.proficiencyLevel;
            existingSkill.experienceLevel = newSkill.experienceLevel;
            if (typeof newSkill.ScoreTest === "number") {
              existingSkill.ScoreTest = newSkill.ScoreTest;
            }
          } else {
            profile.skills.push(newSkill);
          }
        });

        if (
          profileData.skills.length === 1 &&
          typeof profileData.skills[0]?.skill === "string"
        ) {
          profile.skills = [];
        }
      }

      profile.type = profileData.type || profile.type;
      await profile.save();
      console.log("💾 [createOrUpdateProfile] Profile saved successfully");
    }

    // Update profile reference in User
    await User.findByIdAndUpdate(userId, { profile: profile._id });

    const updatedUser = await User.findById(userId);
    const companyMembership = updatedUser.companyMembership
      ? await require('../../models/CompanyMembership.model').findById(updatedUser.companyMembership).populate({ path: 'company', select: 'username email Localisation user_image createdAt updatedAt', populate: { path: 'profile' } }).select('_id role updatedAt company')
      : null;

    return {
      user: updatedUser,
      profile,
      companyMembership
    };
  } catch (error) {
    console.error("Error creating/updating candidate profile:", error);
    throw error;
  }
};

// Create or update a Company profile
exports.createOrUpdateCompanyProfile = async (userId, profileData) => {
  try {
    console.log("🏢 [createOrUpdateCompanyProfile] Starting company profile update for userId:", userId);
    console.log("📋 [createOrUpdateCompanyProfile] Company data received:", JSON.stringify(profileData, null, 2));

    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found.");
    }

    // Ensure user role is updated to Company
    await User.findByIdAndUpdate(userId, { role: "Company" });

    let profile = await Profile.findOne({ userId });

    // Extract companyDetails from profileData (can be nested or flat)
    const companyDetailsInput = profileData.companyDetails || {};

    const profileDataToSave = {
      userId,
      type: "Company",
      companyDetails: {
        email: companyDetailsInput.email || profileData.email ,
        name: companyDetailsInput.name || profileData.name ,
        industry: companyDetailsInput.industry || profileData.industry ,
        size: companyDetailsInput.size || profileData.size ,
        location: companyDetailsInput.location || profileData.location ,
        website: companyDetailsInput.website || profileData.website ,
        linkedin: companyDetailsInput.linkedin || profileData.linkedin ,
        employmentType: companyDetailsInput.employmentType || profileData.employmentType,
      },
      requiredSkills: profileData.requiredSkills || [],
      requiredExperienceLevel: profileData.requiredExperienceLevel || "Entry Level",
    };

    console.log("📊 [createOrUpdateCompanyProfile] Profile data to save:", JSON.stringify(profileDataToSave, null, 2));
    console.log("🎯 [createOrUpdateCompanyProfile] requiredExperienceLevel value:", profileDataToSave.requiredExperienceLevel);
    console.log("📧 [createOrUpdateCompanyProfile] contactInformation value:", profileDataToSave.contactInformation);

    if (profile) {
      // Update existing profile
      console.log("🔄 [createOrUpdateCompanyProfile] Updating existing company profile");
      console.log("📝 [createOrUpdateCompanyProfile] Before update - contactInformation:", profile.contactInformation);

      profile.type = "Company";

      // Merge companyDetails (preserve existing values if not provided)
      profile.companyDetails = {
        email: companyDetailsInput.email || profileData.email || profile.companyDetails?.email,
        name: companyDetailsInput.name || profileData.name || profile.companyDetails?.name,
        industry: companyDetailsInput.industry || profileData.industry || profile.companyDetails?.industry,
        size: companyDetailsInput.size || profileData.size || profile.companyDetails?.size,
        location: companyDetailsInput.location || profileData.location || profile.companyDetails?.location,
        website: companyDetailsInput.website || profileData.website || profile.companyDetails?.website,
        linkedin: companyDetailsInput.linkedin || profileData.linkedin || profile.companyDetails?.linkedin,
        employmentType: companyDetailsInput.employmentType || profileData.employmentType || profile.companyDetails?.employmentType,
      };

      profile.requiredSkills = profileData.requiredSkills || profile.requiredSkills;
      profile.requiredExperienceLevel = profileData.requiredExperienceLevel || profile.requiredExperienceLevel;
      console.log("📝 [createOrUpdateCompanyProfile] After update - requiredExperienceLevel:", profile.requiredExperienceLevel);
      console.log("🏢 [createOrUpdateCompanyProfile] Company details updated:", JSON.stringify(profile.companyDetails, null, 2));

      await profile.save();
      console.log("💾 [createOrUpdateCompanyProfile] Profile saved successfully");
    } else {
      // Create new profile
      console.log("✨ [createOrUpdateCompanyProfile] Creating new company profile");
      profile = await Profile.create(profileDataToSave);
      console.log("✅ [createOrUpdateCompanyProfile] New profile created with ID:", profile._id);
      console.log("📧 [createOrUpdateCompanyProfile] Created profile contactInformation:", profile.contactInformation);
    }

    // Update the user's profile reference
    await User.findByIdAndUpdate(userId, { profile: profile._id });

    const updatedUser = await User.findById(userId);
    const companyMembership = updatedUser.companyMembership
      ? await require('../../models/CompanyMembership.model').findById(updatedUser.companyMembership).populate({ path: 'company', select: 'username email Localisation user_image createdAt updatedAt', populate: { path: 'profile' } }).select('_id role updatedAt company')
      : null;

    console.log("✅ [createOrUpdateCompanyProfile] Company profile update completed successfully");
    console.log("📊 [createOrUpdateCompanyProfile] Final profile state:", {
      _id: profile._id,
      type: profile.type,
      companyName: profile.companyDetails.name,
      requiredSkills: profile.requiredSkills,
      employmentType: profile.companyDetails.employmentType
    });

    return {
      user: updatedUser,
      profile,
      companyMembership
    };
  } catch (error) {
    console.error("❌ [createOrUpdateCompanyProfile] Error creating/updating company profile:", error.message);
    throw error;
  }
};

exports.updateUserImage = async (userId, newFilename) => {
  if (!userId) {
    throw new Error("Missing user ID.");
  }
  if (!newFilename) {
    throw new Error("Missing image filename.");
  }
console.log("Updating profile image for userId:", userId.toString(), "with new filename:", newFilename);
  // 1️⃣ Retrieve the existing user to know the old image
const existingUser = await Profile.findOne({ userId: userId.toString() });
  if (!existingUser) {
    throw new Error("Profile not found.");
  }

  const oldImage = existingUser.user_image;
  console.log("Old image filename:", oldImage);
  // 2️⃣ Update the image in the database
  const updatedUser = await Profile.findByIdAndUpdate(
    existingUser._id,
    { user_image: newFilename },
    { new: true }
  );

  // 3️⃣ Supprimer l’ancienne image si elle existe
  if (oldImage && oldImage !== newFilename) {
    const oldImagePath = path.join(__dirname, "..", "public", "images", "Users", oldImage);
console.log("Old image path to delete:", oldImagePath);
    fs.access(oldImagePath, fs.constants.F_OK, (err) => {
      if (!err) {
        fs.unlink(oldImagePath, (unlinkErr) => {
          if (unlinkErr) console.error("Error deleting old image:", unlinkErr);
          else console.log("Old image deleted:", oldImage);
        });
      }
    });
  }

  return updatedUser;
};

// Get a profile by user ID
// services/profileService.js
module.exports.getProfileByUserId = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    const [profile, companyMembership] = await Promise.all([
      user.profile
        ? Profile.findById(user.profile).populate('planLimits')
        : null,

      user.companyMembership
        ? require('../../models/CompanyMembership.model')
            .findById(user.companyMembership)
            .populate({
              path: 'company',
              select: 'username email Localisation user_image createdAt updatedAt',
              populate: { path: 'profile' }
            })
            .select('_id role updatedAt company')
        : null
    ]);

    // Extract planLimits from profile if it exists
    let planLimits = null;
    if (profile && profile.planLimits) {
      planLimits = profile.planLimits;
    }

    // Auto-assign Trial plan for Company profiles that have no plan yet
    if (profile && !planLimits && user.role === 'Company') {
      try {
        const { assignFreePlanToProfile } = require('../authentication.service');
        await assignFreePlanToProfile(profile._id);
        const refreshed = await Profile.findById(profile._id).populate('planLimits');
        planLimits = refreshed?.planLimits || null;
      } catch (e) {
        console.warn('Auto-assign Trial on getMyProfile failed:', e.message);
      }
    }

    return {
      success: true,
      message: "Profile retrieved successfully",
      user,
      profile,
      planLimits,
      companyMembership
    };
  } catch (error) {
    console.error("Error retrieving profile:", error);
    error.status = error.status || 500;
    throw error;
  }
};

module.exports.getProfileByPostId = async (postId) => {
  try {
    const post = await Post.findOne({ _id: postId }).populate({
      path: "user",
      populate: { path: "profile" },
    });

    if (!post || !post.user || !post.user.profile) {
      return { message: "No profile found for this user." };
    }

    return post.user.profile;
  } catch (error) {
    console.error("Error retrieving profile:", error);
    throw new Error("Unable to retrieve profile."); // More generic message
  }
};

// Update specific profile fields
module.exports.updateProfileFields = async (userId, updateData) => {
  try {
    console.log('🔧 Updating profile fields for user:', userId);
    console.log('🔧 Update data:', updateData);

    const profile = await Profile.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true }
    );

    if (!profile) {
      throw new Error("Profile not found");
    }

    console.log('✅ Profile fields updated successfully');
    return profile;
  } catch (error) {
    console.error('❌ Error updating profile fields:', error);
    throw error;
  }
};

// Update user fields in a centralized service (map camelCase to existing User schema fields)
module.exports.updateUserFields = async (userId, userUpdateData) => {
  try {
    if (!userId) throw new Error('Missing userId');

    // Map camelCase to actual User model fields where needed
    const mapped = { ...userUpdateData };
    if (mapped.firstName !== undefined) {
      mapped.FirstName = mapped.firstName;
      delete mapped.firstName;
    }
    if (mapped.lastName !== undefined) {
      mapped.LastName = mapped.lastName;
      delete mapped.lastName;
    }

    // Avoid accidentally setting undefined values
    Object.keys(mapped).forEach((k) => {
      if (mapped[k] === undefined) delete mapped[k];
    });

    const updatedUser = await User.findByIdAndUpdate(userId, mapped, { new: true });

    if (!updatedUser) {
      throw new Error('User not found');
    }

    return updatedUser;
  } catch (error) {
    console.error('❌ Error updating user fields:', error);
    throw error;
  }
};

// Update profile visibility (public/private)
module.exports.updateProfileVisibility = async (userId, isPublicProfile) => {
  try {
    if (typeof isPublicProfile !== 'boolean') {
      throw new Error('isPublicProfile must be a boolean');
    }

    const profile = await Profile.findOneAndUpdate(
      { userId },
      { $set: { isPublicProfile } },
      { new: true }
    );

    if (!profile) {
      throw new Error('Profile not found');
    }

    return profile;
  } catch (error) {
    console.error('❌ Error updating profile visibility:', error);
    throw error;
  }
};

// ========== PLAN USAGE FUNCTIONS ==========
// NOTE: These functions are DEPRECATED - Use subscription.service instead
// Kept for backward compatibility

/**
 * DEPRECATED - Use subscriptionService.checkSubscriptionLimit() instead
 * Check if a user can perform an action based on plan limits
 * @param {string} userId - User ID
 * @param {string} limitType - Type of limit: 'posts', 'monthlyInterviews'
 * @returns {object} - { canUse: boolean, message: string, limitData: object }
 */
module.exports.checkPlanLimit = async (userId, limitType) => {
  try {
    const profile = await Profile.findOne({ userId });

    if (!profile) {
      throw new Error('User profile not found');
    }

    if (profile.type !== 'Company') {
      throw new Error('This action is only available for company accounts');
    }

    const subscriptionService = require('../subscription.service');
    
    // Use new subscription service
    return await subscriptionService.checkSubscriptionLimit(profile._id, limitType);
  } catch (error) {
    console.error('❌ Error checking plan limit:', error);
    throw error;
  }
};

/**
 * DEPRECATED - Use subscriptionService.incrementUsage() instead
 * Increment plan usage counter
 * @param {string} userId - User ID
 * @param {string} usageType - Type of usage: 'postsUsed', 'monthlyInterviewsUsed'
 * @returns {object} - Updated profile
 */
/**
 * DEPRECATED - Use subscriptionService.incrementUsage() instead
 * Increment plan usage counter
 * @param {string} userId - User ID
 * @param {string} usageType - Type of usage: 'postsUsed', 'monthlyInterviewsUsed'
 * @returns {object} - Updated subscription
 */
module.exports.incrementPlanUsage = async (userId, usageType) => {
  try {
    if (!['postsUsed', 'monthlyInterviewsUsed'].includes(usageType)) {
      throw new Error('Invalid usage type');
    }

    const profile = await Profile.findOne({ userId }).populate('activeSubscription');

    if (!profile) {
      throw new Error('Profile not found');
    }

    if (!profile.activeSubscription) {
      throw new Error('No active subscription found');
    }

    const subscriptionService = require('../subscription.service');
    
    // Use new subscription service
    const result = await subscriptionService.incrementUsage(
      profile.activeSubscription._id,
      usageType,
      1
    );

    return result.data;
  } catch (error) {
    console.error('❌ Error incrementing plan usage:', error);
    throw error;
  }
};