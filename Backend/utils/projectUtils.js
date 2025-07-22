const {
  BUSINESS_OVERALL_SCORE_WEIGHTS,
  TECH_TYPE_WEIGHTS,
  TECHNICAL_OVERALL_SCORE_WEIGHTS,
  PROJECT_ASSESSMENT_TYPE,
  ELIGIBILITY_REQUIREMENTS,
  ELIGIBILITY_CHECKS_STATUS,
  MIN_TRACK_ALIGNMENT_SCORE,
  TECH_STACK_TYPES,
} = require("../constants/projectConstants");

const {
  ASSESSMENT_OVERALL_SCORE_WEIGHTS,
} = require("../constants/projectConstants");
const { loadProjectTemplates, detectProjectTypeFromRepo, evaluateProjectStructure, evaluateCodeQuality, evaluateSecurityAndPerformance, evaluateModernPractices } = require("../helpers/projectHelpers");

/**
 * Calculates the overallScore for businessData by assigning weights to each component score.
 * @param {Object} businessData - The businessData object containing innovation, businessModel, marketPotential.
 * @param {Object} [weights] - Optional custom weights for each component. Defaults: innovation=0.3, businessModel=0.4, marketPotential=0.3
 * @returns {number} The calculated overallScore (0-100, rounded to 2 decimals)
 */
function handleBusinessOverallScore(
  businessData,
  weights = {
    innovation: BUSINESS_OVERALL_SCORE_WEIGHTS.INNOVATION,
    businessModel: BUSINESS_OVERALL_SCORE_WEIGHTS.BUSINESS_MODEL,
    marketPotential: BUSINESS_OVERALL_SCORE_WEIGHTS.MARKET_POTENTIAL,
    hederaEcosystemImpact:
      BUSINESS_OVERALL_SCORE_WEIGHTS.HEDERA_ECOSYSTEM_IMPACT,
    trackAlignment: BUSINESS_OVERALL_SCORE_WEIGHTS.TRACK_ALIGNMENT,
  }
) {
  if (!businessData) return 0;
  const {
    innovation,
    businessModel,
    marketPotential,
    hederaEcosystemImpact,
    trackAlignment,
  } = businessData;

  // Extract scores, defaulting to 0 if missing
  const innovationScore =
    innovation && typeof innovation.score === "number" ? innovation.score : 0;

  const businessModelScore =
    businessModel && typeof businessModel.score === "number"
      ? businessModel.score
      : 0;

  const marketPotentialScore =
    marketPotential && typeof marketPotential.score === "number"
      ? marketPotential.score
      : 0;

  const hederaEcosystemImpactScore =
    hederaEcosystemImpact && typeof hederaEcosystemImpact.score === "number"
      ? hederaEcosystemImpact.score
      : 0;

  const trackAlignmentScore =
    trackAlignment && typeof trackAlignment.score === "number"
      ? trackAlignment.score
      : 0;

  // Weighted sum
  const overallScore =
    innovationScore * weights.innovation +
    businessModelScore * weights.businessModel +
    marketPotentialScore * weights.marketPotential +
    hederaEcosystemImpactScore * weights.hederaEcosystemImpact +
    trackAlignmentScore * weights.trackAlignment;

  // Clamp to 0-100 and round
  return Math.round(Math.max(0, Math.min(100, overallScore)) * 100) / 100;
}

function handleAssessmentOverallScore(
  technicalOverallScore,
  businessOverallScore
) {
  let technicalScore = technicalOverallScore
    ? Number(technicalOverallScore)
    : 0;

  let businessScore = businessOverallScore ? Number(businessOverallScore) : 0;

  const techWeight = ASSESSMENT_OVERALL_SCORE_WEIGHTS.TECHNICAL;
  const bizWeight = ASSESSMENT_OVERALL_SCORE_WEIGHTS.BUSINESS;
  const totalWeight = techWeight + bizWeight;

  const weightedSum =
    (technicalScore * techWeight + businessScore * bizWeight) / totalWeight;

  return Math.round(weightedSum * 100) / 100;
}

