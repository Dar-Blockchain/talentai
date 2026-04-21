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
      console.log("📝 [createOrUpdateCompanyProfile] Before update - requiredExperienceLevel:", profile.requiredExperienceLevel);
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
      console.log("🎯 [createOrUpdateCompanyProfile] Created profile requiredExperienceLevel:", profile.requiredExperienceLevel);
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
      requiredExperienceLevel: profile.requiredExperienceLevel,
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
      // Keep planLimits inside profile so callers receive it as part of the profile object
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

// Search profiles by skills
module.exports.searchProfilesBySkills = async (skills) => {
  try {
    const profiles = await Profile.find({
      "skills.name": { $in: skills },
    }).populate("userId", "username email");
    return profiles;
  } catch (error) {
    console.error("Error searching profiles:", error);
    throw error;
  }
};

// Manage soft skills
module.exports.addSoftSkills = async (userId, softSkills) => {
  try {
    const profile = await Profile.findOne({ userId });

    if (!profile) {
      throw new Error("Profile not found");
    }

    if (!Array.isArray(softSkills)) {
      throw new Error(
        "Soft skills must be provided as an array"
      );
    }

    // Check existing soft skills
    const existingSoftSkills = profile.softSkills.map((skill) =>
      skill.name.toLowerCase()
    );
    const newSoftSkills = [];
    const duplicateSoftSkills = [];

    // Filter existing and new skills
    softSkills.forEach((skill) => {
      // Normalize to lowercase to avoid case-insensitive duplicates
      const skillName = skill.name.toLowerCase();

      if (existingSoftSkills.includes(skillName)) {
        duplicateSoftSkills.push(skill.name);
      } else {
        newSoftSkills.push(skill);
      }
    });

    // If we have new skills, add them
    if (newSoftSkills.length > 0) {
      // Add new soft skills while preserving uniqueness
      profile.softSkills = [...profile.softSkills, ...newSoftSkills];
      await profile.save(); // Save changes to database
    }

    // Return appropriate message
    return {
      profile,
      message:
        newSoftSkills.length > 0
          ? "Soft skills added successfully."
          : "No new skills to add.",
      duplicateSoftSkills, // List of duplicates found
    };
  } catch (error) {
    console.error("Error adding soft skills:", error);
    throw error; // Throw error to be handled by controller
  }
};

module.exports.getSoftSkills = async (userId) => {
  try {
    const profile = await Profile.findOne({ userId });
    if (!profile) {
      throw new Error("Profile not found");
    }
    return profile.softSkills || [];
  } catch (error) {
    console.error("Error retrieving soft skills:", error);
    throw error;
  }
};

module.exports.updateSoftSkills = async (userId, softSkills) => {
  try {
    const profile = await Profile.findOne({ userId });
    if (!profile) {
      throw new Error("Profile not found");
    }

    if (!Array.isArray(softSkills)) {
      throw new Error(
        "Soft skills must be provided as an array"
      );
    }

    profile.softSkills = softSkills;
    await profile.save();
    return profile;
  } catch (error) {
    console.error("Error updating soft skills:", error);
    throw error;
  }
};

module.exports.deleteSoftSkills = async (userId, softSkillsToDelete) => {
  try {
    const profile = await Profile.findOne({ userId });
    if (!profile) {
      throw new Error("Profile not found");
    }

    if (!Array.isArray(softSkillsToDelete)) {
      throw new Error(
        "Soft skills to delete must be provided as an array"
      );
    }

    profile.softSkills = profile.softSkills.filter(
      (skill) => !softSkillsToDelete.includes(skill)
    );
    await profile.save();
    return profile;
  } catch (error) {
    console.error("Error deleting soft skills:", error);
    throw error;
  }
};



