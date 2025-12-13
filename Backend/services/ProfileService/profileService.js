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
      profile.firstName = profileData.firstName || profileData.FirstName || profile.firstName;
      profile.lastName = profileData.lastName || profileData.LastName || profile.lastName;
      profile.age = profileData.age || profile.age;
      profile.gender = profileData.gender || profile.gender;
      profile.educationLevel = profileData.educationLevel || profile.educationLevel;
      profile.country = profileData.country || profile.country;
      profile.language = profileData.language || profile.language;
      profile.timeZone = profileData.timeZone || profile.timeZone;
      
      // Update salary expectations
      if (profileData.expectedSalary) {
        profile.expectedSalary = {
          min: profileData.expectedSalary.min,
          max: profileData.expectedSalary.max,
          currency: profileData.expectedSalary.currency || "EUR"
        };
      }
      
      profile.preferredContractType = profileData.preferredContractType || profile.preferredContractType;
      profile.workModePreference = profileData.workModePreference || profile.workModePreference;
      
      // Update overall score if provided
      if (typeof profileData.overallScore === "number") {
        profile.overallScore = profileData.overallScore;
      }

      // Merge skills
      if (Array.isArray(profileData.skills)) {
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
    }

    // Update profile reference in User
    await User.findByIdAndUpdate(userId, { profile: profile._id });

    return profile;
  } catch (error) {
    console.error("Error creating/updating candidate profile:", error);
    throw error;
  }
};

