const axios = require('axios');
const Together = require('together-ai');  // Use require instead of import
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const IntelligentProjectAnalyzer = require('./intelligentAnalyzer');

const together = new Together(); // Auth using API key in process.env.TOGETHER_API_KEY

const CRITERIA_WEIGHTS = {
    codeQuality: 30,
    innovation: 25,
    functionality: 20,
    documentation: 15,
    userExperience: 10,
};

// Add chalk for colored output if available
let chalk = null;
try { chalk = require('chalk'); } catch (e) { chalk = null; }

function colorize(text, color) {
    if (chalk && chalk[color]) return chalk[color](text);
    return text;
}

function section(title, emoji = '', color = 'cyan') {
    const line = '='.repeat(60);
    return `\n${colorize(line, color)}\n${emoji ? emoji + ' ' : ''}${colorize(title, color)}\n${colorize(line, color)}`;
}

// Analyze the repository
const analyzeRepo = async (owner, repo, selectedTemplate = 'auto', hackathonCriteria = null) => {
    try {
        console.log('Fetching repo data...');
        const repoData = await fetchRepoData(owner, repo);  // Ensure fetchRepoData is working correctly
        console.log('Repo data fetched:', repoData);

        // --- Hackathon Eligibility Check ---
        let eligibilityResults = {};
        let eligible = true;
        if (hackathonCriteria) {
            console.log(section('HACKATHON ELIGIBILITY CHECK', '🏆', 'yellow'));
            // Display contributors and commits
            const numContributors = repoData.contributors ? repoData.contributors.length : 0;
            const numCommits = repoData.commits ? repoData.commits.length : 0;
            console.log(colorize(`👥 Contributors (${numContributors}): `, 'magenta') + colorize(repoData.contributors.map(c => c.login).join(', '), 'white'));
            console.log(colorize(`🔢 Total commits: ${numCommits}`, 'magenta'));
            if (repoData.commits && repoData.commits.length > 0) {
                const firstCommit = repoData.commits[repoData.commits.length - 1];
                const lastCommit = repoData.commits[0];
                console.log(colorize(`📅 First commit: ${firstCommit.date} by ${firstCommit.author}`, 'magenta'));
                console.log(colorize(`📅 Last commit: ${lastCommit.date} by ${lastCommit.author}`, 'magenta'));
            }
            // 1. Date check (repo creation and last commit)
            let datePass = true;
            let repoCreated, repoPushed, hackathonStart, hackathonEnd;
            try {
                repoCreated = new Date(repoData.created_at);
                if (isNaN(repoCreated)) throw new Error('Invalid repo created_at date');
            } catch (e) {
                eligibilityResults.startDate = 'ERROR (Invalid or missing repo created_at date)';
                datePass = false;
            }
            try {
                repoPushed = new Date(repoData.pushed_at);
                if (isNaN(repoPushed)) throw new Error('Invalid repo pushed_at date');
            } catch (e) {
                eligibilityResults.deadline = 'ERROR (Invalid or missing repo pushed_at date)';
                datePass = false;
            }
            try {
                hackathonStart = new Date(hackathonCriteria.startDate);
                if (isNaN(hackathonStart)) throw new Error('Invalid hackathon startDate');
            } catch (e) {
                eligibilityResults.startDate = 'ERROR (Invalid or missing hackathon startDate)';
                datePass = false;
            }
            try {
                hackathonEnd = new Date(hackathonCriteria.deadline);
                if (isNaN(hackathonEnd)) throw new Error('Invalid hackathon deadline');
            } catch (e) {
                eligibilityResults.deadline = 'ERROR (Invalid or missing hackathon deadline)';
                datePass = false;
            }
            if (repoCreated && hackathonStart && !isNaN(repoCreated) && !isNaN(hackathonStart)) {
                if (repoCreated < hackathonStart) {
                    eligibilityResults.startDate = `FAIL (Repo created before hackathon: ${repoCreated.toISOString().slice(0,10)})`;
                    datePass = false;
                } else {
                    eligibilityResults.startDate = `PASS (${repoCreated.toISOString().slice(0,10)})`;
                }
            }
            if (repoPushed && hackathonEnd && !isNaN(repoPushed) && !isNaN(hackathonEnd)) {
                if (repoPushed > hackathonEnd) {
                    eligibilityResults.deadline = `FAIL (Last commit after deadline: ${repoPushed.toISOString().slice(0,10)})`;
                    datePass = false;
                } else {
                    eligibilityResults.deadline = `PASS (${repoPushed.toISOString().slice(0,10)})`;
                }
            }
            eligible = eligible && datePass;
            // 2. Team size (contributors)
            let teamPass = true;
            if (hackathonCriteria.maxTeamSize) {
                const contributors = repoData.contributors ? repoData.contributors.length : 1;
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
                    eligibilityResults.mustBeOriginal = 'FAIL (Repository is a fork)';
                    originalityPass = false;
                } else {
                    eligibilityResults.mustBeOriginal = 'PASS (Original repository)';
                }
                eligible = eligible && originalityPass;
            }
            // 4. Demo required (check for demo video or demo.md)
            let demoPass = true;
            if (hackathonCriteria.demoRequired !== undefined) {
                const hasDemo = repoData.files && Object.keys(repoData.files).some(f => f.toLowerCase().includes('demo'));
                if (hackathonCriteria.demoRequired && !hasDemo) {
                    eligibilityResults.demoRequired = 'FAIL (No demo file found)';
                    demoPass = false;
                } else if (hackathonCriteria.demoRequired) {
                    eligibilityResults.demoRequired = 'PASS (Demo file found)';
                } else {
                    eligibilityResults.demoRequired = 'N/A';
                }
                eligible = eligible && demoPass;
            }
            // Print results
            Object.entries(eligibilityResults).forEach(([k, v]) => {
                const status = v.startsWith('PASS') ? colorize('✅', 'green') : v.startsWith('N/A') ? colorize('ℹ️', 'blue') : v.startsWith('ERROR') ? colorize('❌', 'red') : colorize('❌', 'red');
                console.log(`${status} ${colorize(k, 'yellow')}: ${colorize(v, v.startsWith('PASS') ? 'green' : v.startsWith('ERROR') ? 'red' : 'yellow')}`);
            });
            console.log(colorize(`\n${eligible ? '🎉 ELIGIBLE for hackathon judging!' : '🚫 NOT ELIGIBLE for hackathon judging.'}`, eligible ? 'green' : 'red'));
        }

        let score = 0;
        let criteriaResults = {};
        let feedbacks = {};

        // Get comprehensive code analysis first
        console.log('Getting comprehensive code analysis...');
        const comprehensiveAnalysis = await getComprehensiveCodeAnalysis(repoData, selectedTemplate);
        
        // Analyze Code Quality (using objective metrics)
        console.log('Evaluating code quality...');
        const codeQualityResult = calculateCodeQualityScore(comprehensiveAnalysis);
        console.log('Code quality score:', codeQualityResult.score);
        criteriaResults.codeQuality = codeQualityResult.score;
        feedbacks.codeQuality = codeQualityResult.feedback;
        score += codeQualityResult.score * CRITERIA_WEIGHTS.codeQuality / 100;

        // Analyze Documentation (using objective metrics)
        console.log('Evaluating documentation...');
        const documentationResult = calculateDocumentationScore(comprehensiveAnalysis);
        console.log('Documentation score:', documentationResult.score);
        criteriaResults.documentation = documentationResult.score;
        feedbacks.documentation = documentationResult.feedback;
        score += documentationResult.score * CRITERIA_WEIGHTS.documentation / 100;

        // Evaluate Functionality (using objective metrics)
        console.log('Evaluating functionality...');
        const functionalityResult = calculateFunctionalityScore(comprehensiveAnalysis);
        console.log('Functionality score:', functionalityResult.score);
        criteriaResults.functionality = functionalityResult.score;
        feedbacks.functionality = functionalityResult.feedback;
        score += functionalityResult.score * CRITERIA_WEIGHTS.functionality / 100;

        // Evaluate Innovation (using objective metrics)
        console.log('Evaluating innovation...');
        const innovationResult = calculateInnovationScore(comprehensiveAnalysis);
        console.log('Innovation score:', innovationResult.score);
        criteriaResults.innovation = innovationResult.score;
        feedbacks.innovation = innovationResult.feedback;
        score += innovationResult.score * CRITERIA_WEIGHTS.innovation / 100;

        // Evaluate User Experience (using objective metrics)
        console.log('Evaluating user experience...');
        const userExperienceResult = calculateUserExperienceScore(comprehensiveAnalysis);
        console.log('User experience score:', userExperienceResult.score);
        criteriaResults.userExperience = userExperienceResult.score;
        feedbacks.userExperience = userExperienceResult.feedback;
        score += userExperienceResult.score * CRITERIA_WEIGHTS.userExperience / 100;

        // Final score (0-10)
        const finalScore = score.toFixed(1);
        console.log('Final score calculated:', finalScore);

        // --- LLM Hackathon Feasibility Check ---
        let llmFeasibility = null;
        if (hackathonCriteria && repoData.commits && repoData.contributors) {
            const hackathonDays = Math.ceil((new Date(hackathonCriteria.deadline) - new Date(hackathonCriteria.startDate)) / (1000 * 60 * 60 * 24)) + 1;
            const prompt = `You are a hackathon judge. The following project was completed by ${repoData.contributors.length} contributors in ${repoData.commits.length} commits, between ${hackathonCriteria.startDate} and ${hackathonCriteria.deadline} (${hackathonDays} days). Here is a summary of the project:\n\n` +
                `Project type: ${comprehensiveAnalysis.projectType}\n` +
                `Main features: ${(innovationResult && innovationResult.features) ? innovationResult.features.join(', ') : 'N/A'}\n` +
                `Codebase size: ${comprehensiveAnalysis.summary.totalLines} lines, ${comprehensiveAnalysis.summary.totalFiles} files.\n` +
                `Please answer: Is it realistic for a team of ${repoData.contributors.length} to build this project in ${hackathonDays} days? Answer YES or NO and explain why. If it looks suspiciously large or complex, say so.`;
            try {
                const response = await callTogetherAIWithTimeout({
                    messages: [
                        { role: 'system', content: 'You are an expert hackathon judge.' },
                        { role: 'user', content: prompt }
                    ],
                    model: 'deepseek-ai/DeepSeek-V3',
                }, 'hackathon feasibility');
                llmFeasibility = response.choices[0].message.content;
                console.log(section('LLM HACKATHON FEASIBILITY JUDGMENT', '🤖', 'blue'));
                console.log(colorize(llmFeasibility, 'white'));
            } catch (e) {
                console.warn('LLM feasibility check failed:', e.message);
            }
        }

        // Run intelligent analysis
        console.log('\n🧠 RUNNING INTELLIGENT ANALYSIS...');
        const intelligentAnalyzer = new IntelligentProjectAnalyzer();
        const intelligentAnalysis = await intelligentAnalyzer.analyzeRepository(owner, repo);
        
        // Display intelligent analysis results
        if (intelligentAnalysis) {
            console.log(section('🧠 INTELLIGENT ANALYSIS RESULTS', '🧠', 'cyan'));
            
            // Project Purpose with clear conclusion
            console.log('\n🎯 PROJECT PURPOSE:');
            if (intelligentAnalysis.projectPurpose.conclusion) {
                console.log(`   💡 CONCLUSION: ${intelligentAnalysis.projectPurpose.conclusion}`);
            }
            console.log(`   Type: ${intelligentAnalysis.projectPurpose.type}`);
            console.log(`   Domain: ${intelligentAnalysis.projectPurpose.domain}`);
            console.log(`   Complexity: ${intelligentAnalysis.projectPurpose.complexity}`);
            console.log(`   Target Audience: ${intelligentAnalysis.projectPurpose.target}`);
            console.log(`   Confidence: ${Math.round(intelligentAnalysis.projectPurpose.confidence * 100)}%`);
            
            if (intelligentAnalysis.projectPurpose.description) {
                console.log(`   Description: ${intelligentAnalysis.projectPurpose.description}`);
            }
            
            if (intelligentAnalysis.projectPurpose.features && intelligentAnalysis.projectPurpose.features.length > 0) {
                console.log(`   Main Features: ${intelligentAnalysis.projectPurpose.features.join(', ')}`);
            }
            
            if (intelligentAnalysis.projectPurpose.technologies && intelligentAnalysis.projectPurpose.technologies.length > 0) {
                console.log(`   Technology Stack: ${intelligentAnalysis.projectPurpose.technologies.join(', ')}`);
            }
            
            if (intelligentAnalysis.projectPurpose.keyFiles && intelligentAnalysis.projectPurpose.keyFiles.length > 0) {
                console.log(`   Key Files: ${intelligentAnalysis.projectPurpose.keyFiles.slice(0, 5).join(', ')}${intelligentAnalysis.projectPurpose.keyFiles.length > 5 ? '...' : ''}`);
            }
            
            // Architecture
            console.log('\n🏗️ ARCHITECTURE:');
            console.log(`   Pattern: ${intelligentAnalysis.architecture.pattern}`);
            console.log(`   Layers: ${intelligentAnalysis.architecture.layers.join(', ')}`);
            console.log(`   Design Patterns: ${intelligentAnalysis.architecture.patterns.join(', ')}`);
            console.log(`   Quality Score: ${intelligentAnalysis.architecture.quality}/10`);
            if (intelligentAnalysis.architecture.strengths.length > 0) {
                console.log(`   Strengths: ${intelligentAnalysis.architecture.strengths.join(', ')}`);
            }
            if (intelligentAnalysis.architecture.weaknesses.length > 0) {
                console.log(`   Weaknesses: ${intelligentAnalysis.architecture.weaknesses.join(', ')}`);
            }
            
            // Coherence
            console.log('\n🔗 COHERENCE:');
            console.log(`   Overall Consistency: ${intelligentAnalysis.coherence.consistency.toFixed(1)}/10`);
            console.log(`   Naming Consistency: ${intelligentAnalysis.coherence.naming.toFixed(1)}/10`);
            console.log(`   Structural Consistency: ${intelligentAnalysis.coherence.structure.toFixed(1)}/10`);
            console.log(`   Pattern Consistency: ${intelligentAnalysis.coherence.patterns.toFixed(1)}/10`);
            
            // Quality
            console.log('\n📊 CODE QUALITY:');
            console.log(`   Overall Quality: ${intelligentAnalysis.quality.overall.toFixed(1)}/10`);
            console.log(`   Maintainability: ${intelligentAnalysis.quality.maintainability.toFixed(1)}/10`);
            console.log(`   Readability: ${intelligentAnalysis.quality.readability.toFixed(1)}/10`);
            console.log(`   Performance: ${intelligentAnalysis.quality.performance.toFixed(1)}/10`);
            console.log(`   Security: ${intelligentAnalysis.quality.security.toFixed(1)}/10`);
            console.log(`   Testability: ${intelligentAnalysis.quality.testability.toFixed(1)}/10`);
            
            // File Structure Summary
            if (intelligentAnalysis.structure) {
                console.log('\n📁 FILE STRUCTURE SUMMARY:');
                console.log(`   Total Files Analyzed: ${intelligentAnalysis.structure.allFiles.length}`);
                console.log(`   Total Directories: ${intelligentAnalysis.structure.allDirectories.length}`);
                console.log(`   Files with Content Analysis: ${Object.keys(intelligentAnalysis.structure.fileContents).length}`);
                
                // Show file types distribution
                const fileTypes = {};
                intelligentAnalysis.structure.allFiles.forEach(file => {
                    const ext = file.split('.').pop().toLowerCase();
                    fileTypes[ext] = (fileTypes[ext] || 0) + 1;
                });
                console.log(`   File Types: ${Object.entries(fileTypes).map(([ext, count]) => `${ext}(${count})`).join(', ')}`);
            }
            
            // Intelligent Insights
            console.log('\n💡 INTELLIGENT INSIGHTS:');
            intelligentAnalysis.insights.forEach((insight, index) => {
                const emoji = insight.category === 'strength' ? colorize('✅', 'green') : 
                             insight.category === 'improvement' ? colorize('⚠️', 'yellow') : 
                             insight.category === 'understanding' ? colorize('🧠', 'cyan') : 
                             insight.category === 'information' ? colorize('📊', 'magenta') : colorize('💡', 'green');
                console.log(`   ${emoji} ${insight.title} (${Math.round(insight.confidence * 100)}% confidence)`);
                console.log(`      ${insight.message}`);
            });
        }
        
        // Get comprehensive code analysis for detailed feedback
        console.log('\n=== COMPREHENSIVE CODE ANALYSIS ===');
        
        // Print comprehensive feedback
        console.log('\n📊 PROJECT STRUCTURE ANALYSIS:');
        console.log(`Project Type: ${comprehensiveAnalysis.projectType}`);
        console.log(`Total Files Analyzed: ${comprehensiveAnalysis.summary.totalFiles}`);
        console.log(`Total Lines of Code: ${comprehensiveAnalysis.summary.totalLines}`);
        console.log(`File Types:`, comprehensiveAnalysis.summary.fileTypes);
        
        // Print detailed file feedback
        console.log('\n📁 DETAILED FILE ANALYSIS:');
        Object.keys(comprehensiveAnalysis.files).forEach(fileName => {
            const file = comprehensiveAnalysis.files[fileName];
            console.log(`\n📄 ${fileName}:`);
            console.log(`   Lines: ${file.lines}`);
            console.log(`   Size: ${file.size} characters`);
            console.log(`   Type: ${file.type}`);
            
            // Show first few lines as preview
            const preview = file.content.split('\n').slice(0, 3).join('\n   ');
            console.log(`   Preview:\n   ${preview}...`);
        });

        // Print feedbacks for each criterion
        Object.keys(feedbacks).forEach(key => {
            console.log(`\n${key.charAt(0).toUpperCase() + key.slice(1)} Feedback:`);
            console.log(feedbacks[key]);
        });

        return {
            repoName: repoData.name,
            criteriaResults,
            feedbacks,
            finalScore,
            comprehensiveAnalysis,
            intelligentAnalysis
        };
    } catch (error) {
        console.error('Error analyzing repository:', error);
        return null;
    }
};