function calculateTechStackScore(techStack = []) {
  if (!Array.isArray(techStack) || techStack.length === 0)
    return { score: 0, isValid: false };

  const typeWeights = {
    [TECH_STACK_TYPES.HEDERA_TOOLING]: TECH_TYPE_WEIGHTS.HEDERA_TOOLING,
    [TECH_STACK_TYPES.HEDERA_SERVICE]: TECH_TYPE_WEIGHTS.HEDERA_SERVICE,
    [TECH_STACK_TYPES.CORE_TECH]: TECH_TYPE_WEIGHTS.CORE_TECH,
    [TECH_STACK_TYPES.INTEGRATION_TOOL]: TECH_TYPE_WEIGHTS.INTEGRATION_TOOL,
    [TECH_STACK_TYPES.INFRASTRUCTURE]: TECH_TYPE_WEIGHTS.INFRASTRUCTURE,
  };

  // Group scores by componentType
  const scoresByType = {};
  const countsByType = {};

  for (const item of techStack) {
    const type = item.componentType;
    const score = typeof item.score === "number" ? item.score : 0;

    if (!scoresByType[type]) {
      scoresByType[type] = 0;
      countsByType[type] = 0;
    }
    scoresByType[type] += score;
    countsByType[type] += 1;
  }

  // Calculate average score per type
  const avgScoresByType = {};
  for (const type in scoresByType) {
    avgScoresByType[type] = scoresByType[type] / countsByType[type];
  }

  // Calculate weighted average of the averages
  let weightedSum = 0;
  let totalWeight = 0;

  for (const type in avgScoresByType) {
    const weight = typeWeights[type] || 0;
    weightedSum += avgScoresByType[type] * weight;
    totalWeight += weight;
  }

  const isValid = totalWeight > 0;
  const score = isValid ? weightedSum / totalWeight : 0;

  return score;
}

function handleTechnicalOverallScore(technicalData) {
  if (!technicalData || !technicalData.techStack || technicalData.techStack.length === 0) return 0;

  const categoryWeights = {
    techStack: TECHNICAL_OVERALL_SCORE_WEIGHTS.TECH_STACK,
    architecture: TECHNICAL_OVERALL_SCORE_WEIGHTS.ARCHITECTURE,
    scalability: TECHNICAL_OVERALL_SCORE_WEIGHTS.SCALABILITY_APPROACH,
  };

  const techStackScore = calculateTechStackScore(technicalData.techStack);

  const hasArchitecture = typeof technicalData.architecture?.score === "number";
  const architectureScore = hasArchitecture
    ? technicalData.architecture.score
    : 0;

  const hasScalability =
    typeof technicalData.scalabilityApproach?.score === "number";
  const scalabilityScore = hasScalability
    ? technicalData.scalabilityApproach.score
    : 0;

  let finalScore = 0;
  finalScore =
    architectureScore * categoryWeights.architecture +
    scalabilityScore * categoryWeights.scalability +
    techStackScore * categoryWeights.techStack;

  return Math.round(Math.max(0, Math.min(100, finalScore)) * 100) / 100;
}

/**
 * Updates the eligibility status of a project assessment based on the business track alignment score.
 *
 * This function  evaluates the trackAlignment score from the analysis.
 *    - If the score meets or exceeds the minimum required (MIN_TRACK_ALIGNMENT_SCORE), the TRACK_MATCH eligibility check is marked as approved.
 *    - Otherwise, it is marked as not approved. The assessment is then saved.
 *
 * @param {Object} assessment - The ProjectAssessment mongoose document to update.
 * @param {Object} analysis - The analysis object containing businessData and trackAlignment score.
 * @param {string} assessmentType - The type of assessment (should be PROJECT_ASSESSMENT_TYPE.BUSINESS).
 * @returns {Promise<void>}
 */
async function handleEligibility(assessment, analysis, assessmentType) {
  // handle eligibility for business assessment
  if (assessmentType === PROJECT_ASSESSMENT_TYPE.BUSINESS) {
    if (
      assessment.businessData &&
      assessment.businessData.trackAlignment &&
      typeof analysis.businessData.trackAlignment.score === "number"
    ) {
      if (
        analysis.businessData.trackAlignment.score >= MIN_TRACK_ALIGNMENT_SCORE
      ) {
        assessment.eligibility.checks.map((check) => {
          if (check.type === ELIGIBILITY_REQUIREMENTS.TRACK_MATCH) {
            check.status = ELIGIBILITY_CHECKS_STATUS.IS_APPROVED;
          }
        });
      } else {
        assessment.eligibility.checks.map((check) => {
          if (check.type === ELIGIBILITY_REQUIREMENTS.TRACK_MATCH) {
            check.status = ELIGIBILITY_CHECKS_STATUS.IS_NOT_APPROVED;
          }
        });
      }
    }
  }
  // handle eligibility for code assessment
  //(to be handled when integrating code assessment)

  await assessment.save();
}

