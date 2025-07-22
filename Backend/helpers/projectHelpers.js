const axios = require('axios');
require("dotenv").config();

const fetchRepoData = async (owner, repo) => {
    console.log("xxxxx: ", owner, repo);
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

const fs = require('fs');
const path = require('path');

const loadProjectTemplates = () => {
    
    const templatePath = path.join(__dirname, '..', 'templates', 'projectTemplates.json');
    if (fs.existsSync(templatePath)) {
        return JSON.parse(fs.readFileSync(templatePath, 'utf8'));
    }
    return {};
};

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



module.exports = {
    fetchRepoData,    
    loadProjectTemplates, 
    detectProjectTypeFromRepo,
    evaluateProjectStructure, 
    evaluateCodeQuality,
    evaluateSecurityAndPerformance,
    evaluateModernPractices
}