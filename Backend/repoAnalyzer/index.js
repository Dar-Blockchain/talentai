const { analyzeRepo } = require('./evaluateRepo');

// Example GitHub project details (replace with real values)
const owner = 'firasbelhiba'; // Replace with the GitHub repo owner
const repo = 'FinSage'; // Replace with the GitHub repo name

(async () => {
    const result = await analyzeRepo(owner, repo);
    if (result) {
        console.log('Project:', result.repoName);
        console.log('Criteria Results:', result.criteriaResults);
        console.log('Final Score:', result.finalScore);
    }
})();