// ------ analyzecode section: -------
// Function to fetch and analyze multiple files for comprehensive feedback
const getComprehensiveCodeAnalysis = async (repoData, selectedTemplate = 'auto') => {
  console.log('[getComprehensiveCodeAnalysis] Starting comprehensive file analysis...');
  
  const templates = loadProjectTemplates();
  let projectType;

  console.log("daaaaaaa: ", templates);
  
  if (selectedTemplate.trim() === 'auto') {
      console.log("this1 entered...", );
      projectType = await detectProjectTypeFromRepo(repoData);
      console.log(`[getComprehensiveCodeAnalysis] Auto-detected project type: ${projectType}`);
      
  } else {
    console.log("this2 entered...", );
      projectType = selectedTemplate;
      console.log(`[getComprehensiveCodeAnalysis] Using selected template: ${projectType}`);
  }
  
  console.log(`________: ${projectType}`);
  const template = templates[projectType] || templates['custom'];
  const templateFiles = template.files || [];
  
  const analysis = {
      projectType,
      files: {},
      summary: {
          totalFiles: 0,
          totalLines: 0,
          fileTypes: {},
          structure: {}
      }
  };
  
  // Helper function to fetch directory contents
  const fetchDirectoryContents = async (dirPath) => {
      try {
          const response = await axios.get(`${repoData.url}/contents/${dirPath}`, {
              headers: {
                  Authorization: `token ${process.env.GITHUB_TOKEN}`,
              },
          });
          return response.data;
      } catch (error) {
          return [];
      }
  };
  
  // Helper function to fetch file content
  const fetchFileContent = async (filePath) => {
      try {
          const response = await axios.get(`${repoData.url}/contents/${filePath}`, {
              headers: {
                  Authorization: `token ${process.env.GITHUB_TOKEN}`,
              },
          });
          return Buffer.from(response.data.content, 'base64').toString('utf8');
      } catch (error) {
          return null;
      }
  };
  
  // Helper function to process template files (handle wildcards)
  const processTemplateFiles = async (templateFiles) => {
      const filesToAnalyze = [];
      
      for (const templateFile of templateFiles) {
          if (templateFile.includes('*')) {
              // Handle wildcard patterns
              const dirPath = templateFile.replace('/*', '');
              const dirContents = await fetchDirectoryContents(dirPath);
              
              if (dirContents.length > 0) {
                  // Add all files from this directory
                  for (const item of dirContents) {
                      if (item.type === 'file') {
                          filesToAnalyze.push(item.path);
                      }
                  }
              }
          } else {
              // Direct file reference
              filesToAnalyze.push(templateFile);
          }
      }
      
      return filesToAnalyze;
  };
  
  // Get all files to analyze (including those from wildcard patterns)
  const allFilesToAnalyze = await processTemplateFiles(templateFiles);
  
  // Add essential files
  const essentialFiles = ['package.json', 'index.js', 'server.js', 'app.js', 'App.js', 'App.tsx'];
  for (const file of essentialFiles) {
      if (!allFilesToAnalyze.includes(file)) {
          allFilesToAnalyze.push(file);
      }
  }
  
  // Fetch and analyze all files
  // mouna
  for (const fileName of allFilesToAnalyze) {
      try {
          const fileContent = await fetchFileContent(fileName);
          
          if (fileContent) {
              const lines = fileContent.split('\n').length;
              
              analysis.files[fileName] = {
                  content: fileContent,
                  size: fileContent.length,
                  lines: lines,
                  type: fileName.split('.').pop() || 'directory'
              };
              
              analysis.summary.totalFiles++;
              analysis.summary.totalLines += lines;
              analysis.summary.fileTypes[fileName.split('.').pop() || 'directory'] = 
                  (analysis.summary.fileTypes[fileName.split('.').pop() || 'directory'] || 0) + 1;
                  
              console.log(`[getComprehensiveCodeAnalysis] Successfully analyzed: ${fileName} (${lines} lines)`);
          } else {
              console.log(`[getComprehensiveCodeAnalysis] Could not fetch content for: ${fileName}`);
          }
          
      } catch (error) {
          console.log(`[getComprehensiveCodeAnalysis] Error analyzing ${fileName}: ${error.message}`);
      }
  }
  
  return analysis;
};

