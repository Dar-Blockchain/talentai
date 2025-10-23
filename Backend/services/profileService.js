const Profile = require("../models/ProfileModel");
const User = require("../models/UserModel");
const Post = require("../models/PostModel");
const Agent = require("../models/AgentModel");
const agentService = require("./AgentService");
const hederaService = require("./hederaService");
const { POST_STATUS } = require("../constants/postConstants");

// Créer ou mettre à jour un profil utilisateur
module.exports.createOrUpdateProfile = async (userId, profileData) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    // S'assurer que le rôle utilisateur est bien défini
    await User.findByIdAndUpdate(userId, {
      FirstName: profileData.FirstName,
      LastName: profileData.LastName,
      role: "Candidat",
    });

    // Recherche profil existant
    let profile = await Profile.findOne({ userId });

    if (!profile) {
      // Créer un nouveau profil s'il n'existe pas
      profile = await Profile.create({
        userId,
        type: profileData.type || "Candidate",
        skills: profileData.skills || [],
        overallScore: profileData.overallScore || 0,
      });

      if (
        profileData.skills.length === 1 &&
        typeof profileData.skills[0]?.skill === "string"
      ) {
        console.log("heyaa: ", profile);
        profile.skills = [];
        await profile.save();
        console.log("heybb: ", profile);
      }
    } else {
      // Mise à jour overallScore si fourni
      if (typeof profileData.overallScore === "number") {
        profile.overallScore = profileData.overallScore;
      }

      // Mise à jour ou ajout des skills
      if (Array.isArray(profileData.skills)) {
        profileData.skills.forEach((newSkill) => {
          const existingSkill = profile.skills.find(
            (skill) => skill.name === newSkill.name
          );
          if (existingSkill) {
            existingSkill.proficiencyLevel = newSkill.proficiencyLevel;
            existingSkill.experienceLevel = newSkill.experienceLevel;

            // ✅ Ajoute explicitement la mise à jour du ScoreTest
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
          console.log("hey11: ", profile);
          profile.skills = [];
          await profile.save();
          console.log("hey22: ", profile);
        }
      }

      // Mise à jour du type de profil si fourni
      profile.type = profileData.type || profile.type;

      await profile.save();
    }

    // Mise à jour de la référence du profil dans User
    await User.findByIdAndUpdate(userId, { profile: profile._id });

    return profile;
  } catch (error) {
    console.error("Erreur lors de la création/mise à jour du profil:", error);
    throw error;
  }
};

// Create or update a Company profile
exports.createOrUpdateCompanyProfile = async (userId, profileData) => {
  try {
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

    const profileDataToSave = {
      userId,
      type: "Company",
      companyDetails: {
        name: profileData.name,
        industry: profileData.industry,
        size: profileData.size,
        location: profileData.location,
      },
      requiredSkills: profileData.requiredSkills || [],
      requiredExperienceLevel:
        profileData.requiredExperienceLevel || "Entry Level",
    };

    if (profile) {
      // Update existing profile
      profile.type = "Company";
      profile.companyDetails = profileDataToSave.companyDetails;
      profile.requiredSkills = profileDataToSave.requiredSkills;
      profile.requiredExperienceLevel =
        profileDataToSave.requiredExperienceLevel;
      await profile.save();
    } else {
      // Create new profile
      profile = await Profile.create(profileDataToSave);
    }

    // Update the user's profile reference
    await User.findByIdAndUpdate(userId, { profile: profile._id });

    return profile;
  } catch (error) {
    console.error("Error creating/updating company profile:", error.message);
    throw error;
  }
};

// Récupérer un profil par ID utilisateur
// services/profileService.js
module.exports.getProfileByUserId = async (userId) => {
  try {
    const profile = await Profile.findOne({ userId }).populate("userId");

    if (!profile) {
      // Aucun profil trouvé
      return { message: "Aucun profil trouvé pour cet utilisateur." };
    }

    return profile;
  } catch (error) {
    console.error("Erreur lors de la récupération du profil :", error);
    throw new Error("Impossible de récupérer le profil."); // message plus générique
  }
};

module.exports.getProfileByPostId = async (postId) => {
  try {
    const post = await Post.findOne({ _id: postId }).populate({
      path: "user",
      populate: { path: "profile" },
    });

    if (!post || !post.user || !post.user.profile) {
      return { message: "Aucun profil trouvé pour cet utilisateur." };
    }

    return post.user.profile;
  } catch (error) {
    console.error("Erreur lors de la récupération du profil :", error);
    throw new Error("Impossible de récupérer le profil."); // Message plus générique
  }
};

