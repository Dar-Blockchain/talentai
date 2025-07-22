const inquirer = require('inquirer');
const { analyzeRepo } = require('./evaluateRepo');
const fs = require('fs');
const path = require('path');

// Load project templates
const loadProjectTemplates = () => {
    const templatePath = path.join(__dirname, 'projectTemplates.json');
    if (fs.existsSync(templatePath)) {
        return JSON.parse(fs.readFileSync(templatePath, 'utf8'));
    }
    return {};
};

// Load hackathon templates
const loadHackathonTemplates = () => {
    const templatePath = path.join(__dirname, 'hackathonTemplates.json');
    if (fs.existsSync(templatePath)) {
        return JSON.parse(fs.readFileSync(templatePath, 'utf8'));
    }
    return {};
};

// Display welcome banner
const displayBanner = () => {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 GITHUB REPOSITORY EVALUATOR');
    console.log('='.repeat(60));
    console.log('Analyze your GitHub repositories with objective metrics!');
    console.log('='.repeat(60) + '\n');
};

// Main menu with hackathon selection
const showMainMenu = async () => {
    const templates = loadProjectTemplates();
    const hackathonTemplates = loadHackathonTemplates();
    const hackathonOptions = Object.keys(hackathonTemplates).map(key => ({
        name: `${hackathonTemplates[key].hackathonName} (${hackathonTemplates[key].startDate} to ${hackathonTemplates[key].deadline})`,
        value: key
    }));
    const templateOptions = Object.keys(templates).map(key => ({
        name: `${key.toUpperCase()} - ${templates[key].description} (${templates[key].files.length} files)`,
        value: key
    }));

    const questions = [
        {
            type: 'input',
            name: 'owner',
            message: '📝 Enter GitHub repository owner (username):',
            validate: (input) => {
                if (input.trim() === '') {
                    return 'Owner cannot be empty!';
                }
                return true;
            }
        },
        {
            type: 'input',
            name: 'repo',
            message: '📁 Enter GitHub repository name:',
            validate: (input) => {
                if (input.trim() === '') {
                    return 'Repository name cannot be empty!';
                }
                return true;
            }
        },
        {
            type: 'list',
            name: 'hackathon',
            message: '🏆 Select hackathon template:',
            choices: [
                ...hackathonOptions,
                new inquirer.Separator(),
                { name: '❌ No hackathon (skip)', value: null }
            ]
        },
        {
            type: 'list',
            name: 'template',
            message: '🎯 Select project template (or let auto-detect):',
            choices: [
                { name: '🤖 AUTO-DETECT - Let the system detect project type', value: 'auto' },
                ...templateOptions,
                new inquirer.Separator(),
                { name: '📋 View all available templates', value: 'view_templates' },
                { name: '❌ Exit', value: 'exit' }
            ]
        },
        {
            type: 'confirm',
            name: 'showDetailedBreakdown',
            message: '📊 Show detailed scoring breakdown?',
            default: true
        },
        {
            type: 'confirm',
            name: 'saveResults',
            message: '💾 Save results to file?',
            default: false
        }
    ];

    const answers = await inquirer.prompt(questions);

    if (answers.template === 'exit') {
        console.log('\n👋 Goodbye!');
        process.exit(0);
    }

    if (answers.template === 'view_templates') {
        await showTemplatesMenu();
        return await showMainMenu();
    }

    // Attach selected hackathon criteria to answers
    if (answers.hackathon && hackathonTemplates[answers.hackathon]) {
        answers.hackathonCriteria = hackathonTemplates[answers.hackathon];
    } else {
        answers.hackathonCriteria = null;
    }

    return answers;
};

// Templates menu
const showTemplatesMenu = async () => {
    const templates = loadProjectTemplates();
    
    console.log('\n📋 AVAILABLE PROJECT TEMPLATES:');
    console.log('='.repeat(50));
    
    Object.keys(templates).forEach(templateName => {
        const template = templates[templateName];
        console.log(`\n🎯 ${templateName.toUpperCase()}:`);
        console.log(`   Description: ${template.description}`);
        console.log(`   Files to analyze: ${template.files.length}`);
        console.log('   Key Files:');
        template.files.slice(0, 10).forEach(file => {
            console.log(`     - ${file}`);
        });
        if (template.files.length > 10) {
            console.log(`     ... and ${template.files.length - 10} more files`);
        }
    });
    
    console.log('\n' + '='.repeat(50));
    
    const { continueAnalysis } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'continueAnalysis',
            message: 'Continue with repository analysis?',
            default: true
        }
    ]);
    
    if (!continueAnalysis) {
        console.log('\n👋 Goodbye!');
        process.exit(0);
    }
};

// Get template description
const getTemplateDescription = (templateName) => {
    const descriptions = {
        'nextjs': 'Next.js React framework with pages, API routes, and components',
        'react': 'React application with components and source files',
        'nodejs': 'Node.js/Express backend with controllers, routes, and models',
        'custom': 'Generic project structure with main files and components'
    };
    return descriptions[templateName] || 'Custom project template';
};