// Enhanced Code Quality Metrics for comprehensive analysis
const calculateCodeQualityScore = (codeAnalysis) => {
  let score = 0;
  const feedback = [];
  const detailedBreakdown = [];
  
  console.log('\n🔍 ENHANCED CODE QUALITY SCORING BREAKDOWN:');
  console.log('=============================================');
  
  // 1. Project Structure & Organization (30 points)
  console.log('\n📁 1. PROJECT STRUCTURE & ORGANIZATION (30 points max):');
  const structureScore = evaluateProjectStructure(codeAnalysis);
  score += structureScore.points;
  feedback.push(...structureScore.feedback);
  detailedBreakdown.push(...structureScore.details);
  console.log(`   📊 Project Structure Subtotal: ${structureScore.points}/30 points`);
  
  // 2. Code Quality & Best Practices (25 points)
  console.log('\n📝 2. CODE QUALITY & BEST PRACTICES (25 points max):');
  const qualityScore = evaluateCodeQuality(codeAnalysis);
  score += qualityScore.points;
  feedback.push(...qualityScore.feedback);
  detailedBreakdown.push(...qualityScore.details);
  console.log(`   📊 Code Quality Subtotal: ${qualityScore.points}/25 points`);
  
  // 3. Security & Performance (25 points)
  console.log('\n🔒 3. SECURITY & PERFORMANCE (25 points max):');
  const securityScore = evaluateSecurityAndPerformance(codeAnalysis);
  score += securityScore.points;
  feedback.push(...securityScore.feedback);
  detailedBreakdown.push(...securityScore.details);
  console.log(`   📊 Security & Performance Subtotal: ${securityScore.points}/25 points`);
  
  // 4. Modern Development Practices (20 points)
  console.log('\n🚀 4. MODERN DEVELOPMENT PRACTICES (20 points max):');
  const modernScore = evaluateModernPractices(codeAnalysis);
  score += modernScore.points;
  feedback.push(...modernScore.feedback);
  detailedBreakdown.push(...modernScore.details);
  console.log(`   📊 Modern Practices Subtotal: ${modernScore.points}/20 points`);
  
  const finalScore = Math.min(10, Math.round(score / 10));
  console.log(`\n🎯 ENHANCED CODE QUALITY FINAL SCORE: ${finalScore}/10`);
  console.log(`   Raw Score: ${score}/100 points`);
  console.log(`   Calculation: ${score} ÷ 10 = ${finalScore}`);
  
  return { 
      score: finalScore, 
      feedback: feedback.join('\n'),
      detailedBreakdown: detailedBreakdown.join('\n'),
      rawScore: score
  };
};

// Objective Documentation Score
const calculateDocumentationScore = (codeAnalysis) => {
  let score = 0;
  const feedback = [];
  
  console.log('\n📚 DOCUMENTATION SCORING BREAKDOWN:');
  console.log('=====================================');
  
  // Check for README
  console.log('\n📖 README FILE (100 points max):');
  if (codeAnalysis.files['README.md'] || codeAnalysis.files['README']) {
      score += 40;
      feedback.push("✅ README file present");
      console.log('   ✅ README file present (+40 points)');
      
      const readmeContent = codeAnalysis.files['README.md']?.content || codeAnalysis.files['README']?.content || '';
      
      // Check README quality
      if (readmeContent.includes('##') || readmeContent.includes('#')) {
          score += 20;
          feedback.push("✅ README has proper structure");
          console.log('   ✅ README has proper structure (+20 points)');
      } else {
          console.log('   ❌ README lacks proper structure (0 points)');
      }
      
      if (readmeContent.includes('install') || readmeContent.includes('setup')) {
          score += 20;
          feedback.push("✅ Installation instructions");
          console.log('   ✅ Installation instructions (+20 points)');
      } else {
          console.log('   ❌ No installation instructions (0 points)');
      }
      
      if (readmeContent.includes('api') || readmeContent.includes('endpoint')) {
          score += 20;
          feedback.push("✅ API documentation");
          console.log('   ✅ API documentation (+20 points)');
      } else {
          console.log('   ❌ No API documentation (0 points)');
      }
  } else {
      feedback.push("❌ No README file found");
      console.log('   ❌ No README file found (0 points)');
  }
  
  const finalScore = Math.min(10, Math.round(score / 10));
  console.log(`\n🎯 DOCUMENTATION FINAL SCORE: ${finalScore}/10`);
  console.log(`   Raw Score: ${score}/100 points`);
  console.log(`   Calculation: ${score} ÷ 10 = ${finalScore}`);
  
  return { 
      score: finalScore, 
      feedback: feedback.join('\n'),
      rawScore: score
  };
};

