module.exports = {
  CVAnalysis:        require("./cv-analysis.model"),
  CVAnalysisService: require("./cv-analysis.service"),
  analyzeCV:         require("./analyse-resume.service").analyzeCV,
};