// Récupérer tous les profils
module.exports.getAllProfiles = async () => {
  try {
    const profiles = await Profile.find().populate("userId", "username email");
    return profiles;
  } catch (error) {
    console.error("Erreur lors de la récupération des profils:", error);
    throw error;
  }
};

// Supprimer un profil
module.exports.deleteProfile = async (userId) => {
  try {
    const profile = await Profile.findOneAndDelete({ userId });
    if (!profile) {
      throw new Error("Profil non trouvé");
    }

    // Mettre à jour l'utilisateur pour supprimer la référence au profil
    await User.findByIdAndUpdate(userId, { $unset: { profile: 1 } });

    return { message: "Profil supprimé avec succès" };
  } catch (error) {
    console.error("Erreur lors de la suppression du profil:", error);
    throw error;
  }
};

// Rechercher des profils par compétences
module.exports.searchProfilesBySkills = async (skills) => {
  try {
    const profiles = await Profile.find({
      "skills.name": { $in: skills },
    }).populate("userId", "username email");
    return profiles;
  } catch (error) {
    console.error("Erreur lors de la recherche des profils:", error);
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
        "Les soft skills doivent être fournis sous forme de tableau"
      );
    }

    // Vérification des soft skills existants
    const existingSoftSkills = profile.softSkills.map((skill) =>
      skill.name.toLowerCase()
    );
    const newSoftSkills = [];
    const duplicateSoftSkills = [];

    // Filtrer les compétences existantes et nouvelles
    softSkills.forEach((skill) => {
      // Normaliser en minuscules pour éviter les doublons insensibles à la casse
      const skillName = skill.name.toLowerCase();

      if (existingSoftSkills.includes(skillName)) {
        duplicateSoftSkills.push(skill.name);
      } else {
        newSoftSkills.push(skill);
      }
    });

    // Si nous avons de nouvelles compétences, les ajouter
    if (newSoftSkills.length > 0) {
      // Ajouter les nouvelles soft skills en préservant l'unicité
      profile.softSkills = [...profile.softSkills, ...newSoftSkills];
      await profile.save(); // Sauvegarder les modifications dans la base de données
    }

    // Retourner un message approprié
    return {
      profile,
      message:
        newSoftSkills.length > 0
          ? "Soft skills ajoutés avec succès."
          : "Aucune nouvelle compétence à ajouter.",
      duplicateSoftSkills, // Liste des doublons trouvés
    };
  } catch (error) {
    console.error("Erreur lors de l'ajout des soft skills:", error);
    throw error; // Lancer l'erreur pour être gérée par le contrôleur
  }
};

module.exports.getSoftSkills = async (userId) => {
  try {
    const profile = await Profile.findOne({ userId });
    if (!profile) {
      throw new Error("Profil non trouvé");
    }
    return profile.softSkills || [];
  } catch (error) {
    console.error("Erreur lors de la récupération des soft skills:", error);
    throw error;
  }
};

module.exports.updateSoftSkills = async (userId, softSkills) => {
  try {
    const profile = await Profile.findOne({ userId });
    if (!profile) {
      throw new Error("Profil non trouvé");
    }

    if (!Array.isArray(softSkills)) {
      throw new Error(
        "Les soft skills doivent être fournis sous forme de tableau"
      );
    }

    profile.softSkills = softSkills;
    await profile.save();
    return profile;
  } catch (error) {
    console.error("Erreur lors de la mise à jour des soft skills:", error);
    throw error;
  }
};