const calculateFunctionalityScore = (codeAnalysis) => {
  let score = 0;
  const feedback = [];
  
  console.log('\n🔧 FUNCTIONALITY SCORING BREAKDOWN:');
  console.log('====================================');
  
  // 1. Core Functionality (30 points)
  console.log('\n⚙️ 1. CORE FUNCTIONALITY (30 points max):');
  if (codeAnalysis.files['index.js']) {
      const indexContent = codeAnalysis.files['index.js'].content;
      
      // Check for database connection
      if (indexContent.includes('mongoose') || indexContent.includes('connect') || indexContent.includes('database')) {
          score += 10;
          feedback.push("✅ Database connection configured");
          console.log('   ✅ Database connection configured (+10 points)');
      } else {
          console.log('   ❌ No database connection (0 points)');
      }
      
      // Check for API routes
      if (indexContent.includes('router') || indexContent.includes('app.get') || indexContent.includes('app.post')) {
          score += 10;
          feedback.push("✅ API routes defined");
          console.log('   ✅ API routes defined (+10 points)');
      } else {
          console.log('   ❌ No API routes defined (0 points)');
      }
      
      // Check for authentication
      if (indexContent.includes('auth') || indexContent.includes('jwt') || indexContent.includes('passport')) {
          score += 10;
          feedback.push("✅ Authentication system");
          console.log('   ✅ Authentication system (+10 points)');
      } else {
          console.log('   ❌ No authentication system (0 points)');
      }
  }
  
  console.log(`   📊 Core Functionality Subtotal: ${Math.min(30, score)}/30 points`);
  
  // 2. API Endpoints (25 points)
  console.log('\n🌐 2. API ENDPOINTS (25 points max):');
  const routeFiles = Object.keys(codeAnalysis.files).filter(file => file.includes('route'));
  if (routeFiles.length > 0) {
      score += 10;
      feedback.push(`✅ ${routeFiles.length} route files found`);
      console.log(`   ✅ ${routeFiles.length} route files found (+10 points)`);
  } else {
      console.log('   ❌ No route files found (0 points)');
  }
  
  if (codeAnalysis.files['routes']) {
      score += 10;
      feedback.push("✅ Routes directory exists");
      console.log('   ✅ Routes directory exists (+10 points)');
  } else {
      console.log('   ❌ No routes directory (0 points)');
  }
  
  if (codeAnalysis.files['controllers']) {
      score += 5;
      feedback.push("✅ Controllers directory exists");
      console.log('   ✅ Controllers directory exists (+5 points)');
  } else {
      console.log('   ❌ No controllers directory (0 points)');
  }
  
  console.log(`   📊 API Endpoints Subtotal: ${Math.min(25, score - 30)}/25 points`);
  
  // 3. Data Models (25 points)
  console.log('\n🗄️ 3. DATA MODELS (25 points max):');
  if (codeAnalysis.files['models']) {
      score += 10;
      feedback.push("✅ Models directory exists");
      console.log('   ✅ Models directory exists (+10 points)');
  } else {
      console.log('   ❌ No models directory (0 points)');
  }
  
  if (codeAnalysis.files['package.json']) {
      const pkgContent = codeAnalysis.files['package.json'].content;
      if (pkgContent.includes('mongoose') || pkgContent.includes('sequelize')) {
          score += 10;
          feedback.push("✅ Database ORM included");
          console.log('   ✅ Database ORM included (+10 points)');
      } else {
          console.log('   ❌ No database ORM found (0 points)');
      }
      
      if (pkgContent.includes('express')) {
          score += 5;
          feedback.push("✅ Express.js framework");
          console.log('   ✅ Express.js framework (+5 points)');
      } else {
          console.log('   ❌ Express.js not found (0 points)');
      }
  }
  
  console.log(`   📊 Data Models Subtotal: ${Math.min(25, score - 55)}/25 points`);
  
  // 4. Configuration and Environment (20 points)
  console.log('\n⚙️ 4. CONFIGURATION AND ENVIRONMENT (20 points max):');
  if (codeAnalysis.files['index.js']) {
      const indexContent = codeAnalysis.files['index.js'].content;
      
      if (indexContent.includes('dotenv') || indexContent.includes('process.env')) {
          score += 10;
          feedback.push("✅ Environment configuration");
          console.log('   ✅ Environment configuration (+10 points)');
      } else {
          console.log('   ❌ No environment configuration (0 points)');
      }
      
      if (indexContent.includes('PORT') || indexContent.includes('listen')) {
          score += 10;
          feedback.push("✅ Server configuration");
          console.log('   ✅ Server configuration (+10 points)');
      } else {
          console.log('   ❌ No server configuration (0 points)');
      }
  }
  
  console.log(`   📊 Configuration Subtotal: ${Math.min(20, score - 80)}/20 points`);
  
  const finalScore = Math.min(10, Math.round(score / 10));
  console.log(`\n🎯 FUNCTIONALITY FINAL SCORE: ${finalScore}/10`);
  console.log(`   Raw Score: ${score}/100 points`);
  console.log(`   Calculation: ${score} ÷ 10 = ${finalScore}`);
  
  return { 
      score: finalScore, 
      feedback: feedback.join('\n'),
      rawScore: score
  };
};

