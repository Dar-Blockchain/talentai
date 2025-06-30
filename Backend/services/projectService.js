const Project = require("../models/project.model");

// Création d'un projet
const createProject = async (data) => {
  try {
    const project = new Project(data);
    await project.save();
    return project;
  } catch (error) {
    throw new Error("Erreur lors de la création du projet");
  }
};

// Récupération de tous les projets
const getAllProjects = async () => {
  try {
    const projects = await Project.find();
    return projects;
  } catch (error) {
    throw new Error("Erreur lors de la récupération des projets");
  }
};

// Récupération d'un projet par son ID
const getProjectById = async (id) => {
  try {
    const project = await Project.findById(id);
    if (!project) throw new Error("Projet non trouvé");
    return project;
  } catch (error) {
    throw new Error("Erreur lors de la récupération du projet");
  }
};

// Mise à jour d'un projet
const updateProject = async (id, data) => {
  try {
    const project = await Project.findByIdAndUpdate(id, data, { new: true });
    if (!project) throw new Error("Projet non trouvé");
    return project;
  } catch (error) {
    throw new Error("Erreur lors de la mise à jour du projet");
  }
};

// Suppression d'un projet
const deleteProject = async (id) => {
  try {
    const project = await Project.findByIdAndDelete(id);
    if (!project) throw new Error("Projet non trouvé");
    return project;
  } catch (error) {
    throw new Error("Erreur lors de la suppression du projet");
  }
};

module.exports = {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
};