// Helper to call Together AI with timeout
const callTogetherAIWithTimeout = async (params, label) => {
    const timeoutMs = 30000; // 30 seconds
    return Promise.race([
        together.chat.completions.create(params),
        new Promise((_, reject) => setTimeout(() => reject(new Error(`Together AI timeout for ${label}`)), timeoutMs))
    ]);
};

// AI-powered Code Quality Evaluation using Together AI
const evaluateCodeQualityWithAI = async (repoData) => {
    console.log('Getting code sample for code quality...');
    const codeSample = await getCodeSample(repoData);  // Fetch a sample of code
    console.log('Code sample fetched for code quality.');
    if (!codeSample || codeSample === 'No code sample found') {
        console.warn('No code sample available for code quality. Returning default score.');
        return { score: 5, feedback: 'No code sample available.' };
    }
    try {
        const response = await callTogetherAIWithTimeout({
            messages: [
                { role: "system", content: "You are an expert code reviewer. Evaluate the following code based on its structure, readability, and best practices. Give a short feedback and a score from 1 to 10." },
                { role: "user", content: `Here is a code sample: ${codeSample}` }
            ],
            model: "deepseek-ai/DeepSeek-V3",  // Use Together AI model
        }, 'code quality');
        console.log('AI response for code quality received.');
        const evaluation = response.choices[0].message.content;
        return { score: evaluateAIResponse(evaluation), feedback: evaluation };
    } catch (error) {
        console.error('Error evaluating code quality:', error);
        return { score: 5, feedback: 'Error or timeout during code quality evaluation.' };
    }
};

