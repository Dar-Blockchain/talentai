const Profile = require("../models/ProfileModel");
const User = require("../models/UserModel");
const Post = require("../models/PostModel");
const Agent = require("../models/AgentModel");
const agentService = require("./AgentService");

// Créer ou mettre à jour un profil utilisateur
module.exports.createOrUpdateProfile = async (userId, profileData) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    // S'assurer que le rôle utilisateur est bien défini
    await User.findByIdAndUpdate(userId, { role: "Candidat" });

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

    const oldCompanyId = profile.companyBid.company;

    // Vérifier si la nouvelle enchère est supérieure à l'ancienne
    if (profile.companyBid.finalBid && newBid <= profile.companyBid.finalBid) {
      throw new Error("The new bid must be higher than the old bid");
    }

    // Mettre à jour le bid
    profile.companyBid.finalBid = newBid;
    profile.companyBid.company = companyId;
    profile.companyBid.post = postId;
    profile.companyBid.dateBid = new Date();
    await profile.save();

    // 🔄 Supprimer l'user de l'ancienne compagnie s'il y en avait une
    if (oldCompanyId && oldCompanyId.toString() !== companyId.toString()) {
      const oldCompanyProfile = await Profile.findOne({ userId: oldCompanyId });
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

// Supprimer un skill spécifique
module.exports.deleteHardSkill = async (userId, skillToDelete) => {
  try {
    const profile = await Profile.findOne({ userId });
    if (!profile) {
      throw new Error("Profile not found");
    }

    if (!skillToDelete || typeof skillToDelete !== "string") {
      throw new Error("The skill to be deleted must be provided as a string");
    }

    // Trouver l'index du skill à supprimer
    const skillIndex = profile.skills.findIndex(
      (skill) => skill.name === skillToDelete
    );

    if (skillIndex === -1) {
      throw new Error(
        `Le skill "${skillToDelete}" n'existe pas dans votre profil`
      );
    }

    // Supprimer le skill du tableau
    profile.skills.splice(skillIndex, 1);
    await profile.save();

    return profile;
  } catch (error) {
    console.error("Erreur lors de la suppression du skill:", error);
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

module.exports.getCompanyProfileWithAssessments = async (profileId) => {
  try {
    const profile = await Profile.findById(profileId)
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

    return profile.assessmentResults;
  } catch (error) {
    throw new Error(
      "Erreur lors de la récupération des assessments : " + error.message
    );
  }
};
