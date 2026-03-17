/**
 * Exemple d'utilisation des outils IA par un agent
 * Ce script montre comment un agent IA peut interagir avec les APIs
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:5000';
const API_TOKEN = 'your-auth-token-here'; // À remplacer par un token réel

// Headers pour les requêtes authentifiées
const authHeaders = {
  'Authorization': `Bearer ${API_TOKEN}`,
  'Content-Type': 'application/json'
};

/**
 * Exemple d'agent IA qui utilise les outils
 */
class TalentAIAgent {
  constructor() {
    this.tools = {};
  }

  /**
   * Découvrir les outils disponibles
   */
  async discoverTools() {
    try {
      const response = await axios.get(`${BASE_URL}/ai/tools`);
      this.tools = response.data.tools.reduce((acc, tool) => {
        acc[tool.name] = tool;
        return acc;
      }, {});
      console.log(`✅ Découvert ${Object.keys(this.tools).length} outils`);
      return this.tools;
    } catch (error) {
      console.error('❌ Erreur lors de la découverte des outils:', error.message);
      return {};
    }
  }

  /**
   * Exécuter un outil
   */
  async executeTool(toolName, parameters) {
    try {
      const response = await axios.post(`${BASE_URL}/ai/execute-tool`, {
        toolName,
        parameters
      }, { headers: authHeaders });

      console.log(`✅ Outil ${toolName} exécuté avec succès`);
      return response.data.result;
    } catch (error) {
      console.error(`❌ Erreur lors de l'exécution de ${toolName}:`, error.response?.data?.error || error.message);
      return null;
    }
  }

  /**
   * Exemple de workflow : Créer un post puis le rechercher
   */
  async exampleWorkflow() {
    console.log('🚀 Démarrage du workflow IA...\n');

    // 1. Découvrir les outils
    await this.discoverTools();

    // 2. Créer un post
    console.log('📝 Création d\'un post...');
    const createResult = await this.executeTool('createPost', {
      title: 'Développeur IA - Test Agent',
      description: 'Post créé automatiquement par un agent IA pour démonstration',
      skills: ['Python', 'Machine Learning', 'API'],
      location: 'Remote',
      employmentType: 'Full-time',
      experienceLevel: 'Senior'
    });

    if (createResult) {
      const postId = createResult.data?._id || createResult.data?.id;
      console.log(`📋 Post créé avec ID: ${postId}\n`);

      // 3. Rechercher le post créé
      console.log('🔍 Recherche du post...');
      const searchResult = await this.executeTool('searchPosts', {
        query: 'IA',
        skills: ['Python'],
        limit: 5
      });

      if (searchResult) {
        console.log(`📊 Trouvé ${searchResult.data?.length || 0} posts correspondants\n`);
      }

      // 4. Obtenir les détails du post
      if (postId) {
        console.log('📖 Récupération des détails du post...');
        const detailsResult = await this.executeTool('getPostDetails', {
          postId: postId
        });

        if (detailsResult) {
          console.log('📄 Détails du post récupérés avec succès\n');
        }
      }

      // 5. Calculer le prix du post
      if (postId) {
        console.log('💰 Calcul du prix du post...');
        const priceResult = await this.executeTool('calculatePostPrice', {
          postId: postId
        });

        if (priceResult) {
          console.log('💵 Prix calculé avec succès\n');
        }
      }
    }

    // 6. Obtenir les statistiques publiques
    console.log('📈 Récupération des statistiques...');
    const statsResult = await this.executeTool('getPublicStats', {});

    if (statsResult) {
      console.log('📊 Statistiques récupérées avec succès\n');
    }

    console.log('🎉 Workflow terminé !');
  }
}

// Exécution de l'exemple
if (require.main === module) {
  const agent = new TalentAIAgent();

  // Pour un vrai test, remplacez API_TOKEN par un token valide
  console.log('⚠️  Pour tester, remplacez API_TOKEN par un token d\'authentification valide\n');

  // agent.exampleWorkflow().catch(console.error);
}

module.exports = TalentAIAgent;