// AI-powered Documentation Evaluation using Together AI
const evaluateDocumentationWithAI = async (repoData) => {
    console.log('Getting README for documentation...');
    const readme = await getReadme(repoData);  // Fetch README for evaluation
    console.log('README fetched for documentation.');
    if (!readme || readme === 'No README found') {
        console.warn('No README available for documentation. Returning score 0.');
        return { score: 0, feedback: 'No README available.' };
    }
    try {
        const response = await callTogetherAIWithTimeout({
            messages: [
                { role: "system", content: "You are an expert in documentation evaluation. Assess the following README documentation for clarity, completeness, and usefulness. Give a short feedback and a score from 1 to 10." },
                { role: "user", content: `Here is the README documentation: ${readme}` }
            ],
            model: "deepseek-ai/DeepSeek-V3",
        }, 'documentation');
        console.log('AI response for documentation received.');
        const evaluation = response.choices[0].message.content;
        return { score: evaluateAIResponse(evaluation), feedback: evaluation };
    } catch (error) {
        console.error('Error evaluating documentation:', error);
        return { score: 5, feedback: 'Error or timeout during documentation evaluation.' };
    }
};

// AI-powered Functionality Evaluation using Together AI
const evaluateFunctionalityWithAI = async (repoData) => {
    console.log('Getting code sample for functionality...');
    const codeSample = await getCodeSample(repoData); // Reuse code sample for functionality
    console.log('Code sample fetched for functionality.');
    if (!codeSample || codeSample === 'No code sample found') {
        console.warn('No code sample available for functionality. Returning default score.');
        return { score: 5, feedback: 'No code sample available.' };
    }
    try {
        const response = await callTogetherAIWithTimeout({
            messages: [
                { role: "system", content: "You are an expert software tester. Evaluate the following code for its functionality, completeness, and reliability. Give a short feedback and a score from 1 to 10." },
                { role: "user", content: `Here is a code sample: ${codeSample}` }
            ],
            model: "deepseek-ai/DeepSeek-V3",
        }, 'functionality');
        console.log('AI response for functionality received.');
        const evaluation = response.choices[0].message.content;
        return { score: evaluateAIResponse(evaluation), feedback: evaluation };
    } catch (error) {
        console.error('Error evaluating functionality:', error);
        return { score: 5, feedback: 'Error or timeout during functionality evaluation.' };
    }
};

