const InterviewAssessment = require('../models/InterviewAssessmentModel');

class InterviewAssessmentService {
  // Créer une nouvelle évaluation
  async createAssessment(data) {
    try {
      const assessment = new InterviewAssessment(data);
      return await assessment.save();
    } catch (error) {
      throw new Error(`Erreur lors de la création de l'évaluation: ${error.message}`);
    }
  }

  // Récupérer une évaluation par ID
  async getAssessmentById(id) {
    try {
      const assessment = await InterviewAssessment.findById(id)
        .populate('candidateId')
        .populate('interviewerId');
      if (!assessment) {
        throw new Error('Évaluation non trouvée');
      }
      return assessment;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération de l'évaluation: ${error.message}`);
    }
  }

  // Récupérer une évaluation par sessionId
  async getAssessmentBySessionId(sessionId) {
    try {
      const assessment = await InterviewAssessment.findOne({ 'interviewData.sessionId': sessionId })
        .populate('candidateId')
        .populate('interviewerId');
      if (!assessment) {
        throw new Error('Évaluation non trouvée pour cette session');
      }
      return assessment;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération: ${error.message}`);
    }
  }

  // Récupérer toutes les évaluations avec pagination
  async getAllAssessments(page = 1, limit = 10, filters = {}) {
    try {
      const skip = (page - 1) * limit;
      const query = this._buildQuery(filters);

      const assessments = await InterviewAssessment.find(query)
        .populate('candidateId')
        .populate('interviewerId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await InterviewAssessment.countDocuments(query);

      return {
        data: assessments,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des évaluations: ${error.message}`);
    }
  }

  // Récupérer les évaluations par candidat
  async getAssessmentsByCandidate(candidateId, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;

      const assessments = await InterviewAssessment.find({ candidateId })
        .populate('candidateId')
        .populate('interviewerId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await InterviewAssessment.countDocuments({ candidateId });

      return {
        data: assessments,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération: ${error.message}`);
    }
  }

  // Récupérer les évaluations par compétence
  async getAssessmentsBySkill(skill, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;

      const assessments = await InterviewAssessment.find({ 'metadata.skill': skill })
        .populate('candidateId')
        .populate('interviewerId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await InterviewAssessment.countDocuments({ 'metadata.skill': skill });

      return {
        data: assessments,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération: ${error.message}`);
    }
  }

  // Mettre à jour une évaluation
  async updateAssessment(id, updateData) {
    try {
      const assessment = await InterviewAssessment.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate('candidateId')
        .populate('interviewerId');

      if (!assessment) {
        throw new Error('Évaluation non trouvée');
      }
      return assessment;
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour: ${error.message}`);
    }
  }

  // Mettre à jour le statut
  async updateStatus(id, status) {
    try {
      const validStatuses = ['draft', 'in-progress', 'completed', 'archived'];
      if (!validStatuses.includes(status)) {
        throw new Error(`Statut invalide. Valeurs acceptées: ${validStatuses.join(', ')}`);
      }

      const assessment = await InterviewAssessment.findByIdAndUpdate(
        id,
        { status, updatedAt: new Date() },
        { new: true }
      );

      if (!assessment) {
        throw new Error('Évaluation non trouvée');
      }
      return assessment;
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour du statut: ${error.message}`);
    }
  }

  // Supprimer une évaluation
  async deleteAssessment(id) {
    try {
      const assessment = await InterviewAssessment.findByIdAndDelete(id);
      if (!assessment) {
        throw new Error('Évaluation non trouvée');
      }
      return { message: 'Évaluation supprimée avec succès' };
    } catch (error) {
      throw new Error(`Erreur lors de la suppression: ${error.message}`);
    }
  }

  // Archiver une évaluation
  async archiveAssessment(id) {
    try {
      const assessment = await InterviewAssessment.findByIdAndUpdate(
        id,
        { status: 'archived', updatedAt: new Date() },
        { new: true }
      );

      if (!assessment) {
        throw new Error('Évaluation non trouvée');
      }
      return assessment;
    } catch (error) {
      throw new Error(`Erreur lors de l'archivage: ${error.message}`);
    }
  }

  // Obtenir le résumé d'une évaluation
  async getAssessmentSummary(id) {
    try {
      const assessment = await InterviewAssessment.findById(id);
      if (!assessment) {
        throw new Error('Évaluation non trouvée');
      }
      return assessment.getSummary();
    } catch (error) {
      throw new Error(`Erreur lors de la récupération du résumé: ${error.message}`);
    }
  }

  // Obtenir les statistiques globales
  async getGlobalStatistics() {
    try {
      const totalAssessments = await InterviewAssessment.countDocuments();
      const completedAssessments = await InterviewAssessment.countDocuments({ status: 'completed' });
      const draftAssessments = await InterviewAssessment.countDocuments({ status: 'draft' });
      const inProgressAssessments = await InterviewAssessment.countDocuments({ status: 'in-progress' });
      const archivedAssessments = await InterviewAssessment.countDocuments({ status: 'archived' });

      const averageScore = await InterviewAssessment.aggregate([
        {
          $group: {
            _id: null,
            avgScore: { $avg: '$interviewData.finalReport.scores.overall' }
          }
        }
      ]);

      const assessmentsBySkill = await InterviewAssessment.aggregate([
        {
          $group: {
            _id: '$metadata.skill',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]);

      const assessmentsByProficiency = await InterviewAssessment.aggregate([
        {
          $group: {
            _id: '$metadata.proficiency',
            count: { $sum: 1 }
          }
        }
      ]);

      return {
        totalAssessments,
        byStatus: {
          completed: completedAssessments,
          draft: draftAssessments,
          inProgress: inProgressAssessments,
          archived: archivedAssessments
        },
        averageScore: averageScore[0]?.avgScore || 0,
        bySkill: assessmentsBySkill,
        byProficiency: assessmentsByProficiency
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
    }
  }

  // Construire la requête avec filtres
  _buildQuery(filters) {
    const query = {};

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.skill) {
      query['metadata.skill'] = filters.skill;
    }

    if (filters.proficiency) {
      query['metadata.proficiency'] = filters.proficiency;
    }

    if (filters.interviewType) {
      query['interviewData.interviewType'] = filters.interviewType;
    }

    if (filters.candidateId) {
      query.candidateId = filters.candidateId;
    }

    if (filters.interviewerId) {
      query.interviewerId = filters.interviewerId;
    }

    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        query.createdAt.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.createdAt.$lte = new Date(filters.endDate);
      }
    }

    return query;
  }
}

module.exports = new InterviewAssessmentService();