// Run analysis
const runAnalysis = async (answers) => {
    console.log('\n🔍 STARTING REPOSITORY ANALYSIS...');
    console.log('='.repeat(50));
    console.log(`Repository: ${answers.owner}/${answers.repo}`);
    console.log(`Template: ${answers.template === 'auto' ? 'Auto-detect' : answers.template}`);
    console.log('='.repeat(50) + '\n');

    try {
        const startTime = Date.now();
        const result = await analyzeRepo(answers.owner, answers.repo, answers.template, answers.hackathonCriteria);
        const endTime = Date.now();
        
        if (result) {
            displayResults(result, answers, endTime - startTime);
            
            if (answers.saveResults) {
                saveResultsToFile(result, answers);
            }
        } else {
            console.log('❌ Analysis failed. Please check your repository details and try again.');
        }
    } catch (error) {
        console.error('❌ Error during analysis:', error.message);
    }
};

// Display results
const displayResults = (result, answers, duration) => {
    console.log('\n' + '='.repeat(60));
    console.log('📊 ANALYSIS RESULTS');
    console.log('='.repeat(60));
    
    console.log(`\n🏷️  Project: ${result.repoName}`);
    console.log(`⏱️  Analysis Time: ${duration}ms`);
    console.log(`🎯 Final Score: ${result.finalScore}/10`);
    
    console.log('\n📈 CRITERIA BREAKDOWN:');
    console.log('-'.repeat(40));
    Object.entries(result.criteriaResults).forEach(([criterion, score]) => {
        const emoji = score >= 8 ? '🟢' : score >= 6 ? '🟡' : score >= 4 ? '🟠' : '🔴';
        console.log(`${emoji} ${criterion.charAt(0).toUpperCase() + criterion.slice(1)}: ${score}/10`);
    });
    
    console.log('\n📋 DETAILED FEEDBACK:');
    console.log('-'.repeat(40));
    Object.entries(result.feedbacks).forEach(([criterion, feedback]) => {
        console.log(`\n🔍 ${criterion.charAt(0).toUpperCase() + criterion.slice(1)}:`);
        console.log(feedback);
    });
    
    console.log('\n' + '='.repeat(60));
};

// Save results to file
const saveResultsToFile = (result, answers) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `analysis_${answers.owner}_${answers.repo}_${timestamp}.json`;
    
    const dataToSave = {
        analysisDate: new Date().toISOString(),
        repository: `${answers.owner}/${answers.repo}`,
        template: answers.template,
        results: result
    };
    
    try {
        fs.writeFileSync(filename, JSON.stringify(dataToSave, null, 2));
        console.log(`\n💾 Results saved to: ${filename}`);
    } catch (error) {
        console.error('❌ Error saving results:', error.message);
    }
};

// Show continue options
const showContinueOptions = async () => {
    const { action } = await inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'What would you like to do next?',
            choices: [
                { name: '🔄 Analyze another repository', value: 'analyze_another' },
                { name: '📋 View templates again', value: 'view_templates' },
                { name: '❌ Exit', value: 'exit' }
            ]
        }
    ]);
    
    return action;
};

// Main application flow
const main = async () => {
    displayBanner();
    
    while (true) {
        try {
            const answers = await showMainMenu();
            
            if (answers.template === 'exit') {
                break;
            }
            
            await runAnalysis(answers);
            
            const continueAction = await showContinueOptions();
            
            if (continueAction === 'exit') {
                console.log('\n👋 Thank you for using GitHub Repository Evaluator!');
                break;
            } else if (continueAction === 'view_templates') {
                await showTemplatesMenu();
            }
            // If 'analyze_another', the loop continues
            
        } catch (error) {
            console.error('❌ An error occurred:', error.message);
            const { retry } = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'retry',
                    message: 'Would you like to try again?',
                    default: true
                }
            ]);
            
            if (!retry) {
                console.log('\n👋 Goodbye!');
                break;
            }
        }
    }
};

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n\n👋 Goodbye!');
    process.exit(0);
});

// Start the application
if (require.main === module) {
    main().catch(console.error);
}

// Prompt for new project metadata and save to JSON
const promptForProjectMetadata = async () => {
    const questions = [
        {
            type: 'input',
            name: 'startDate',
            message: '📅 Enter project start date (YYYY-MM-DD):',
            validate: (input) => /\d{4}-\d{2}-\d{2}/.test(input) ? true : 'Format must be YYYY-MM-DD'
        },
        {
            type: 'input',
            name: 'deadline',
            message: '⏰ Enter project deadline (YYYY-MM-DD):',
            validate: (input) => /\d{4}-\d{2}-\d{2}/.test(input) ? true : 'Format must be YYYY-MM-DD'
        },
        {
            type: 'input',
            name: 'hackathonName',
            message: '🏆 Enter the name of the hackathon:'
        },
        {
            type: 'number',
            name: 'maxTeamSize',
            message: '👥 Max team size (leave blank if not applicable):',
            default: null
        },
        {
            type: 'confirm',
            name: 'mustBeOriginal',
            message: '🆕 Must be original work?',
            default: true
        },
        {
            type: 'confirm',
            name: 'demoRequired',
            message: '🎥 Demo required?',
            default: true
        }
    ];
    const answers = await inquirer.prompt(questions);
    const projectData = {
        startDate: answers.startDate,
        deadline: answers.deadline,
        hackathon: {
            hackathonName: answers.hackathonName,
            maxTeamSize: answers.maxTeamSize || null,
            mustBeOriginal: answers.mustBeOriginal,
            demoRequired: answers.demoRequired
        },
        metadata: []
    };
    const fileName = `${answers.hackathonName.replace(/\s+/g, '_')}_${answers.startDate}.project.json`;
    fs.writeFileSync(fileName, JSON.stringify(projectData, null, 2));
    console.log(`\n✅ Project template saved as ${fileName}\n`);
};

module.exports = { main }; 