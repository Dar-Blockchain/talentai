// ============================================================================
// Module utilitaire pour interagir avec l'API GitHub afin de récupérer
// des informations sur un dépôt (repository). Ce module expose une seule
// fonction `fetchRepoData` qui retourne les métadonnées du repo.
// ============================================================================
const axios = require('axios');
require('dotenv').config();

// GitHub API URL
// Constante de base pour construire les URLs d'accès à l'API GitHub des repos.
// Exemple d'URL finale : https://api.github.com/repos/<owner>/<repo>
const GITHUB_API_URL = 'https://api.github.com/repos/';

// Function to fetch repository data
// --------------------------------------------------------------------------
// But: récupérer les métadonnées d'un dépôt GitHub (nom, description, dates,
//      paramètres par défaut, etc.) via l'API publique de GitHub.
// Paramètres:
// - owner: nom du propriétaire du repo (organisation ou utilisateur GitHub)
// - repo: nom du dépôt
// Détails techniques:
// - Utilise axios pour effectuer une requête HTTP GET vers l'API GitHub.
// - Ajoute un header Authorization avec un token personnel GitHub, si présent
//   dans la variable d'environnement GITHUB_TOKEN (améliore les limites de rate).
// - En cas de succès, retourne `response.data` (objet JSON renvoyé par l'API).
// - En cas d'erreur, log l'erreur et relance l'exception pour gestion en amont.
const fetchRepoData = async (owner, repo) => {
    try {
        const response = await axios.get(`${GITHUB_API_URL}${owner}/${repo}`, {
            headers: {
                Authorization: `token ${process.env.GITHUB_TOKEN}`,
            },
        });
        return response.data;
    } catch (error) {
        // Gestion d'erreur: on journalise l'erreur pour faciliter le debug
        // puis on relance l'erreur afin que l'appelant décide de la suite
        console.error('Error fetching repository data:', error);
        throw error;
    }
};

// Export de la fonction afin qu'elle puisse être utilisée par d'autres modules.
module.exports = { fetchRepoData };
