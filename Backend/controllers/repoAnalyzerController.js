const IntelligentProjectAnalyzer = require("../repoAnalyzer/intelligentAnalyzer");
const CodeAnalysis = require("../models/codeAnalysisModel");
const ProjectAssessment = require("../models/projectAssessmentModel");

const {analyzeRepo} = require("../repoAnalyzer/evaluateRepo");
const { handleAssessmentFinalOverallScore } = require("../utils/projectUtils");
const { PROJECT_STATUS } = require("../constants/projectConstants");

exports.analyzeGithubRepo = async (req, res) => {
  const { githubLink } = req.body;
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

  const analyzer = new IntelligentProjectAnalyzer();
  try {
    const result = await analyzer.analyzeRepository(owner, repo);
    if (!result) {
      return res.status(500).json({ success: false, error: "Analysis failed" });
    }

    // const res1 = await analyzeRepo(owner, repo, 'auto', hackathonCriteria= null);
    // if (!res1) {
    //   return res1.status(500).json({ success: false, error: "Analysis failed" });
    // }

    // Save analysis to DB
    const codeAnalysis = await CodeAnalysis.create({
      githubLink,
      owner,
      repo,
      analysis: result,
      // criteriaResults: res1.criteriaResults,
      // feedbacks:res1.feedbacks,
      // // res.intelligentAnalysis data are already present in the analysis:result
      // finalScore: res1.finalScore,
      // comprehensiveAnalysis: res1.comprehensiveAnalysis,
      // contributors: res1.contributors,
      // totalCommits: res1.totalCommits,
      // firstCommit: res1.firstCommit,
      // lastCommit: res1.lastCommit,
      // startDateCheck: res1.startDateCheck,
      // deadlineCheck: res1.deadlineCheck,
      // maxTeamSizeCheck: res1.maxTeamSizeCheck,
      // mustBeOriginalCheck: res1.mustBeOriginalCheck,
      // demoRequiredCheck: res1.demoRequiredCheck,
    });
    
    const projectAssessment = await ProjectAssessment.findOne({project: projectId});
    
    projectAssessment.codeAnalysis = codeAnalysis._id;

    const technicalScore = projectAssessment.technicalData.overallScore; 
    const businessScore = projectAssessment.businessData.overallScore; 
    const codeScore = result?.overallScore;

    const finalOverallScore = handleAssessmentFinalOverallScore(technicalScore,businessScore, codeScore );

    projectAssessment.overallScore = finalOverallScore; 
    projectAssessment.status = PROJECT_STATUS.DONE; 

    await projectAssessment.save();

    console.log("check assessment: ", projectAssessment._id);


    res.json({ success: true, result, codeAnalysis });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
