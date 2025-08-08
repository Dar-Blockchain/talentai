const IntelligentProjectAnalyzer = require("../repoAnalyzer/intelligentAnalyzer");
const CodeAnalysis = require("../models/codeAnalysisModel");
const ProjectAssessment = require("../models/projectAssessmentModel");

const {
  analyzeRepo,
  getContributorsData,
  checkRepoOwnership,
} = require("../repoAnalyzer/evaluateRepo");
const { handleAssessmentFinalOverallScore } = require("../utils/projectUtils");
const {
  PROJECT_STATUS,
  ELIGIBILITY_REQUIREMENTS,
  ELIGIBILITY_CHECKS_STATUS,
} = require("../constants/projectConstants");
const {
  HEDERA_HACKATHON_CRITERIA,
  OTHER_HACKATHON_CRITERIA,
} = require("../constants/hackathonConstants");

/**
 * @function analyzeGithubRepo
 * @description
 * Analyzes a submitted GitHub repository for a specific project and hackathon.
 * 
 * This endpoint performs the following steps:
 *  - Validates repository ownership by checking if the user's email exists in the contributor list.
 *  - Ensures that technical and business assessments are already completed.
 *  - Verifies that a code analysis has not already been conducted for the project.
 * 
 * Depending on the `hackathonName`, specific evaluation criteria are applied.
 * Currently, "HederaHacks" is supported using the `HEDERA_HACKATHON_CRITERIA` constant.
 * 
 * Results are saved in the `CodeAnalysis` model and linked to the `ProjectAssessment` model.
 * The function also updates:
 *  - `projectAssessment.eligibility` based on eligibility checks.
 *  - `projectAssessment.overallScore` using the technical, business, and code scores.
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user data
 * @param {string} req.body.githubLink - GitHub repository URL
 * @param {string} req.body.hackathonName - Name of the hackathon
 * @param {string} req.params.projectId - ID of the project to analyze
 * 
 * @param {Object} res - Express response object
 * 
 * @returns {Object} JSON response with analysis results or an error message
 * 
 * @throws {400} If required data is missing or invalid
 * @throws {403} If repository ownership validation fails
 * @throws {500} On internal processing error
 */
exports.analyzeGithubRepo = async (req, res) => {
  const user = req.user;
  const { githubLink, hackathonName } = req.body;

  const { projectId } = req.params;
  if (!githubLink) {
    return res
      .status(400)
      .json({ success: false, error: "githubLink is required" });
  }

  // Parse owner and repo from URL
  const match = githubLink.match(/github.com[/:]([^/]+)\/([^/.]+)/);
  if (!match) {
    return res
      .status(400)
      .json({ success: false, error: "Invalid GitHub repo URL" });
  }
  const owner = match[1];
  const repo = match[2];

  const projectAssessment = await ProjectAssessment.findOne({
    project: projectId,
  });

  if (
    !projectAssessment ||
    !projectAssessment.technicalData ||
    !projectAssessment.businessData
  ) {
    return res.status(400).json({
      success: false,
      error:
        "TechnicalAssessment and BusinessAssessment must be completed first",
    });
  }

  if (projectAssessment.codeAnalysis) {
    return res.status(400).json({
      success: false,
      error: "code analysis already processed for this project",
    });
  }

  const analyzer = new IntelligentProjectAnalyzer();

  let hackathonCriteria;
  console.log("checkout : ", hackathonName);

  switch (hackathonName) {
    case "HederaHacks":
      hackathonCriteria = HEDERA_HACKATHON_CRITERIA;
      break;
    case "otherHacks":
      hackathonCriteria = OTHER_HACKATHON_CRITERIA;
      break;
    default:
      hackathonCriteria = null;
      break;
  }

  const contributorsData = await getContributorsData(owner, repo);

  //1. check repo ownership
  const ownershipValidated = await checkRepoOwnership(
    user.email,
    contributorsData
  );

  if (!ownershipValidated) {
    return res.status(403).json({
      success: false,
      errorCode: "OWNERSHIP_ERROR",
      message: "Ownership validation failed",
    });
  }

  //2.Analyse code
  try {
    const {
      projectPurpose,
      architecture,
      coherence,
      quality,
      insights,
      structure,

      eligibilityResults,
      githubData,
      comprehensiveAnalysis,
      evaluationScores,
      overallScore,
    } = await analyzer.analyzeRepository(owner, repo, hackathonCriteria);

    console.log("check projectPurpose: ", projectPurpose);

    const analysis = {
      projectPurpose,
      architecture,
      coherence,
      quality,
      insights,
      structure,
      eligibilityResults,
      githubData,
      evaluationScores,
      comprehensiveAnalysis,
      overallScore,
    };

    // Save analysis to DB
    let codeAnalysis = await CodeAnalysis.create({
      githubLink,
      owner,
      repo,
      analysis,
      eligibilityResults,
      githubData,
    });

    console.log("check codeAnalysis: ", codeAnalysis._id);

    const projectAssessment = await ProjectAssessment.findOne({
      project: projectId,
    });

    projectAssessment.codeAnalysis = codeAnalysis._id;

    console.log("check assessment: ", projectAssessment._id);

    const technicalScore = projectAssessment.technicalData.overallScore;
    const businessScore = projectAssessment.businessData.overallScore;
    const codeScore = overallScore;

    // 3. updates projectAssessment.overallScore
    const finalOverallScore = handleAssessmentFinalOverallScore(
      technicalScore,
      businessScore,
      codeScore
    );

    projectAssessment.overallScore = finalOverallScore;
    projectAssessment.status = PROJECT_STATUS.DONE;

    //4. update eligibility in the projectAssessmentModel
    const codeCheck = projectAssessment.eligibility.checks.find(
      (check) => check.type === ELIGIBILITY_REQUIREMENTS.CODE_SUBMISSION_INFO
    );
    if (codeCheck) {
      if (eligibilityResults.eligible === true) {
        codeCheck.status = ELIGIBILITY_CHECKS_STATUS.IS_APPROVED;
        projectAssessment.eligibility.isEligible = true;
      } else {
        codeCheck.status = ELIGIBILITY_CHECKS_STATUS.IS_NOT_APPROVED;
        projectAssessment.eligibility.isEligible = false;
        // set code overallScore and projectAssessment overallScore to 0 , by -not eligible- projects
        projectAssessment.overallScore = 0;
        codeAnalysis.analysis.overallScore = 0;
        await codeAnalysis.save();
      }
    }

    await projectAssessment.save();

    res.json({
      success: true,
      result: { ...analysis, ...codeAnalysis },
      codeAnalysis,
    });
  } catch (err) {
    console.error("error when analysing github repo:", err);

    const status = err.statusCode || 500;
    const errorCode = err.errorCode || "internalError";

    res.status(status).json({
      success: false,
      error: err.message,
      errorCode: errorCode,
    });
  }
};
