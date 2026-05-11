# 🚀 Guide d'Implémentation - Unreviewed Interviews KPI

**Pour:** Frontend Team  
**API:** Interviews IA Non Reviewés > 48h  
**Date:** 11 Mai 2026  
**Durée Implémentation:** 2-3 heures

---

## 📋 Checklist Implémentation

- [ ] Créer le service API
- [ ] Créer le custom hook
- [ ] Créer le composant Widget KPI
- [ ] Créer le composant Liste avec pagination
- [ ] Ajouter les notifications
- [ ] Tester les 2 endpoints

---

## 1️⃣ Service API

**File:** `src/services/interviewKpiService.ts`

```typescript
import axios, { AxiosInstance } from 'axios';

interface UnreviewedKPI {
  count: number;
  urgent: number;
  lastCheck: string;
  description: string;
}

interface UnreviewedInterview {
  _id: string;
  candidateName: string;
  candidateEmail: string;
  postTitle: string;
  completedAt: string;
  hoursPending: number;
  isUrgent: boolean;
  overallScore: number;
  aiGenerated: boolean;
}

interface PaginationData {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

interface UnreviewedDetailsResponse {
  success: boolean;
  message: string;
  data: UnreviewedInterview[];
  pagination: PaginationData;
  metadata: {
    timestamp: string;
    allInterviewsAreAIGenerated: boolean;
    sortedByOldestFirst: boolean;
  };
}

class InterviewKpiService {
  private api: AxiosInstance;
  private baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  constructor(token?: string) {
    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          console.error('❌ Unauthorized - token may have expired');
          // Optionally trigger logout here
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get KPI count of unreviewed AI interviews > 48h
   */
  async getUnreviewedCount(postId?: string): Promise<UnreviewedKPI> {
    try {
      console.log('📊 Fetching unreviewed interviews KPI count...');
      
      const config: any = {};
      if (postId) {
        config.params = { postId };
      }

      const response = await this.api.get(
        '/post-interview-assessments/company/mine/kpi/unreviewed-48h',
        config
      );

      console.log(`✅ KPI Retrieved: ${response.data.data.count} total, ${response.data.data.urgent} urgent`);
      
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Error fetching unreviewed count:', error.message);
      throw error;
    }
  }

  /**
   * Get paginated list of unreviewed AI interviews > 48h
   */
  async getUnreviewedDetails(
    page: number = 1,
    limit: number = 10,
    postId?: string
  ): Promise<UnreviewedDetailsResponse> {
    try {
      console.log(`📋 Fetching unreviewed interviews - Page ${page}`);
      
      const params: any = { page, limit };
      if (postId) {
        params.postId = postId;
      }

      const response = await this.api.get(
        '/post-interview-assessments/company/mine/kpi/unreviewed-48h/details',
        { params }
      );

      console.log(
        `✅ Details Retrieved: ${response.data.data.length} items, ` +
        `Page ${response.data.pagination.page}/${response.data.pagination.totalPages}`
      );
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching unreviewed details:', error.message);
      throw error;
    }
  }

  /**
   * Get all unreviewed interviews in one request
   */
  async getAllUnreviewed(postId?: string): Promise<UnreviewedInterview[]> {
    try {
      const response = await this.getUnreviewedDetails(1, 100, postId);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching all unreviewed:', error);
      throw error;
    }
  }

  /**
   * Update token for authenticated requests
   */
  setToken(token: string) {
    this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
}

export default InterviewKpiService;
export type { UnreviewedKPI, UnreviewedInterview, UnreviewedDetailsResponse, PaginationData };
```

---

## 2️⃣ Custom Hook

**File:** `src/hooks/useUnreviewedInterviews.ts`

