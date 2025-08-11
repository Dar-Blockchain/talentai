// ============================================================================
// Point d'entrée de démonstration pour l'analyse d'un dépôt GitHub.
// Ce script importe la fonction `analyzeRepo` et l'exécute avec un owner/repo
// d'exemple, puis affiche un résumé des résultats dans la console.
// ============================================================================
const { analyzeRepo } = require('./evaluateRepo');

// Example GitHub project details (replace with real values)
// Ces constantes définissent le propriétaire et le nom du dépôt à analyser.
// Dans un usage réel, remplace ces valeurs par celles du repo ciblé ou
// paramètre-les via des variables d'environnement ou des arguments CLI.
const owner = 'firasbelhiba'; // Replace with the GitHub repo owner
const repo = 'FinSage'; // Replace with the GitHub repo name

// IIFE asynchrone pour exécuter l'analyse sans bloquer le thread principal
// - Appelle `analyzeRepo(owner, repo)` qui effectue toute l'analyse (GitHub API,
//   calculs des scores, feedbacks, etc.)
// - Si un résultat est retourné (non nul), on affiche quelques éléments clés:
//   - `repoName`: nom du repo analysé
//   - `criteriaResults`: scores par critère
//   - `finalScore`: score global agrégé
(async () => {
    const result = await analyzeRepo(owner, repo);
    if (result) {
        console.log('Project:', result.repoName);
        console.log('Criteria Results:', result.criteriaResults);
        console.log('Final Score:', result.finalScore);
    }
})();
