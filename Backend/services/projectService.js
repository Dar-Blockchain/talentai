const { Together } = require("together-ai");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const {
  PROJECT_ASSESSMENT_TYPE,
  TECHNICAL_ASSESSMENT_QUESTIONS_COUNT,
  BUSINESS_ASSESSMENT_QUESTIONS_COUNT,
  PITCH_DURATION,
  QUESTION_DURATION,
} = require("../constants/projectConstants");

const Project = require("../models/projectModel");
const User = require("../models/UserModel");
const ProjectAssessment = require("../models/projectAssessmentModel");

const { parseAIResponse } = require("../parsers/AIResponseParser");
const { HttpError } = require("../utils/httpUtils");

const {
  generateTechnicalQuestionsPrompts,
  generateBusinessQuestionsPrompts,
  analyzeTechnicalAnswersPrompts,
  analyzeBusinessAnswersPrompts,
} = require("../prompts/projectPrompts");

const together = new Together({ apiKey: process.env.TOGETHER_API_KEY });

// Création d'un projet
const { sendActivationEmail } = require("../utils/mailing");
const crypto = require("crypto");
const EXPIRATION_HOURS = 24;

module.exports.createProject = async (data, baseUrl) => {
  try {
    if (!data.team || data.team.length === 0) {
      throw new Error("L'équipe doit avoir des membres.");
    }

    const teamWithTokens = data.team.map((email) => {
      if (!email) {
        throw new Error("L'email est requis pour chaque membre de l'équipe.");
      }

      const activationToken = crypto.randomBytes(20).toString("hex");
      const expiresAt = new Date(Date.now() + EXPIRATION_HOURS * 60 * 60 * 1000); // 24h

      return {
        email,
        validated: false,
        activationToken,
        expiresAt,
      };
    });

    const project = new Project({
      name: data.Name,
      track: data.track,
      description: data.description,
      team: teamWithTokens,
      leaderId: data.leaderId,
    });

    await project.save();

    for (const member of teamWithTokens) {
      const link = `${baseUrl}/projects/activate?projectId=${project._id}&token=${member.activationToken}`;
      await sendActivationEmail(member.email, link);
    }

    await User.findByIdAndUpdate(data.leaderId, {
      FirstName: data.FirstName,
      LastName: data.LastName,
      isHaker: true,
      role: "Candidat",
      $push: { project: project._id },
    });

    return project;
  } catch (error) {
    console.error("Erreur lors de la création du projet:", error);
    throw new Error("Erreur lors de la création du projet");
  }
};