// AI-powered Innovation Evaluation using Together AI
const evaluateInnovationWithAI = async (repoData) => {
    console.log('Getting README for innovation...');
    const readme = await getReadme(repoData); // Use README as a proxy for innovation
    console.log('README fetched for innovation.');
    if (!readme || readme === 'No README found') {
        console.warn('No README available for innovation. Returning score 0.');
        return { score: 0, feedback: 'No README available.' };
    }
    try {
        const response = await callTogetherAIWithTimeout({
            messages: [
                { role: "system", content: "You are an expert in software innovation. Assess the following project for its originality and innovative features based on its documentation. Give a short feedback and a score from 1 to 10." },
                { role: "user", content: `Here is the README documentation: ${readme}` }
            ],
            model: "deepseek-ai/DeepSeek-V3",
        }, 'innovation');
        console.log('AI response for innovation received.');
        const evaluation = response.choices[0].message.content;
        return { score: evaluateAIResponse(evaluation), feedback: evaluation };
    } catch (error) {
        console.error('Error evaluating innovation:', error);
        return { score: 5, feedback: 'Error or timeout during innovation evaluation.' };
    }
};

// AI-powered User Experience Evaluation using Together AI
const evaluateUserExperienceWithAI = async (repoData) => {
    console.log('Getting README for user experience...');
    const readme = await getReadme(repoData); // Use README as a proxy for UX
    console.log('README fetched for user experience.');
    if (!readme || readme === 'No README found') {
        console.warn('No README available for user experience. Returning score 0.');
        return { score: 0, feedback: 'No README available.' };
    }
    try {
        const response = await callTogetherAIWithTimeout({
            messages: [
                { role: "system", content: "You are an expert in user experience. Evaluate the following project for its usability and user-friendliness based on its documentation. Give a short feedback and a score from 1 to 10." },
                { role: "user", content: `Here is the README documentation: ${readme}` }
            ],
            model: "deepseek-ai/DeepSeek-V3",
        }, 'user experience');
        console.log('AI response for user experience received.');
        const evaluation = response.choices[0].message.content;
        return { score: evaluateAIResponse(evaluation), feedback: evaluation };
    } catch (error) {
        console.error('Error evaluating user experience:', error);
        return { score: 5, feedback: 'Error or timeout during user experience evaluation.' };
    }
};