// Delete a specific skill (with cleanup of relationships and implications)
// 🔹 Fonction pour supprimer un hard skill d’un profil utilisateur
module.exports.deleteHardSkill = async (userId, skillToDelete) => {
  try {
    console.log("🟢 Starting skill deletion:", skillToDelete, "for user:", userId);

    // ✅ 1) Get the user's profile
    const profile = await Profile.findOne({ userId });
    if (!profile) {
      console.error("❌ No profile found for user:", userId);
      throw new Error("Profile not found");
    }
    console.log("✅ Profile found:", profile._id);

    // ✅ 2) Verify validity of skill to delete
    if (!skillToDelete || typeof skillToDelete !== "string") {
      console.error("❌ The skill to delete must be a valid string");
      throw new Error("The skill to be deleted must be provided as a string");
    }

    // ✅ 3) Find the position of the skill in the skills array
    const skillIndex = profile.skills.findIndex(
      (skill) => skill.name === skillToDelete
    );

    if (skillIndex === -1) {
      console.warn(`⚠️ The skill "${skillToDelete}" does not exist in the profile`);
      throw new Error(`The skill "${skillToDelete}" does not exist in your profile`);
    }
    console.log(`🧩 Skill "${skillToDelete}" found at index ${skillIndex}`);

    // ✅ 4) Delete the skill from the array
    profile.skills.splice(skillIndex, 1);
    console.log(`🗑️ Skill "${skillToDelete}" successfully deleted from profile`);

    // ✅ 5) Recalculer le overallScore
    const numericScores = (profile.skills || [])
      .map((s) => Number(s.ScoreTest))
      .filter((n) => Number.isFinite(n));

    const newOverall = numericScores.length
      ? Number(
          (numericScores.reduce((a, b) => a + b, 0) / numericScores.length).toFixed(2)
        )
      : 0;

    profile.overallScore = newOverall;
    console.log("📊 New overallScore calculated:", newOverall);

    // ✅ 6) Save updated profile
    await profile.save();
    console.log("💾 Profile successfully saved to database");

    // ✅ 7) Delete related InterviewAssessment and remove relationships
    let assessmentIds = [];
    try {
      console.log("🧹 Suppression des InterviewAssessment en cours...");
      const InterviewAssessment = require("../../models/InterviewAssessmentModel");

      // Case-insensitive deletion of target skill
      const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const skillRegex = new RegExp(`^${escapeRegExp(skillToDelete)}$`, "i");

      // 7.a Find InterviewAssessment to delete (containing this skill)
      const assessmentsToDelete = await InterviewAssessment.find({
        candidateId: profile._id,
        "metadata.skill": { $regex: skillRegex },
      }).select("_id");

      assessmentIds = assessmentsToDelete.map((d) => d._id);

      if (assessmentIds.length > 0) {
        // 7.b Delete corresponding InterviewAssessment
        const delRes = await InterviewAssessment.deleteMany({ _id: { $in: assessmentIds } });
        console.log("✅ InterviewAssessment deleted:", delRes.deletedCount);

        // 7.c Remove references in the profile
        profile.interviewDetails = (profile.interviewDetails || []).filter(
          (id) => !assessmentIds.some((x) => x.toString() === id.toString())
        );
        await profile.save();
      } else {
        console.log("ℹ️ No InterviewAssessment to delete for this skill");
      }
    } catch (relErr) {
      console.warn("⚠️ Error cleaning up InterviewAssessment:", relErr.message);
    }

    // ✅ 8) Clean up references in JobAssessmentResult
    try {
      console.log("🧹 Cleaning up JobAssessmentResult...");
      const JobAssessmentResult = require("../../models/JobAssessmentResultModel");

      const res2 = await JobAssessmentResult.updateMany(
        { condidateId: profile._id },
        {
          $pull: {
            "analysis.skillAnalysis": { skillName: skillToDelete },
            "analysis.skillProgression": { skillName: skillToDelete },
          },
        }
      );

      console.log("✅ JobAssessmentResult cleanup completed:", res2.modifiedCount, "documents updated");

      // Also delete JobAssessmentResult pointing to deleted InterviewAssessment
      try {
        if (typeof assessmentIds !== "undefined" && assessmentIds.length > 0) {
          const delAss = await JobAssessmentResult.deleteMany({ interviewId: { $in: assessmentIds } });
          console.log("🗑️ JobAssessmentResult deleted (linked to deleted InterviewAssessment):", delAss.deletedCount);
        }
      } catch (innerErr) {
        console.warn("⚠️ Error deleting related JobAssessmentResult:", innerErr.message);
      }
    } catch (relErr) {
      console.warn("⚠️ Error cleaning up JobAssessmentResult:", relErr.message);
    }

    // ✅ 9) Return updated profile
    console.log("🎯 Skill deletion completed successfully for:", skillToDelete);
    return profile;

  } catch (error) {
    console.error("🚨 Error deleting skill:", error.message);
    throw error;
  }
};