module.exports.deleteSoftSkills = async (userId, softSkillsToDelete) => {
  try {
    const profile = await Profile.findOne({ userId });
    if (!profile) {
      throw new Error("Profil non trouvé");
    }

    if (!Array.isArray(softSkillsToDelete)) {
      throw new Error(
        "Les soft skills à supprimer doivent être fournis sous forme de tableau"
      );
    }

    profile.softSkills = profile.softSkills.filter(
      (skill) => !softSkillsToDelete.includes(skill)
    );
    await profile.save();
    return profile;
  } catch (error) {
    console.error("Erreur lors de la suppression des soft skills:", error);
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

    // Si un bid existe déjà → on additionne
    let finalBid;
    if (profile.companyBid.finalBid) {
      finalBid = profile.companyBid.finalBid + newBid;
    } else {
      finalBid = newBid;
    }

    // ✅ Mettre à jour le bid
    profile.companyBid.finalBid = finalBid;
    profile.companyBid.company = companyId;
    profile.companyBid.post = postId;
    profile.companyBid.dateBid = new Date();
    await profile.save();

    // 🔄 Supprimer l'user de l'ancienne compagnie s'il y en avait une
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
    console.log("🟢 Début de la suppression du skill:", skillToDelete, "pour l'utilisateur:", userId);

    // ✅ 1) Récupérer le profil du user
    const profile = await Profile.findOne({ userId });
    if (!profile) {
      console.error("❌ Aucun profil trouvé pour l'utilisateur:", userId);
      throw new Error("Profile not found");
    }
    console.log("✅ Profil trouvé:", profile._id);

    // ✅ 2) Vérifier la validité du skill à supprimer
    if (!skillToDelete || typeof skillToDelete !== "string") {
      console.error("❌ Le skill à supprimer doit être une chaîne de caractères valide");
      throw new Error("The skill to be deleted must be provided as a string");
    }

    // ✅ 3) Chercher la position du skill dans le tableau des skills
    const skillIndex = profile.skills.findIndex(
      (skill) => skill.name === skillToDelete
    );

    if (skillIndex === -1) {
      console.warn(`⚠️ Le skill "${skillToDelete}" n'existe pas dans le profil`);
      throw new Error(`Le skill "${skillToDelete}" n'existe pas dans votre profil`);
    }
    console.log(`🧩 Skill "${skillToDelete}" trouvé à l'index ${skillIndex}`);

    // ✅ 4) Supprimer la compétence du tableau
    profile.skills.splice(skillIndex, 1);
    console.log(`🗑️ Skill "${skillToDelete}" supprimé avec succès du profil`);

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
    console.log("📊 Nouveau overallScore calculé:", newOverall);

    // ✅ 6) Sauvegarder le profil mis à jour
    await profile.save();
    console.log("💾 Profil sauvegardé avec succès dans la base de données");

    // ✅ 7) Supprimer les InterviewDetails liés à ce skill et retirer les relations
    try {
      console.log("🧹 Suppression des InterviewDetails en cours...");
      const InterviewDetails = require("../models/InterviewDetailsModel");

       // Suppression insensible à la casse du skill visé dans les tableaux skillDetails
       const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
       const skillRegex = new RegExp(`^${escapeRegExp(skillToDelete)}$`, "i");

      // 7.a Trouver les InterviewDetails à supprimer (qui contiennent ce skill)
      const detailsToDelete = await InterviewDetails.find({
        candidate: profile._id,
        "skillDetails.name": { $regex: skillRegex },
      }).select("_id");

      const detailsIds = detailsToDelete.map((d) => d._id);

      if (detailsIds.length > 0) {
        // 7.b Supprimer les InterviewDetails correspondants
        const delRes = await InterviewDetails.deleteMany({ _id: { $in: detailsIds } });
        console.log("✅ InterviewDetails supprimés:", delRes.deletedCount);

        // 7.c Retirer les références dans le profil
        profile.interviewDetails = (profile.interviewDetails || []).filter(
          (id) => !detailsIds.some((x) => x.toString() === id.toString())
        );
        await profile.save();
      } else {
        console.log("ℹ️ Aucun InterviewDetails à supprimer pour ce skill");
      }
    } catch (relErr) {
      console.warn("⚠️ Erreur lors du nettoyage des InterviewDetails:", relErr.message);
    }

    // ✅ 8) Nettoyer les références dans JobAssessmentResult
    try {
      console.log("🧹 Nettoyage des JobAssessmentResult en cours...");
      const JobAssessmentResult = require("../models/JobAssessmentResultModel");

      const res2 = await JobAssessmentResult.updateMany(
        { condidateId: profile._id },
        {
          $pull: {
            "analysis.skillAnalysis": { skillName: skillToDelete },
            "analysis.skillProgression": { skillName: skillToDelete },
          },
        }
      );

      console.log("✅ Nettoyage des JobAssessmentResult terminé:", res2.modifiedCount, "documents mis à jour");

      // Supprimer aussi les JobAssessmentResult qui pointent vers des InterviewDetails supprimés
      try {
        if (typeof detailsIds !== "undefined" && detailsIds.length > 0) {
          const delAss = await JobAssessmentResult.deleteMany({ interviewId: { $in: detailsIds } });
          console.log("🗑️ JobAssessmentResult supprimés (liés aux InterviewDetails supprimés):", delAss.deletedCount);
        }
      } catch (innerErr) {
        console.warn("⚠️ Erreur lors de la suppression des JobAssessmentResult liés:", innerErr.message);
      }
    } catch (relErr) {
      console.warn("⚠️ Erreur lors du nettoyage des JobAssessmentResult:", relErr.message);
    }

    // ✅ 9) Retourner le profil mis à jour
    console.log("🎯 Suppression du skill terminée avec succès pour:", skillToDelete);
    return profile;

  } catch (error) {
    console.error("🚨 Erreur lors de la suppression du skill:", error.message);
    throw error;
  }
};



