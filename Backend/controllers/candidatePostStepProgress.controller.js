const candidatePostStepProgressService = require("../services/candidatePostStepProgress.service");

class CandidatePostStepProgressController {
  // Créer un nouveau progrès de candidat
  async createProgress(req, res) {
    try {
      const result = await candidatePostStepProgressService.createProgress(
        req.body,
      );

      if (result.success) {
        return res.status(201).json({
          success: true,
          message: "Progrès de candidat créé avec succès",
          data: result.data,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "Erreur lors de la création du progrès",
          error: result.error,
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Erreur serveur",
        error: error.message,
      });
    }
  }

  // Récupérer tous les progrès
  async getAllProgress(req, res) {
    try {
      const result = await candidatePostStepProgressService.getAllProgress();

      if (result.success) {
        return res.status(200).json({
          success: true,
          message: "Progrès récupérés avec succès",
          data: result.data,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "Erreur lors de la récupération des progrès",
          error: result.error,
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Erreur serveur",
        error: error.message,
      });
    }
  }

  // Récupérer un progrès par ID
  async getProgressById(req, res) {
    try {
      const { id } = req.params;
      const result = await candidatePostStepProgressService.getProgressById(id);

      if (result.success) {
        return res.status(200).json({
          success: true,
          message: "Progrès récupéré avec succès",
          data: result.data,
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "Progrès non trouvé",
          error: result.error,
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Erreur serveur",
        error: error.message,
      });
    }
  }

  // Récupérer un progrès par idCandidate
  async findByIdCandidate(req, res) {
    try {
      const candidateId = req.user._id;
      console.log("candidateId", candidateId);

      const result =
        await candidatePostStepProgressService.getProgressByCandidate(
          candidateId,
        );

      if (result.success) {
        return res.status(200).json({
          success: true,
          message: "Progrès récupéré avec succès",
          data: result.data,
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "Progrès non trouvé",
          error: result.error,
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Erreur serveur",
        error: error.message,
      });
    }
  }

  // Récupérer le progrès d'un candidat pour un post spécifique
  async getProgressByCandidateAndPost(req, res) {
    try {
      const { candidateId, postId } = req.params;
      const result =
        await candidatePostStepProgressService.getProgressByCandidateAndPost(
          candidateId,
          postId,
        );

      if (result.success) {
        return res.status(200).json({
          success: true,
          message: "Progrès récupéré avec succès",
          data: result.data,
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "Progrès non trouvé",
          error: result.error,
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Erreur serveur",
        error: error.message,
      });
    }
  }

  // Récupérer tous les progrès d'un candidat
  async getProgressByCandidate(req, res) {
    try {
      const { candidateId } = req.params;
      const result =
        await candidatePostStepProgressService.getProgressByCandidate(
          candidateId,
        );

      if (result.success) {
        return res.status(200).json({
          success: true,
          message: "Progrès du candidat récupérés avec succès",
          data: result.data,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "Erreur lors de la récupération des progrès",
          error: result.error,
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Erreur serveur",
        error: error.message,
      });
    }
  }

  // Récupérer tous les progrès pour un post spécifique
  async getProgressByPost(req, res) {
    try {
      const { postId } = req.params;
      const result =
        await candidatePostStepProgressService.getProgressByPost(postId);

      if (result.success) {
        return res.status(200).json({
          success: true,
          message: "Progrès du post récupérés avec succès",
          data: result.data,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "Erreur lors de la récupération des progrès",
          error: result.error,
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Erreur serveur",
        error: error.message,
      });
    }
  }

  // Récupérer les progrès par statut
  async getProgressByStatus(req, res) {
    try {
      const { status } = req.params;
      const result =
        await candidatePostStepProgressService.getProgressByStatus(status);

      if (result.success) {
        return res.status(200).json({
          success: true,
          message: "Progrès récupérés avec succès",
          data: result.data,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "Erreur lors de la récupération des progrès",
          error: result.error,
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Erreur serveur",
        error: error.message,
      });
    }
  }

  // Mettre à jour un progrès
  async updateProgress(req, res) {
    try {
      const { id } = req.params;
      const result = await candidatePostStepProgressService.updateProgress(
        id,
        req.body,
      );

      if (result.success) {
        return res.status(200).json({
          success: true,
          message: "Progrès mis à jour avec succès",
          data: result.data,
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "Progrès non trouvé",
          error: result.error,
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Erreur serveur",
        error: error.message,
      });
    }
  }

  // Mettre à jour le progrès d'un candidat pour un post spécifique
  async updateProgressByCandidateAndPost(req, res) {
    try {
      const { candidateId, postId } = req.params;
      const result =
        await candidatePostStepProgressService.updateProgressByCandidateAndPost(
          candidateId,
          postId,
          req.body,
        );

      if (result.success) {
        return res.status(200).json({
          success: true,
          message: "Progrès mis à jour avec succès",
          data: result.data,
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "Progrès non trouvé",
          error: result.error,
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Erreur serveur",
        error: error.message,
      });
    }
  }

  // Supprimer un progrès
  async deleteProgress(req, res) {
    try {
      const { id } = req.params;
      const result = await candidatePostStepProgressService.deleteProgress(id);

      if (result.success) {
        return res.status(200).json({
          success: true,
          message: "Progrès supprimé avec succès",
          data: result.data,
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "Progrès non trouvé",
          error: result.error,
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Erreur serveur",
        error: error.message,
      });
    }
  }

  // Supprimer le progrès d'un candidat pour un post spécifique
  async deleteProgressByCandidateAndPost(req, res) {
    try {
      const { candidateId, postId } = req.params;
      const result =
        await candidatePostStepProgressService.deleteProgressByCandidateAndPost(
          candidateId,
          postId,
        );

      if (result.success) {
        return res.status(200).json({
          success: true,
          message: "Progrès supprimé avec succès",
          data: result.data,
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "Progrès non trouvé",
          error: result.error,
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Erreur serveur",
        error: error.message,
      });
    }
  }

  // Créer ou mettre à jour un progrès (upsert)
  async upsertProgress(req, res) {
    try {
      const { candidateId, postId } = req.params;
      const result = await candidatePostStepProgressService.upsertProgress(
        candidateId,
        postId,
        req.body,
      );

      if (result.success) {
        return res.status(200).json({
          success: true,
          message: "Progrès créé ou mis à jour avec succès",
          data: result.data,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "Erreur lors de la création/mise à jour du progrès",
          error: result.error,
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Erreur serveur",
        error: error.message,
      });
    }
  }

  // Récupérer les statistiques de progrès pour un post
  async getProgressStatsByPost(req, res) {
    try {
      const { postId } = req.params;
      const result =
        await candidatePostStepProgressService.getProgressStatsByPost(postId);

      if (result.success) {
        return res.status(200).json({
          success: true,
          message: "Statistiques récupérées avec succès",
          data: result.data,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "Erreur lors de la récupération des statistiques",
          error: result.error,
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Erreur serveur",
        error: error.message,
      });
    }
  }

  // Récupérer les candidats qui ont terminé un post
  async getCompletedCandidatesByPost(req, res) {
    try {
      const { postId } = req.params;
      const result =
        await candidatePostStepProgressService.getCompletedCandidatesByPost(
          postId,
        );

      if (result.success) {
        return res.status(200).json({
          success: true,
          message: "Candidats terminés récupérés avec succès",
          data: result.data,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "Erreur lors de la récupération des candidats terminés",
          error: result.error,
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Erreur serveur",
        error: error.message,
      });
    }
  }

  // Récupérer les candidats en cours pour un post
  async getInProgressCandidatesByPost(req, res) {
    try {
      const { postId } = req.params;
      const result =
        await candidatePostStepProgressService.getInProgressCandidatesByPost(
          postId,
        );

      if (result.success) {
        return res.status(200).json({
          success: true,
          message: "Candidats en cours récupérés avec succès",
          data: result.data,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "Erreur lors de la récupération des candidats en cours",
          error: result.error,
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Erreur serveur",
        error: error.message,
      });
    }
  }
}

module.exports = new CandidatePostStepProgressController();