// Create or update a Company profile (optimized)
exports.createOrUpdateCompanyProfile = async (userId, profileData) => {
  try {
    if (!profileData || !profileData.name) {
      throw new Error("Company name is required.");
    }

    // Récupérer l'utilisateur une seule fois
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found.");

    // Préparer mises à jour utilisateur minimales
    const userUpdates = {};
    if (user.role !== "Company") userUpdates.role = "Company";

    // Tenter la création d'un compte Hedera uniquement si nécessaire (non-blocking)
    if (!user.hederaAccountId) {
      try {
        if (hederaService && typeof hederaService.createAccount === "function") {
          const created = await hederaService.createAccount(userId).catch(() => null);
          if (created && created.accountId) userUpdates.hederaAccountId = created.accountId;
        }
      } catch (e) {
        console.warn("Warning: Hedera account creation failed (non-blocking)", e.message || e);
      }
    }

    // Préparer l'objet à persister (préserver les autres champs du document)
    const companyDetails = {
      email: profileData.email,
      name: profileData.name,
      industry: profileData.industry,
      size: profileData.size,
      location: profileData.location,
      employmentType: profileData.employmentType,
    };

    const setObj = {
      type: "Company",
      companyDetails,
      requiredSkills: profileData.requiredSkills || [],
      requiredExperienceLevel: profileData.requiredExperienceLevel || "Entry Level",
    };

    // Upsert atomique: crée ou met à jour en une seule opération
    const profile = await Profile.findOneAndUpdate(
      { userId },
      { $set: setObj, $setOnInsert: { userId } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // Mettre à jour l'utilisateur seulement si nécessaire
    if (Object.keys(userUpdates).length > 0 || !user.profile || user.profile.toString() !== profile._id.toString()) {
      const finalUserUpdates = { ...userUpdates, profile: profile._id };
      await User.findByIdAndUpdate(userId, finalUserUpdates);
    }

    return profile;
  } catch (error) {
    console.error("Error creating/updating company profile:", error.message || error);
    throw error;
  }
};


exports.updateUserImage = async (userId, newFilename) => {
  if (!userId) {
    throw new Error("ID utilisateur manquant.");
  }
  if (!newFilename) {
    throw new Error("Nom de fichier image manquant.");
  }
console.log("Updating profile image for userId:", userId.toString(), "with new filename:", newFilename);
  // 1️⃣ Récupérer l'utilisateur existant pour connaître l'ancienne image
const existingUser = await Profile.findOne({ userId: userId.toString() });
  if (!existingUser) {
    throw new Error("Profile non trouvé.");
  }

  const oldImage = existingUser.user_image;
  console.log("Old image filename:", oldImage);
  // 2️⃣ Mettre à jour l'image dans la base
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
          if (unlinkErr) console.error("Erreur suppression ancienne image:", unlinkErr);
          else console.log("Ancienne image supprimée :", oldImage);
        });
      }
    });
  }

  return updatedUser;
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

    // Valider et normaliser les valeurs de bid en nombres
    const currentFinalBid =
      profile.companyBid && profile.companyBid.finalBid
        ? Number(profile.companyBid.finalBid)
        : null;

    const parsedNewBid = Number(newBid);
    if (!Number.isFinite(parsedNewBid) || parsedNewBid <= 0) {
      throw new Error("Nouveau bid invalide. Le bid doit être un nombre positif.");
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
      console.warn('⚠️ Erreur lors de la vérification du bidBudgetMax :', e.message);
    }

    // Vérifier si le nouveau bid est strictement supérieur à l'ancien (si présent)
    if (currentFinalBid !== null && parsedNewBid <= currentFinalBid) {
      throw new Error(
        `Le nouveau bid doit être strictement supérieur au bid actuel (${currentFinalBid}). Reçu: ${parsedNewBid}`
      );
    }

    // ✅ Mettre à jour le bid
    let finalBid = parsedNewBid;

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

    // ✅ 7) Supprimer les InterviewAssessment liés à ce skill et retirer les relations
    let assessmentIds = [];
    try {
      console.log("🧹 Suppression des InterviewAssessment en cours...");
      const InterviewAssessment = require("../../models/InterviewAssessmentModel");

      // Suppression insensible à la casse du skill visé
      const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const skillRegex = new RegExp(`^${escapeRegExp(skillToDelete)}$`, "i");

      // 7.a Trouver les InterviewAssessment à supprimer (qui contiennent ce skill)
      const assessmentsToDelete = await InterviewAssessment.find({
        candidateId: profile._id,
        "metadata.skill": { $regex: skillRegex },
      }).select("_id");

      assessmentIds = assessmentsToDelete.map((d) => d._id);

      if (assessmentIds.length > 0) {
        // 7.b Supprimer les InterviewAssessment correspondants
        const delRes = await InterviewAssessment.deleteMany({ _id: { $in: assessmentIds } });
        console.log("✅ InterviewAssessment supprimés:", delRes.deletedCount);

        // 7.c Retirer les références dans le profil
        profile.interviewDetails = (profile.interviewDetails || []).filter(
          (id) => !assessmentIds.some((x) => x.toString() === id.toString())
        );
        await profile.save();
      } else {
        console.log("ℹ️ Aucun InterviewAssessment à supprimer pour ce skill");
      }
    } catch (relErr) {
      console.warn("⚠️ Erreur lors du nettoyage des InterviewAssessment:", relErr.message);
    }

    // ✅ 8) Nettoyer les références dans JobAssessmentResult
    try {
      console.log("🧹 Nettoyage des JobAssessmentResult en cours...");
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

      console.log("✅ Nettoyage des JobAssessmentResult terminé:", res2.modifiedCount, "documents mis à jour");

      // Supprimer aussi les JobAssessmentResult qui pointent vers des InterviewAssessment supprimés
      try {
        if (typeof assessmentIds !== "undefined" && assessmentIds.length > 0) {
          const delAss = await JobAssessmentResult.deleteMany({ interviewId: { $in: assessmentIds } });
          console.log("🗑️ JobAssessmentResult supprimés (liés aux InterviewAssessment supprimés):", delAss.deletedCount);
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
// 🔹 Fonction pour supprimer un soft skill d'un profil utilisateur avec la même logique que deleteHardSkill
module.exports.deleteSoftSkill = async (userId, softSkillToDelete) => {
  try {
    console.log("🟢 Début de la suppression du softSkill:", softSkillToDelete, "pour l'utilisateur:", userId);

    // ✅ 1) Récupérer le profil du user
    const profile = await Profile.findOne({ userId });
    if (!profile) {
      console.error("❌ Aucun profil trouvé pour l'utilisateur:", userId);
      throw new Error("Profile not found");
    }
    console.log("✅ Profil trouvé:", profile._id);

    // ✅ 2) Vérifier la validité du softSkill à supprimer
    if (!softSkillToDelete || typeof softSkillToDelete !== "string") {
      console.error("❌ Le softSkill à supprimer doit être une chaîne de caractères valide");
      throw new Error("The skill to be deleted must be provided as a string");
    }

    // ✅ 3) Chercher la position du softSkill dans le tableau des softSkills
    const softSkillIndex = profile.softSkills.findIndex(
      (skill) => skill.name === softSkillToDelete
    );

    if (softSkillIndex === -1) {
      console.warn(`⚠️ Le softSkill "${softSkillToDelete}" n'existe pas dans le profil`);
      throw new Error(
        `Le softSkill "${softSkillToDelete}" n'existe pas dans votre profil`
      );
    }
    console.log(`🧩 SoftSkill "${softSkillToDelete}" trouvé à l'index ${softSkillIndex}`);

    // ✅ 4) Supprimer le softSkill du tableau
    profile.softSkills.splice(softSkillIndex, 1);
    console.log(`🗑️ SoftSkill "${softSkillToDelete}" supprimé avec succès du profil`);

    // ✅ 5) Sauvegarder le profil mis à jour
    await profile.save();
    console.log("💾 Profil sauvegardé avec succès dans la base de données");

    // ✅ 6) Supprimer les InterviewAssessment liés à ce softSkill et retirer les relations
    let assessmentIds = [];
    try {
      console.log("🧹 Suppression des InterviewAssessment en cours...");
      const InterviewAssessment = require("../../models/InterviewAssessmentModel");

      // Suppression insensible à la casse du softSkill visé
      const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const softSkillRegex = new RegExp(`^${escapeRegExp(softSkillToDelete)}$`, "i");

      // 6.a Trouver les InterviewAssessment à supprimer (qui contiennent ce softSkill)
      const assessmentsToDelete = await InterviewAssessment.find({
        candidateId: profile._id,
        "metadata.skill": { $regex: softSkillRegex },
      }).select("_id");

      assessmentIds = assessmentsToDelete.map((d) => d._id);

      if (assessmentIds.length > 0) {
        // 6.b Supprimer les InterviewAssessment correspondants
        const delRes = await InterviewAssessment.deleteMany({ _id: { $in: assessmentIds } });
        console.log("✅ InterviewAssessment supprimés:", delRes.deletedCount);

        // 6.c Retirer les références dans le profil
        profile.interviewDetails = (profile.interviewDetails || []).filter(
          (id) => !assessmentIds.some((x) => x.toString() === id.toString())
        );
        await profile.save();
      } else {
        console.log("ℹ️ Aucun InterviewAssessment à supprimer pour ce softSkill");
      }
    } catch (relErr) {
      console.warn("⚠️ Erreur lors du nettoyage des InterviewAssessment:", relErr.message);
    }

    // ✅ 7) Nettoyer les références dans JobAssessmentResult
    try {
      console.log("🧹 Nettoyage des JobAssessmentResult en cours...");
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

      console.log("✅ Nettoyage des JobAssessmentResult terminé:", res2.modifiedCount, "documents mis à jour");

      // Supprimer aussi les JobAssessmentResult qui pointent vers des InterviewAssessment supprimés
      try {
        if (typeof assessmentIds !== "undefined" && assessmentIds.length > 0) {
          const delAss = await JobAssessmentResult.deleteMany({ interviewId: { $in: assessmentIds } });
          console.log("🗑️ JobAssessmentResult supprimés (liés aux InterviewAssessment supprimés):", delAss.deletedCount);
        }
      } catch (innerErr) {
        console.warn("⚠️ Erreur lors de la suppression des JobAssessmentResult liés:", innerErr.message);
      }
    } catch (relErr) {
      console.warn("⚠️ Erreur lors du nettoyage des JobAssessmentResult:", relErr.message);
    }

    // ✅ 8) Retourner le profil mis à jour
    console.log("🎯 Suppression du softSkill terminée avec succès pour:", softSkillToDelete);
    return profile;

  } catch (error) {
    console.error("🚨 Erreur lors de la suppression du softSkill:", error.message);
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
    throw new Error("Erreur lors de l'agrégation: " + error.message);
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