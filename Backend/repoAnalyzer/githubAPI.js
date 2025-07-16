const axios = require('axios');
require('dotenv').config();

// GitHub API URL
const GITHUB_API_URL = 'https://api.github.com/repos/';

// Function to fetch repository data
const fetchRepoData = async (owner, repo) => {
    try {
        const response = await axios.get(`${GITHUB_API_URL}${owner}/${repo}`, {
            headers: {
                Authorization: `token ${process.env.GITHUB_TOKEN}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching repository data:', error);
        throw error;
    }
};

module.exports = { fetchRepoData };
