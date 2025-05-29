const profileService = require("../services/profileService");
const Agent = require("../models/AgentModel");
const agentService = require("../services/AgentService");

// Créer ou mettre à jour un profil
module.exports.createOrUpdateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const profileData = req.body;

    // Valider les données requises
    if (!profileData.type) {
      return res.status(400).json({ message: "Le type de profil est requis" });
    }

    // Utiliser le service pour créer ou mettre à jour le profil
    const profile = await profileService.createOrUpdateProfile(
      userId,
      profileData
    );

    res.status(200).json({
      message: "Profil créé/mis à jour avec succès",
      profile,
    });
  } catch (error) {
    console.error("Erreur lors de la création/mise à jour du profil:", error);
    res
      .status(500)
      .json({
        message:
          error.message || "Erreur lors de la création/mise à jour du profil",
      });
  }
};

// Créer ou mettre à jour un profil
module.exports.createOrUpdateCompanyProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const profileData = req.body;
    console.log(profileData);
    if (!profileData.name) {
      return res.status(400).json({ message: "Company name is required" });
    }

    // Remove agent creation and update profile creation
    const profile = await profileService.createOrUpdateCompanyProfile(
      userId,
      profileData
    );
    res.status(200).json({
      message: "Company profile created/updated successfully",
      profile,
    });
  } catch (error) {
    console.error("Error creating/updating company profile:", error);
    res
      .status(500)
      .json({
        message: error.message || "Error creating/updating company profile",
      });
  }
};

// Récupérer son propre profil
// controllers/profileController.js
module.exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const result = await profileService.getProfileByUserId(userId);

    // Si result contient la clé message, alors aucun profil
    if (result.message) {
      return res.status(200).json({ message: result.message });
    }

    // Profil trouvé
    return res.status(200).json(result);
  } catch (error) {
    console.error("Erreur lors de la récupération du profil :", error);
    return res.status(500).json({
      message:
        error.message || "Erreur interne lors de la récupération du profil.",
    });
  }
};

// Récupérer un profil par ID
module.exports.getProfileById = async (req, res) => {
  try {
    const { userId } = req.params;

    // Utiliser le service pour récupérer le profil
    const profile = await profileService.getProfileByUserId(userId);

    res.status(200).json(profile);
  } catch (error) {
    console.error("Erreur lors de la récupération du profil:", error);
    res
      .status(500)
      .json({
        message: error.message || "Erreur lors de la récupération du profil",
      });
  }
};

// Récupérer tous les profils
module.exports.getAllProfiles = async (req, res) => {
  try {
    // Utiliser le service pour récupérer tous les profils
    const profiles = await profileService.getAllProfiles();

    res.status(200).json(profiles);
  } catch (error) {
    console.error("Erreur lors de la récupération des profils:", error);
    res
      .status(500)
      .json({
        message: error.message || "Erreur lors de la récupération des profils",
      });
  }
};

// Supprimer un profil
module.exports.deleteProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    // Utiliser le service pour supprimer le profil
    const result = await profileService.deleteProfile(userId);

    res.status(200).json(result);
  } catch (error) {
    console.error("Erreur lors de la suppression du profil:", error);
    res
      .status(500)
      .json({
        message: error.message || "Erreur lors de la suppression du profil",
      });
  }
};

// Rechercher des profils par compétences
module.exports.searchProfilesBySkills = async (req, res) => {
  try {
    const { skills } = req.query;
    if (!skills) {
      return res.status(400).json({ message: "Les compétences sont requises" });
    }

    const skillsArray = skills.split(",").map((skill) => skill.trim());

    // Utiliser le service pour rechercher les profils
    const profiles = await profileService.searchProfilesBySkills(skillsArray);

    res.status(200).json(profiles);
  } catch (error) {
    console.error("Erreur lors de la recherche des profils:", error);
    res
      .status(500)
      .json({
        message: error.message || "Erreur lors de la recherche des profils",
      });
  }
};

// Ajouter des soft skills
module.exports.addSoftSkills = async (req, res) => {
  try {
    const userId = req.user._id;
    const { softSkills } = req.body;

    if (!softSkills || !Array.isArray(softSkills)) {
      return res
        .status(400)
        .json({
          message: "Les soft skills doivent être fournis sous forme de tableau",
        });
    }

    const result = await profileService.addSoftSkills(userId, softSkills);

    if (result.duplicateSoftSkills.length > 0) {
      return res.status(200).json({
        message: `Les soft skills suivants existent déjà : ${result.duplicateSoftSkills.join(
          ", "
        )}`,
      });
    }

    res.status(200).json({
      message: result.message,
      profile: result.profile,
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout des soft skills:", error);
    res
      .status(500)
      .json({
        message: error.message || "Erreur lors de l'ajout des soft skills",
      });
  }
};

// Récupérer les soft skills
module.exports.getSoftSkills = async (req, res) => {
  try {
    const userId = req.user._id;
    const softSkills = await profileService.getSoftSkills(userId);
    res.status(200).json(softSkills);
  } catch (error) {
    console.error("Erreur lors de la récupération des soft skills:", error);
    res
      .status(500)
      .json({
        message:
          error.message || "Erreur lors de la récupération des soft skills",
      });
  }
};

// Mettre à jour les soft skills
module.exports.updateSoftSkills = async (req, res) => {
  try {
    const userId = req.user._id;
    const { softSkills } = req.body;

    if (!softSkills || !Array.isArray(softSkills)) {
      return res
        .status(400)
        .json({
          message: "Les soft skills doivent être fournis sous forme de tableau",
        });
    }

    const profile = await profileService.updateSoftSkills(userId, softSkills);
    res.status(200).json({
      message: "Soft skills mis à jour avec succès",
      profile,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour des soft skills:", error);
    res
      .status(500)
      .json({
        message:
          error.message || "Erreur lors de la mise à jour des soft skills",
      });
  }
};

// Supprimer un skill spécifique
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

// Supprimer un softSkill spécifique
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

// Mettre à jour le finalBid
module.exports.updateFinalBid = async (req, res) => {
  try {
    const companyId = req.user._id;
    const { newBid, userId, postId } = req.body;

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

// Récupérer les candidats bidés par la compagnie connectée
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
    console.log(id);
    const profile = await profileService.getCompanyProfileWithAssessments(id);

    if (!profile) {
      return res
        .status(404)
        .json({ message: "Profil introuvable ou non une entreprise." });
    }

    return res.status(200).json(profile);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
