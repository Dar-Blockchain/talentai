const Post_Steps = require('../models/post_Steps');

class PostStepsService {
  // Créer une nouvelle étape de post
  async createPostStep(postStepData) {
    try {
      const postStep = new Post_Steps(postStepData);
      const savedPostStep = await postStep.save();
      return { success: true, data: savedPostStep };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Récupérer toutes les étapes de post
  async getAllPostSteps() {
    try {
      const postSteps = await Post_Steps.find().populate('postId', 'title');
      return { success: true, data: postSteps };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Récupérer une étape de post par ID
  async getPostStepById(id) {
    try {
      const postStep = await Post_Steps.findById(id).populate('postId', 'title');
      if (!postStep) {
        return { success: false, error: 'Étape de post non trouvée' };
      }
      return { success: true, data: postStep };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Récupérer les étapes d'un post spécifique
  async getPostStepsByPostId(postId) {
    try {
      const postSteps = await Post_Steps.find({ postId }).populate('postId', 'title').sort({ order: 1 });
      return { success: true, data: postSteps };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Mettre à jour une étape de post
  async updatePostStep(id, updateData) {
    try {
      const updatedPostStep = await Post_Steps.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate('postId', 'title');
      
      if (!updatedPostStep) {
        return { success: false, error: 'Étape de post non trouvée' };
      }
      return { success: true, data: updatedPostStep };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Supprimer une étape de post
  async deletePostStep(id) {
    try {
      const deletedPostStep = await Post_Steps.findByIdAndDelete(id);
      if (!deletedPostStep) {
        return { success: false, error: 'Étape de post non trouvée' };
      }
      return { success: true, data: deletedPostStep };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Récupérer les étapes par type
  async getPostStepsByType(type) {
    try {
      const postSteps = await Post_Steps.find({ type }).populate('postId', 'title');
      return { success: true, data: postSteps };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Récupérer les étapes par parent
  async getPostStepsByParent(parentStep) {
    try {
      const postSteps = await Post_Steps.find({ parentStep }).populate('postId', 'title').sort({ order: 1 });
      return { success: true, data: postSteps };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = new PostStepsService(); 