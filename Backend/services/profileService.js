const Profile = require('../models/ProfileModel');
const User = require('../models/UserModel');
const Agent = require('../models/AgentModel');
const agentService = require('./AgentService');

// Créer ou mettre à jour un profil utilisateur
module.exports.createOrUpdateProfile = async (userId, profileData) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    // S'assurer que le rôle utilisateur est bien défini
    await User.findByIdAndUpdate(userId, { role: 'Candidat' });

    // Recherche profil existant
    let profile = await Profile.findOne({ userId });

    if (!profile) {
      // Créer un nouveau profil s'il n'existe pas
      profile = await Profile.create({
        userId,
        type: profileData.type || 'Candidate',
        skills: profileData.skills || [],
        overallScore: profileData.overallScore || 0
      });
    } else {
      // Mise à jour overallScore si fourni
      if (typeof profileData.overallScore === 'number') {
        profile.overallScore = profileData.overallScore;
      }

      // Mise à jour ou ajout des skills
      if (Array.isArray(profileData.skills)) {
        profileData.skills.forEach((newSkill) => {
          const existingSkill = profile.skills.find(skill => skill.name === newSkill.name);
          if (existingSkill) {
            existingSkill.proficiencyLevel = newSkill.proficiencyLevel;
            existingSkill.experienceLevel = newSkill.experienceLevel;

            // ✅ Ajoute explicitement la mise à jour du ScoreTest
            if (typeof newSkill.ScoreTest === 'number') {
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
    console.error('Erreur lors de la création/mise à jour du profil:', error);
    throw error;
  }
};


// Create or update a Company profile
exports.createOrUpdateCompanyProfile = async (userId, profileData) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found.');
    }

    // Ensure user role is updated to Company
    await User.findByIdAndUpdate(userId, { role: 'Company' });

    let profile = await Profile.findOne({ userId });

    const profileDataToSave = {
      userId,
      type: 'Company',
      companyDetails: {
        name: profileData.name,
        industry: profileData.industry,
        size: profileData.size,
        location: profileData.location,
      },
      requiredSkills: profileData.requiredSkills || [],
      requiredExperienceLevel: profileData.requiredExperienceLevel || 'Entry Level'
    };

    if (profile) {
      // Update existing profile
      profile.type = 'Company';
      profile.companyDetails = profileDataToSave.companyDetails;
      profile.requiredSkills = profileDataToSave.requiredSkills;
      profile.requiredExperienceLevel = profileDataToSave.requiredExperienceLevel;
      await profile.save();
    } else {
      // Create new profile
      profile = await Profile.create(profileDataToSave);
      
    }

    // Update the user's profile reference
    await User.findByIdAndUpdate(userId, { profile: profile._id });

    return profile;
  } catch (error) {
    console.error('Error creating/updating company profile:', error.message);
    throw error;
  }
};

// Récupérer un profil par ID utilisateur
// services/profileService.js
module.exports.getProfileByUserId = async (userId) => {
  try {
    const profile = await Profile.findOne({ userId }).populate('userId');

    if (!profile) {
      // Aucun profil trouvé
      return { message: 'Aucun profil trouvé pour cet utilisateur.' };
    }

    return profile;
  } catch (error) {
    console.error('Erreur lors de la récupération du profil :', error);
    throw new Error("Impossible de récupérer le profil."); // message plus générique
  }
};


// Récupérer tous les profils
module.exports.getAllProfiles = async () => {
  try {
    const profiles = await Profile.find().populate('userId', 'username email');
    return profiles;
  } catch (error) {
    console.error('Erreur lors de la récupération des profils:', error);
    throw error;
  }
};

// Supprimer un profil
module.exports.deleteProfile = async (userId) => {
  try {
    const profile = await Profile.findOneAndDelete({ userId });
    if (!profile) {
      throw new Error('Profil non trouvé');
    }
    
    // Mettre à jour l'utilisateur pour supprimer la référence au profil
    await User.findByIdAndUpdate(userId, { $unset: { profile: 1 } });
    
    return { message: 'Profil supprimé avec succès' };
  } catch (error) {
    console.error('Erreur lors de la suppression du profil:', error);
    throw error;
  }
};

// Rechercher des profils par compétences
module.exports.searchProfilesBySkills = async (skills) => {
  try {
    const profiles = await Profile.find({
      'skills.name': { $in: skills }
    }).populate('userId', 'username email');
    return profiles;
  } catch (error) {
    console.error('Erreur lors de la recherche des profils:', error);
    throw error;
  }
};

// Gérer les soft skills
module.exports.addSoftSkills = async (userId, softSkills) => {
  try {
    const profile = await Profile.findOne({ userId });
    if (!profile) {
      throw new Error('Profil non trouvé');
    }

    if (!Array.isArray(softSkills)) {
      throw new Error('Les soft skills doivent être fournis sous forme de tableau');
    }

    // Vérifier les soft skills existants
    const existingSoftSkills = profile.softSkills || [];
    const newSoftSkills = [];
    const duplicateSoftSkills = [];

    softSkills.forEach(skill => {
      if (existingSoftSkills.includes(skill)) {
        duplicateSoftSkills.push(skill);
      } else {
        newSoftSkills.push(skill);
      }
    });

    if (newSoftSkills.length > 0) {
      profile.softSkills = [...new Set([...existingSoftSkills, ...newSoftSkills])];
      await profile.save();
    }

    return {
      profile,
      message: duplicateSoftSkills.length > 0 
        ? `Les soft skills suivants existent déjà : ${duplicateSoftSkills.join(', ')}`
        : 'Soft skills ajoutés avec succès'
    };
  } catch (error) {
    console.error('Erreur lors de l\'ajout des soft skills:', error);
    throw error;
  }
};

module.exports.getSoftSkills = async (userId) => {
  try {
    const profile = await Profile.findOne({ userId });
    if (!profile) {
      throw new Error('Profil non trouvé');
    }
    return profile.softSkills || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des soft skills:', error);
    throw error;
  }
};

module.exports.updateSoftSkills = async (userId, softSkills) => {
  try {
    const profile = await Profile.findOne({ userId });
    if (!profile) {
      throw new Error('Profil non trouvé');
    }

    if (!Array.isArray(softSkills)) {
      throw new Error('Les soft skills doivent être fournis sous forme de tableau');
    }

    profile.softSkills = softSkills;
    await profile.save();
    return profile;
  } catch (error) {
    console.error('Erreur lors de la mise à jour des soft skills:', error);
    throw error;
  }
};

module.exports.deleteSoftSkills = async (userId, softSkillsToDelete) => {
  try {
    const profile = await Profile.findOne({ userId });
    if (!profile) {
      throw new Error('Profil non trouvé');
    }

    if (!Array.isArray(softSkillsToDelete)) {
      throw new Error('Les soft skills à supprimer doivent être fournis sous forme de tableau');
    }

    profile.softSkills = profile.softSkills.filter(skill => !softSkillsToDelete.includes(skill));
    await profile.save();
    return profile;
  } catch (error) {
    console.error('Erreur lors de la suppression des soft skills:', error);
    throw error;
  }
}; 