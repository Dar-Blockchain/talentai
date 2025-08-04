const CandidatePostStepProgress = require('../models/candidate_Post_Step_Progress');

class CandidatePostStepProgressService {
  // Créer un nouveau progrès de candidat
  async createProgress(progressData) {
    try {
      const progress = new CandidatePostStepProgress(progressData);
      const savedProgress = await progress.save();
      return { success: true, data: savedProgress };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Récupérer tous les progrès
  async getAllProgress() {
    try {
      const progress = await CandidatePostStepProgress.find()
        .populate('idCandidate', 'name email')
        .populate('idPost', 'jobDetails.title')
        .populate('currentStep', 'data.label data.type')
        .sort({ createdAt: -1 });
      return { success: true, data: progress };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Récupérer un progrès par ID
  async getProgressById(id) {
    try {
      const progress = await CandidatePostStepProgress.findById(id)
        .populate('idCandidate', 'name email')
        .populate('idPost', 'jobDetails.title')
        .populate('currentStep', 'data.label data.type');
      
      if (!progress) {
        return { success: false, error: 'Progrès non trouvé' };
      }
      return { success: true, data: progress };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Récupérer le progrès d'un candidat pour un post spécifique
  async getProgressByCandidateAndPost(candidateId, postId) {
    try {
      const progress = await CandidatePostStepProgress.findOne({
        idCandidate: candidateId,
        idPost: postId
      })
      .populate('idCandidate', 'name email')
      .populate('idPost', 'jobDetails.title')
      .populate('currentStep', 'data.label data.type');
      
      if (!progress) {
        return { success: false, error: 'Progrès non trouvé' };
      }
      return { success: true, data: progress };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Récupérer tous les progrès d'un candidat
  async getProgressByCandidate(candidateId) {
    try {
      const progress = await CandidatePostStepProgress.find({ idCandidate: candidateId })
        .populate('idCandidate', 'name email')
        .populate('idPost', 'jobDetails.title')
        .populate('currentStep', 'data.label data.type')
        .sort({ updatedAt: -1 });
      return { success: true, data: progress };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Récupérer tous les progrès pour un post spécifique
  async getProgressByPost(postId) {
    try {
      const progress = await CandidatePostStepProgress.find({ idPost: postId })
        .populate('idCandidate', 'name email')
        .populate('idPost', 'jobDetails.title')
        .populate('currentStep', 'data.label data.type')
        .sort({ updatedAt: -1 });
      return { success: true, data: progress };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Récupérer les progrès par statut
  async getProgressByStatus(status) {
    try {
      const progress = await CandidatePostStepProgress.find({ status })
        .populate('idCandidate', 'name email')
        .populate('idPost', 'jobDetails.title')
        .populate('currentStep', 'data.label data.type')
        .sort({ updatedAt: -1 });
      return { success: true, data: progress };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Mettre à jour un progrès
  async updateProgress(id, updateData) {
    try {
      const updatedProgress = await CandidatePostStepProgress.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      )
      .populate('idCandidate', 'name email')
      .populate('idPost', 'jobDetails.title')
      .populate('currentStep', 'data.label data.type');
      
      if (!updatedProgress) {
        return { success: false, error: 'Progrès non trouvé' };
      }
      return { success: true, data: updatedProgress };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Mettre à jour le progrès d'un candidat pour un post spécifique
  async updateProgressByCandidateAndPost(candidateId, postId, updateData) {
    try {
      const updatedProgress = await CandidatePostStepProgress.findOneAndUpdate(
        { idCandidate: candidateId, idPost: postId },
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      )
      .populate('idCandidate', 'name email')
      .populate('idPost', 'jobDetails.title')
      .populate('currentStep', 'data.label data.type');
      
      if (!updatedProgress) {
        return { success: false, error: 'Progrès non trouvé' };
      }
      return { success: true, data: updatedProgress };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Supprimer un progrès
  async deleteProgress(id) {
    try {
      const deletedProgress = await CandidatePostStepProgress.findByIdAndDelete(id);
      if (!deletedProgress) {
        return { success: false, error: 'Progrès non trouvé' };
      }
      return { success: true, data: deletedProgress };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Supprimer le progrès d'un candidat pour un post spécifique
  async deleteProgressByCandidateAndPost(candidateId, postId) {
    try {
      const deletedProgress = await CandidatePostStepProgress.findOneAndDelete({
        idCandidate: candidateId,
        idPost: postId
      });
      if (!deletedProgress) {
        return { success: false, error: 'Progrès non trouvé' };
      }
      return { success: true, data: deletedProgress };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Créer ou mettre à jour un progrès (upsert)
  async upsertProgress(candidateId, postId, progressData) {
    try {
      const progress = await CandidatePostStepProgress.findOneAndUpdate(
        { idCandidate: candidateId, idPost: postId },
        { 
          ...progressData, 
          idCandidate: candidateId,
          idPost: postId,
          updatedAt: new Date() 
        },
        { 
          new: true, 
          upsert: true, 
          runValidators: true 
        }
      )
      .populate('idCandidate', 'name email')
      .populate('idPost', 'jobDetails.title')
      .populate('currentStep', 'data.label data.type');
      
      return { success: true, data: progress };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Récupérer les statistiques de progrès pour un post
  async getProgressStatsByPost(postId) {
    try {
      const stats = await CandidatePostStepProgress.aggregate([
        { $match: { idPost: new mongoose.Types.ObjectId(postId) } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            avgProgress: { $avg: { $toDouble: '$progress' } }
          }
        }
      ]);
      
      const totalCandidates = await CandidatePostStepProgress.countDocuments({ idPost: postId });
      
      return { 
        success: true, 
        data: { 
          stats, 
          totalCandidates,
          postId 
        } 
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Récupérer les candidats qui ont terminé un post
  async getCompletedCandidatesByPost(postId) {
    try {
      const completedCandidates = await CandidatePostStepProgress.find({
        idPost: postId,
        status: 'completed'
      })
      .populate('idCandidate', 'name email')
      .populate('idPost', 'jobDetails.title')
      .sort({ updatedAt: -1 });
      
      return { success: true, data: completedCandidates };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Récupérer les candidats en cours pour un post
  async getInProgressCandidatesByPost(postId) {
    try {
      const inProgressCandidates = await CandidatePostStepProgress.find({
        idPost: postId,
        status: { $in: ['in_progress', 'started'] }
      })
      .populate('idCandidate', 'name email')
      .populate('idPost', 'jobDetails.title')
      .sort({ updatedAt: -1 });
      
      return { success: true, data: inProgressCandidates };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = new CandidatePostStepProgressService(); 