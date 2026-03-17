/**
 * Outils IA pour interagir avec les APIs du projet TalentAI
 * Ces outils permettent à un agent IA d'exécuter des actions sur les APIs
 */

const postController = require('../controllers/PostControllers/post.controller');
const postPaymentController = require('../controllers/postPayment.controller');

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
 * Outils supplémentaires pour gérer tous les endpoints de post.routes.js
 */

const getAllPostsTool = {
  name: 'getAllPosts',
  description: 'Récupérer tous les posts (optionnellement filtrés par statut)',
  parameters: {
    type: 'object',
    properties: {
      status: { type: 'string', description: 'Statut des posts (active, draft, expired, closed, cancelled)' }
    }
  },
  execute: async (params) => {
    const req = { query: params || {} };
    const res = {
      status: (code) => ({
        json: (data) => ({ status: code, data })
      })
    };

    try {
      const result = await postController.getAllPosts(req, res);
      return result;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des posts: ${error.message}`);
    }
  }
};

const getMyPostsTool = {
  name: 'getMyPosts',
  description: 'Récupérer les posts de l\'utilisateur authentifié',
  parameters: {
    type: 'object',
    properties: {
      page: { type: 'number', description: 'Page de résultats' },
      limit: { type: 'number', description: 'Nombre de résultats par page' },
      search: { type: 'string', description: 'Terme de recherche dans les posts' },
      sort: { type: 'string', description: 'Ordre de tri (newest, oldest, title_asc, title_desc)' },
      status: { type: 'string', description: 'Statut des posts' }
    }
  },
  execute: async (params, user) => {
    const req = { query: params || {}, user };
    const res = {
      status: (code) => ({
        json: (data) => ({ status: code, data })
      })
    };

    try {
      const result = await postController.getUserPosts(req, res);
      return result;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des posts de l\'utilisateur: ${error.message}`);
    }
  }
};

const getPostByIdTool = {
  name: 'getPostById',
  description: 'Récupérer un post par son ID (authentifié)',
  parameters: {
    type: 'object',
    properties: {
      postId: { type: 'string', description: 'ID du post' }
    },
    required: ['postId']
  },
  execute: async (params, user) => {
    const req = { params: { id: params.postId }, user };
    const res = {
      status: (code) => ({
        json: (data) => ({ status: code, data })
      })
    };

    try {
      const result = await postController.getPostById(req, res);
      return result;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération du post: ${error.message}`);
    }
  }
};

const updatePostStatusTool = {
  name: 'updatePostStatus',
  description: 'Mettre à jour le statut d\'un post (active, draft, expired, closed, cancelled)',
  parameters: {
    type: 'object',
    properties: {
      postId: { type: 'string', description: 'ID du post' },
      status: { type: 'string', description: 'Nouveau statut', enum: ['active', 'draft', 'expired', 'closed', 'cancelled'] }
    },
    required: ['postId', 'status']
  },
  execute: async (params, user) => {
    const req = { params: { id: params.postId }, body: { status: params.status }, user };
    const res = {
      status: (code) => ({
        json: (data) => ({ status: code, data })
      })
    };

    try {
      const result = await postController.updatePostStatus(req, res);
      return result;
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour du statut: ${error.message}`);
    }
  }
};

const getPostMetricsTool = {
  name: 'getPostMetrics',
  description: 'Obtenir les métriques de posts de l\'utilisateur (totals par statut)',
  parameters: {
    type: 'object',
    properties: {}
  },
  execute: async (params, user) => {
    const req = { user };
    const res = {
      status: (code) => ({
        json: (data) => ({ status: code, data })
      })
    };

    try {
      const result = await postController.getPostMetrics(req, res);
      return result;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des métriques: ${error.message}`);
    }
  }
};

const getPostsByUserTopSkillsTool = {
  name: 'getPostsByUserTopSkills',
  description: 'Obtenir des posts recommandés en fonction des compétences principales de l\'utilisateur',
  parameters: {
    type: 'object',
    properties: {
      page: { type: 'number', description: 'Page de résultats' },
      limit: { type: 'number', description: 'Nombre de résultats par page' }
    }
  },
  execute: async (params, user) => {
    const req = { query: params || {}, user };
    const res = {
      status: (code) => ({
        json: (data) => ({ status: code, data })
      })
    };

    try {
      const result = await postController.getPostsByUserTopSkills(req, res);
      return result;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des posts recommandés: ${error.message}`);
    }
  }
};

