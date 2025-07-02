const { Together } = require("together-ai");
require("dotenv").config();

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
} = require("../prompts/projectPrompts");

const together = new Together({ apiKey: process.env.TOGETHER_API_KEY });

const { sendActivationEmail } = require("../utils/mailing");

// Création d'un projet
const jwt = require("jsonwebtoken");
const secret = process.env.Net_Secret;

module.exports.createProject = async (data, baseUrl) => {
  try {
    // Vérifier que l'email est fourni
    if (!data.team || data.team.length === 0) {
      throw new Error("L'équipe doit avoir des membres.");
    }

    console.log("Team emails:", data.team);

    // Créer un JWT global avec la liste des membres
    const activationData = { members: data.team };
    const activationToken = jwt.sign(activationData, secret, { expiresIn: '1h' });

    // Créer un projet
    const project = new Project({
      name: data.Name,
      track: data.track,
      description: data.description,
      team: data.team.map(email => ({
        email,
        validated: false,
        activationToken: null,
      })),
      leaderId: data.leaderId,
      activationToken: activationToken, // Le token d'activation global
    });

    // Sauvegarder le projet dans la base de données
    await project.save();
    console.log("Project created:", project);

    // Envoyer un email à chaque membre avec le lien d'activation
    for (const memberEmail of data.team) {
      const link = `${baseUrl}/projects/activate?projectId=${project._id}&token=${activationToken}&email=${memberEmail}`;
      console.log("Sending activation email to:", memberEmail, "Link:", link);
      await sendActivationEmail(memberEmail, link);
    }

    // Mettre à jour l'utilisateur leader
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

module.exports.activateTeamMember = async (projectId, token, memberEmail) => {
  try {
    console.log("Activating project with ID:", projectId);
    console.log("Received token:", token);
    console.log("Member email:", memberEmail);

    // Vérification du format du token
    if (token.split('.').length !== 3) {
      throw new Error("Token mal formé");
    }

    // Trouver le projet
    const project = await Project.findById(projectId);
    if (!project) {
      console.error("Projet introuvable");
      throw new Error("Project not found");
    }

    console.log("Project found:", project);

    // Vérification du token avec la clé secrète
    let decoded;
    try {
      decoded = jwt.verify(token, secret);
      console.log("Decoded token:", decoded);  // Vérifie que les membres sont inclus
    } catch (err) {
      console.error('Erreur JWT:', err);
      throw new Error('Invalid token');
    }

    // Log des membres inclus dans le token
    console.log("Decoded token contains members:", decoded.members);

    // Vérifier si l'email du membre est inclus dans la liste des membres
    const member = project.team.find(
      (m) => m.email === memberEmail && !m.validated
    );

    if (!member) {
      console.error("Lien invalide ou déjà activé");
      throw new Error("Invalid link or already activated");
    }

    // Mettre à jour le statut du membre
    member.validated = true;

    // Sauvegarder le projet avec le membre mis à jour
    await project.save();

    console.log("Membre activé:", member);

    // Retourner les informations du membre activé
    return member;
  } catch (error) {
    console.error("Erreur lors de l'activation du membre:", error);
    throw error; // Rejeter l'erreur pour être capturée ailleurs
  }
};
;


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
    const project = await Project.findById(id).populate('leaderId'); // ← Ajoute le populate ici

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
        questionsCount,
        QUESTION_DURATION
      );
      userPrompt = generateTechnicalQuestionsPrompts.getUserPrompt(
        projectName,
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
  profile,
  project,
  projectAssessment, 
  assessmentType,
}) => {
  

  let systemPrompt = "";
  let userPrompt = "";
  const projectName = project.name;
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

  // if (assessmentType == PROJECT_ASSESSMENT_TYPE.BUSINESS) {
  //   systemPrompt = analyzeBusinessAnswersPrompts.getSystemPrompt(
  //     projectName,
  //     questionsCount,
  //     QUESTION_DURATION
  //   );
  //   userPrompt = analyzeBusinessAnswersPrompts.getUserPrompt(
  //     projectName,
  //     questionsCount
  //   );
  // }

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

  // I. parse AI response
  let analysis = await parseAIResponse(raw);

  console.log("Analysis:", analysis);

  if (!projectAssessment) {
    projectAssessment = new ProjectAssessment({
      project: project._id,
      leaderProfile: profile._id,
      technicalData: analysis.technicalData,
    });
    profile.projectAssessments.push(projectAssessment._id);
    await projectAssessment.save();
    await profile.save();
  } else {
    projectAssessment.technicalData = analysis.technicalData;
    await projectAssessment.save();
  }

  // const interviewId = await saveInterviewDetails(
  //   profile,
  //   analysis.overallScore,
  //   analysis.skillAnalysis,
  //   formData
  // );

  // profile.quota++;

  // if (!profile.interviewDetails) {
  //   profile.interviewDetails = [];
  // }
  // profile.interviewDetails.push(interviewId);
  // await profile.save();

  return { analysis };
};