// Supprimer un softSkill spécifique
module.exports.deleteSoftSkill = async (userId, softSkillToDelete) => {
  try {
    const profile = await Profile.findOne({ userId });
    if (!profile) {
      throw new Error("Profile not found");
    }

    if (!softSkillToDelete || typeof softSkillToDelete !== "string") {
      throw new Error("The skill to be deleted must be provided as a string");
    }

    // Trouver l'index du softSkill à supprimer
    const softSkillIndex = profile.softSkills.findIndex(
      (skill) => skill.name === softSkillToDelete
    );

    if (softSkillIndex === -1) {
      throw new Error(
        `Le softSkill "${softSkillToDelete}" n'existe pas dans votre profil`
      );
    }

    // Supprimer le softSkill du tableau
    profile.softSkills.splice(softSkillIndex, 1);
    await profile.save();

    return profile;
  } catch (error) {
    console.error("Erreur lors de la suppression du softSkill:", error);
    throw error;
  }
};

// Récupérer les informations du companyBid

module.exports.getCompanyBids = async (companyId) => {
  try {
    // Récupérer le profil de la compagnie
    const companyProfile = await Profile.findOne({
      userId: companyId,
      type: "Company",
    });

    if (!companyProfile) {
      throw new Error("Company profile not found");
    }

    // Récupérer les candidats biddés
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

    // Construction du résultat enrichi
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
    console.error("Error getting bided candidates:", error);
    throw error;
  }
};

module.exports.getCompanyProfileWithAssessments = async (id, jobId) => {
  try {
    const mongoose = require("mongoose");
    // Ensure id is a string or ObjectId, not Buffer
    const safeId = Buffer.isBuffer(id)
      ? new mongoose.Types.ObjectId(id.toString("hex"))
      : id;

    const profile = await Profile.findById(safeId)
      .where("type")
      .equals("Company")
      .populate({
        path: "assessmentResults",
        populate: [
          {
            path: "condidateId",
            model: "Profile",
            populate: {
              path: "userId",
              model: "User",
            },
          },
          { path: "jobId", model: "Post" },
        ],
      });

    if (!profile) {
      throw new Error("Profil introuvable ou non une entreprise.");
    }

    const assessmentResults = jobId
      ? profile.assessmentResults.filter(
          (result) => result.jobId._id?.toString() === jobId
        )
      : profile.assessmentResults;

    return assessmentResults;
  } catch (error) {
    throw new Error(
      "Erreur lors de la récupération des assessments : " + error.message
    );
  }
};

exports.getTotalCompanies = async () => {
  return await Profile.countDocuments({ type: "Company" });
};

exports.getCompaniesWithActivePosts = async () => {
  return await Post.aggregate([
    { $match: { status: POST_STATUS.OPEN } },
    {
      $group: {
        _id: "$user",
        lastPostDate: { $max: "$createdAt" },
        postCount: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $lookup: {
        from: "profiles",
        localField: "_id",
        foreignField: "userId",
        as: "profile",
      },
    },
    { $unwind: { path: "$profile", preserveNullAndEmptyArrays: true } },
    { $match: { "profile.type": "Company" } },
    {
      $project: {
        _id: 0,
        userId: "$_id",
        companyName: "$profile.companyDetails.name",
        industry: "$profile.companyDetails.industry",
        email: "$user.email",
        lastPostDate: 1,
        postCount: 1,
      },
    },
    { $sort: { lastPostDate: -1 } },
  ]);
};

exports.getTopHiringCompanies = async () => {
  return await Post.aggregate([
    { $match: { status: POST_STATUS.CLOSED } },
    { $group: { _id: "$user", closedPostCount: { $sum: 1 } } },
    { $sort: { closedPostCount: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "profiles",
        localField: "_id",
        foreignField: "userId",
        as: "companyProfile",
      },
    },
    { $unwind: "$companyProfile" },
    {
      $project: {
        _id: 1,
        companyName: "$companyProfile.companyDetails.name",
        closedPostCount: 1,
      },
    },
  ]);
};

exports.getRecentActiveCompanies = async () => {
  return await Post.aggregate([
    { $sort: { createdAt: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: "profiles",
        localField: "user",
        foreignField: "userId",
        as: "profile",
      },
    },
    { $unwind: "$profile" },
    { $match: { "profile.type": "Company" } },
    {
      $group: {
        _id: "$user",
        lastPostDate: { $first: "$createdAt" },
        companyName: { $first: "$profile.companyDetails.name" },
      },
    },
    { $sort: { lastPostDate: -1 } },
  ]);
};

exports.getTopIndustries = async () => {
  return await Profile.aggregate([
    { $match: { type: "Company", "companyDetails.industry": { $ne: null } } },
    {
      $group: {
        _id: "$companyDetails.industry",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ]);
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