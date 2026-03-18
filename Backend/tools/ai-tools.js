/**
 * Outils IA pour interagir avec les APIs du projet TalentAI
 * Ces outils permettent à un agent IA d'exécuter des actions sur les APIs
 */

const postController = require('../controllers/PostControllers/post.controller');
const postPaymentController = require('../controllers/postPayment.controller');
const userService = require('../services/authentication.service');
const profileService = require('../services/ProfileService/profile.service');

/**
 * Outil pour créer un post
 */
const createPostTool = {
  name: 'createPost',
  description: 'Créer une nouvelle offre d\'emploi (post)',
  parameters: {
    type: 'object',
    properties: {
      title: { type: 'string', description: 'Titre du poste' },
      description: { type: 'string', description: 'Description du poste' },
      requirements: { type: 'array', items: { type: 'string' }, description: 'Exigences du poste' },
      skills: { type: 'array', items: { type: 'string' }, description: 'Compétences requises' },
      location: { type: 'string', description: 'Localisation' },
      salary: {
        type: 'object',
        properties: {
          min: { type: 'number' },
          max: { type: 'number' },
          currency: { type: 'string' }
        }
      },
      employmentType: { type: 'string', enum: ['Full-time', 'Part-time', 'Contract', 'Freelance'] },
      experienceLevel: { type: 'string', enum: ['Entry Level', 'Junior', 'Mid Level', 'Senior', 'Expert'] }
    },
    required: ['title', 'description']
  },
  execute: async (params, user) => {
    // Simuler la requête pour le contrôleur
    const req = {
      body: params,
      user: user
    };
    const res = {
      status: (code) => ({
        json: (data) => ({ status: code, data })
      })
    };

    try {
      const result = await postController.createPost(req, res);
      return result;
    } catch (error) {
      throw new Error(`Erreur lors de la création du post: ${error.message}`);
    }
  }
};

/**
 * Outil pour rechercher des posts
 */
const searchPostsTool = {
  name: 'searchPosts',
  description: 'Rechercher des offres d\'emploi avec filtres',
  parameters: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'Terme de recherche' },
      skills: { type: 'array', items: { type: 'string' }, description: 'Compétences à filtrer' },
      location: { type: 'string', description: 'Localisation' },
      experienceLevel: { type: 'string', description: 'Niveau d\'expérience' },
      employmentType: { type: 'string', description: 'Type d\'emploi' },
      page: { type: 'number', default: 1, description: 'Page de résultats' },
      limit: { type: 'number', default: 10, description: 'Nombre de résultats par page' }
    }
  },
  execute: async (params) => {
    const req = {
      query: params
    };
    const res = {
      status: (code) => ({
        json: (data) => ({ status: code, data })
      })
    };

    try {
      const result = await postController.getAllPostsWithSearch(req, res);
      return result;
    } catch (error) {
      throw new Error(`Erreur lors de la recherche: ${error.message}`);
    }
  }
};

/**
 * Outil pour obtenir les détails d'un post
 */
const getPostDetailsTool = {
  name: 'getPostDetails',
  description: 'Obtenir les détails complets d\'une offre d\'emploi',
  parameters: {
    type: 'object',
    properties: {
      postId: { type: 'string', description: 'ID du post' }
    },
    required: ['postId']
  },
  execute: async (params) => {
    const req = {
      params: { id: params.postId }
    };
    const res = {
      status: (code) => ({
        json: (data) => ({ status: code, data })
      })
    };

    try {
      const result = await postController.getPostDetailsPublic(req, res);
      return result;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des détails: ${error.message}`);
    }
  }
};

/**
 * Outil pour mettre à jour un post
 */
const updatePostTool = {
  name: 'updatePost',
  description: 'Mettre à jour une offre d\'emploi existante',
  parameters: {
    type: 'object',
    properties: {
      postId: { type: 'string', description: 'ID du post à mettre à jour' },
      title: { type: 'string', description: 'Nouveau titre' },
      description: { type: 'string', description: 'Nouvelle description' },
      requirements: { type: 'array', items: { type: 'string' }, description: 'Nouvelles exigences' },
      skills: { type: 'array', items: { type: 'string' }, description: 'Nouvelles compétences' },
      status: { type: 'string', enum: ['active', 'draft', 'expired', 'closed', 'cancelled'], description: 'Nouveau statut' }
    },
    required: ['postId']
  },
  execute: async (params, user) => {
    const { postId, ...updateData } = params;
    const req = {
      params: { id: postId },
      body: updateData,
      user: user
    };
    const res = {
      status: (code) => ({
        json: (data) => ({ status: code, data })
      })
    };

    try {
      const result = await postController.updatePost(req, res);
      return result;
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour: ${error.message}`);
    }
  }
};

/**
 * Outil pour supprimer un post
 */
const deletePostTool = {
  name: 'deletePost',
  description: 'Supprimer une offre d\'emploi',
  parameters: {
    type: 'object',
    properties: {
      postId: { type: 'string', description: 'ID du post à supprimer' }
    },
    required: ['postId']
  },
  execute: async (params, user) => {
    const req = {
      params: { id: params.postId },
      user: user
    };
    const res = {
      status: (code) => ({
        json: (data) => ({ status: code, data })
      })
    };

    try {
      const result = await postController.deletePost(req, res);
      return result;
    } catch (error) {
      throw new Error(`Erreur lors de la suppression: ${error.message}`);
    }
  }
};

/**
 * Outil pour calculer le prix d'un post
 */
const calculatePostPriceTool = {
  name: 'calculatePostPrice',
  description: 'Calculer le prix de publication d\'une offre d\'emploi',
  parameters: {
    type: 'object',
    properties: {
      postId: { type: 'string', description: 'ID du post' }
    },
    required: ['postId']
  },
  execute: async (params, user) => {
    const req = {
      params: { postId: params.postId },
      user: user
    };
    const res = {
      status: (code) => ({
        json: (data) => ({ status: code, data })
      })
    };

    try {
      const result = await postPaymentController.calculatePostPrice(req, res);
      return result;
    } catch (error) {
      throw new Error(`Erreur lors du calcul du prix: ${error.message}`);
    }
  }
};

/**
 * Outil pour obtenir les statistiques publiques
 */
const getPublicStatsTool = {
  name: 'getPublicStats',
  description: 'Obtenir les statistiques publiques de la plateforme',
  parameters: {
    type: 'object',
    properties: {}
  },
  execute: async () => {
    const req = {};
    const res = {
      status: (code) => ({
        json: (data) => ({ status: code, data })
      })
    };

    try {
      const result = await postController.getPublicStats(req, res);
      return result;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
    }
  }
};

/**
 * Liste de tous les outils disponibles
 */
const availableTools = [
  createPostTool,
  searchPostsTool,
  getPostDetailsTool,
  updatePostTool,
  deletePostTool,
  calculatePostPriceTool,
  getPublicStatsTool
];

/**
 * Trouver un outil par son nom
 */
const findTool = (toolName) => {
  return availableTools.find(tool => tool.name === toolName);
};

/**
 * Obtenir la liste des outils disponibles avec leurs descriptions
 */
const getAvailableTools = () => {
  return availableTools.map(tool => ({
    name: tool.name,
    description: tool.description,
    parameters: tool.parameters
  }));
};

module.exports = {
  availableTools,
  findTool,
  getAvailableTools,
  // Exporter individuellement pour un accès direct
  createPostTool,
  searchPostsTool,
  getPostDetailsTool,
  updatePostTool,
  deletePostTool,
  calculatePostPriceTool,
  getPublicStatsTool
};