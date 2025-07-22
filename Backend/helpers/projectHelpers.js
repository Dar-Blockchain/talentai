const axios = require('axios');
require("dotenv").config();

module.exports.fetchRepoData = async (owner, repo) => {
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