const profileService = require("../../services/ProfileService/profileService");
const {
  VALIDATION,
  buildUpdateData,
  validateUpdateFields,
  validateProfileCreationFields,
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
    const profile = await profileService.createOrUpdateProfile(userId, profileData);

    res.status(200).json({
      message: "Profile created/updated successfully",
      profile,
    });
  } catch (error) {
    console.error("Error creating/updating candidate profile:", error);
    res.status(500).json({
      message: error.message || "Error creating/updating candidate profile",
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

exports.updateUserImage = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!req.file) {
      return res.status(400).json({ message: "Aucune image n’a été fournie." });
    }

    const { filename } = req.file;
    console.log("Nouvelle image :", filename);

    const updatedUser = await profileService.updateUserImage(userId, filename);

    res.status(200).json({
      message: "Image mise à jour avec succès.",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
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
    //const id = "68ff674d5d0454e0505e4d75"; // For testing purpose
    
    const { jobId } = req.params; 
    
    const profile = await profileService.getCompanyProfileWithAssessments(id, jobId);

    if (!profile) {
      return res.status(404).json({ message: "Profil introuvable ou non une entreprise." });
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
      profile: updatedProfile,
    });

  } catch (error) {
    console.error('❌ Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update profile",
    });
  }
};

// Mettre à jour la visibilité du profil (public / private)
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