const calculateInnovationScore = (codeAnalysis) => {
  let score = 0;
  const feedback = [];
  
  // Check for advanced features
  if (codeAnalysis.files['package.json']) {
      const pkgContent = codeAnalysis.files['package.json'].content;
      
      // Check for advanced dependencies
      const advancedFeatures = [
          'socket.io', 'redis', 'elasticsearch', 'graphql', 'prisma', 
          'swagger', 'jest', 'cypress', 'docker', 'kubernetes'
      ];
      
      advancedFeatures.forEach(feature => {
          if (pkgContent.includes(feature)) {
              score += 15;
              feedback.push(`✅ Advanced feature: ${feature}`);
          }
      });
  }
  
  // Check for project structure complexity
  const directories = ['controllers', 'routes', 'models', 'middleware', 'utils', 'config'];
  directories.forEach(dir => {
      if (codeAnalysis.files[dir]) {
          score += 10;
          feedback.push(`✅ Well-organized: ${dir} directory`);
      }
  });
  
  // Check for testing setup
  if (codeAnalysis.files['package.json']?.content.includes('test') || 
      codeAnalysis.files['package.json']?.content.includes('jest') ||
      codeAnalysis.files['package.json']?.content.includes('mocha')) {
      score += 20;
      feedback.push("✅ Testing framework configured");
  }
  
  return { score: Math.min(10, Math.round(score / 10)), feedback: feedback.join('\n') };
};

const calculateUserExperienceScore = (codeAnalysis) => {
  let score = 0;
  const feedback = [];
  
  // Check for API documentation
  if (codeAnalysis.files['README.md'] || codeAnalysis.files['README']) {
      const readmeContent = codeAnalysis.files['README.md']?.content || codeAnalysis.files['README']?.content || '';
      
      if (readmeContent.includes('api') || readmeContent.includes('endpoint')) {
          score += 30;
          feedback.push("✅ API documentation available");
      }
      
      if (readmeContent.includes('example') || readmeContent.includes('usage')) {
          score += 20;
          feedback.push("✅ Usage examples provided");
      }
  }
  
  // Check for proper error handling (affects UX)
  if (codeAnalysis.files['index.js']) {
      const indexContent = codeAnalysis.files['index.js'].content;
      if (indexContent.includes('error') || indexContent.includes('catch')) {
          score += 25;
          feedback.push("✅ Error handling for better UX");
      }
  }
  
  // Check for CORS (affects frontend integration)
  if (codeAnalysis.files['index.js']?.content.includes('cors')) {
      score += 25;
      feedback.push("✅ CORS configured for frontend integration");
  }
  
  return { score: Math.min(10, Math.round(score / 10)), feedback: feedback.join('\n') };
};

module.exports = {
  handleBusinessOverallScore,
  handleTechnicalOverallScore,
  handleAssessmentOverallScore,
  handleEligibility,
  // code analysis section
  
  getComprehensiveCodeAnalysis, 
  calculateCodeQualityScore, 
  calculateDocumentationScore, 
  calculateFunctionalityScore,
  calculateInnovationScore,
  calculateUserExperienceScore,
  

};
