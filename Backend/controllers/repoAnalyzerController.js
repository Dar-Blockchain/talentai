const IntelligentProjectAnalyzer = require("../repoAnalyzer/intelligentAnalyzer");
const CodeAnalysis = require("../models/codeAnalysisModel");
const ProjectAssessment = require("../models/projectAssessmentModel");

exports.analyzeGithubRepo = async (req, res) => {
  const { repoUrl } = req.body;
  const { projectId } = req.params;
  if (!repoUrl) {
    return res
      .status(400)
      .json({ success: false, error: "repoUrl is required" });
  }

  // Parse owner and repo from URL
  const match = repoUrl.match(/github.com[/:]([^/]+)\/([^/.]+)/);
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
    // Save analysis to DB
    // await RepoAnalysis.create({ repoUrl, owner, repo, analysis: result });
    const codeAnalysis = await CodeAnalysis.create({
      repoUrl,
      owner,
      repo,
      analysis: result,
    });

    let projectAssessment = await ProjectAssessment.findOne({project: projectId});
    projectAssessment.codeAnalysis = codeAnalysis._id;
    await projectAssessment.save();


    res.json({ success: true, result, codeAnalysis });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