// Utility function to parse AI evaluation into a score
const evaluateAIResponse = (responseContent) => {
    // More comprehensive parsing of AI evaluation
    const content = responseContent.toLowerCase();
    
    // Look for explicit scores first
    const scoreMatch = content.match(/(\d+(?:\.\d+)?)\/10|score[:\s]*(\d+(?:\.\d+)?)/i);
    if (scoreMatch) {
        const score = parseFloat(scoreMatch[1] || scoreMatch[2]);
        if (score >= 0 && score <= 10) {
            return Math.round(score);
        }
    }
    
    // Look for score patterns like "8.5/10" or "Score: 7"
    const patternMatch = content.match(/(\d+(?:\.\d+)?)\s*\/\s*10/);
    if (patternMatch) {
        const score = parseFloat(patternMatch[1]);
        if (score >= 0 && score <= 10) {
            return Math.round(score);
        }
    }
    
    // Keyword-based scoring as fallback
    if (content.includes('excellent') || content.includes('outstanding') || content.includes('9') || content.includes('10')) return 9;
    if (content.includes('very good') || content.includes('great') || content.includes('8')) return 8;
    if (content.includes('good') || content.includes('solid') || content.includes('7')) return 7;
    if (content.includes('above average') || content.includes('decent') || content.includes('6')) return 6;
    if (content.includes('average') || content.includes('adequate') || content.includes('5')) return 5;
    if (content.includes('below average') || content.includes('poor') || content.includes('4')) return 4;
    if (content.includes('bad') || content.includes('inadequate') || content.includes('3')) return 3;
    if (content.includes('very bad') || content.includes('terrible') || content.includes('2')) return 2;
    if (content.includes('awful') || content.includes('unacceptable') || content.includes('1')) return 1;
    
    // Default fallback
    return 5;
};

// Utility to get code sample based on project templates
const getCodeSample = async (repoData) => {
    console.log('[getCodeSample] Loading project templates...');
    const templates = loadProjectTemplates();
    
    // Try to detect project type from the repository
    console.log('[getCodeSample] Detecting project type...');
    const projectType = await detectProjectTypeFromRepo(repoData);
    console.log(`[getCodeSample] Detected project type: ${projectType}`);
    
    // Get template files for the detected project type
    const templateFiles = templates[projectType] || templates['custom'];
    console.log(`[getCodeSample] Template files for ${projectType}:`, templateFiles);
    
    // Try to fetch files from the template in order
    for (const filePath of templateFiles) {
        console.log(`[getCodeSample] Attempting to fetch file: ${filePath}`);
        try {
            const fileResponse = await axios.get(`${repoData.url}/contents/${filePath}`, {
                headers: {
                    Authorization: `token ${process.env.GITHUB_TOKEN}`,
                },
            });
            const fileContent = Buffer.from(fileResponse.data.content, 'base64').toString('utf8');
            console.log(`[getCodeSample] Successfully fetched file: ${filePath}`);
            console.log(`[getCodeSample] File size: ${fileContent.length} characters`);
            console.log(`[getCodeSample] Code preview (first 200 chars): ${fileContent.substring(0, 200)}...`);
            return fileContent;
        } catch (error) {
            console.log(`[getCodeSample] File not found: ${filePath} (${error.response?.status || error.message})`);
            continue;
        }
    }
    
    console.error('[getCodeSample] No template files found in repository');
    return 'No code sample found';
};

