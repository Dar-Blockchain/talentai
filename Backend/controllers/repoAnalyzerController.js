const IntelligentProjectAnalyzer = require("../repoAnalyzer/intelligentAnalyzer");
const CodeAnalysis = require("../models/codeAnalysisModel");
const ProjectAssessment = require("../models/projectAssessmentModel");

const { analyzeRepo } = require("../repoAnalyzer/evaluateRepo");
const { handleAssessmentFinalOverallScore } = require("../utils/projectUtils");
const { PROJECT_STATUS } = require("../constants/projectConstants");
const {
  HEDERA_HACKATHON_CRITERIA,
  OTHER_HACKATHON_CRITERIA,
} = require("../constants/hackathonConstants");

exports.analyzeGithubRepo = async (req, res) => {
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
    return res
      .status(400)
      .json({
        success: false,
        error:
          "TechnicalAssessment and BusinessAssessment must be completed first",
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

  console.log("check out: ", hackathonCriteria);

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
    const codeAnalysis = await CodeAnalysis.create({
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

    const finalOverallScore = handleAssessmentFinalOverallScore(
      technicalScore,
      businessScore,
      codeScore
    );

    projectAssessment.overallScore = finalOverallScore;
    projectAssessment.status = PROJECT_STATUS.DONE;

    await projectAssessment.save();

    
    

    res.json({
      success: true,
      result: { ...analysis, ...codeAnalysis },
      codeAnalysis,
    });
  } catch (err) {
    console.log("error when analysing github repo: ", err);
    res.status(500).json({ success: false, error: err.message });
  }
};
