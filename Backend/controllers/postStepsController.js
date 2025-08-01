const postStepsService = require('../services/postStepsService');

class PostStepsController {
  // Créer une nouvelle étape de post
  async createPostStep(req, res) {
    try {
      const result = await postStepsService.createPostStep(req.body);
      
      if (result.success) {
        return res.status(201).json({
          success: true,
          message: 'Étape de post créée avec succès',
          data: result.data
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Erreur lors de la création de l\'étape de post',
          error: result.error
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur',
        error: error.message
      });
    }
  }

  // Récupérer toutes les étapes de post
  async getAllPostSteps(req, res) {
    try {
      const result = await postStepsService.getAllPostSteps();
      
      if (result.success) {
        return res.status(200).json({
          success: true,
          message: 'Étapes de post récupérées avec succès',
          data: result.data
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Erreur lors de la récupération des étapes de post',
          error: result.error
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur',
        error: error.message
      });
    }
  }

  // Récupérer une étape de post par ID
  async getPostStepById(req, res) {
    try {
      const { id } = req.params;
      const result = await postStepsService.getPostStepById(id);
      
      if (result.success) {
        return res.status(200).json({
          success: true,
          message: 'Étape de post récupérée avec succès',
          data: result.data
        });
      } else {
        return res.status(404).json({
          success: false,
          message: 'Étape de post non trouvée',
          error: result.error
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur',
        error: error.message
      });
    }
  }

  // Récupérer les étapes d'un post spécifique
  async getPostStepsByPostId(req, res) {
    try {
      const { postId } = req.params;
      const result = await postStepsService.getPostStepsByPostId(postId);
      
      if (result.success) {
        return res.status(200).json({
          success: true,
          message: 'Étapes de post récupérées avec succès',
          data: result.data
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Erreur lors de la récupération des étapes de post',
          error: result.error
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur',
        error: error.message
      });
    }
  }

  // Mettre à jour une étape de post
  async updatePostStep(req, res) {
    try {
      const { id } = req.params;
      const result = await postStepsService.updatePostStep(id, req.body);
      
      if (result.success) {
        return res.status(200).json({
          success: true,
          message: 'Étape de post mise à jour avec succès',
          data: result.data
        });
      } else {
        return res.status(404).json({
          success: false,
          message: 'Étape de post non trouvée',
          error: result.error
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur',
        error: error.message
      });
    }
  }

  // Supprimer une étape de post
  async deletePostStep(req, res) {
    try {
      const { id } = req.params;
      const result = await postStepsService.deletePostStep(id);
      
      if (result.success) {
        return res.status(200).json({
          success: true,
          message: 'Étape de post supprimée avec succès',
          data: result.data
        });
      } else {
        return res.status(404).json({
          success: false,
          message: 'Étape de post non trouvée',
          error: result.error
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur',
        error: error.message
      });
    }
  }

  // Récupérer les étapes par type
  async getPostStepsByType(req, res) {
    try {
      const { type } = req.params;
      const result = await postStepsService.getPostStepsByType(type);
      
      if (result.success) {
        return res.status(200).json({
          success: true,
          message: 'Étapes de post récupérées avec succès',
          data: result.data
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Erreur lors de la récupération des étapes de post',
          error: result.error
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur',
        error: error.message
      });
    }
  }

  // Récupérer les étapes par parent
  async getPostStepsByParent(req, res) {
    try {
      const { parentStep } = req.params;
      const result = await postStepsService.getPostStepsByParent(parentStep);
      
      if (result.success) {
        return res.status(200).json({
          success: true,
          message: 'Étapes de post récupérées avec succès',
          data: result.data
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Erreur lors de la récupération des étapes de post',
          error: result.error
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Erreur serveur',
        error: error.message
      });
    }
  }
}

module.exports = new PostStepsController(); 