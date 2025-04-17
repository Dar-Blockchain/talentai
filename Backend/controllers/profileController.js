const profileService = require('../services/profileService');

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
    const profile = await profileService.createOrUpdateProfile(userId, profileData);

    res.status(200).json({
      message: "Profil créé/mis à jour avec succès",
      profile
    });
  } catch (error) {
    console.error('Erreur lors de la création/mise à jour du profil:', error);
    res.status(500).json({ message: error.message || "Erreur lors de la création/mise à jour du profil" });
  }
};

// Créer ou mettre à jour un profil
module.exports.createOrUpdateCompanyProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const profileData = req.body;


    // Utiliser le service pour créer ou mettre à jour le profil
    const profile = await profileService.createOrUpdateCompanyProfile(userId, profileData);

    res.status(200).json({
      message: "Profil créé/mis à jour avec succès",
      profile
    });
  } catch (error) {
    console.error('Erreur lors de la création/mise à jour du profil:', error);
    res.status(500).json({ message: error.message || "Erreur lors de la création/mise à jour du profil" });
  }
};

// Récupérer son propre profil
module.exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Utiliser le service pour récupérer le profil
    const profile = await profileService.getProfileByUserId(userId);
    
    res.status(200).json(profile);
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({ message: error.message || "Erreur lors de la récupération du profil" });
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
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({ message: error.message || "Erreur lors de la récupération du profil" });
  }
};

// Récupérer tous les profils
module.exports.getAllProfiles = async (req, res) => {
  try {
    // Utiliser le service pour récupérer tous les profils
    const profiles = await profileService.getAllProfiles();
    
    res.status(200).json(profiles);
  } catch (error) {
    console.error('Erreur lors de la récupération des profils:', error);
    res.status(500).json({ message: error.message || "Erreur lors de la récupération des profils" });
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
    console.error('Erreur lors de la suppression du profil:', error);
    res.status(500).json({ message: error.message || "Erreur lors de la suppression du profil" });
  }
};

// Rechercher des profils par compétences
module.exports.searchProfilesBySkills = async (req, res) => {
  try {
    const { skills } = req.query;
    if (!skills) {
      return res.status(400).json({ message: "Les compétences sont requises" });
    }

    const skillsArray = skills.split(',').map(skill => skill.trim());
    
    // Utiliser le service pour rechercher les profils
    const profiles = await profileService.searchProfilesBySkills(skillsArray);
    
    res.status(200).json(profiles);
  } catch (error) {
    console.error('Erreur lors de la recherche des profils:', error);
    res.status(500).json({ message: error.message || "Erreur lors de la recherche des profils" });
  }
}; 