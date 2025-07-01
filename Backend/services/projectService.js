const Project = require("../models/projectModel");
const User = require("../models/UserModel");

// Création d'un projet
module.exports.createProject = async (data) => {
    try {
      // Créer un projet avec les données fournies
      const project = new Project({
        name: data.Name,
        description: data.description,
        team: data.team.map(email => ({ email, validated: false })), // Ajouter les membres avec un statut validé à false
        leaderId: data.leaderId, // Vous devez avoir l'ID du leader (assurez-vous de le récupérer quelque part)
      });
      await project.save(); // Sauvegarder le projet dans la base de données
  
      // Mettre à jour l'utilisateur leader avec ses informations et ajouter l'ID du projet à sa liste de projets
      await User.findByIdAndUpdate(
        data.leaderId, 
        { 
          FirstName: data.FirstName,
          LastName: data.LastName,
          isHaker: true,
          role: "Candidat",
          $push: { project: project._id } // Ajouter l'ID du projet à la liste des projets de l'utilisateur
        }
      );
  
      return project; // Retourner le projet créé
    } catch (error) {
      console.error("Erreur lors de la création du projet:", error);
      throw new Error("Erreur lors de la création du projet");
    }
  };
  

// Récupération de tous les projets
module.exports.getAllProjects = async () => {
  try {
    const projects = await Project.find();
    return projects;
  } catch (error) {
    throw new Error("Erreur lors de la récupération des projets");
  }
};

// Récupération des projets de l'utilisateur connecté
module.exports.getMyProjects = async (userId) => {
  try {
    const projects = await Project.find({ leaderId: userId });
    return projects;
  } catch (error) {
    throw new Error("Erreur lors de la récupération des projets");
  }
};
// Récupération d'un projet par son ID
module.exports.getProjectById = async (id) => {
  try {
    const project = await Project.findById(id);
    if (!project) throw new Error("Projet non trouvé");
    return project;
  } catch (error) {
    throw new Error("Erreur lors de la récupération du projet");
  }
};

// Mise à jour d'un projet
module.exports.updateProject = async (id, data) => {
  try {
    const project = await Project.findByIdAndUpdate(id, data, { new: true });
    if (!project) throw new Error("Projet non trouvé");
    return project;
  } catch (error) {
    throw new Error("Erreur lors de la mise à jour du projet");
  }
};

// Suppression d'un projet
module.exports.deleteProject = async (id) => {
  try {
    const project = await Project.findByIdAndDelete(id);
    if (!project) throw new Error("Projet non trouvé");
    return project;
  } catch (error) {
    throw new Error("Erreur lors de la suppression du projet");
  }
};

