const InterviewAssessmentService = require('../services/InterviewAssessmentService');

class InterviewAssessmentController {
  // POST - Créer une nouvelle évaluation
  async create(req, res) {
    try {
      const data = req.body;

      // Validation de base
      if (!data.interviewData?.sessionId) {
        return res.status(400).json({
          success: false,
          message: 'sessionId est requis'
        });
      }

      const assessment = await InterviewAssessmentService.createAssessment(data);

      return res.status(201).json({
        success: true,
        message: 'Évaluation créée avec succès',
        data: assessment
      });
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET - Récupérer une évaluation par ID
  async getById(req, res) {
    try {
      const { id } = req.params;

      const assessment = await InterviewAssessmentService.getAssessmentById(id);

      return res.status(200).json({
        success: true,
        data: assessment
      });
    } catch (error) {
      console.error('Erreur lors de la récupération:', error);
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET - Récupérer une évaluation par sessionId
  async getBySessionId(req, res) {
    try {
      const { sessionId } = req.params;

      const assessment = await InterviewAssessmentService.getAssessmentBySessionId(sessionId);

      return res.status(200).json({
        success: true,
        data: assessment
      });
    } catch (error) {
      console.error('Erreur lors de la récupération:', error);
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET - Récupérer toutes les évaluations
  async getAll(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const filters = {
        status: req.query.status,
        skill: req.query.skill,
        proficiency: req.query.proficiency,
        interviewType: req.query.interviewType,
        candidateId: req.query.candidateId,
        interviewerId: req.query.interviewerId,
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };

      const result = await InterviewAssessmentService.getAllAssessments(
        parseInt(page),
        parseInt(limit),
        Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== undefined))
      );

      return res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      console.error('Erreur lors de la récupération:', error);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET - Récupérer les évaluations par candidat
  async getByCandidate(req, res) {
    try {
      const { candidateId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const result = await InterviewAssessmentService.getAssessmentsByCandidate(
        candidateId,
        parseInt(page),
        parseInt(limit)
      );

      return res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      console.error('Erreur lors de la récupération:', error);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET - Récupérer les évaluations par compétence
  async getBySkill(req, res) {
    try {
      const { skill } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const result = await InterviewAssessmentService.getAssessmentsBySkill(
        skill,
        parseInt(page),
        parseInt(limit)
      );

      return res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      console.error('Erreur lors de la récupération:', error);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // PUT - Mettre à jour une évaluation
  async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const assessment = await InterviewAssessmentService.updateAssessment(id, updateData);

      return res.status(200).json({
        success: true,
        message: 'Évaluation mise à jour avec succès',
        data: assessment
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // PATCH - Mettre à jour le statut
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Le statut est requis'
        });
      }

      const assessment = await InterviewAssessmentService.updateStatus(id, status);

      return res.status(200).json({
        success: true,
        message: 'Statut mis à jour avec succès',
        data: assessment
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // DELETE - Supprimer une évaluation
  async delete(req, res) {
    try {
      const { id } = req.params;

      const result = await InterviewAssessmentService.deleteAssessment(id);

      return res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // PATCH - Archiver une évaluation
  async archive(req, res) {
    try {
      const { id } = req.params;

      const assessment = await InterviewAssessmentService.archiveAssessment(id);

      return res.status(200).json({
        success: true,
        message: 'Évaluation archivée avec succès',
        data: assessment
      });
    } catch (error) {
      console.error('Erreur lors de l\'archivage:', error);
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET - Obtenir le résumé d'une évaluation
  async getSummary(req, res) {
    try {
      const { id } = req.params;

      const summary = await InterviewAssessmentService.getAssessmentSummary(id);

      return res.status(200).json({
        success: true,
        data: summary
      });
    } catch (error) {
      console.error('Erreur lors de la récupération du résumé:', error);
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET - Obtenir les statistiques globales
  async getStatistics(req, res) {
    try {
      const statistics = await InterviewAssessmentService.getGlobalStatistics();

      return res.status(200).json({
        success: true,
        data: statistics
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new InterviewAssessmentController();
