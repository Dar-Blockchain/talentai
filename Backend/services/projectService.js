const { Together } = require("together-ai");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const {
  handleBusinessOverallScore,
  handleTechnicalOverallScore,
  handleAssessmentOverallScore,
  handleEligibility,
} = require("../utils/projectUtils");

const {
  PROJECT_ASSESSMENT_TYPE,
  TECHNICAL_ASSESSMENT_QUESTIONS_COUNT,
  BUSINESS_ASSESSMENT_QUESTIONS_COUNT,
  PITCH_DURATION,
  QUESTION_DURATION,
  PROJECT_STATUS,
  BUSINESS_QUESTION_DURATION,
  BUSINESS_PITCH_DURATION,
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
      throw new Error("The team must have at least one member.");
    }

    const teamWithTokens = data.team.map((member) => {
      if (!member.email) {
        throw new Error("Email is required for each team member.");
      }
      if (!member.role) {
        throw new Error("Role is required for each team member.");
      }
    
      const activationToken = crypto.randomBytes(20).toString("hex");
      const expiresAt = new Date(
        Date.now() + EXPIRATION_HOURS * 60 * 60 * 1000
      ); // 24h
    
      return {
        email: member.email,
        name: member.name,
        role: member.role,
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

    // create assessment for project (default status: pending)
    const projectAssessment = new ProjectAssessment({
      project: project._id,
      user: data.leaderId,
    });
    await projectAssessment.save();
    project.assessment = projectAssessment._id;
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
    console.error("Error while creating the project:", error);
    throw new Error(error.message);
  }
};


module.exports.activateTeamMember = async (projectId, token) => {
  try {
    const project = await Project.findById(projectId);
    if (!project) throw new Error("Project not found");

    const member = project.team.find((m) => m.activationToken === token);
    if (!member) throw new Error("Lien invalide ou déjà activé");

    if (!member.expiresAt || member.expiresAt < new Date())
      throw new Error(
        "Le lien d'activation a expiré. Demandez un nouvel envoi."
      );

    if (member.validated) throw new Error("Membre déjà validé");

    member.validated = true;
    member.activationToken = null;
    member.expiresAt = null;

    await project.save();
    return member;
  } catch (error) {
    console.error("Erreur lors de l'activation du membre:", error);
    throw error;
  }
};

module.exports.addMemberToTeam = async (projectId, member, baseUrl) => {
  const project = await Project.findById(projectId);
  if (!project) throw new Error("Projet introuvable");

  // Vérifier si le membre existe déjà dans l'équipe
  const existingMember = project.team.find((m) => m.email === member.email);
  if (existingMember) throw new Error("Le membre existe déjà dans l'équipe");

  if (!member.email || !member.role) {
    throw new Error("Email et rôle sont requis pour chaque membre.");
  }

  // Générer un nouveau token et une nouvelle expiration
  const activationToken = crypto.randomBytes(20).toString("hex");
  const expiresAt = new Date(Date.now() + EXPIRATION_HOURS * 60 * 60 * 1000); // 24h

  // Ajouter le nouveau membre à l'équipe, structure identique à la création
  const newMember = {
    email: member.email,
    name: member.name,
    role: member.role,
    validated: false,
    activationToken,
    expiresAt,
  };
  project.team.push(newMember);

  await project.save();

  // Générer et envoyer le lien d'activation
  const link = `${baseUrl}/projects/activate?projectId=${project._id}&token=${activationToken}`;
  await sendActivationEmail(member.email, link);

  return {
    success: true,
    message: "Membre ajouté avec succès et invitation envoyée.",
  };
};



// 3. Réinvitation d'un membre
module.exports.resendTeamInvitation = async (
  projectId,
  memberEmail,
  baseUrl
) => {
  try {
    const project = await Project.findById(projectId);
    if (!project) throw new Error("Projet introuvable");
    console.log("project", project);
    const member = project.team.find((m) => m.email === memberEmail);
    if (!member) throw new Error("Membre introuvable");
    console.log("member", member);

    if (member.validated)
      throw new Error("Ce membre a déjà validé son invitation.");

    // Nouveau token + nouvelle expiration
    member.activationToken = crypto.randomBytes(20).toString("hex");
    member.expiresAt = new Date(Date.now() + EXPIRATION_HOURS * 60 * 60 * 1000);
    console.log("membermember", member);

    await project.save();
    console.log("projectproject", project);

    // Envoi du mail
    const link = `${baseUrl}/projects/activate?projectId=${project._id}&token=${member.activationToken}`;
    await sendActivationEmail(member.email, link);
    console.log("link", link);

    return { success: true, message: "Nouvelle invitation envoyée." };
  } catch (error) {
    console.error("Erreur lors de l'activation du membre:", error);
    throw error;
  }
};

// Récupération de tous les projets
module.exports.getAllProjects = async (
  page,
  limit,
  sort,
  track,
  leaderId,
  name
) => {
  try {
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    const match = {};
    if (track && track.trim() !== "") match.track = track;
    if (leaderId) match.leaderId = leaderId;
    if (name && name.trim() !== "") {
      match.name = { $regex: name, $options: "i" };
    }

    // Prepare sort field and order
    let sortField = "createdAt"; // default sort
    let sortOrder = -1; // descending by default

    let filterTechnicalData = false;
    let filterBusinessData = false;
    let filterOverallScore = false;
    if (sort) {
      const rawField = sort.replace(/^[-+]/, "");
      sortOrder = sort.startsWith("-") ? -1 : 1;

      // Handle specific nested fields
      if (rawField === "overallScoreTechnical") {
        sortField = "assessment.technicalData.overallScore";
        filterTechnicalData = true;
      } else if (rawField === "overallScoreBusiness") {
        sortField = "assessment.businessData.overallScore";
        filterBusinessData = true;
      } else if (rawField === "overallScore") {
        sortField = "assessment.overallScore";
        filterOverallScore = true; 
      } else {
        sortField = rawField;
      }
    }

    const pipeline = [
      { $match: match },
      {
        $lookup: {
          from: "projectassessments",
          localField: "assessment",
          foreignField: "_id",
          as: "assessment",
        },
      },
      { $unwind: { path: "$assessment", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "users",
          localField: "leaderId",
          foreignField: "_id",
          as: "leaderId",
        },
      },
      { $unwind: { path: "$leaderId", preserveNullAndEmptyArrays: true } },
    ];

    // If sorting by overallScoreTechnical, only return projects that have technicalData
    if (filterTechnicalData) {
      pipeline.push({
        $match: {
          "assessment.technicalData.overallScore": { $exists: true, $ne: null }
        }
      });
    }

    // If sorting by overallScoreBusiness, only return projects that have businessData
    else if (filterBusinessData) {
      pipeline.push({
        $match: {
          "assessment.businessData.overallScore": { $exists: true, $ne: null }
        }
      });
    }

    // If sorting by overallScore, only return projects that have overallScore
    else if (filterOverallScore) {
      pipeline.push({
        $match: {
          "assessment.overallScore": { $exists: true, $ne: null }
        }
      });
    }

    pipeline.push({
      $sort: {
        [sortField]: sortOrder,
      },
    });

    // Count total before pagination
    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await Project.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;

    // Add pagination
    pipeline.push({ $skip: (page - 1) * limit });
    pipeline.push({ $limit: limit });

    // Fetch paginated results
    const paginatedProjects = await Project.aggregate(pipeline);

    // Add status to each project
    paginatedProjects.forEach((project) => {
      project.status = project.assessment?.status || "Pending";
    });

    return {
      total,
      page,
      limit,
      projects: paginatedProjects,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    throw new Error(`Erreur lors de la récupération des projets: ${error}`);
  }
};


// Récupération des projets de l'utilisateur connecté
module.exports.getMyProjects = async (userId) => {
  try {
    const projects = await Project.find({ leaderId: userId }).populate([
      { path: "assessment", model: "ProjectAssessment" },
      { path: "leaderId", model: "User" },
      { path: "leaderProfile", model: "Profile" }
    ]);
    
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

module.exports.generateProjectQuestions = async (project, assessmentType) => {
  try {
    let systemPrompt = "";
    let userPrompt = "";
    let pitchQuestion = "";

    const projectName = project.name;
    const projectTrack = project.track;
    const projectDescription = project.description;

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
        projectTrack,
        questionsCount,
        BUSINESS_QUESTION_DURATION
      );
      userPrompt = generateBusinessQuestionsPrompts.getUserPrompt(
        projectName,
        projectTrack,
        projectDescription,
        questionsCount
      );
      pitchQuestion =
        "In the next " +
        BUSINESS_PITCH_DURATION +
        " minutes, give us the big picture: what's your project, who's it for, and why will it make a difference?";
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

    if (assessmentType == PROJECT_ASSESSMENT_TYPE.BUSINESS) {
      questions = [pitchQuestion, ...questions];
    }

    if (assessmentType == PROJECT_ASSESSMENT_TYPE.TECHNICAL) {
      questions.push(pitchQuestion);
    }

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
        projectTrack
      );
      userPrompt = analyzeTechnicalAnswersPrompts.getUserPrompt(
        projectName,
        projectTrack,
        questions
      );
    }

    if (assessmentType == PROJECT_ASSESSMENT_TYPE.BUSINESS) {
      systemPrompt = analyzeBusinessAnswersPrompts.getSystemPrompt(
        projectName,
        projectTrack
      );
      userPrompt = analyzeBusinessAnswersPrompts.getUserPrompt(
        projectName,
        projectTrack,
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
      max_tokens: 4000,
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

    /// III.-1 Manage Scores in the analysis

    // IV. Store the projectAssessment in the project model
    if (!projectAssessment) {
      projectAssessment = new ProjectAssessment({
        project: project._id,
        user: user._id,
      });

      await projectAssessment.save();

      project.assessment = projectAssessment._id;
      await project.save();
    }

    if (assessmentType === PROJECT_ASSESSMENT_TYPE.TECHNICAL) {
      analysis.technicalData.overallScore = handleTechnicalOverallScore(
        analysis.technicalData
      );
      projectAssessment.technicalData = analysis.technicalData;
    } else if (assessmentType === PROJECT_ASSESSMENT_TYPE.BUSINESS) {
      analysis.businessData.overallScore = handleBusinessOverallScore(
        analysis.businessData
      );
      projectAssessment.businessData = analysis.businessData;
      projectAssessment.status = PROJECT_STATUS.IN_PROGRESS;
    }

    // FINALIZE assessment: update overallScore + update status to done
    // for now , we calculate the assessment overallScore after the technical assessment
    // will be chaged after integrating code assessment
    if (assessmentType === PROJECT_ASSESSMENT_TYPE.TECHNICAL) {
      projectAssessment.overallScore = handleAssessmentOverallScore(
        analysis.technicalData.overallScore,
        projectAssessment.businessData.overallScore
      );
      projectAssessment.status = PROJECT_STATUS.DONE;
    }

    await projectAssessment.save();

    await handleEligibility(projectAssessment, analysis, assessmentType);

    return { analysis };
  } catch (error) {
    console.error("Error analyzing answers:", error);
    throw new Error(`Error analyzing answers: ${error}`);
  }
};

module.exports.getAllTracks = async () => {
  // Returns an array of unique, non-empty tracks from all projects
  const tracks = await Project.distinct("track", {
    track: { $ne: null, $ne: "" },
  });
  return tracks;
};

module.exports.getProjectStats = async () => {
  try {
    // 1. Total Projects
    const totalProjects = await Project.countDocuments();

    // 2. Total Number of Tracks (distinct track names)
    const distinctTracks = await Project.distinct("track");
    const totalTracks = distinctTracks.length;

    // 3. Average Score
    const totalScores = await ProjectAssessment.aggregate([
      {
        $lookup: {
          from: "projects",
          localField: "project",
          foreignField: "_id",
          as: "projectDetails",
        },
      },
      { $unwind: "$projectDetails" },
      {
        $group: {
          _id: null,
          averageScore: { $avg: "$technicalData.overallScore" },
        },
      },
    ]);
    const averageScore = totalScores.length ? totalScores[0].averageScore : 0;

    // 4. Evaluated Projects (with assessment.status === "done")
    const evaluatedProjects = await ProjectAssessment.countDocuments({
      status: "done",
    });

    // 5. Total Team Members
    const totalTeamMembers = await Project.aggregate([
      { $unwind: "$team" },
      { $count: "totalTeamMembers" },
    ]);

    return {
      totalProjects,
      totalTracks,
      averageScore,
      evaluatedProjects,
      totalTeamMembers: totalTeamMembers.length
        ? totalTeamMembers[0].totalTeamMembers
        : 0,
    };
  } catch (error) {
    throw new Error("Error fetching project statistics: " + error.message);
  }
};

module.exports.getProjectsByTrack = async () => {
  try {
    const tracksWithCount = await Project.aggregate([
      {
        $group: {
          _id: "$track", // Group by track name
          count: { $sum: 1 }, // Count how many projects for each track
        },
      },
      {
        $project: {
          track: "$_id", // Rename _id to track
          count: 1, // Include count
          _id: 0, // Exclude _id field from result
        },
      },
    ]);
    return tracksWithCount;
  } catch (error) {
    throw new Error("Error fetching tracks with count: " + error.message);
  }
};

const moment = require("moment");

module.exports.getProjectsCreatedPerDay = async () => {
  try {
    const projectsPerDay = await Project.aggregate([
      {
        $addFields: {
          // Ensure the createdAt field is in date format (convert it if it's not already)
          createdAtDate: { $toDate: "$createdAt" },
        },
      },
      {
        $project: {
          // Format the createdAtDate field to only keep the date (without time)
          date: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAtDate" },
          },
        },
      },
      {
        $group: {
          _id: "$date", // Group by the formatted date
          count: { $sum: 1 }, // Count the number of projects created on each day
        },
      },
      {
        $sort: { _id: 1 }, // Sort by date in ascending order
      },
      {
        $project: {
          date: "$_id", // Rename _id to date
          count: 1, // Include count field
          _id: 0, // Exclude _id field from result
        },
      },
    ]);

    return projectsPerDay;
  } catch (error) {
    throw new Error(
      "Error fetching projects created per day: " + error.message
    );
  }
};

module.exports.getProjectsCountByStatus = async () => {
  try {
    const projectsByStatus = await ProjectAssessment.aggregate([
      {
        $addFields: {
          // Remplacez les valeurs null de 'status' par 'PENDING'
          status: { $ifNull: ["$status", "pending"] },
        },
      },
      {
        $group: {
          _id: "$status", // Group by the status field (which is now guaranteed to be non-null)
          count: { $sum: 1 }, // Count the number of projects with each status
        },
      },
      {
        $project: {
          status: "$_id", // Rename _id to status
          count: 1, // Include count
          _id: 0, // Exclude _id from the result
        },
      },
      {
        $sort: { status: 1 }, // Sort by status (optional, you can customize sorting)
      },
    ]);
    return projectsByStatus;
  } catch (error) {
    throw new Error(
      "Error fetching projects count by status: " + error.message
    );
  }
};

const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const {
  createExportDirIfNeeded,
  generateFilePath,
} = require("../utils/genPdf");

module.exports.exportProjectPdfService = async (projectId) => {
  const project = await Project.findById(projectId)
    .populate("assessment")
    .populate("leaderId");

  if (!project) throw new Error("Project not found");

  // Crée le répertoire si nécessaire
  const exportDir = path.join(__dirname, "../public");
  createExportDirIfNeeded(exportDir);

  const filePath = generateFilePath(project.name);
  console.log(`File will be saved at: ${filePath}`); // Debugging

  const doc = new PDFDocument();
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // Titre du projet
  doc.fontSize(18).text(`Project: ${project.name}`, { underline: true });
  doc.fontSize(12).text(`Description: ${project.description || "N/A"}`);
  doc.text(`Track: ${project.track || "N/A"}`);
  doc.moveDown();

  // Évaluation du projet
  if (project.assessment) {
    doc.fontSize(14).text("Assessment", { underline: true });
    doc
      .fontSize(12)
      .text(`Overall Score: ${project.assessment.overallScore ?? "N/A"}`);

    if (project.assessment.technicalData) {
      doc.moveDown().text("Technical Data", { underline: true });
      doc.text(
        `- Architecture Score: ${
          project.assessment.technicalData.architecture?.score ?? "N/A"
        }`
      );
      doc.text(
        `- Scalability Score: ${
          project.assessment.technicalData.scalabilityApproach?.score ?? "N/A"
        }`
      );
    }

    if (project.assessment.businessData) {
      doc.moveDown().text("Business Data", { underline: true });
      doc.text(
        `- Business Model Score: ${
          project.assessment.businessData.businessModel?.score ?? "N/A"
        }`
      );
      doc.text(
        `- Market Potential Score: ${
          project.assessment.businessData.marketPotential?.score ?? "N/A"
        }`
      );
    }

    doc.moveDown().text("Eligibility", { underline: true });
    doc.text(
      `Eligibility Status: ${
        project.assessment.eligibility?.isEligible ? "Eligible" : "Not Eligible"
      }`
    );
  } else {
    doc.text("No assessment data available.");
  }

  doc.moveDown().text("Team", { underline: true });
  (project.team || []).forEach((member) => {
    doc.text(
      `- ${member.email} (${member.validated ? "Validated" : "Not Validated"})`
    );
  });

  doc.end();

  return filePath;
};
