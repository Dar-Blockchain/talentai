const axios = require('axios');
require("dotenv").config();

module.exports.fetchRepoData = async (owner, repo) => {
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

module.exports.loadProjectTemplates = () => {
    const templatePath = path.join(__dirname, 'projectTemplates.json');
    if (fs.existsSync(templatePath)) {
        return JSON.parse(fs.readFileSync(templatePath, 'utf8'));
    }
    return {};
};

module.exports.detectProjectTypeFromRepo = async (repoData) => {
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