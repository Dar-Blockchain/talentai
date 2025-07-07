const projectService = require("../services/projectService");
const Profile = require("../models/ProfileModel");
const Project = require("../models/projectModel");
const { HttpError } = require("../utils/httpUtils");
const { PROJECT_ASSESSMENT_TYPE } = require("../constants/projectConstants");
const ProjectAssessment = require("../models/projectAssessmentModel");

// Créer un projet
module.exports.createProject = async (req, res) => {
  try {
    const baseUrl = process.env.BASE_URL || "http://localhost:3000"; // Adapte selon ton env
    const data = req.body;
    data.leaderId = req.user._id;
    const newProject = await projectService.createProject(data, baseUrl);
    res.status(201).json(newProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports.activateTeamMember = async (req, res) => {
  try {
    const { projectId, token } = req.body;
    const member = await projectService.activateTeamMember(projectId, token);
    res.send(`Activation réussie pour ${member.email}`);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

// 4. Ajouter un membre à l'équipe
module.exports.addMemberToTeam = async (req, res) => {
  const { projectId,email } = req.body;  // Email du nouveau membre
  const baseUrl = req.protocol + '://' + req.get('host');  // URL de base de l'application

  try {
    const result = await projectService.addMemberToTeam(projectId, email, baseUrl);
    res.status(200).json(result);  // Retourner le succès
  } catch (error) {
    console.error("Erreur lors de l'ajout du membre :", error);
    res.status(400).json({ error: error.message });
  }
};


// 3. Réinviter un membre dont le lien d'activation a expiré
module.exports.resendTeamInvitation = async (req, res) => {
  const { projectId,email } = req.body;
  const baseUrl = req.protocol + '://' + req.get('host'); // Récupérer l'URL de base de l'application

  try {
    const result = await projectService.resendTeamInvitation(projectId, email, baseUrl);
    res.status(200).json(result); // Retourne la réussite de la réinvitation
  } catch (error) {
    console.error("Erreur lors de la réinvitation du membre :", error);
    res.status(400).json({ error: error.message });
  }
};

// Récupérer tous les projets
module.exports.getAllProjects = async (req, res) => {
  try {
    const { page, limit, sort, track, leaderId, name } = req.query;
    const projects = await projectService.getAllProjects(
      page,
      limit,
      sort,
      track,
      leaderId, 
      name
    );
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

// Récupérer Nombre des projets
module.exports.getNumberProjects = async (req, res) => {
  try {
    const project = await projectService.getNumberProjects(req.user._id);
    res.status(200).json(project);
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

    const projectName = project.name;
    const projectTrack = project.track;

    const result = await projectService.generateProjectQuestions(
      projectName,
      projectTrack,
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
      return res.status(404).json({
        error: "project not found",
      });
    }

    let projectAssessment = await ProjectAssessment.findOne({
      project: project._id,
    });

    switch (assessmentType) {
      case PROJECT_ASSESSMENT_TYPE.TECHNICAL:
        if (projectAssessment && !projectAssessment.businessData) {
          return res.status(400).json({
            message: "Business Assessment must take place before Technical assessment",
          });
        }
        if (projectAssessment && projectAssessment.technicalData) {
          return res.status(400).json({
            message: "Technical data already asssessed for this project",
          });
        }

        break;
      case PROJECT_ASSESSMENT_TYPE.BUSINESS:
        if (projectAssessment && projectAssessment.businessData) {
          return res.status(400).json({
            message: "Business data already asssessed for this project",
          });
        }
        break;
      default:
        return res.status(400).json({
          error: "Invalid assessment type",
        });
    }

    const result = await projectService.analyzeAnswers({
      questions,
      user,
      project,
      projectAssessment,
      assessmentType,
    });

    // After analyzeAnswers, re-fetch the project with population
    const populatedProject = await Project.findById(projectId)
      .populate({ path: "leaderId", model: "User", as: "leader" })
      .populate({
        path: "assessment",
        model: "ProjectAssessment",
        populate: { path: "user", model: "User" },
      });

    res.status(200).json({
      success: true,
      result,
      project: {
        ...populatedProject.toObject(),
        leader: populatedProject.leaderId, // alias leaderId as leader
      },
    });
  } catch (error) {
    return res.status(500).json({
      error: `An unexpected error occurred while analyzing project answers: ${error}`,
    });
  }
};

// Get all available project tracks from the database
module.exports.getProjectTracks = async (req, res) => {
  try {
    const tracks = await projectService.getAllTracks();
    res.status(200).json({ tracks });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch project tracks", error: error.message });
  }
};

// Controller to fetch project stats
module.exports.getProjectStats = async (req, res) => {
  try {
    const stats = await projectService.getProjectStats();
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};