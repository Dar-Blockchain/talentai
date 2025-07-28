const projectService = require("../services/projectService");
const Profile = require("../models/ProfileModel");
const Project = require("../models/projectModel");
const { HttpError } = require("../utils/httpUtils");
const { PROJECT_ASSESSMENT_TYPE } = require("../constants/projectConstants");
const ProjectAssessment = require("../models/projectAssessmentModel");

// Créer un projet
module.exports.createProject = async (req, res) => {
  try {
    const sender = req.user; 

    const baseUrl = process.env.BASE_URL; // Adapte selon ton env
    const data = req.body;
    data.leaderId = req.user._id;

    const newProject = await projectService.createProject(data, baseUrl, sender.email );
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
  const { projectId, email, name, role } = req.body;
  const baseUrl = process.env.BASE_URL;

  const sender = req.user; 

  try {
    const result = await projectService.addMemberToTeam(
      projectId,
      { email, name, role },
      baseUrl, 
      sender.email
    );
    res.status(200).json(result);
  } catch (error) {
    console.error("Erreur lors de l'ajout du membre :", error);
    res.status(400).json({ error: error.message });
  }
};

// 3. Réinviter un membre dont le lien d'activation a expiré
module.exports.resendTeamInvitation = async (req, res) => {
  const { projectId, email } = req.body;
  const sender = req.user; 

  const baseUrl = process.env.BASE_URL; // Récupérer l'URL de base de l'application

  try {
    const result = await projectService.resendTeamInvitation(
      projectId,
      email,
      baseUrl, 
      sender.email
    );
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

    const result = await projectService.generateProjectQuestions(
      project,
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
            message:
              "Business Assessment must take place before Technical assessment",
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
    res.status(500).json({
      message: "Failed to fetch project tracks",
      error: error.message,
    });
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

module.exports.getProjectsByTrack = async (req, res) => {
  try {
    const projectsByTrack = await projectService.getProjectsByTrack();
    res.status(200).json(projectsByTrack);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports.getProjectsCreatedPerDay = async (req, res) => {
  try {
    const projectsCreatedPerDay =
      await projectService.getProjectsCreatedPerDay();
    res.status(200).json(projectsCreatedPerDay);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports.getProjectsCountByStatus = async (req, res) => {
  try {
    const projectsCountByStatus =
      await projectService.getProjectsCountByStatus();
    res.status(200).json(projectsCountByStatus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const puppeteer = require("puppeteer");
const ejs = require("ejs");
const fs = require("fs");
const path = require("path");

// Helpers
function renderScoreClass(score) {
  if (score === undefined || score === null) return "grey";
  if (score < 50) return "red";
  if (score < 80) return "yellow";
  return "green";
}
function renderScoreText(score) {
  if (score === undefined || score === null) return "N/A";
  return score + "%";
}

module.exports.exportProjectPdf = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const project = await Project.findById(projectId)
      .populate("assessment")
      .populate("leaderId");
    if (!project || !project.assessment)
      throw new Error("Project or assessment not found");

    // Render le HTML depuis EJS
    const html = await ejs.renderFile(
      path.join(__dirname, "../views/project-pdf.ejs"),
      {
        project: project.toObject(), // simplifie la sérialisation
        assessment: project.assessment,
        renderScoreClass,
        renderScoreText,
      }
    );

    // Chemin de sortie
    const exportDir = path.join(__dirname, "../public");
    if (!fs.existsSync(exportDir)) fs.mkdirSync(exportDir);
    const filePath = path.join(
      exportDir,
      `${project.name.replace(/[^a-z0-9]/gi, "_")}_PdfAssessment.pdf`
    );

    // Générer PDF avec Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"], // option utile en prod
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    await page.pdf({ path: filePath, format: "A4", printBackground: true });
    await browser.close();

    // Envoyer le fichier PDF pour téléchargement
    res.download(filePath, (err) => {
      if (err) {
        console.error("Error sending PDF:", err);
        res.status(500).send("Error sending PDF");
      }
      fs.unlink(filePath, () => {});
    });
  } catch (error) {
    console.error("Error generating or sending PDF:", error);
    res.status(500).send("Failed to generate PDF");
  }
};

// ------- code analysis------------

// const analyzeRepo = async (
//   owner,
//   repo,
//   selectedTemplate = "auto",
//   hackathonCriteria = null
// ) => {
//   try {
//     console.log("Fetching repo data...");
//     const repoData = await fetchRepoData(owner, repo); // Ensure fetchRepoData is working correctly
//     console.log("Repo data fetched:", repoData);

//     console.log("check selected template: ", selectedTemplate);

//     await new Promise((resolve) => setTimeout(resolve, 3000));

//     // --- Hackathon Eligibility Check ---
//     let eligibilityResults = {};
//     let eligible = true;
//     if (hackathonCriteria) {
//       // Display contributors and commits
//       const numContributors = repoData.contributors
//         ? repoData.contributors.length
//         : 0;
//       const numCommits = repoData.commits ? repoData.commits.length : 0;
//       console.log(
//         colorize(`👥 Contributors (${numContributors}): `, "magenta") +
//           colorize(
//             repoData.contributors.map((c) => c.login).join(", "),
//             "white"
//           )
//       );
//       console.log(colorize(`🔢 Total commits: ${numCommits}`, "magenta"));
//       if (repoData.commits && repoData.commits.length > 0) {
//         const firstCommit = repoData.commits[repoData.commits.length - 1];
//         const lastCommit = repoData.commits[0];
//         console.log(
//           colorize(
//             `📅 First commit: ${firstCommit.date} by ${firstCommit.author}`,
//             "magenta"
//           )
//         );
//         console.log(
//           colorize(
//             `📅 Last commit: ${lastCommit.date} by ${lastCommit.author}`,
//             "magenta"
//           )
//         );
//       }
//       // 1. Date check (repo creation and last commit)
//       let datePass = true;
//       let repoCreated, repoPushed, hackathonStart, hackathonEnd;
//       try {
//         repoCreated = new Date(repoData.created_at);
//         if (isNaN(repoCreated)) throw new Error("Invalid repo created_at date");
//       } catch (e) {
//         eligibilityResults.startDate =
//           "ERROR (Invalid or missing repo created_at date)";
//         datePass = false;
//       }
//       try {
//         repoPushed = new Date(repoData.pushed_at);
//         if (isNaN(repoPushed)) throw new Error("Invalid repo pushed_at date");
//       } catch (e) {
//         eligibilityResults.deadline =
//           "ERROR (Invalid or missing repo pushed_at date)";
//         datePass = false;
//       }
//       try {
//         hackathonStart = new Date(hackathonCriteria.startDate);
//         if (isNaN(hackathonStart))
//           throw new Error("Invalid hackathon startDate");
//       } catch (e) {
//         eligibilityResults.startDate =
//           "ERROR (Invalid or missing hackathon startDate)";
//         datePass = false;
//       }
//       try {
//         hackathonEnd = new Date(hackathonCriteria.deadline);
//         if (isNaN(hackathonEnd)) throw new Error("Invalid hackathon deadline");
//       } catch (e) {
//         eligibilityResults.deadline =
//           "ERROR (Invalid or missing hackathon deadline)";
//         datePass = false;
//       }
//       if (
//         repoCreated &&
//         hackathonStart &&
//         !isNaN(repoCreated) &&
//         !isNaN(hackathonStart)
//       ) {
//         if (repoCreated < hackathonStart) {
//           eligibilityResults.startDate = `FAIL (Repo created before hackathon: ${repoCreated
//             .toISOString()
//             .slice(0, 10)})`;
//           datePass = false;
//         } else {
//           eligibilityResults.startDate = `PASS (${repoCreated
//             .toISOString()
//             .slice(0, 10)})`;
//         }
//       }
//       if (
//         repoPushed &&
//         hackathonEnd &&
//         !isNaN(repoPushed) &&
//         !isNaN(hackathonEnd)
//       ) {
//         if (repoPushed > hackathonEnd) {
//           eligibilityResults.deadline = `FAIL (Last commit after deadline: ${repoPushed
//             .toISOString()
//             .slice(0, 10)})`;
//           datePass = false;
//         } else {
//           eligibilityResults.deadline = `PASS (${repoPushed
//             .toISOString()
//             .slice(0, 10)})`;
//         }
//       }
//       eligible = eligible && datePass;
//       // 2. Team size (contributors)
//       let teamPass = true;
//       if (hackathonCriteria.maxTeamSize) {
//         const contributors = repoData.contributors
//           ? repoData.contributors.length
//           : 1;
//         if (contributors > hackathonCriteria.maxTeamSize) {
//           eligibilityResults.maxTeamSize = `FAIL (${contributors}/${hackathonCriteria.maxTeamSize})`;
//           teamPass = false;
//         } else {
//           eligibilityResults.maxTeamSize = `PASS (${contributors}/${hackathonCriteria.maxTeamSize})`;
//         }
//         eligible = eligible && teamPass;
//       }
//       // 3. Originality (fork check)
//       let originalityPass = true;
//       if (hackathonCriteria.mustBeOriginal !== undefined) {
//         if (repoData.fork && hackathonCriteria.mustBeOriginal) {
//           eligibilityResults.mustBeOriginal = "FAIL (Repository is a fork)";
//           originalityPass = false;
//         } else {
//           eligibilityResults.mustBeOriginal = "PASS (Original repository)";
//         }
//         eligible = eligible && originalityPass;
//       }
//       // 4. Demo required (check for demo video or demo.md)
//       let demoPass = true;
//       if (hackathonCriteria.demoRequired !== undefined) {
//         const hasDemo =
//           repoData.files &&
//           Object.keys(repoData.files).some((f) =>
//             f.toLowerCase().includes("demo")
//           );
//         if (hackathonCriteria.demoRequired && !hasDemo) {
//           eligibilityResults.demoRequired = "FAIL (No demo file found)";
//           demoPass = false;
//         } else if (hackathonCriteria.demoRequired) {
//           eligibilityResults.demoRequired = "PASS (Demo file found)";
//         } else {
//           eligibilityResults.demoRequired = "N/A";
//         }
//         eligible = eligible && demoPass;
//       }
//       // Print results
//       Object.entries(eligibilityResults).forEach(([k, v]) => {
//         const status = v.startsWith("PASS")
//           ? colorize("✅", "green")
//           : v.startsWith("N/A")
//           ? colorize("ℹ️", "blue")
//           : v.startsWith("ERROR")
//           ? colorize("❌", "red")
//           : colorize("❌", "red");
//         console.log(
//           `${status} ${colorize(k, "yellow")}: ${colorize(
//             v,
//             v.startsWith("PASS")
//               ? "green"
//               : v.startsWith("ERROR")
//               ? "red"
//               : "yellow"
//           )}`
//         );
//       });
//       console.log(
//         colorize(
//           `\n${
//             eligible
//               ? "🎉 ELIGIBLE for hackathon judging!"
//               : "🚫 NOT ELIGIBLE for hackathon judging."
//           }`,
//           eligible ? "green" : "red"
//         )
//       );
//     }

//     console.log("check eligibility: ", eligibilityResults);

//     let score = 0;
//     let criteriaResults = {};
//     let feedbacks = {};

//     // Get comprehensive code analysis first
//     console.log("Getting comprehensive code analysis...");
//     const comprehensiveAnalysis = await getComprehensiveCodeAnalysis(
//       repoData,
//       selectedTemplate
//     );

//     // Analyze Code Quality (using objective metrics)
//     console.log("Evaluating code quality...");
//     const codeQualityResult = calculateCodeQualityScore(comprehensiveAnalysis);
//     console.log("Code quality score:", codeQualityResult.score);
//     criteriaResults.codeQuality = codeQualityResult.score;
//     feedbacks.codeQuality = codeQualityResult.feedback;
//     score += (codeQualityResult.score * CRITERIA_WEIGHTS.codeQuality) / 100;

//     // Analyze Documentation (using objective metrics)
//     console.log("Evaluating documentation...");
//     const documentationResult = calculateDocumentationScore(
//       comprehensiveAnalysis
//     );
//     console.log("Documentation score:", documentationResult.score);
//     criteriaResults.documentation = documentationResult.score;
//     feedbacks.documentation = documentationResult.feedback;
//     score += (documentationResult.score * CRITERIA_WEIGHTS.documentation) / 100;

//     // Evaluate Functionality (using objective metrics)
//     console.log("Evaluating functionality...");
//     const functionalityResult = calculateFunctionalityScore(
//       comprehensiveAnalysis
//     );
//     console.log("Functionality score:", functionalityResult.score);
//     criteriaResults.functionality = functionalityResult.score;
//     feedbacks.functionality = functionalityResult.feedback;
//     score += (functionalityResult.score * CRITERIA_WEIGHTS.functionality) / 100;

//     // Evaluate Innovation (using objective metrics)
//     console.log("Evaluating innovation...");
//     const innovationResult = calculateInnovationScore(comprehensiveAnalysis);
//     console.log("Innovation score:", innovationResult.score);
//     criteriaResults.innovation = innovationResult.score;
//     feedbacks.innovation = innovationResult.feedback;
//     score += (innovationResult.score * CRITERIA_WEIGHTS.innovation) / 100;

//     // Evaluate User Experience (using objective metrics)
//     console.log("Evaluating user experience...");
//     const userExperienceResult = calculateUserExperienceScore(
//       comprehensiveAnalysis
//     );
//     console.log("User experience score:", userExperienceResult.score);
//     criteriaResults.userExperience = userExperienceResult.score;
//     feedbacks.userExperience = userExperienceResult.feedback;
//     score +=
//       (userExperienceResult.score * CRITERIA_WEIGHTS.userExperience) / 100;

//     // Final score (0-10)
//     const finalScore = score.toFixed(1);
//     console.log("Final score calculated:", finalScore);

//     // --- LLM Hackathon Feasibility Check ---
//     let llmFeasibility = null;
//     if (hackathonCriteria && repoData.commits && repoData.contributors) {
//       const hackathonDays =
//         Math.ceil(
//           (new Date(hackathonCriteria.deadline) -
//             new Date(hackathonCriteria.startDate)) /
//             (1000 * 60 * 60 * 24)
//         ) + 1;
//       const prompt =
//         `You are a hackathon judge. The following project was completed by ${repoData.contributors.length} contributors in ${repoData.commits.length} commits, between ${hackathonCriteria.startDate} and ${hackathonCriteria.deadline} (${hackathonDays} days). Here is a summary of the project:\n\n` +
//         `Project type: ${comprehensiveAnalysis.projectType}\n` +
//         `Main features: ${
//           innovationResult && innovationResult.features
//             ? innovationResult.features.join(", ")
//             : "N/A"
//         }\n` +
//         `Codebase size: ${comprehensiveAnalysis.summary.totalLines} lines, ${comprehensiveAnalysis.summary.totalFiles} files.\n` +
//         `Please answer: Is it realistic for a team of ${repoData.contributors.length} to build this project in ${hackathonDays} days? Answer YES or NO and explain why. If it looks suspiciously large or complex, say so.`;
//       try {
//         const response = await callTogetherAIWithTimeout(
//           {
//             messages: [
//               { role: "system", content: "You are an expert hackathon judge." },
//               { role: "user", content: prompt },
//             ],
//             model: "deepseek-ai/DeepSeek-V3",
//           },
//           "hackathon feasibility"
//         );
//         llmFeasibility = response.choices[0].message.content;
//         console.log(
//           section("LLM HACKATHON FEASIBILITY JUDGMENT", "🤖", "blue")
//         );
//         console.log(colorize(llmFeasibility, "white"));
//       } catch (e) {
//         console.warn("LLM feasibility check failed:", e.message);
//       }
//     }

//     // Run intelligent analysis
//     console.log("\n🧠 RUNNING INTELLIGENT ANALYSIS...");
//     const intelligentAnalyzer = new IntelligentProjectAnalyzer();
//     const intelligentAnalysis = await intelligentAnalyzer.analyzeRepository(
//       owner,
//       repo
//     );

//     // Display intelligent analysis results
//     if (intelligentAnalysis) {
//       console.log(section("🧠 INTELLIGENT ANALYSIS RESULTS", "🧠", "cyan"));

//       // Project Purpose with clear conclusion
//       console.log("\n🎯 PROJECT PURPOSE:");
//       if (intelligentAnalysis.projectPurpose.conclusion) {
//         console.log(
//           `   💡 CONCLUSION: ${intelligentAnalysis.projectPurpose.conclusion}`
//         );
//       }
//       console.log(`   Type: ${intelligentAnalysis.projectPurpose.type}`);
//       console.log(`   Domain: ${intelligentAnalysis.projectPurpose.domain}`);
//       console.log(
//         `   Complexity: ${intelligentAnalysis.projectPurpose.complexity}`
//       );
//       console.log(
//         `   Target Audience: ${intelligentAnalysis.projectPurpose.target}`
//       );
//       console.log(
//         `   Confidence: ${Math.round(
//           intelligentAnalysis.projectPurpose.confidence * 100
//         )}%`
//       );

//       if (intelligentAnalysis.projectPurpose.description) {
//         console.log(
//           `   Description: ${intelligentAnalysis.projectPurpose.description}`
//         );
//       }

//       if (
//         intelligentAnalysis.projectPurpose.features &&
//         intelligentAnalysis.projectPurpose.features.length > 0
//       ) {
//         console.log(
//           `   Main Features: ${intelligentAnalysis.projectPurpose.features.join(
//             ", "
//           )}`
//         );
//       }

//       if (
//         intelligentAnalysis.projectPurpose.technologies &&
//         intelligentAnalysis.projectPurpose.technologies.length > 0
//       ) {
//         console.log(
//           `   Technology Stack: ${intelligentAnalysis.projectPurpose.technologies.join(
//             ", "
//           )}`
//         );
//       }

//       if (
//         intelligentAnalysis.projectPurpose.keyFiles &&
//         intelligentAnalysis.projectPurpose.keyFiles.length > 0
//       ) {
//         console.log(
//           `   Key Files: ${intelligentAnalysis.projectPurpose.keyFiles
//             .slice(0, 5)
//             .join(", ")}${
//             intelligentAnalysis.projectPurpose.keyFiles.length > 5 ? "..." : ""
//           }`
//         );
//       }

//       // Architecture
//       console.log("\n🏗️ ARCHITECTURE:");
//       console.log(`   Pattern: ${intelligentAnalysis.architecture.pattern}`);
//       console.log(
//         `   Layers: ${intelligentAnalysis.architecture.layers.join(", ")}`
//       );
//       console.log(
//         `   Design Patterns: ${intelligentAnalysis.architecture.patterns.join(
//           ", "
//         )}`
//       );
//       console.log(
//         `   Quality Score: ${intelligentAnalysis.architecture.quality}/10`
//       );
//       if (intelligentAnalysis.architecture.strengths.length > 0) {
//         console.log(
//           `   Strengths: ${intelligentAnalysis.architecture.strengths.join(
//             ", "
//           )}`
//         );
//       }
//       if (intelligentAnalysis.architecture.weaknesses.length > 0) {
//         console.log(
//           `   Weaknesses: ${intelligentAnalysis.architecture.weaknesses.join(
//             ", "
//           )}`
//         );
//       }

//       // Coherence
//       console.log("\n🔗 COHERENCE:");
//       console.log(
//         `   Overall Consistency: ${intelligentAnalysis.coherence.consistency.toFixed(
//           1
//         )}/10`
//       );
//       console.log(
//         `   Naming Consistency: ${intelligentAnalysis.coherence.naming.toFixed(
//           1
//         )}/10`
//       );
//       console.log(
//         `   Structural Consistency: ${intelligentAnalysis.coherence.structure.toFixed(
//           1
//         )}/10`
//       );
//       console.log(
//         `   Pattern Consistency: ${intelligentAnalysis.coherence.patterns.toFixed(
//           1
//         )}/10`
//       );

//       // Quality
//       console.log("\n📊 CODE QUALITY:");
//       console.log(
//         `   Overall Quality: ${intelligentAnalysis.quality.overall.toFixed(
//           1
//         )}/10`
//       );
//       console.log(
//         `   Maintainability: ${intelligentAnalysis.quality.maintainability.toFixed(
//           1
//         )}/10`
//       );
//       console.log(
//         `   Readability: ${intelligentAnalysis.quality.readability.toFixed(
//           1
//         )}/10`
//       );
//       console.log(
//         `   Performance: ${intelligentAnalysis.quality.performance.toFixed(
//           1
//         )}/10`
//       );
//       console.log(
//         `   Security: ${intelligentAnalysis.quality.security.toFixed(1)}/10`
//       );
//       console.log(
//         `   Testability: ${intelligentAnalysis.quality.testability.toFixed(
//           1
//         )}/10`
//       );

//       // File Structure Summary
//       if (intelligentAnalysis.structure) {
//         console.log("\n📁 FILE STRUCTURE SUMMARY:");
//         console.log(
//           `   Total Files Analyzed: ${intelligentAnalysis.structure.allFiles.length}`
//         );
//         console.log(
//           `   Total Directories: ${intelligentAnalysis.structure.allDirectories.length}`
//         );
//         console.log(
//           `   Files with Content Analysis: ${
//             Object.keys(intelligentAnalysis.structure.fileContents).length
//           }`
//         );

//         // Show file types distribution
//         const fileTypes = {};
//         intelligentAnalysis.structure.allFiles.forEach((file) => {
//           const ext = file.split(".").pop().toLowerCase();
//           fileTypes[ext] = (fileTypes[ext] || 0) + 1;
//         });
//         console.log(
//           `   File Types: ${Object.entries(fileTypes)
//             .map(([ext, count]) => `${ext}(${count})`)
//             .join(", ")}`
//         );
//       }

//       // Intelligent Insights
//       console.log("\n💡 INTELLIGENT INSIGHTS:");
//       intelligentAnalysis.insights.forEach((insight, index) => {
//         const emoji =
//           insight.category === "strength"
//             ? colorize("✅", "green")
//             : insight.category === "improvement"
//             ? colorize("⚠️", "yellow")
//             : insight.category === "understanding"
//             ? colorize("🧠", "cyan")
//             : insight.category === "information"
//             ? colorize("📊", "magenta")
//             : colorize("💡", "green");
//         console.log(
//           `   ${emoji} ${insight.title} (${Math.round(
//             insight.confidence * 100
//           )}% confidence)`
//         );
//         console.log(`      ${insight.message}`);
//       });
//     }

//     // Get comprehensive code analysis for detailed feedback
//     console.log("\n=== COMPREHENSIVE CODE ANALYSIS ===");

//     // Print comprehensive feedback
//     console.log("\n📊 PROJECT STRUCTURE ANALYSIS:");
//     console.log(`Project Type: ${comprehensiveAnalysis.projectType}`);
//     console.log(
//       `Total Files Analyzed: ${comprehensiveAnalysis.summary.totalFiles}`
//     );
//     console.log(
//       `Total Lines of Code: ${comprehensiveAnalysis.summary.totalLines}`
//     );
//     console.log(`File Types:`, comprehensiveAnalysis.summary.fileTypes);

//     // Print detailed file feedback
//     console.log("\n📁 DETAILED FILE ANALYSIS:");
//     Object.keys(comprehensiveAnalysis.files).forEach((fileName) => {
//       const file = comprehensiveAnalysis.files[fileName];
//       console.log(`\n📄 ${fileName}:`);
//       console.log(`   Lines: ${file.lines}`);
//       console.log(`   Size: ${file.size} characters`);
//       console.log(`   Type: ${file.type}`);

//       // Show first few lines as preview
//       const preview = file.content.split("\n").slice(0, 3).join("\n   ");
//       console.log(`   Preview:\n   ${preview}...`);
//     });

//     // Print feedbacks for each criterion
//     Object.keys(feedbacks).forEach((key) => {
//       console.log(`\n${key.charAt(0).toUpperCase() + key.slice(1)} Feedback:`);
//       console.log(feedbacks[key]);
//     });

//     return {
//       repoName: repoData.name,
//       criteriaResults,
//       feedbacks,
//       finalScore,
//       comprehensiveAnalysis,
//       intelligentAnalysis,
//     };
//   } catch (error) {
//     console.error("Error analyzing repository:", error);
//     return null;
//   }
// };



module.exports.analyzeRepo = async (req, res) => {

  const projectId = req.params.projectId; 
  const owner = req.body.owner; 
  const repo = req.body.repo;
  const selectedTemplate = req.body.selectedTemplate || "auto";
  const hackathonCriteria = req.body.hackathonCriteria || null; 

  try {
    // Delegate to projectService for modular code
    const result = await projectService.analyzeRepo(
      owner,
      repo,
      selectedTemplate,
      hackathonCriteria,
      projectId
    );

    console.log("check this: ", result);

    res.status(200).json({
      success: true,
      result,
    });

  } catch (error) {
    console.error("Error analyzing repository:", error);
    return null;
  }
};


exports.getTeamMemberProjects = async (req, res) => {
  try {
    
    const user = req.user;
    const result = await projectService.getTeamMemberProjects(user.email);

    res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    return res.status(500).json({
      error: `An unexpected error occurred while getting teamMemberProjects: ${error}`,
    });
  }
};

exports.getLeaderProjects = async (req, res) => {
  try {
    
    const user = req.user;
    const result = await projectService.getLeaderProjects(user.id);

    res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    return res.status(500).json({
      error: `An unexpected error occurred while getting leaderProjects: ${error}`,
    });
  }
};

module.exports.decodeMemberToken = async (req, res) => {
  const { token } = req.params;

  try {
    const result = await projectService.decodeMemberToken(
      token
    );
    res.status(200).json(result); 
  } catch (error) {
    console.error("error by decoding memberToken :", error);
    res.status(400).json({ error: error.message });
  }
};