/**
 * Job Application Service - TypeScript Implementation
 * Exemples d'utilisation des nouvelles APIs
 * 
 * À copier dans: src/services/jobApplicationService.ts
 */

import axios, { AxiosInstance } from 'axios';

interface PendingShortlist {
  _id: string;
  profile: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    location: string;
    skills: Array<{ name: string; Levelconfirmed?: string }>;
    yearsOfExperience: number;
  };
  post: {
    _id: string;
    jobDetails: { title: string };
  };
  matchScore: number;
  matchReasoning: string;
  appliedAt: string;
  viewedAt?: string;
  companyNotes?: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface KPIResponse {
  success: boolean;
  data: {
    pendingShortlistsCount: number;
    threshold: number;
  };
}

interface PendingDetailsResponse {
  success: boolean;
  data: PendingShortlist[];
  pagination: Pagination;
  threshold: number;
}

interface DecisionResponse {
  success: boolean;
  message: string;
  data: any;
}

class JobApplicationService {
  private api: AxiosInstance;
  private baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  constructor(token?: string) {
    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
  }

  // ========== KPI ENDPOINTS ==========

  /**
   * Récupère le nombre de candidats en attente de décision
   * @param postId - ID du poste (optionnel)
   * @returns Nombre de shortlists en attente
   */
  async getPendingShortlistsCount(postId?: string): Promise<KPIResponse> {
    try {
      const params = postId ? { postId } : {};
      const response = await this.api.get<KPIResponse>(
        '/job-applications/company/my/kpi/pending-shortlists',
        { params }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du KPI:', error);
      throw error;
    }
  }

  /**
   * Récupère la liste paginée des candidats en attente
   * @param page - Numéro de page
   * @param limit - Nombre d'items par page
   * @param postId - ID du poste (optionnel)
   * @returns Liste des candidats avec pagination
   */
  async getPendingShortlistsDetails(
    page: number = 1,
    limit: number = 20,
    postId?: string
  ): Promise<PendingDetailsResponse> {
    try {
      const params = { page, limit, ...(postId && { postId }) };
      const response = await this.api.get<PendingDetailsResponse>(
        '/job-applications/company/my/kpi/pending-shortlists/details',
        { params }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des détails:', error);
      throw error;
    }
  }

  // ========== RECRUITER DECISION ENDPOINTS ==========

  /**
   * Shortlister un candidat
   * @param applicationId - ID de la candidature
   * @param rejectionReason - Raison optionnelle
   * @returns Candidature mise à jour
   */
  async shortlistCandidate(
    applicationId: string,
    rejectionReason?: string
  ): Promise<DecisionResponse> {
    try {
      const response = await this.api.patch<DecisionResponse>(
        `/job-applications/${applicationId}/recruiter-decision`,
        {
          decision: 'shortlisted',
          rejectionReason: rejectionReason || null,
        }
      );
      console.log('✅ Candidat shortlisté:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors du shortlist:', error);
      throw error;
    }
  }

  /**
   * Rejeter un candidat
   * @param applicationId - ID de la candidature
   * @param rejectionReason - Raison du rejet (optionnel)
   * @returns Candidature mise à jour
   */
  async rejectCandidate(
    applicationId: string,
    rejectionReason?: string
  ): Promise<DecisionResponse> {
    try {
      const response = await this.api.patch<DecisionResponse>(
        `/job-applications/${applicationId}/recruiter-decision`,
        {
          decision: 'rejected',
          rejectionReason: rejectionReason || null,
        }
      );
      console.log('❌ Candidat rejeté:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors du rejet:', error);
      throw error;
    }
  }

  /**
   * Récupère les candidats shortlistés
   * @param page - Numéro de page
   * @param limit - Nombre d'items par page
   * @param postId - ID du poste (optionnel)
   * @returns Liste des candidats shortlistés
   */
  async getShortlistedCandidates(
    page: number = 1,
    limit: number = 20,
    postId?: string
  ): Promise<PendingDetailsResponse> {
    try {
      const params = { page, limit, ...(postId && { postId }) };
      const response = await this.api.get<PendingDetailsResponse>(
        '/job-applications/company/my/shortlisted',
        { params }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des shortlistés:', error);
      throw error;
    }
  }

  /**
   * Récupère les candidats rejetés
   * @param page - Numéro de page
   * @param limit - Nombre d'items par page
   * @param postId - ID du poste (optionnel)
   * @returns Liste des candidats rejetés
   */
  async getRejectedCandidates(
    page: number = 1,
    limit: number = 20,
    postId?: string
  ): Promise<PendingDetailsResponse> {
    try {
      const params = { page, limit, ...(postId && { postId }) };
      const response = await this.api.get<PendingDetailsResponse>(
        '/job-applications/company/my/rejected',
        { params }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des rejetés:', error);
      throw error;
    }
  }

  /**
   * Récupère les candidats selon leur décision
   * @param decision - Type de décision ('shortlisted' ou 'rejected')
   * @param page - Numéro de page
   * @param limit - Nombre d'items par page
   * @param postId - ID du poste (optionnel)
   * @returns Liste des candidats
   */
  async getCandidatesByDecision(
    decision: 'shortlisted' | 'rejected',
    page: number = 1,
    limit: number = 20,
    postId?: string
  ): Promise<PendingDetailsResponse> {
    try {
      const params = { decision, page, limit, ...(postId && { postId }) };
      const response = await this.api.get<PendingDetailsResponse>(
        '/job-applications/company/my/by-decision',
        { params }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération par décision:', error);
      throw error;
    }
  }

  /**
   * Met à jour le token d'authentification
   */
  setAuthToken(token: string) {
    this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
}

export default JobApplicationService;

// ========== REACT HOOKS ==========

import { useState, useCallback, useEffect } from 'react';

/**
 * Hook pour gérer les shortlists en attente
 */
export const usePendingShortlists = (token: string, postId?: string) => {
  const [data, setData] = useState<PendingShortlist[]>([]);
  const [count, setCount] = useState<number>(0);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const service = new JobApplicationService(token);

  const fetchCount = useCallback(async () => {
    try {
      setLoading(true);
      const response = await service.getPendingShortlistsCount(postId);
      setCount(response.data.pendingShortlistsCount);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [token, postId]);

  const fetchDetails = useCallback(
    async (page: number = 1) => {
      try {
        setLoading(true);
        const response = await service.getPendingShortlistsDetails(page, 20, postId);
        setData(response.data);
        setPagination(response.pagination);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    },
    [token, postId]
  );

  useEffect(() => {
    fetchCount();
    fetchDetails();
  }, [postId, token]);

  return { data, count, pagination, loading, error, fetchDetails };
};

/**
 * Hook pour la gestion des décisions (shortlist/reject)
 */
export const useRecruiterDecision = (token: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const service = new JobApplicationService(token);

  const shortlist = useCallback(
    async (applicationId: string, reason?: string) => {
      try {
        setLoading(true);
        const response = await service.shortlistCandidate(applicationId, reason);
        return response.data;
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  const reject = useCallback(
    async (applicationId: string, reason?: string) => {
      try {
        setLoading(true);
        const response = await service.rejectCandidate(applicationId, reason);
        return response.data;
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  return { shortlist, reject, loading, error };
};

// ========== EXEMPLE D'UTILISATION ==========

/**
 * Composant React - Afficher les candidats en attente
 */
export const PendingShortlistsPanel = ({ token, postId }: { token: string; postId?: string }) => {
  const { data, count, pagination, loading, error, fetchDetails } = usePendingShortlists(
    token,
    postId
  );
  const { shortlist, reject } = useRecruiterDecision(token);

  const handleShortlist = async (appId: string) => {
    try {
      await shortlist(appId, 'À recontacter');
      // Rafraîchir la liste
      fetchDetails();
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  const handleReject = async (appId: string) => {
    try {
      await reject(appId, 'Expérience insuffisante');
      // Rafraîchir la liste
      fetchDetails();
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error.message}</div>;

  return (
    <div className="panel">
      <h2>⏳ Candidats en attente: {count}</h2>

      {data.map((candidate) => (
        <div key={candidate._id} className="candidate-card">
          <h3>
            {candidate.profile.firstName} {candidate.profile.lastName}
          </h3>
          <p>📧 {candidate.profile.email}</p>
          <p>🎯 Score: {candidate.matchScore}/100</p>
          <p>📍 {candidate.profile.location}</p>

          <div className="actions">
            <button
              onClick={() => handleShortlist(candidate._id)}
              className="btn btn-primary"
            >
              ✓ Shortlist
            </button>
            <button
              onClick={() => handleReject(candidate._id)}
              className="btn btn-secondary"
            >
              ✗ Reject
            </button>
          </div>
        </div>
      ))}

      {pagination && pagination.hasNextPage && (
        <button onClick={() => fetchDetails(pagination.currentPage + 1)}>
          Voir plus
        </button>
      )}
    </div>
  );
};