// Delete a specific softSkill
// 🔹 Function to delete a soft skill from a user profile with the same logic as deleteHardSkill
module.exports.deleteSoftSkill = async (userId, softSkillToDelete) => {
  try {
    console.log("🟢 Starting soft skill deletion:", softSkillToDelete, "for user:", userId);

    // ✅ 1) Retrieve user profile
    const profile = await Profile.findOne({ userId });
    if (!profile) {
      console.error("❌ No profile found for user:", userId);
      throw new Error("Profile not found");
    }
    console.log("✅ Profile found:", profile._id);

    // ✅ 2) Verify the validity of the softSkill to delete
    if (!softSkillToDelete || typeof softSkillToDelete !== "string") {
      console.error("❌ The soft skill to delete must be a valid string");
      throw new Error("The skill to be deleted must be provided as a string");
    }

    // ✅ 3) Find the position of the softSkill in the softSkills array
    const softSkillIndex = profile.softSkills.findIndex(
      (skill) => skill.name === softSkillToDelete
    );

    if (softSkillIndex === -1) {
      console.warn(`⚠️ The soft skill "${softSkillToDelete}" does not exist in the profile`);
      throw new Error(
        `The soft skill "${softSkillToDelete}" does not exist in your profile`
      );
    }
    console.log(`🧩 Soft skill "${softSkillToDelete}" found at index ${softSkillIndex}`);

    // ✅ 4) Delete the softSkill from the array
    profile.softSkills.splice(softSkillIndex, 1);
    console.log(`🗑️ Soft skill "${softSkillToDelete}" successfully deleted from profile`);

    // ✅ 5) Save the updated profile
    await profile.save();
    console.log("💾 Profile successfully saved to database");

    // ✅ 6) Delete related InterviewAssessment and remove relationships
    let assessmentIds = [];
    try {
      console.log("🧹 Deleting InterviewAssessment...");
      const InterviewAssessment = require("../../models/InterviewAssessmentModel");

      // Case-insensitive deletion of the target soft skill
      const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const softSkillRegex = new RegExp(`^${escapeRegExp(softSkillToDelete)}$`, "i");

      // 6.a Find InterviewAssessment to delete (containing this softSkill)
      const assessmentsToDelete = await InterviewAssessment.find({
        candidateId: profile._id,
        "metadata.skill": { $regex: softSkillRegex },
      }).select("_id");

      assessmentIds = assessmentsToDelete.map((d) => d._id);

      if (assessmentIds.length > 0) {
        // 6.b Delete matching InterviewAssessment
        const delRes = await InterviewAssessment.deleteMany({ _id: { $in: assessmentIds } });
        console.log("✅ InterviewAssessment deleted:", delRes.deletedCount);

        // 6.c Remove references from profile
        profile.interviewDetails = (profile.interviewDetails || []).filter(
          (id) => !assessmentIds.some((x) => x.toString() === id.toString())
        );
        await profile.save();
      } else {
        console.log("ℹ️ No InterviewAssessment to delete for this soft skill");
      }
    } catch (relErr) {
      console.warn("⚠️ Error cleaning up InterviewAssessment:", relErr.message);
    }

    // ✅ 7) Clean up references in JobAssessmentResult
    try {
      console.log("🧹 Cleaning up JobAssessmentResult...");
      const JobAssessmentResult = require("../../models/JobAssessmentResultModel");

      const res2 = await JobAssessmentResult.updateMany(
        { condidateId: profile._id },
        {
          $pull: {
            "analysis.skillAnalysis": { skillName: softSkillToDelete },
            "analysis.skillProgression": { skillName: softSkillToDelete },
          },
        }
      );

      console.log("✅ JobAssessmentResult cleanup completed:", res2.modifiedCount, "documents updated");

      // Also delete JobAssessmentResult pointing to deleted InterviewAssessment
      try {
        if (typeof assessmentIds !== "undefined" && assessmentIds.length > 0) {
          const delAss = await JobAssessmentResult.deleteMany({ interviewId: { $in: assessmentIds } });
          console.log("🗑️ JobAssessmentResult deleted (linked to deleted InterviewAssessment):", delAss.deletedCount);
        }
      } catch (innerErr) {
        console.warn("⚠️ Error deleting related JobAssessmentResult:", innerErr.message);
      }
    } catch (relErr) {
      console.warn("⚠️ Error cleaning up JobAssessmentResult:", relErr.message);
    }

    // ✅ 8) Return updated profile
    console.log("🎯 Soft skill deletion completed successfully for:", softSkillToDelete);
    return profile;

  } catch (error) {
    console.error("🚨 Error deleting soft skill:", error.message);
    throw error;
  }
};