```typescript
import { useState, useCallback, useEffect } from 'react';
import InterviewKpiService, { 
  UnreviewedKPI, 
  UnreviewedInterview, 
  PaginationData 
} from '../services/interviewKpiService';

interface UseUnreviewedInterviewsReturn {
  kpi: UnreviewedKPI | null;
  interviews: UnreviewedInterview[];
  pagination: PaginationData | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  fetchPage: (page: number) => Promise<void>;
  setPostIdFilter: (postId?: string) => void;
}

export const useUnreviewedInterviews = (token: string): UseUnreviewedInterviewsReturn => {
  const [kpi, setKpi] = useState<UnreviewedKPI | null>(null);
  const [interviews, setInterviews] = useState<UnreviewedInterview[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [postIdFilter, setPostIdFilter] = useState<string | undefined>();

  const service = new InterviewKpiService(token);

  // Fetch KPI and details
  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch both in parallel for better performance
      const [kpiData, detailsData] = await Promise.all([
        service.getUnreviewedCount(postIdFilter),
        service.getUnreviewedDetails(page, 10, postIdFilter)
      ]);

      setKpi(kpiData);
      setInterviews(detailsData.data);
      setPagination(detailsData.pagination);
    } catch (err: any) {
      setError(err);
      console.error('Failed to fetch unreviewed interviews:', err);
    } finally {
      setLoading(false);
    }
  }, [service, page, postIdFilter]);

  // Auto-refetch on page/filter change
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Manual page navigation
  const fetchPage = useCallback(async (newPage: number) => {
    setPage(newPage);
  }, []);

  // Filter by post
  const handleSetPostIdFilter = useCallback((postId?: string) => {
    setPostIdFilter(postId);
    setPage(1); // Reset to page 1 when filtering
  }, []);

  return {
    kpi,
    interviews,
    pagination,
    loading,
    error,
    refetch,
    fetchPage,
    setPostIdFilter: handleSetPostIdFilter
  };
};
```

---

## 3️⃣ Composant Widget KPI

**File:** `src/components/InterviewKPIWidget.tsx`

```typescript
import React, { useEffect } from 'react';
import { useUnreviewedInterviews } from '../hooks/useUnreviewedInterviews';

interface InterviewKPIWidgetProps {
  token: string;
  onRefresh?: () => void;
}

export const InterviewKPIWidget: React.FC<InterviewKPIWidgetProps> = ({ 
  token, 
  onRefresh 
}) => {
  const { kpi, loading, error, refetch } = useUnreviewedInterviews(token);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [refetch]);

  if (loading) {
    return (
      <div className="widget-loading">
        <div className="spinner"></div>
        <p>Chargement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="widget-error">
        <p>❌ Erreur: {error.message}</p>
        <button onClick={refetch}>Réessayer</button>
      </div>
    );
  }

  if (!kpi) {
    return <div>Pas de données</div>;
  }

  const urgentPercentage = kpi.count > 0 ? (kpi.urgent / kpi.count) * 100 : 0;

  return (
    <div className="interview-kpi-widget">
      <div className="widget-header">
        <h3>📊 Interviews à Reviewer</h3>
        <button className="refresh-btn" onClick={refetch} disabled={loading}>
          🔄 Rafraîchir
        </button>
      </div>

      <div className="widget-body">
        {/* Total Count */}
        <div className="metric">
          <div className="metric-value">{kpi.count}</div>
          <div className="metric-label">Non reviewés (> 48h)</div>
        </div>

        {/* Urgent Count */}
        <div className={`metric urgent ${kpi.urgent > 0 ? 'alert' : ''}`}>
          <div className="metric-value">{kpi.urgent}</div>
          <div className="metric-label">Très urgents (> 72h)</div>
          {kpi.urgent > 0 && <div className="alert-badge">⚠️ URGENT!</div>}
        </div>

        {/* Progress Bar */}
        <div className="progress-bar">
          <div 
            className="progress-fill urgent"
            style={{ width: `${urgentPercentage}%` }}
          ></div>
        </div>

        {/* Last Updated */}
        <div className="metadata">
          <small>
            ✅ Dernier check: {new Date(kpi.lastCheck).toLocaleTimeString()}
          </small>
        </div>
      </div>

      {/* CTA Button */}
      <div className="widget-footer">
        <button className="cta-button primary">
          Voir les interviews ({kpi.count})
        </button>
      </div>
    </div>
  );
};
```