// Utility to get README content
const getReadme = async (repoData) => {
    try {
        const fileResponse = await axios.get(`${repoData.url}/contents/README.md`, {
            headers: {
                Authorization: `token ${process.env.GITHUB_TOKEN}`,
            },
        });

        const readmeContent = Buffer.from(fileResponse.data.content, 'base64').toString('utf8');
        return readmeContent;
    } catch (error) {
        // Only log if error is not a 404 (file not found)
        if (!(error.response && error.response.status === 404)) {
            console.error('Error fetching README:', error);
        }
        return 'No README found';
    }
};

// Fetch repository metadata from GitHub
const fetchRepoData = async (owner, repo) => {
    try {
        const headers = {
            Authorization: `token ${process.env.GITHUB_TOKEN}`,
            'User-Agent': 'github-agent-script',
        };
        // Basic repo info
        const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, { headers });
        const data = response.data;
        // Contributors
        let contributors = [];
        try {
            const contribRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contributors?per_page=100`, { headers });
            contributors = contribRes.data.map(c => ({ login: c.login, contributions: c.contributions }));
        } catch (e) {
            console.warn('Could not fetch contributors:', e.message);
        }
        // Commits
        let commits = [];
        try {
            let page = 1;
            let keepFetching = true;
            while (keepFetching) {
                const commitRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=100&page=${page}`, { headers });
                if (commitRes.data.length > 0) {
                    commits = commits.concat(commitRes.data.map(c => ({
                        sha: c.sha,
                        author: c.commit.author.name,
                        date: c.commit.author.date,
                        login: c.author ? c.author.login : null
                    })));
                    page++;
                } else {
                    keepFetching = false;
                }
            }
        } catch (e) {
            console.warn('Could not fetch commits:', e.message);
        }
        return {
            name: data.name,
            url: `https://api.github.com/repos/${owner}/${repo}`,
            full_name: data.full_name,
            description: data.description,
            default_branch: data.default_branch,
            owner: data.owner.login,
            created_at: data.created_at,
            pushed_at: data.pushed_at,
            fork: data.fork,
            contributors,
            commits
        };
    } catch (error) {
        console.error('Error fetching repo data:', error.message);
        throw error;
    }
};

// Load project templates from JSON
const loadProjectTemplates = () => {
    const templatePath = path.join(__dirname, 'projectTemplates.json');
    if (fs.existsSync(templatePath)) {
        return JSON.parse(fs.readFileSync(templatePath, 'utf8'));
    }
    return {};
};

// Detect project type based on repository contents
const detectProjectTypeFromRepo = async (repoData) => {
    try {
        // First, try to get the root directory contents
        const contentsResponse = await axios.get(`${repoData.url}/contents`, {
            headers: {
                Authorization: `token ${process.env.GITHUB_TOKEN}`,
            },
        });
        
        const files = contentsResponse.data.map(item => item.name);
        console.log('[detectProjectTypeFromRepo] Repository files:', files);
        
        // Check for Next.js indicators
        if (files.includes('next.config.js') || files.includes('next.config.mjs')) {
            return 'nextjs';
        }
        
        // Check for package.json to analyze dependencies
        if (files.includes('package.json')) {
            try {
                const pkgResponse = await axios.get(`${repoData.url}/contents/package.json`, {
                    headers: {
                        Authorization: `token ${process.env.GITHUB_TOKEN}`,
                    },
                });
                const pkgContent = Buffer.from(pkgResponse.data.content, 'base64').toString('utf8');
                const pkg = JSON.parse(pkgContent);
                const deps = { ...pkg.dependencies, ...pkg.devDependencies };
                
                if (deps['next']) return 'nextjs';
                if (deps['react-scripts'] || deps['react']) return 'react';
            } catch (error) {
                console.log('[detectProjectTypeFromRepo] Could not read package.json:', error.message);
            }
        }
        
        // Check for React indicators
        if (files.includes('src') && (files.includes('App.js') || files.includes('App.jsx') || files.includes('App.tsx'))) {
            return 'react';
        }
        
        // Check for Node.js/Express indicators
        if (files.includes('package.json') && (files.includes('index.js') || files.includes('server.js') || files.includes('app.js'))) {
            return 'nodejs';
        }
        
        return 'custom';
    } catch (error) {
        console.error('[detectProjectTypeFromRepo] Error detecting project type:', error.message);
        return 'custom';
    }
};

// Detect project type based on files and package.json (local version)
const detectProjectType = () => {
    // Check for next.config.js
    if (fs.existsSync(path.join(process.cwd(), 'next.config.js'))) {
        return 'nextjs';
    }
    // Check package.json dependencies
    const pkgPath = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };
        if (deps['next']) return 'nextjs';
        if (deps['react-scripts'] || deps['react']) return 'react';
    }
    return 'custom';
};