// services/profileService.js
module.exports.getCompanyProfileWithAssessments = async (id, jobId) => {
  try {
    const mongoose = require("mongoose");

    const safeId = Buffer.isBuffer(id)
      ? new mongoose.Types.ObjectId(id.toString("hex"))
      : new mongoose.Types.ObjectId(id);

    // ✅ Aggregation pipeline
    const pipeline = [
      // 1️⃣ Match by company (and optional job)
      {
        $match: {
          companyId: safeId,
          ...(jobId ? { jobId: new mongoose.Types.ObjectId(jobId) } : {})
        }
      },
      // 2️⃣ Group all JobAssessmentResults per candidate + job
      {
        $group: {
          _id: {
            candidateId: "$condidateId",
            jobId: "$jobId"
          },
          companyId: { $first: "$companyId" },
          steps: {
            $push: {
              interviewId: "$interviewId",
              timestamp: "$timestamp",
              assessmentType: "$assessmentType",
              numberOfQuestions: "$numberOfQuestions",
              analysis: "$analysis" // keep full analysis object
            }
          },
          latestAssessment: { $max: "$timestamp" },
          totalAssessments: { $sum: 1 },
          averageOverallScore: { $avg: "$analysis.overallScore" }
        }
      },
      // 3️⃣ Join candidate info
      {
        $lookup: {
          from: "profiles",
          localField: "_id.candidateId",
          foreignField: "_id",
          as: "candidateInfo"
        }
      },
      { $unwind: "$candidateInfo" },
      // 4️⃣ Join user info (username/email)
      {
        $lookup: {
          from: "users",
          localField: "candidateInfo.userId",
          foreignField: "_id",
          as: "userInfo"
        }
      },
      { $unwind: "$userInfo" },
      // 5️⃣ Join job info
      {
        $lookup: {
          from: "posts",
          localField: "_id.jobId",
          foreignField: "_id",
          as: "jobInfo"
        }
      },
      { $unwind: "$jobInfo" },
      // 6️⃣ Reshape output
      {
        $project: {
          _id: 0,
          candidateId: "$_id.candidateId",
          jobId: "$_id.jobId",
          companyId: 1,
          candidateInfo: {
            name: "$userInfo.username",
            email: "$userInfo.email",
            skills: "$candidateInfo.skills",
            softSkills: "$candidateInfo.softSkills"
          },
          jobInfo: {
            title: "$jobInfo.jobDetails.title",
            description: "$jobInfo.jobDetails.description"
          },
          assessmentSummary: {
            steps: "$steps",
            latestAssessment: "$latestAssessment",
            totalAssessments: "$totalAssessments",
            averageOverallScore: "$averageOverallScore"
          }
        }
      },
      // 7️⃣ Sort by latest assessment date
      {
        $sort: { "assessmentSummary.latestAssessment": -1 }
      }
    ];

    const results = await mongoose.model("JobAssessmentResult").aggregate(pipeline);

    return {
      companyId: safeId,
      totalCandidates: results.length,
      assessments: results
    };
  } catch (error) {
    console.error("Aggregation error:", error);
    throw new Error("Error during aggregation: " + error.message);
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

/**
 * Check if a user can perform an action based on plan limits
 * @param {string} userId - User ID
 * @param {string} limitType - Type of limit: 'posts', 'candidateUnlocks', 'monthlyInterviews'
 * @returns {object} - { canUse: boolean, message: string, limitData: object }
 */
module.exports.checkPlanLimit = async (userId, limitType) => {
  try {
    const profile = await Profile.findOne({ userId }).populate('planLimits');

    if (!profile) {
      throw new Error('User profile not found');
    }

    if (profile.type !== 'Company') {
      throw new Error('This action is only available for company accounts');
    }

    if (!profile.planLimits) {
      throw new Error('No plan assigned to your company');
    }

    const planLimits = profile.planLimits;
    const planUsage = profile.planUsage || {};

    let used = 0;
    let limit = 0;
    let fieldName = '';

    switch (limitType) {
      case 'posts':
        used = planUsage.postsUsed || 0;
        limit = planLimits.postsLimit || 0;
        fieldName = 'postsLimit';
        break;
      case 'monthlyInterviews':
        used = planUsage.monthlyInterviewsUsed || 0;
        limit = planLimits.monthlyInterviewLimit || 0;
        fieldName = 'monthlyInterviewLimit';
        break;
      default:
        throw new Error('Invalid limit type');
    }

    const canUse = used < limit;
    const message = canUse
      ? `You can create ${limit - used} more ${limitType}`
      : `You have reached the maximum ${limitType} (${limit}) for your plan`;

    return {
      canUse,
      message,
      limitData: {
        used,
        limit,
        remaining: Math.max(0, limit - used),
        planName: planLimits.name,
        fieldName
      }
    };
  } catch (error) {
    console.error('❌ Error checking plan limit:', error);
    throw error;
  }
};

/**
 * Increment plan usage counter
 * @param {string} userId - User ID
 * @param {string} usageType - Type of usage: 'postsUsed', 'monthlyInterviewsUsed'
 * @returns {object} - Updated profile
 */
module.exports.incrementPlanUsage = async (userId, usageType) => {
  try {
    if (!['postsUsed', 'monthlyInterviewsUsed'].includes(usageType)) {
      throw new Error('Invalid usage type');
    }

    const updateObj = {};
    updateObj[`planUsage.${usageType}`] = 1;

    const profile = await Profile.findOneAndUpdate(
      { userId },
      { $inc: updateObj },
      { new: true }
    ).populate('planLimits');

    if (!profile) {
      throw new Error('Profile not found');
    }

    console.log(`✅ [incrementPlanUsage] ${usageType} incremented. New value: ${profile.planUsage[usageType]}`);

    return profile;
  } catch (error) {
    console.error('❌ Error incrementing plan usage:', error);
    throw error;
  }
};

// ========== PAYMENT MANAGEMENT FUNCTIONS ==========

/**
 * Get all payments for a profile
 * @param {string} profileId - Profile ID
 * @returns {object} - Payments with plan and user details
 */
module.exports.getProfilePayments = async (profileId) => {
  try {
    const profile = await Profile.findById(profileId).populate({
      path: 'payments',
      populate: [
        { path: 'planId', select: 'name priceUsd postsLimit monthlyInterviewLimit' },
        { path: 'userId', select: 'email FirstName LastName' }
      ]
    });

    if (!profile) {
      const error = new Error("Profile not found");
      error.status = 404;
      throw error;
    }

    return {
      success: true,
      message: "Payments retrieved successfully",
      profileId: profile._id,
      profileType: profile.type,
      payments: profile.payments || [],
      totalPayments: (profile.payments || []).length,
      totalAmountPaid: (profile.payments || [])
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.planPrice, 0)
    };
  } catch (error) {
    console.error("Error retrieving profile payments:", error);
    throw error;
  }
};

/**
 * Get active payment for a profile (most recent completed payment)
 * @param {string} profileId - Profile ID
 * @returns {object} - Active payment details
 */
module.exports.getActiveProfilePayment = async (profileId) => {
  try {
    const profile = await Profile.findById(profileId).populate({
      path: 'payments',
      match: { status: 'completed' },
      populate: { path: 'planId', select: 'name priceUsd postsLimit monthlyInterviewLimit' },
      options: { sort: { completedAt: -1 }, limit: 1 }
    });

    if (!profile) {
      const error = new Error("Profile not found");
      error.status = 404;
      throw error;
    }

    const activePayment = profile.payments && profile.payments.length > 0 
      ? profile.payments[0] 
      : null;

    return {
      success: true,
      message: activePayment ? "Active payment found" : "No active payment found",
      profileId: profile._id,
      activePayment
    };
  } catch (error) {
    console.error("Error retrieving active profile payment:", error);
    throw error;
  }
};

/**
 * Add payment to profile payments array
 * @param {string} profileId - Profile ID
 * @param {string} paymentId - Payment ID
 * @returns {object} - Updated profile
 */
module.exports.addPaymentToProfile = async (profileId, paymentId) => {
  try {
    const profile = await Profile.findById(profileId);

    if (!profile) {
      const error = new Error("Profile not found");
      error.status = 404;
      throw error;
    }

    if (!profile.payments) {
      profile.payments = [];
    }

    // Prevent duplicate payments
    if (!profile.payments.includes(paymentId)) {
      profile.payments.push(paymentId);
      await profile.save();
      console.log(`✅ Payment ${paymentId} added to profile ${profileId}`);
    }

    return {
      success: true,
      message: "Payment added to profile",
      profileId: profile._id,
      paymentsCount: profile.payments.length
    };
  } catch (error) {
    console.error("Error adding payment to profile:", error);
    throw error;
  }
};