**Styles CSS:**
```css
.interview-kpi-widget {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  background: #f9f9f9;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.widget-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.refresh-btn {
  background: none;
  border: 1px solid #ccc;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.widget-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 15px;
}

.metric {
  text-align: center;
  padding: 15px;
  background: white;
  border-radius: 6px;
  border-left: 4px solid #4CAF50;
}

.metric.urgent {
  border-left-color: #ff9800;
}

.metric.urgent.alert {
  background: #fff3cd;
  border-left-color: #dc3545;
}

.metric-value {
  font-size: 32px;
  font-weight: bold;
  color: #333;
}

.metric-label {
  font-size: 12px;
  color: #666;
  margin-top: 5px;
}

.alert-badge {
  font-size: 12px;
  color: #dc3545;
  margin-top: 8px;
  font-weight: bold;
}

.progress-bar {
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin: 15px 0;
}

.progress-fill.urgent {
  background: #ff9800;
  height: 100%;
}

.metadata {
  text-align: center;
  color: #999;
}

.widget-footer {
  margin-top: 15px;
  display: flex;
  gap: 10px;
}

.cta-button {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}

.cta-button.primary {
  background: #4CAF50;
  color: white;
}
```

---

## 4️⃣ Composant Liste avec Pagination

**File:** `src/components/UnreviewedInterviewsList.tsx`

```typescript
import React, { useState } from 'react';
import { useUnreviewedInterviews } from '../hooks/useUnreviewedInterviews';

interface UnreviewedInterviewsListProps {
  token: string;
  postId?: string;
}

export const UnreviewedInterviewsList: React.FC<UnreviewedInterviewsListProps> = ({
  token,
  postId
}) => {
  const { 
    interviews, 
    pagination, 
    loading, 
    error, 
    fetchPage,
    setPostIdFilter 
  } = useUnreviewedInterviews(token);

  // Set filter if postId provided
  React.useEffect(() => {
    if (postId) {
      setPostIdFilter(postId);
    }
  }, [postId, setPostIdFilter]);

  if (loading && interviews.length === 0) {
    return <div className="list-loading">Chargement des interviews...</div>;
  }

  if (error) {
    return <div className="list-error">Erreur: {error.message}</div>;
  }

  if (interviews.length === 0) {
    return <div className="list-empty">✅ Aucune interview non reviewée!</div>;
  }

  // Sort by urgency (most urgent first)
  const sorted = [...interviews].sort((a, b) => {
    if (a.isUrgent !== b.isUrgent) return a.isUrgent ? -1 : 1;
    return b.hoursPending - a.hoursPending;
  });

  return (
    <div className="interviews-list">
      <div className="list-header">
        <h2>Interviews à Reviewer</h2>
        <span className="badge">{pagination?.totalCount || 0} total</span>
      </div>

      <table className="interviews-table">
        <thead>
          <tr>
            <th>Candidat</th>
            <th>Poste</th>
            <th>Score IA</th>
            <th>Temps en attente</th>
            <th>Urgence</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(interview => (
            <tr 
              key={interview._id}
              className={`interview-row ${interview.isUrgent ? 'urgent' : ''}`}
            >
              <td>
                <div className="candidate-info">
                  <strong>{interview.candidateName}</strong>
                  <br/>
                  <small>{interview.candidateEmail}</small>
                </div>
              </td>
              <td>{interview.postTitle}</td>
              <td>
                <div className="score-badge">
                  {interview.overallScore}/100
                </div>
              </td>
              <td>
                <span className="hours">
                  {interview.hoursPending}h
                </span>
                <br/>
                <small>{new Date(interview.completedAt).toLocaleDateString('fr-FR')}</small>
              </td>
              <td>
                {interview.isUrgent ? (
                  <span className="urgency urgent">🔴 Urgent (>72h)</span>
                ) : (
                  <span className="urgency normal">🟡 Normal (>48h)</span>
                )}
              </td>
              <td>
                <button 
                  className="review-btn"
                  onClick={() => reviewInterview(interview._id)}
                >
                  Reviewer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => fetchPage(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            ← Précédent
          </button>

          <span className="page-info">
            Page {pagination.page} de {pagination.totalPages}
          </span>

          <button
            onClick={() => fetchPage(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
          >
            Suivant →
          </button>
        </div>
      )}

      {/* AI Generated Note */}
      <div className="ai-note">
        <small>💡 Tous ces interviews ont été générés par IA. Pas d'entretiens humains.</small>
      </div>
    </div>
  );
};

function reviewInterview(interviewId: string) {
  // Navigate to review page or open modal
  console.log(`Reviewing interview: ${interviewId}`);
}
```

