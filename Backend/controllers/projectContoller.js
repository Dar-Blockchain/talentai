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

// Récupérer tous les projets
module.exports.getMyProjects = async (req, res) => {
  try {
    const projects = await projectService.getMyProjects(req.user._id);
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
    res.status(200).json({
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
    if (
      !assessmentType ||
      !Object.values(PROJECT_ASSESSMENT_TYPE).includes(assessmentType)
    ) {
      throw new HttpError(
        400,
        `Assessment type is required and must have a valid value `
      );
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

exports.analyzeAnswers = async (req, res) => {
  try {
    const { questions } = req.body;
    const projectId = req.params.id;
    const assessmentType = req.params.assessmentType.trim();
    const user = req.user;

    const profile = await Profile.findById(user.profile);
    if (!profile)
      throw new HttpError(404, "profile not found.");

    const now = new Date();
    const daysSinceLastUpdate =
      (now - new Date(profile.quotaUpdatedAt)) / (1000 * 60 * 60 * 24);
    if (daysSinceLastUpdate >= 30) {
      profile.quota = 0;
      profile.quotaUpdatedAt = now;
    }

    if (profile.quota >= 5) {
      return res
        .status(403)
        .json({ error: "You have reached your test limit (5)" });
    }

    if (!Array.isArray(questions)) {
      return res.status(400).json({
        error: "Invalid request format",
        required: {
          questions: "Array of question-answer pairs",
        },
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      throw new HttpError(404, "project not found");
    }

    const result = await projectService.analyzeAnswers({
      questions,
      profile,
      project,
      assessmentType,
    });

    res.status(200).json({ success: true, result });
  } catch (error) {
    console.error("Error analyzing project answers:", error);
    res.status(500).json({
      success: false,
      error: "Failed to analyze project answers",
      details: error.message,
    });
  }
};