const sendTechnicalTestTool = {
  name: 'sendTechnicalTest',
  description: 'Envoyer un test technique par email pour un candidat',
  parameters: {
    type: 'object',
    properties: {
      postId: { type: 'string', description: 'ID du post' },
      candidateEmail: { type: 'string', description: 'Email du candidat' },
      candidateName: { type: 'string', description: 'Nom du candidat (optionnel)' }
    },
    required: ['postId', 'candidateEmail']
  },
  execute: async (params, user) => {
    const req = { body: { ...params }, user, headers: { authorization: '' } };
    const res = {
      status: (code) => ({
        json: (data) => ({ status: code, data })
      })
    };

    try {
      const result = await postController.sendTechnicalTest(req, res);
      return result;
    } catch (error) {
      throw new Error(`Erreur lors de l'envoi du test technique: ${error.message}`);
    }
  }
};

const processPostPaymentTool = {
  name: 'processPostPayment',
  description: 'Traiter le paiement pour un post (beta gratuite)',
  parameters: {
    type: 'object',
    properties: {
      postId: { type: 'string', description: 'ID du post' },
      agentId: { type: 'string', description: 'ID de l\'agent (optionnel)' }
    },
    required: ['postId']
  },
  execute: async (params, user) => {
    const req = { body: { ...params }, user };
    const res = {
      status: (code) => ({
        json: (data) => ({ status: code, data })
      })
    };

    try {
      const result = await postPaymentController.processPostPayment(req, res);
      return result;
    } catch (error) {
      throw new Error(`Erreur lors du traitement du paiement: ${error.message}`);
    }
  }
};

const getPostPaymentHistoryTool = {
  name: 'getPostPaymentHistory',
  description: 'Obtenir l\'historique des paiements pour les posts de l\'utilisateur',
  parameters: {
    type: 'object',
    properties: {
      page: { type: 'number', description: 'Page de résultats' },
      limit: { type: 'number', description: 'Nombre de résultats par page' },
      postId: { type: 'string', description: 'ID du post (optionnel)' }
    }
  },
  execute: async (params, user) => {
    const req = { query: { ...params }, user };
    const res = {
      status: (code) => ({
        json: (data) => ({ status: code, data })
      })
    };

    try {
      const result = await postPaymentController.getPostPaymentHistory(req, res);
      return result;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération de l'historique des paiements: ${error.message}`);
    }
  }
};

const getPostPaymentDetailsTool = {
  name: 'getPostPaymentDetails',
  description: 'Obtenir les détails de paiement pour un post spécifique',
  parameters: {
    type: 'object',
    properties: {
      postId: { type: 'string', description: 'ID du post' }
    },
    required: ['postId']
  },
  execute: async (params, user) => {
    const req = { params: { postId: params.postId }, user };
    const res = {
      status: (code) => ({
        json: (data) => ({ status: code, data })
      })
    };

    try {
      const result = await postPaymentController.getPostPaymentDetails(req, res);
      return result;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des détails de paiement: ${error.message}`);
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
  getPostByIdTool,
  getAllPostsTool,
  getMyPostsTool,
  updatePostTool,
  updatePostStatusTool,
  deletePostTool,
  calculatePostPriceTool,
  getPostMetricsTool,
  getPostsByUserTopSkillsTool,
  sendTechnicalTestTool,
  processPostPaymentTool,
  getPostPaymentHistoryTool,
  getPostPaymentDetailsTool,
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