module.exports.activateTeamMember = async (projectId, token) => {
  try {
    if (!token) {
      throw new Error("Token manquant");
    }

    const project = await Project.findById(projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    const member = project.team.find((m) => m.activationToken === token);

    if (!member) {
      throw new Error("Lien invalide ou déjà activé");
    }

    // Vérifier la date d'expiration
    if (!member.expiresAt || member.expiresAt < new Date()) {
      throw new Error(
        "Le lien d'activation a expiré. Demandez un nouvel envoi."
      );
    }

    if (member.validated) {
      throw new Error("Membre déjà validé");
    }

    member.validated = true;
    member.activationToken = null;
    member.expiresAt = null; // (optionnel : nettoyage du champ)

    await project.save();

    return member;
  } catch (error) {
    console.error("Erreur lors de l'activation du membre:", error);
    throw error;
  }
};

// 3. Réinvitation d’un membre
module.exports.resendTeamInvitation = async (projectId, memberEmail, baseUrl) => {
  const project = await Project.findById(projectId);
  if (!project) throw new Error("Projet introuvable");

  const member = project.team.find((m) => m.email === memberEmail);
  if (!member) throw new Error("Membre introuvable");

  if (member.validated) throw new Error("Ce membre a déjà validé son invitation.");

  // Nouveau token + nouvelle expiration
  member.activationToken = crypto.randomBytes(20).toString("hex");
  member.expiresAt = new Date(Date.now() + EXPIRATION_HOURS * 60 * 60 * 1000);

  await project.save();

  // Envoi du mail
  const link = `${baseUrl}/projects/activate?projectId=${project._id}&token=${member.activationToken}`;
  await sendActivationEmail(member.email, link);

  return { success: true, message: "Nouvelle invitation envoyée." };
}

// Récupération de tous les projets
module.exports.getAllProjects = async (page, limit, sort, track, leaderId) => {
  try {
    const query = {};
    if (track && track.trim() !== "") query.track = track;
    if (leaderId) query.leaderId = leaderId;
    const skip = (page - 1) * limit;

    const [projects, total] = await Promise.all([
      Project.find(query)
        // .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate("leaderId")
        .populate({
          path: "assessment",
          model: "ProjectAssessment",
        }),
      Project.countDocuments(query),
    ]);
    return {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      projects,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    throw new Error("Erreur lors de la récupération des projets");
  }
};

// Récupération des projets de l'utilisateur connecté
module.exports.getMyProjects = async (userId) => {
  try {
    const projects = await Project.find({ leaderId: userId }).populate({
      path: "assessment",
      model: "ProjectAssessment",
    });
    return projects;
  } catch (error) {
    throw new Error("Erreur lors de la récupération des projets");
  }
};

module.exports.getNumberProjects = async (userId) => {
  try {
    const projects = await Project.find({ leaderId: userId });
    if (!projects) throw new Error("Projet non trouvé");
    return projects.length;
  } catch (error) {
    throw new Error("Erreur lors de la récupération du projet");
  }
};

// Récupération d'un projet par son ID
module.exports.getProjectById = async (id) => {
  try {
    const project = await Project.findById(id).populate("leaderId"); // ← Ajoute le populate ici

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

module.exports.generateProjectQuestions = async (
  projectName,
  projectTrack,
  assessmentType
) => {
  try {
    let systemPrompt = "";
    let userPrompt = "";
    let pitchQuestion = "";

    if (assessmentType == PROJECT_ASSESSMENT_TYPE.TECHNICAL) {
      questionsCount = TECHNICAL_ASSESSMENT_QUESTIONS_COUNT;
      systemPrompt = generateTechnicalQuestionsPrompts.getSystemPrompt(
        projectName,
        projectTrack,
        questionsCount,
        QUESTION_DURATION
      );
      userPrompt = generateTechnicalQuestionsPrompts.getUserPrompt(
        projectName,
        projectTrack,
        questionsCount
      );
      pitchQuestion =
        "You have up to " +
        PITCH_DURATION +
        " minutes to deliver your technical pitch and provide additional details about your project.";
    }

    if (assessmentType == PROJECT_ASSESSMENT_TYPE.BUSINESS) {
      questionsCount = BUSINESS_ASSESSMENT_QUESTIONS_COUNT;
      systemPrompt = generateBusinessQuestionsPrompts.getSystemPrompt(
        projectName,
        questionsCount,
        QUESTION_DURATION
      );
      userPrompt = generateBusinessQuestionsPrompts.getUserPrompt(
        projectName,
        questionsCount
      );
      pitchQuestion =
        "You have up to " +
        PITCH_DURATION +
        " minutes to deliver your business pitch and provide additional details about your project.";
    }

    const stream = await together.chat.completions.create({
      model: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
      stream: true,
    });

    let raw = "";
    for await (const chunk of stream) {
      const content = chunk.choices?.[0]?.delta?.content;
      if (content) raw += content;
    }

    let questions = await parseAIResponse(raw);

    questions.push(pitchQuestion);

    return { questions, totalQuestions: questions.length };
  } catch (error) {
    console.error("Error generating project questions:", error);
    if (error instanceof HttpError) throw error;

    throw new HttpError(500, `Internal server error: ${error}`);
  }
};

exports.analyzeAnswers = async ({
  questions,
  user,
  project,
  projectAssessment,
  assessmentType,
}) => {
  try {
    let systemPrompt = "";
    let userPrompt = "";
    const projectName = project.name;
    const projectTrack = project.track;

    // I. Set the prompts according to the analysis to be done (technical or business)
    if (assessmentType == PROJECT_ASSESSMENT_TYPE.TECHNICAL) {
      systemPrompt = analyzeTechnicalAnswersPrompts.getSystemPrompt(
        projectName,
        questions
      );
      userPrompt = analyzeTechnicalAnswersPrompts.getUserPrompt(
        projectName,
        questions
      );
    }

    if (assessmentType == PROJECT_ASSESSMENT_TYPE.BUSINESS) {
      systemPrompt = analyzeBusinessAnswersPrompts.getSystemPrompt(
        projectName,
        questions
      );
      userPrompt = analyzeBusinessAnswersPrompts.getUserPrompt(
        projectName,
        questions
      );
    }

    // II. Send the prompt to the AI
    const stream = await together.chat.completions.create({
      model: "deepseek-ai/DeepSeek-V3",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 2500,
      temperature: 0.7,
      stream: true,
    });

    let raw = "";
    for await (const chunk of stream) {
      const content = chunk.choices?.[0]?.delta?.content;
      if (content) raw += content;
    }

    // III. parse AI response
    let analysis = await parseAIResponse(raw);

    console.log("Analysis:", analysis);

    // IV. Store the projectAssessment in the project model
    if (!projectAssessment) {
      projectAssessment = new ProjectAssessment({
        project: project._id,
        user: user._id,
      });

      project.assessment = projectAssessment._id;
      await project.save();
    }

    if (assessmentType === PROJECT_ASSESSMENT_TYPE.TECHNICAL) {
      projectAssessment.technicalData = analysis.technicalData;
    } else if (assessmentType === PROJECT_ASSESSMENT_TYPE.BUSINESS) {
      projectAssessment.businessData = analysis.businessData;
    }

    await projectAssessment.save();

    return { analysis };
  } catch (error) {
    console.error("Error analyzing answers:", error);
    throw new Error(`Error analyzing answers: ${error}`);
  }
};
