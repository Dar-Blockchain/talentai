const Profile = require("../../models/ProfileModel");
const User = require("../../models/UserModel");
const Post = require("../../models/PostModel");
const hederaService = require("../hederaService");
const AgentConfig = require("../../models/AgentConfigModel");
const { POST_STATUS } = require("../../constants/postConstants");
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
      ? await require('../../models/CompanyMembershipModel').findById(updatedUser.companyMembership).populate({ path: 'company', select: 'username email Localisation user_image createdAt updatedAt', populate: { path: 'profile' } }).select('_id role updatedAt company')
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

    // Create Hedera account if user doesn't have one
    if (!user.hederaAccountId) {
      console.log('🔧 Creating Hedera account for new company user...');
      try {
        const hederaAccount = await hederaService.createHederaAccount();

        // Update user with Hedera account info
        const updatedUser = await User.findByIdAndUpdate(
          userId,
          {
            hederaAccountId: hederaAccount.hederaAccountId,
            hederaPrivateKey: hederaAccount.hederaPrivateKey,
            hederaPublicKey: hederaAccount.hederaPublicKey
          },
          { new: true }
        );

        console.log(`✅ Hedera account created for company user: ${hederaAccount.hederaAccountId}`);
        console.log('Updated user Hedera fields:', {
          hederaAccountId: updatedUser.hederaAccountId,
          hederaPublicKey: updatedUser.hederaPublicKey,
          hasPrivateKey: !!updatedUser.hederaPrivateKey
        });
      } catch (hederaError) {
        console.error('❌ Failed to create Hedera account during company profile creation:', hederaError);
        console.error('Error details:', hederaError.message);
        // Don't fail the entire profile creation if Hedera account creation fails
        console.log('⚠️  Company profile will be created without Hedera account. Account can be created later during first payment.');
      }
    } else {
      console.log('ℹ️  User already has Hedera account:', user.hederaAccountId);
    }

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
      ? await require('../../models/CompanyMembershipModel').findById(updatedUser.companyMembership).populate({ path: 'company', select: 'username email Localisation user_image createdAt updatedAt', populate: { path: 'profile' } }).select('_id role updatedAt company')
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
    const user = await User.findById(userId).select('-hederaAccountId -hederaPrivateKey -hederaPublicKey');

    if (!user) {
      throw new Error("User not found");
    }

    const [profile, companyMembership] = await Promise.all([
      user.profile
        ? Profile.findById(user.profile)
        : null,

      user.companyMembership
        ? require('../../models/CompanyMembershipModel')
            .findById(user.companyMembership)
            .populate({
              path: 'company',
              select: 'username email Localisation user_image createdAt updatedAt',
              populate: { path: 'profile' }
            })
            .select('_id role updatedAt company')
        : null
    ]);

    return {
      user,
      profile,
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

// Delete a profile
module.exports.deleteProfile = async (userId) => {
  try {
    const profile = await Profile.findOneAndDelete({ userId });
    if (!profile) {
      throw new Error("Profile not found");
    }

    // Update user to remove profile reference
    await User.findByIdAndUpdate(userId, { $unset: { profile: 1 } });

    return { message: "Profile deleted successfully" };
  } catch (error) {
    console.error("Error deleting profile:", error);
    throw error;
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

// Gérer les soft skills
module.exports.addSoftSkills = async (userId, softSkills) => {
  try {
    const profile = await Profile.findOne({ userId });

    if (!profile) {
      throw new Error("Profil non trouvé");
    }

    if (!Array.isArray(softSkills)) {
      throw new Error(
        "Soft skills must be provided as an array"
      );
    }

    // Vérification des soft skills existants
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

// Mettre à jour le finalBid
module.exports.updateFinalBid = async (userId, newBid, companyId, postId) => {
  try {
    const profile = await Profile.findOne({ userId });
    if (!profile) {
      throw new Error("Profile not found");
    }

    // Initialiser companyBid si non défini
    if (!profile.companyBid) {
      profile.companyBid = {};
    }

    const lastCompanyId = profile.companyBid.company;

    // 🚫 Vérifier si la même company veut bider de nouveau
    if (lastCompanyId && lastCompanyId.toString() === companyId.toString()) {
      throw new Error("You cannot bid again if your company made the last bid");
    }

    // Valider et normaliser les valeurs de bid en nombres
    const currentFinalBid =
      profile.companyBid && profile.companyBid.finalBid
        ? Number(profile.companyBid.finalBid)
        : null;

    const parsedNewBid = Number(newBid);
    if (!Number.isFinite(parsedNewBid) || parsedNewBid <= 0) {
      throw new Error("Invalid new bid. The bid must be a positive number.");
    }

    // --- Vérifier le plafond de dépense (bidBudgetMax) si configuré pour cet agent ---
    try {
      const agentConfig = await AgentConfig.findOne({ agentId: companyId });
      const bidBudgetMax = agentConfig?.bidBudgetMax ?? null;

      if (bidBudgetMax !== null && Number.isFinite(Number(bidBudgetMax))) {
        // Calculer la somme des bids actuellement attribués à cette company/agent
        const bids = await Profile.find({ 'companyBid.company': companyId }).select('companyBid.finalBid');
        const currentSpent = bids.reduce((sum, p) => {
          const v = p?.companyBid?.finalBid ? Number(p.companyBid.finalBid) : 0;
          return sum + (Number.isFinite(v) ? v : 0);
        }, 0);

        if (currentSpent + parsedNewBid > Number(bidBudgetMax)) {
          throw new Error(
            `Budget maximum atteint ou dépassé : plafond=${bidBudgetMax}, dépensé=${currentSpent}. Le nouveau bid de ${parsedNewBid} le dépasserait.`
          );
        }
      }
    } catch (e) {
      // Ne pas bloquer le flow si la vérification échoue pour une raison non critique
      if (e.message && e.message.includes('Budget maximum')) {
        throw e; // remonter le message explicite au contrôleur
      }
      console.warn('⚠️ Error checking bidBudgetMax:', e.message);
    }

    // Check if new bid is strictly greater than old (if present)
    if (currentFinalBid !== null && parsedNewBid <= currentFinalBid) {
      throw new Error(
        `The new bid must be strictly greater than current bid (${currentFinalBid}). Received: ${parsedNewBid}`
      );
    }

    // ✅ Update the bid
    let finalBid = parsedNewBid;

    // ✅ Update the bid
    profile.companyBid.finalBid = finalBid;
    profile.companyBid.company = companyId;
    profile.companyBid.post = postId;
    profile.companyBid.dateBid = new Date();
    await profile.save();

    // 🔄 Remove user from old company if there was one
    if (lastCompanyId && lastCompanyId.toString() !== companyId.toString()) {
      const oldCompanyProfile = await Profile.findOne({
        userId: lastCompanyId,
      });
      if (oldCompanyProfile && oldCompanyProfile.type === "Company") {
        oldCompanyProfile.usersBidedByCompany =
          oldCompanyProfile.usersBidedByCompany.filter(
            (id) => id.toString() !== userId.toString()
          );
        await oldCompanyProfile.save();
      }
    }

    // ➕ Ajouter l'user dans la nouvelle compagnie
    const newCompanyProfile = await Profile.findOne({ userId: companyId });
    if (newCompanyProfile && newCompanyProfile.type === "Company") {
      if (!newCompanyProfile.usersBidedByCompany.includes(userId)) {
        newCompanyProfile.usersBidedByCompany.push(userId);
        await newCompanyProfile.save();
      }
    }

    return profile;
  } catch (error) {
    console.error("Error updating finalBid:", error);
    throw error;
  }
};

// Supprimer un skill spécifique (avec nettoyage des relations et implications)
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

        // 7.c Retirer les références dans le profil
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

// Retrieve company bid information

module.exports.getCompanyBids = async (companyId) => {
  try {
    // Retrieve the company profile
    const companyProfile = await Profile.findOne({
      userId: companyId,
      type: "Company",
    });

    if (!companyProfile) {
      throw new Error("Company profile not found");
    }

    // Retrieve the candidates bidded by the company
    const candidates = await Profile.find({
      userId: { $in: companyProfile.usersBidedByCompany },
    })
      .populate({
        path: "userId",
        select: "username email",
      })
      .populate({
        path: "companyBid.post",
        select: "jobDetails.title status createdAt",
      });

    // Build enriched result
    const enrichedCandidates = candidates.map((candidate) => ({
      _id: candidate._id,
      userInfo: candidate.userId,
      finalBid: candidate.companyBid?.finalBid || null,
      dateBid: candidate.companyBid?.dateBid || null,
      overallScore: candidate.overallScore,
      skills: candidate.skills,
      softSkills: candidate.softSkills,
      post: candidate.companyBid?.post || null,
    }));

    return {
      companyName: companyProfile.companyDetails?.name || "Unknown Company",
      bidedCandidates: enrichedCandidates,
    };
  } catch (error) {
    console.error("Error getting bidded candidates:", error);
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