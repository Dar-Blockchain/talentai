const IntelligentProjectAnalyzer = require('../repoAnalyzer/intelligentAnalyzer');

exports.analyzeGithubRepo = async (req, res) => {
  const { repoUrl } = req.body;
  if (!repoUrl) {
    return res.status(400).json({ success: false, error: 'repoUrl is required' });
  }

  // Parse owner and repo from URL
  const match = repoUrl.match(/github.com[/:]([^/]+)\/([^/.]+)/);
  if (!match) {
    return res.status(400).json({ success: false, error: 'Invalid GitHub repo URL' });
  }
  const owner = match[1];
  const repo = match[2];

  const analyzer = new IntelligentProjectAnalyzer();
  try {
    const result = await analyzer.analyzeRepository(owner, repo);
    if (!result) {
      return res.status(500).json({ success: false, error: 'Analysis failed' });
    }
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}; 