**Styles CSS:**
```css
.interviews-list {
  margin-top: 30px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.badge {
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
}

.interviews-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.interviews-table thead {
  background: #f5f5f5;
  font-weight: 600;
}

.interviews-table th,
.interviews-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.interview-row.urgent {
  background: #fff3cd;
}

.candidate-info strong {
  display: block;
  margin-bottom: 4px;
}

.score-badge {
  background: #4CAF50;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 600;
  text-align: center;
  width: 70px;
}

.hours {
  font-weight: 600;
  color: #333;
}

.urgency {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.urgency.urgent {
  background: #ffebee;
  color: #dc3545;
}

.urgency.normal {
  background: #fff3cd;
  color: #ff9800;
}

.review-btn {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}

.review-btn:hover {
  background: #45a049;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 15px;
  align-items: center;
  margin-top: 20px;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 4px;
}

.page-info {
  font-weight: 600;
  color: #666;
  min-width: 150px;
  text-align: center;
}

.ai-note {
  margin-top: 15px;
  padding: 10px;
  background: #e8f5e9;
  border-left: 4px solid #4CAF50;
  border-radius: 4px;
  color: #2e7d32;
}
```

---

## 5️⃣ Intégration dans une Page

**File:** `src/pages/InterviewsPage.tsx`

```typescript
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { InterviewKPIWidget } from '../components/InterviewKPIWidget';
import { UnreviewedInterviewsList } from '../components/UnreviewedInterviewsList';

export const InterviewsPage: React.FC = () => {
  const { user, token } = useAuth();

  if (!token) {
    return <div>Veuillez vous connecter</div>;
  }

  return (
    <div className="interviews-page">
      <h1>Gestion des Interviews IA</h1>
      
      {/* KPI Widget */}
      <InterviewKPIWidget token={token} />

      {/* List Component */}
      <UnreviewedInterviewsList token={token} />
    </div>
  );
};
```

---

## 🧪 Test Checklist

- [ ] Importer service et hook
- [ ] Tester avec un token valide
- [ ] Vérifier que KPI count s'affiche
- [ ] Vérifier que liste se pagine
- [ ] Vérifier que tri par urgence fonctionne
- [ ] Tester le filtre par post
- [ ] Vérifier les états loading/error

---

## 📊 Structure du Projet Recommandée

```
src/
├── services/
│   └── interviewKpiService.ts       ← API Service
├── hooks/
│   └── useUnreviewedInterviews.ts   ← Custom Hook
├── components/
│   ├── InterviewKPIWidget.tsx       ← Widget KPI
│   └── UnreviewedInterviewsList.tsx ← Liste
└── pages/
    └── InterviewsPage.tsx           ← Page complète
```

---

## 🚀 Prochaines Étapes

1. **Copier les fichiers** dans votre projet
2. **Adapter les styles** selon votre design system
3. **Ajouter les notifications** (toast pour urgents)
4. **Implémenter le review flow** (modal/page)
5. **Tester avec Postman collection** d'abord
6. **Déployer et monitorer** les logs

---

## 💡 Tips & Tricks

### Cache avec React Query
```typescript
import { useQuery } from 'react-query';

export const useUnreviewedInterviewsQuery = (token: string) => {
  const service = new InterviewKpiService(token);

  return useQuery(
    ['unreviewed-interviews'],
    () => service.getUnreviewedDetails(1, 10),
    {
      refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
      staleTime: 60 * 1000, // Cache for 1 minute
    }
  );
};
```

### Error Boundary
```typescript
class InterviewErrorBoundary extends React.Component {
  render() {
    try {
      return this.props.children;
    } catch (error) {
      console.error('Interview widget error:', error);
      return <div className="error">Erreur affichage interviews</div>;
    }
  }
}
```

### Toast Notifications
```typescript
if (kpi?.urgent > 0) {
  toast.warning(`⚠️ ${kpi.urgent} interviews URGENTS à reviewer!`);
}
```

---

**Bonne chance! 🚀**
