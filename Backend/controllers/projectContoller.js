const projectService = require("../services/projectService");
const Profile = require("../models/ProfileModel");
const Project = require("../models/projectModel");
const { HttpError } = require("../utils/httpUtils");
const { PROJECT_ASSESSMENT_TYPE } = require("../constants/projectConstants");

// Créer un projet
module.exports.createProject = async (req, res) => {
  try {
    const data = req.body;
    data.leaderId = req.user._id;
    const newProject = await projectService.createProject(data);
    res.status(201).json(newProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Récupérer tous les projets
module.exports.getAllProjects = async (req, res) => {
  try {
    const projects = await projectService.getAllProjects();
    res.status(200).json(projects);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Récupérer un projet par ID
module.exports.getProjectById = async (req, res) => {
  try {
    const project = await projectService.getProjectById(req.params.id);
    res.status(200).json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Mettre à jour un projet
module.exports.updateProject = async (req, res) => {
  try {
    const updatedProject = await projectService.updateProject(
      req.params.id,
      req.body
    );
    res.status(200).json(updatedProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Supprimer un projet
module.exports.deleteProject = async (req, res) => {
  try {
    const deletedProject = await projectService.deleteProject(req.params.id);
    res
      .status(200)
      .json({
        message: "Projet supprimé avec succès",
        project: deletedProject,
      });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports.generateProjectQuestions = async (req, res) => {
  try {
    const user = req.user;
    const projectId = req.params.id;
    const assessmentType = req.params.assessmentType.trim();
    if (!user) {
      throw new HttpError(500, `User not found`);
    }
    if (!assessmentType) {
      throw new HttpError(400, `Assessment type is required.`);
    }

    // project verification
    if (!projectId) {
      throw new HttpError(400, `Project ID is required.`);
    }
    const project = await Project.findById(projectId);
    if (!project) {
      throw new HttpError(404, `Project with ID ${projectId} not found.`);
    }

    const projectName = project.Name;

    const result = await projectService.generateProjectQuestions(
      projectName,
      assessmentType
    );

    res.status(200).json(result);
  } catch (error) {
    if (error instanceof HttpError) {
      return res.status(error.statusCode || 500).json({
        error: error.message || "A HTTP error occurred.",
      });
    }

    return res.status(500).json({
      error: "An unexpected error occurred while generating Project questions.",
    });
  }
};
