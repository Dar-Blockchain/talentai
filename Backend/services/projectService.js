const { Together } = require("together-ai");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const {
  handleBusinessOverallScore,
  handleTechnicalOverallScore,
  handleAssessmentOverallScore,
  handleEligibility,
  getComprehensiveCodeAnalysis,
  calculateCodeQualityScore,
  calculateDocumentationScore,
  calculateFunctionalityScore,
  calculateInnovationScore,
  calculateUserExperienceScore,
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
  const project = await Project.findById(projectId).populate("leaderId");
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
  await sendActivationEmail(member.email, link,project );

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
    const member = project.team.find((m) => m.email === memberEmail.trim());
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
    await sendActivationEmail(member.email, link, project);
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
          "assessment.technicalData.overallScore": { $exists: true, $ne: null },
        },
      });
    }

    // If sorting by overallScoreBusiness, only return projects that have businessData
    else if (filterBusinessData) {
      pipeline.push({
        $match: {
          "assessment.businessData.overallScore": { $exists: true, $ne: null },
        },
      });
    }

    // If sorting by overallScore, only return projects that have overallScore
    else if (filterOverallScore) {
      pipeline.push({
        $match: {
          "assessment.overallScore": { $exists: true, $ne: null },
        },
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
    let projects = await Project.find({ leaderId: userId }).populate([
      { 
        path: "assessment", 
        model: "ProjectAssessment",
        populate: { path: "codeAnalysis", model: "CodeAnalysis" }
      },
      { path: "leaderId", model: "User" },
      { path: "leaderProfile", model: "Profile" },
    ]);

    // Rename leaderId to leader in each project
    projects = projects.map((project) => {
      // Convert to plain object if it's a Mongoose document
      const projObj = project.toObject ? project.toObject() : project;
      if (projObj.leaderId) {
        projObj.leader = projObj.leaderId;
        delete projObj.leaderId;
      }
      return projObj;
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
    let project = await Project.findById(id)
      .populate([
        { 
          path: "assessment", 
          model: "ProjectAssessment",
          populate: { path: "codeAnalysis", model: "CodeAnalysis" }
        },
        { path: "leaderId", model: "User" }
      ]);

    if (!project) throw new Error("Projet non trouvé");

    if (project && project.leaderId) {
      project = project.toObject();
      project.leader = project.leaderId;
      delete project.leaderId;
    }
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
        projectDescription,
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
const { fetchRepoData } = require("../helpers/projectHelpers");
const { callTogetherAIWithTimeout } = require("../helpers/togetheraiHelpers");
const IntelligentProjectAnalyzer = require("../repoAnalyzer/intelligentAnalyzer");

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


const CodeAnalysis = require("../models/codeAnalysisModel");
module.exports.analyzeRepo = async (
  owner,
  repo,
  selectedTemplate = "auto",
  hackathonCriteria = null, 
  projectId
) => {

  const repoData = await fetchRepoData(owner, repo);  // Ensure fetchRepoData is working correctly

  // Display contributors and commits
  const numContributors = repoData.contributors
    ? repoData.contributors.length
    : 0;
  const numCommits = repoData.commits ? repoData.commits.length : 0;
  console.log(
    colorize(`👥 Contributors (${numContributors}): `, "magenta") +
      colorize(repoData.contributors.map((c) => c.login).join(", "), "white")
  );
  console.log(colorize(`🔢 Total commits: ${numCommits}`, "magenta"));

  if (repoData.commits && repoData.commits.length > 0) {
    const firstCommit = repoData.commits[repoData.commits.length - 1];
    const lastCommit = repoData.commits[0];
    console.log(
      colorize(
        `📅 First commit: ${firstCommit.date} by ${firstCommit.author}`,
        "magenta"
      )
    );
    console.log(
      colorize(
        `📅 Last commit: ${lastCommit.date} by ${lastCommit.author}`,
        "magenta"
      )
    );
  }
  // 1. Date check (repo creation and last commit)
  let datePass = true;
  let repoCreated, repoPushed, hackathonStart, hackathonEnd;

  try {
    repoCreated = new Date(repoData.created_at);
    if (isNaN(repoCreated)) throw new Error("Invalid repo created_at date");
  } catch (e) {
    eligibilityResults.startDate =
      "ERROR (Invalid or missing repo created_at date)";
    datePass = false;
  }
  try {
    repoPushed = new Date(repoData.pushed_at);
    if (isNaN(repoPushed)) throw new Error("Invalid repo pushed_at date");
  } catch (e) {
    eligibilityResults.deadline =
      "ERROR (Invalid or missing repo pushed_at date)";
    datePass = false;
  }
  try {
    hackathonStart = new Date(hackathonCriteria.startDate);
    if (isNaN(hackathonStart)) throw new Error("Invalid hackathon startDate");
  } catch (e) {
    eligibilityResults.startDate =
      "ERROR (Invalid or missing hackathon startDate)";
    datePass = false;
  }
  try {
    hackathonEnd = new Date(hackathonCriteria.deadline);
    if (isNaN(hackathonEnd)) throw new Error("Invalid hackathon deadline");
  } catch (e) {
    eligibilityResults.deadline =
      "ERROR (Invalid or missing hackathon deadline)";
    datePass = false;
  }
  if (
    repoCreated &&
    hackathonStart &&
    !isNaN(repoCreated) &&
    !isNaN(hackathonStart)
  ) {
    if (repoCreated < hackathonStart) {
      eligibilityResults.startDate = `FAIL (Repo created before hackathon: ${repoCreated
        .toISOString()
        .slice(0, 10)})`;
      datePass = false;
    } else {
      eligibilityResults.startDate = `PASS (${repoCreated
        .toISOString()
        .slice(0, 10)})`;
    }
  }
  if (
    repoPushed &&
    hackathonEnd &&
    !isNaN(repoPushed) &&
    !isNaN(hackathonEnd)
  ) {
    if (repoPushed > hackathonEnd) {
      eligibilityResults.deadline = `FAIL (Last commit after deadline: ${repoPushed
        .toISOString()
        .slice(0, 10)})`;
      datePass = false;
    } else {
      eligibilityResults.deadline = `PASS (${repoPushed
        .toISOString()
        .slice(0, 10)})`;
    }
  }
  eligible = eligible && datePass;
  // 2. Team size (contributors)
  let teamPass = true;
  if (hackathonCriteria.maxTeamSize) {
    const contributors = repoData.contributors
      ? repoData.contributors.length
      : 1;
    if (contributors > hackathonCriteria.maxTeamSize) {
      eligibilityResults.maxTeamSize = `FAIL (${contributors}/${hackathonCriteria.maxTeamSize})`;
      teamPass = false;
    } else {
      eligibilityResults.maxTeamSize = `PASS (${contributors}/${hackathonCriteria.maxTeamSize})`;
    }
    eligible = eligible && teamPass;
  }
  // 3. Originality (fork check)
  let originalityPass = true;
  if (hackathonCriteria.mustBeOriginal !== undefined) {
    if (repoData.fork && hackathonCriteria.mustBeOriginal) {
      eligibilityResults.mustBeOriginal = "FAIL (Repository is a fork)";
      originalityPass = false;
    } else {
      eligibilityResults.mustBeOriginal = "PASS (Original repository)";
    }
    eligible = eligible && originalityPass;
  }
  // 4. Demo required (check for demo video or demo.md)
  let demoPass = true;
  if (hackathonCriteria.demoRequired !== undefined) {
    const hasDemo =
      repoData.files &&
      Object.keys(repoData.files).some((f) => f.toLowerCase().includes("demo"));
    if (hackathonCriteria.demoRequired && !hasDemo) {
      eligibilityResults.demoRequired = "FAIL (No demo file found)";
      demoPass = false;
    } else if (hackathonCriteria.demoRequired) {
      eligibilityResults.demoRequired = "PASS (Demo file found)";
    } else {
      eligibilityResults.demoRequired = "N/A";
    }
    eligible = eligible && demoPass;
  }
  // Print results
  Object.entries(eligibilityResults).forEach(([k, v]) => {
    const status = v.startsWith("PASS")
      ? colorize("✅", "green")
      : v.startsWith("N/A")
      ? colorize("ℹ️", "blue")
      : v.startsWith("ERROR")
      ? colorize("❌", "red")
      : colorize("❌", "red");
    console.log(
      `${status} ${colorize(k, "yellow")}: ${colorize(
        v,
        v.startsWith("PASS")
          ? "green"
          : v.startsWith("ERROR")
          ? "red"
          : "yellow"
      )}`
    );
  });
  console.log(
    colorize(
      `\n${
        eligible
          ? "🎉 ELIGIBLE for hackathon judging!"
          : "🚫 NOT ELIGIBLE for hackathon judging."
      }`,
      eligible ? "green" : "red"
    )
  );

  ////
  let score = 0;
  let criteriaResults = {};
  let feedbacks = {};

  // Get comprehensive code analysis first
  console.log("Getting comprehensive code analysis...");
  const comprehensiveAnalysis = await getComprehensiveCodeAnalysis(
    repoData,
    selectedTemplate
  );

  // Analyze Code Quality (using objective metrics)
  console.log("Evaluating code quality...");
  const codeQualityResult = calculateCodeQualityScore(comprehensiveAnalysis);
  console.log("Code quality score:", codeQualityResult.score);
  criteriaResults.codeQuality = codeQualityResult.score;
  feedbacks.codeQuality = codeQualityResult.feedback;
  score += (codeQualityResult.score * CRITERIA_WEIGHTS.codeQuality) / 100;

  // Analyze Documentation (using objective metrics)
  console.log("Evaluating documentation...");
  const documentationResult = calculateDocumentationScore(
    comprehensiveAnalysis
  );
  console.log("Documentation score:", documentationResult.score);
  criteriaResults.documentation = documentationResult.score;
  feedbacks.documentation = documentationResult.feedback;
  score += (documentationResult.score * CRITERIA_WEIGHTS.documentation) / 100;

  // Evaluate Functionality (using objective metrics)
  console.log("Evaluating functionality...");
  const functionalityResult = calculateFunctionalityScore(
    comprehensiveAnalysis
  );
  console.log("Functionality score:", functionalityResult.score);
  criteriaResults.functionality = functionalityResult.score;
  feedbacks.functionality = functionalityResult.feedback;
  score += (functionalityResult.score * CRITERIA_WEIGHTS.functionality) / 100;

  // Evaluate Innovation (using objective metrics)
  console.log("Evaluating innovation...");
  const innovationResult = calculateInnovationScore(comprehensiveAnalysis);
  console.log("Innovation score:", innovationResult.score);
  criteriaResults.innovation = innovationResult.score;
  feedbacks.innovation = innovationResult.feedback;
  score += (innovationResult.score * CRITERIA_WEIGHTS.innovation) / 100;

  // Evaluate User Experience (using objective metrics)
  console.log("Evaluating user experience...");
  const userExperienceResult = calculateUserExperienceScore(
    comprehensiveAnalysis
  );
  console.log("User experience score:", userExperienceResult.score);
  criteriaResults.userExperience = userExperienceResult.score;
  feedbacks.userExperience = userExperienceResult.feedback;
  score += (userExperienceResult.score * CRITERIA_WEIGHTS.userExperience) / 100;

  // Final score (0-10)
  const finalScore = score.toFixed(1);
  console.log("Final score calculated:", finalScore);

  // --- LLM Hackathon Feasibility Check ---
  let llmFeasibility = null;
  if (hackathonCriteria && repoData.commits && repoData.contributors) {
    const hackathonDays =
      Math.ceil(
        (new Date(hackathonCriteria.deadline) -
          new Date(hackathonCriteria.startDate)) /
          (1000 * 60 * 60 * 24)
      ) + 1;
    const prompt =
      `You are a hackathon judge. The following project was completed by ${repoData.contributors.length} contributors in ${repoData.commits.length} commits, between ${hackathonCriteria.startDate} and ${hackathonCriteria.deadline} (${hackathonDays} days). Here is a summary of the project:\n\n` +
      `Project type: ${comprehensiveAnalysis.projectType}\n` +
      `Main features: ${
        innovationResult && innovationResult.features
          ? innovationResult.features.join(", ")
          : "N/A"
      }\n` +
      `Codebase size: ${comprehensiveAnalysis.summary.totalLines} lines, ${comprehensiveAnalysis.summary.totalFiles} files.\n` +
      `Please answer: Is it realistic for a team of ${repoData.contributors.length} to build this project in ${hackathonDays} days? Answer YES or NO and explain why. If it looks suspiciously large or complex, say so.`;
    try {
      const response = await callTogetherAIWithTimeout(
        {
          messages: [
            { role: "system", content: "You are an expert hackathon judge." },
            { role: "user", content: prompt },
          ],
          model: "deepseek-ai/DeepSeek-V3",
        },
        "hackathon feasibility"
      );
      llmFeasibility = response.choices[0].message.content;
      console.log(section("LLM HACKATHON FEASIBILITY JUDGMENT", "🤖", "blue"));
      console.log(colorize(llmFeasibility, "white"));
    } catch (e) {
      console.warn("LLM feasibility check failed:", e.message);
    }
  }

  //---------- Run intelligent analysis---------
  console.log("\n🧠 RUNNING INTELLIGENT ANALYSIS...");
  const intelligentAnalyzer = new IntelligentProjectAnalyzer();
  const intelligentAnalysis = await intelligentAnalyzer.analyzeRepository(
    owner,
    repo
  );

  // Display intelligent analysis results
  if (intelligentAnalysis) {
    console.log(section("🧠 INTELLIGENT ANALYSIS RESULTS", "🧠", "cyan"));

    // Project Purpose with clear conclusion
    console.log("\n🎯 PROJECT PURPOSE:");
    if (intelligentAnalysis.projectPurpose.conclusion) {
      console.log(
        `   💡 CONCLUSION: ${intelligentAnalysis.projectPurpose.conclusion}`
      );
    }
    console.log(`   Type: ${intelligentAnalysis.projectPurpose.type}`);
    console.log(`   Domain: ${intelligentAnalysis.projectPurpose.domain}`);
    console.log(
      `   Complexity: ${intelligentAnalysis.projectPurpose.complexity}`
    );
    console.log(
      `   Target Audience: ${intelligentAnalysis.projectPurpose.target}`
    );
    console.log(
      `   Confidence: ${Math.round(
        intelligentAnalysis.projectPurpose.confidence * 100
      )}%`
    );

    if (intelligentAnalysis.projectPurpose.description) {
      console.log(
        `   Description: ${intelligentAnalysis.projectPurpose.description}`
      );
    }

    if (
      intelligentAnalysis.projectPurpose.features &&
      intelligentAnalysis.projectPurpose.features.length > 0
    ) {
      console.log(
        `   Main Features: ${intelligentAnalysis.projectPurpose.features.join(
          ", "
        )}`
      );
    }

    if (
      intelligentAnalysis.projectPurpose.technologies &&
      intelligentAnalysis.projectPurpose.technologies.length > 0
    ) {
      console.log(
        `   Technology Stack: ${intelligentAnalysis.projectPurpose.technologies.join(
          ", "
        )}`
      );
    }

    if (
      intelligentAnalysis.projectPurpose.keyFiles &&
      intelligentAnalysis.projectPurpose.keyFiles.length > 0
    ) {
      console.log(
        `   Key Files: ${intelligentAnalysis.projectPurpose.keyFiles
          .slice(0, 5)
          .join(", ")}${
          intelligentAnalysis.projectPurpose.keyFiles.length > 5 ? "..." : ""
        }`
      );
    }

    // Architecture
    console.log("\n🏗️ ARCHITECTURE:");
    console.log(`   Pattern: ${intelligentAnalysis.architecture.pattern}`);
    console.log(
      `   Layers: ${intelligentAnalysis.architecture.layers.join(", ")}`
    );
    console.log(
      `   Design Patterns: ${intelligentAnalysis.architecture.patterns.join(
        ", "
      )}`
    );
    console.log(
      `   Quality Score: ${intelligentAnalysis.architecture.quality}/10`
    );
    if (intelligentAnalysis.architecture.strengths.length > 0) {
      console.log(
        `   Strengths: ${intelligentAnalysis.architecture.strengths.join(", ")}`
      );
    }
    if (intelligentAnalysis.architecture.weaknesses.length > 0) {
      console.log(
        `   Weaknesses: ${intelligentAnalysis.architecture.weaknesses.join(
          ", "
        )}`
      );
    }

    // Coherence
    console.log("\n🔗 COHERENCE:");
    console.log(
      `   Overall Consistency: ${intelligentAnalysis.coherence.consistency.toFixed(
        1
      )}/10`
    );
    console.log(
      `   Naming Consistency: ${intelligentAnalysis.coherence.naming.toFixed(
        1
      )}/10`
    );
    console.log(
      `   Structural Consistency: ${intelligentAnalysis.coherence.structure.toFixed(
        1
      )}/10`
    );
    console.log(
      `   Pattern Consistency: ${intelligentAnalysis.coherence.patterns.toFixed(
        1
      )}/10`
    );

    // Quality
    console.log("\n📊 CODE QUALITY:");
    console.log(
      `   Overall Quality: ${intelligentAnalysis.quality.overall.toFixed(1)}/10`
    );
    console.log(
      `   Maintainability: ${intelligentAnalysis.quality.maintainability.toFixed(
        1
      )}/10`
    );
    console.log(
      `   Readability: ${intelligentAnalysis.quality.readability.toFixed(1)}/10`
    );
    console.log(
      `   Performance: ${intelligentAnalysis.quality.performance.toFixed(1)}/10`
    );
    console.log(
      `   Security: ${intelligentAnalysis.quality.security.toFixed(1)}/10`
    );
    console.log(
      `   Testability: ${intelligentAnalysis.quality.testability.toFixed(1)}/10`
    );

    // File Structure Summary
    if (intelligentAnalysis.structure) {
      console.log("\n📁 FILE STRUCTURE SUMMARY:");
      console.log(
        `   Total Files Analyzed: ${intelligentAnalysis.structure.allFiles.length}`
      );
      console.log(
        `   Total Directories: ${intelligentAnalysis.structure.allDirectories.length}`
      );
      console.log(
        `   Files with Content Analysis: ${
          Object.keys(intelligentAnalysis.structure.fileContents).length
        }`
      );

      // Show file types distribution
      const fileTypes = {};
      intelligentAnalysis.structure.allFiles.forEach((file) => {
        const ext = file.split(".").pop().toLowerCase();
        fileTypes[ext] = (fileTypes[ext] || 0) + 1;
      });
      console.log(
        `   File Types: ${Object.entries(fileTypes)
          .map(([ext, count]) => `${ext}(${count})`)
          .join(", ")}`
      );
    }

    // Intelligent Insights
    console.log("\n💡 INTELLIGENT INSIGHTS:");
    intelligentAnalysis.insights.forEach((insight, index) => {
      const emoji =
        insight.category === "strength"
          ? colorize("✅", "green")
          : insight.category === "improvement"
          ? colorize("⚠️", "yellow")
          : insight.category === "understanding"
          ? colorize("🧠", "cyan")
          : insight.category === "information"
          ? colorize("📊", "magenta")
          : colorize("💡", "green");
      console.log(
        `   ${emoji} ${insight.title} (${Math.round(
          insight.confidence * 100
        )}% confidence)`
      );
      console.log(`      ${insight.message}`);
    });
  }

  // Get comprehensive code analysis for detailed feedback
  console.log("\n=== COMPREHENSIVE CODE ANALYSIS ===");

  // Print comprehensive feedback
  console.log("\n📊 PROJECT STRUCTURE ANALYSIS:");
  console.log(`Project Type: ${comprehensiveAnalysis.projectType}`);
  console.log(
    `Total Files Analyzed: ${comprehensiveAnalysis.summary.totalFiles}`
  );
  console.log(
    `Total Lines of Code: ${comprehensiveAnalysis.summary.totalLines}`
  );
  console.log(`File Types:`, comprehensiveAnalysis.summary.fileTypes);

  // Print detailed file feedback
  console.log("\n📁 DETAILED FILE ANALYSIS:");
  Object.keys(comprehensiveAnalysis.files).forEach((fileName) => {
    const file = comprehensiveAnalysis.files[fileName];
    console.log(`\n📄 ${fileName}:`);
    console.log(`   Lines: ${file.lines}`);
    console.log(`   Size: ${file.size} characters`);
    console.log(`   Type: ${file.type}`);

    // Show first few lines as preview
    const preview = file.content.split("\n").slice(0, 3).join("\n   ");
    console.log(`   Preview:\n   ${preview}...`);
  });

  // Print feedbacks for each criterion
  Object.keys(feedbacks).forEach((key) => {
    console.log(`\n${key.charAt(0).toUpperCase() + key.slice(1)} Feedback:`);
    console.log(feedbacks[key]);
  });


  //***** */
  const codeAnalysis = await CodeAnalysis.create({
    githubLink,
    owner,
    repo,
    analysis: result,
    criteriaResults: res1.criteriaResults,
    feedbacks:res1.feedbacks,
    // res.intelligentAnalysis data are already present in the analysis:result
    finalScore: res1.finalScore,
    comprehensiveAnalysis: res1.comprehensiveAnalysis,
    contributors: res1.contributors,
    totalCommits: res1.totalCommits,
    firstCommit: res1.firstCommit,
    lastCommit: res1.lastCommit,
    startDateCheck: res1.startDateCheck,
    deadlineCheck: res1.deadlineCheck,
    maxTeamSizeCheck: res1.maxTeamSizeCheck,
    mustBeOriginalCheck: res1.mustBeOriginalCheck,
    demoRequiredCheck: res1.demoRequiredCheck,
  });

  console.log("check code: ", codeAnalysis._id);

  let projectAssessment = await ProjectAssessment.findOne({project: projectId});
  projectAssessment.codeAnalysis = codeAnalysis._id;
  await projectAssessment.save();

  console.log("check assessment: ", projectAssessment._id);

  //****** */


  return {
    repoName: repoData.name,
    criteriaResults,
    feedbacks,
    finalScore,
    comprehensiveAnalysis,
    intelligentAnalysis,
  };
};