// Function to fetch and analyze multiple files for comprehensive feedback
const getComprehensiveCodeAnalysis = async (repoData, selectedTemplate = 'auto') => {
    console.log('[getComprehensiveCodeAnalysis] Starting comprehensive file analysis...');
    
    const templates = loadProjectTemplates();
    let projectType;
    
    if (selectedTemplate === 'auto') {
        projectType = await detectProjectTypeFromRepo(repoData);
        console.log(`[getComprehensiveCodeAnalysis] Auto-detected project type: ${projectType}`);
    } else {
        projectType = selectedTemplate;
        console.log(`[getComprehensiveCodeAnalysis] Using selected template: ${projectType}`);
    }
    
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

// Evaluate project structure based on template criteria
const evaluateProjectStructure = (codeAnalysis) => {
    let points = 0;
    const feedback = [];
    const details = [];
    
    const templates = loadProjectTemplates();
    const projectType = codeAnalysis.projectType;
    const template = templates[projectType];
    
    if (!template || !template.criteria) {
        details.push("❌ No template criteria found for project type");
        return { points: 0, feedback: ["❌ No template criteria found"], details };
    }
    
    const criteria = template.criteria.fileStructure;
    const files = codeAnalysis.files;
    
    // Check each structural category
    Object.entries(criteria).forEach(([category, expectedFiles]) => {
        let categoryPoints = 0;
        let foundFiles = 0;
        
        expectedFiles.forEach(expectedFile => {
            // Check for exact matches and wildcard patterns
            const matchingFiles = Object.keys(files).filter(file => {
                if (expectedFile.includes('*')) {
                    const pattern = expectedFile.replace('*', '');
                    return file.includes(pattern);
                }
                return file === expectedFile || file.startsWith(expectedFile);
            });
            
            if (matchingFiles.length > 0) {
                foundFiles++;
                categoryPoints += 2; // 2 points per found file
                details.push(`✅ Found: ${expectedFile} (${matchingFiles.join(', ')})`);
            } else {
                details.push(`❌ Missing: ${expectedFile}`);
            }
        });
        
        // Bonus points for complete categories
        if (foundFiles === expectedFiles.length) {
            categoryPoints += 3; // Bonus for complete category
            feedback.push(`✅ Complete ${category} structure`);
        } else if (foundFiles > expectedFiles.length * 0.5) {
            feedback.push(`⚠️ Partial ${category} structure (${foundFiles}/${expectedFiles.length})`);
        } else {
            feedback.push(`❌ Incomplete ${category} structure (${foundFiles}/${expectedFiles.length})`);
        }
        
        points += categoryPoints;
        console.log(`   ${foundFiles > expectedFiles.length * 0.5 ? '✅' : '❌'} ${category}: ${foundFiles}/${expectedFiles.length} files (${categoryPoints} points)`);
    });
    
    return { points: Math.min(30, points), feedback, details };
};

// Evaluate code quality metrics
const evaluateCodeQuality = (codeAnalysis) => {
    let points = 0;
    const feedback = [];
    const details = [];
    
    // Check main code files
    const mainFiles = ['index.js', 'index.ts', 'App.js', 'App.tsx', 'main.js', 'main.ts'];
    let hasMainFile = false;
    
    mainFiles.forEach(file => {
        if (codeAnalysis.files[file]) {
            hasMainFile = true;
            const content = codeAnalysis.files[file].content;
            const lines = content.split('\n');
            
            // Code documentation (5 points)
            const commentLines = lines.filter(line => 
                line.trim().startsWith('//') || 
                line.trim().startsWith('/*') || 
                line.trim().startsWith('*') ||
                line.trim().startsWith('<!--')
            );
            const commentRatio = commentLines.length / lines.length;
            
            if (commentRatio > 0.1) {
                points += 5;
                feedback.push("✅ Excellent code documentation");
                details.push(`✅ High comment ratio: ${Math.round(commentRatio * 100)}%`);
            } else if (commentRatio > 0.05) {
                points += 3;
                feedback.push("✅ Good code documentation");
                details.push(`✅ Good comment ratio: ${Math.round(commentRatio * 100)}%`);
            } else {
                details.push(`❌ Low comment ratio: ${Math.round(commentRatio * 100)}%`);
            }
            
            // Code formatting (5 points)
            const hasConsistentIndentation = lines.every(line => 
                line === '' || line.startsWith(' ') || line.startsWith('\t') || !line.startsWith(' ')
            );
            if (hasConsistentIndentation) {
                points += 5;
                feedback.push("✅ Consistent code formatting");
                details.push("✅ Proper indentation throughout");
            } else {
                details.push("❌ Inconsistent indentation");
            }
            
            // Modern JavaScript/TypeScript features (5 points)
            const modernFeatures = [
                'const ', 'let ', '=>', 'async', 'await', 'import ', 'export ',
                'interface ', 'type ', 'enum ', 'class ', 'extends '
            ];
            const foundFeatures = modernFeatures.filter(feature => content.includes(feature));
            
            if (foundFeatures.length >= 5) {
                points += 5;
                feedback.push("✅ Modern language features used");
                details.push(`✅ Found ${foundFeatures.length} modern features`);
            } else {
                details.push(`❌ Limited modern features: ${foundFeatures.length}/5`);
            }
            
            // Error handling (5 points)
            if (content.includes('try') && content.includes('catch') || 
                content.includes('error') || content.includes('Error')) {
                points += 5;
                feedback.push("✅ Proper error handling");
                details.push("✅ Error handling patterns found");
            } else {
                details.push("❌ No error handling patterns");
            }
            
            // Type safety (5 points)
            if (content.includes('interface') || content.includes('type ') || 
                content.includes(': ') || content.includes('as ')) {
                points += 5;
                feedback.push("✅ Type safety implemented");
                details.push("✅ TypeScript or type annotations found");
            } else {
                details.push("❌ No type safety patterns");
            }
        }
    });
    
    if (!hasMainFile) {
        details.push("❌ No main code file found for analysis");
    }
    
    return { points: Math.min(25, points), feedback, details };
};

// Evaluate security and performance
const evaluateSecurityAndPerformance = (codeAnalysis) => {
    let points = 0;
    const feedback = [];
    const details = [];
    
    // Check for security configurations
    const securityFiles = [
        '.env', '.env.local', '.env.example', 'middleware', 'middleware.ts', 'middleware.js'
    ];
    
    securityFiles.forEach(file => {
        if (codeAnalysis.files[file]) {
            const content = codeAnalysis.files[file].content;
            
            // Environment variables (5 points)
            if (content.includes('process.env') || content.includes('NEXT_PUBLIC_')) {
                points += 5;
                feedback.push("✅ Environment variables configured");
                details.push(`✅ Environment config in ${file}`);
            }
            
            // Security middleware (5 points)
            if (content.includes('helmet') || content.includes('cors') || 
                content.includes('rate-limit') || content.includes('csrf')) {
                points += 5;
                feedback.push("✅ Security middleware implemented");
                details.push(`✅ Security features in ${file}`);
            }
        }
    });
    
    // Check package.json for security dependencies
    if (codeAnalysis.files['package.json']) {
        const pkgContent = codeAnalysis.files['package.json'].content;
        
        // Security packages (5 points)
        const securityPackages = ['helmet', 'cors', 'express-rate-limit', 'bcrypt', 'jsonwebtoken'];
        const foundSecurityPackages = securityPackages.filter(pkg => pkgContent.includes(pkg));
        
        if (foundSecurityPackages.length >= 2) {
            points += 5;
            feedback.push("✅ Security packages included");
            details.push(`✅ Found security packages: ${foundSecurityPackages.join(', ')}`);
        } else {
            details.push(`❌ Limited security packages: ${foundSecurityPackages.join(', ') || 'none'}`);
        }
        
        // Performance packages (5 points)
        const performancePackages = ['compression', 'cache-manager', 'redis', 'pm2'];
        const foundPerformancePackages = performancePackages.filter(pkg => pkgContent.includes(pkg));
        
        if (foundPerformancePackages.length >= 1) {
            points += 5;
            feedback.push("✅ Performance optimization packages");
            details.push(`✅ Found performance packages: ${foundPerformancePackages.join(', ')}`);
        } else {
            details.push("❌ No performance optimization packages");
        }
    }
    
    // Check for testing setup (5 points)
    const testFiles = ['jest.config', 'cypress.config', 'playwright.config', 'tests/'];
    const hasTesting = testFiles.some(file => codeAnalysis.files[file]);
    
    if (hasTesting) {
        points += 5;
        feedback.push("✅ Testing framework configured");
        details.push("✅ Testing setup found");
    } else {
        details.push("❌ No testing framework configured");
    }
    
    return { points: Math.min(25, points), feedback, details };
};

// Evaluate modern development practices
const evaluateModernPractices = (codeAnalysis) => {
    let points = 0;
    const feedback = [];
    const details = [];
    
    // Check for modern tooling
    const modernTools = [
        'vite.config', 'webpack.config', 'tailwind.config', 'postcss.config',
        'tsconfig.json', 'eslint.config', 'prettier.config'
    ];
    
    const foundTools = modernTools.filter(tool => {
        return Object.keys(codeAnalysis.files).some(file => file.includes(tool));
    });
    
    if (foundTools.length >= 3) {
        points += 5;
        feedback.push("✅ Modern build tools configured");
        details.push(`✅ Found modern tools: ${foundTools.join(', ')}`);
    } else {
        details.push(`❌ Limited modern tools: ${foundTools.join(', ') || 'none'}`);
    }
    
    // Check for CI/CD
    const cicdFiles = ['.github/workflows', 'gitlab-ci.yml', '.gitlab-ci.yml', 'azure-pipelines.yml'];
    const hasCICD = cicdFiles.some(file => codeAnalysis.files[file]);
    
    if (hasCICD) {
        points += 5;
        feedback.push("✅ CI/CD pipeline configured");
        details.push("✅ CI/CD configuration found");
    } else {
        details.push("❌ No CI/CD pipeline configured");
    }
    
    // Check for containerization
    const containerFiles = ['dockerfile', 'docker-compose.yml', 'Dockerfile'];
    const hasContainerization = containerFiles.some(file => 
        Object.keys(codeAnalysis.files).some(f => f.toLowerCase().includes(file.toLowerCase()))
    );
    
    if (hasContainerization) {
        points += 5;
        feedback.push("✅ Containerization configured");
        details.push("✅ Docker configuration found");
    } else {
        details.push("❌ No containerization configured");
    }
    
    // Check for database integration
    const dbFiles = ['prisma/schema.prisma', 'supabase', 'mongodb', 'postgresql'];
    const hasDatabase = dbFiles.some(file => 
        Object.keys(codeAnalysis.files).some(f => f.includes(file))
    );
    
    if (hasDatabase) {
        points += 5;
        feedback.push("✅ Database integration configured");
        details.push("✅ Database configuration found");
    } else {
        details.push("❌ No database integration configured");
    }
    
    return { points: Math.min(20, points), feedback, details };
};

// Objective Functionality Metrics
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

// Objective Innovation Score (based on project complexity and features)
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

// Objective User Experience Score (based on API design and documentation)
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

module.exports = { analyzeRepo };
