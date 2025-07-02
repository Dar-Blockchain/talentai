const { Together } = require("together-ai");
require("dotenv").config();

const {
  PROJECT_ASSESSMENT_TYPE,
  TECHNICAL_ASSESSMENT_QUESTIONS_COUNT,
  BUSINESS_ASSESSMENT_QUESTIONS_COUNT,
} = require("../constants/projectConstants");
//const projectConstants = require("../constants/projectConstants");
const Project = require("../models/projectModel");
const User = require("../models/UserModel");
const { parseAIResponse } = require("../parsers/AIResponseParser");
const { HttpError } = require("../utils/httpUtils");

const {
  generateTechnicalQuestionsPrompts,
  generateBusinessQuestionsPrompts,
} = require("../prompts/projectPrompts");

const together = new Together({ apiKey: process.env.TOGETHER_API_KEY });

const crypto = require("crypto");
const { sendActivationEmail } = require("../utils/mailing");

// Création d'un projet
module.exports.createProject = async (data, baseUrl) => {
  try {
    // Si l'équipe contient des emails sous forme de tableau de chaînes,
    // on doit les transformer en objets avec les clés nécessaires
    const teamWithTokens = data.team.map((email) => {
      if (!email) {
        throw new Error("L'email est requis pour chaque membre de l'équipe.");
      }
      const activationToken = crypto.randomBytes(32).toString("hex");
      return {
        email: email,  // L'email du membre
        validated: false,  // Mis à false par défaut
        activationToken,  // Le token d'activation généré
      };
    });

    // Créer un projet avec les données fournies
    const project = new Project({
      name: data.Name,
      track: data.track,
      description: data.description,
      team: teamWithTokens,  // Ajout des membres de l'équipe avec les emails transformés
      leaderId: data.leaderId, // Assurez-vous que l'ID du leader est passé correctement
    });
    await project.save(); // Sauvegarder le projet dans la base de données

    // Envoie un mail à chaque membre de l'équipe
    for (const member of teamWithTokens) {
      const link = `${baseUrl}/projects/activate?projectId=${project._id}&token=${member.activationToken}`;
      await sendActivationEmail(member.email, link);  // Envoi de l'email d'activation
    }

    // Mettre à jour l'utilisateur leader avec ses informations et ajouter l'ID du projet à sa liste de projets
    await User.findByIdAndUpdate(data.leaderId, {
      FirstName: data.FirstName,
      LastName: data.LastName,
      isHaker: true,
      role: "Candidat",
      $push: { project: project._id }, // Ajouter l'ID du projet à la liste des projets de l'utilisateur
    });

    return project; // Retourner le projet créé
  } catch (error) {
    console.error("Erreur lors de la création du projet:", error);
    throw new Error("Erreur lors de la création du projet");
  }
};



// Activation du compte membre
module.exports.activateTeamMember = async (projectId, token) => {
  const project = await Project.findById(projectId);
  if (!project) throw new Error("Projet introuvable");

  const member = project.team.find(
    (m) => m.activationToken === token && !m.validated
  );
  if (!member) throw new Error("Lien invalide ou déjà activé");

  member.validated = true;
  member.activationToken = undefined; // On supprime le token après activation
  await project.save();

  return member;
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

module.exports.generateProjectQuestions = async (
  projectName,
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
        questionsCount
      );
      userPrompt = generateTechnicalQuestionsPrompts.getUserPrompt(
        projectName,
        questionsCount
      );
      pitchQuestion =
        "You have up to 7 minutes to deliver your technical pitch and provide additional details about your project.";
    }

    if (assessmentType == PROJECT_ASSESSMENT_TYPE.BUSINESS) {
      questionsCount = BUSINESS_ASSESSMENT_QUESTIONS_COUNT;
      systemPrompt = generateBusinessQuestionsPrompts.getSystemPrompt(
        projectName,
        questionsCount
      );
      userPrompt = generateBusinessQuestionsPrompts.getUserPrompt(
        projectName,
        questionsCount
      );
      pitchQuestion =
        "You have up to 7 minutes to deliver your business pitch and provide additional details about your project.";
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
