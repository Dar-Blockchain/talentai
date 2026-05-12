# 📋 Documentation API - Job Application & Recruiter Decision

**Dernière mise à jour:** 11 Mai 2026  
**Version:** 1.0.0  
**Audience:** Frontend Team

---

## 📑 Table des matières
1. [Vue d'ensemble](#vue-densemble)
2. [Authentification](#authentification)
3. [APIs KPI - Shortlists en attente](#apis-kpi---shortlists-en-attente)
4. [APIs Recruiter Decision](#apis-recruiter-decision)
5. [Exemples de consommation](#exemples-de-consommation)
6. [Codes d'erreur](#codes-derreur)

---

## 👁️ Vue d'ensemble

Cet ensemble d'APIs permet à une entreprise (Company) de:
- 📊 Voir les KPIs des candidats shortlistés en attente de décision
- 🎯 Marquer les candidats comme "shortlisted" ou "rejected"
- 👥 Consulter les candidats selon leur statut de décision

### Contexte métier

```
Candidats → Match Score ≥ 60 → Pending Decision → Recruiter Decision (shortlist/reject)
```

- **Match Score**: Calculé automatiquement par AI lors de la candidature (0-100)
- **Seuil shortlist**: 60/100
- **Recruiter Decision**: Décision manuelle du recruteur (shortlisted/rejected/null)

---

## 🔐 Authentification

**Toutes les APIs requièrent:**
- ✅ Token JWT valide dans le header `Authorization: Bearer <token>`
- ✅ L'utilisateur doit être une **Company** (role: "Company")
- ✅ Les données retournées sont filtrées selon la company connectée

```bash
# Header requis
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

## 📊 APIs KPI - Shortlists en attente

### 1. Compter les shortlists en attente

**Endpoint:**
```
GET /job-applications/company/my/kpi/pending-shortlists
```

**Query Parameters:**
| Param | Type | Requis | Description |
|-------|------|--------|-------------|
| `postId` | string | ❌ | ID du poste (optionnel) - filter par poste spécifique |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Pending shortlists KPI retrieved successfully",
  "data": {
    "pendingShortlistsCount": 12,
    "threshold": 60,
    "filters": {
      "company": "company_id_123",
      "post": "post_id_xyz",
      "minMatchScore": 60,
      "recruiterDecision": "null",
      "isActive": true
    }
  }
}
```

**Cas d'usage:**
```javascript
// Récupérer tous les shortlists en attente
const response = await fetch('/job-applications/company/my/kpi/pending-shortlists', {
  headers: { Authorization: `Bearer ${token}` }
});

// Récupérer pour un poste spécifique
const response = await fetch(
  '/job-applications/company/my/kpi/pending-shortlists?postId=post123',
  { headers: { Authorization: `Bearer ${token}` } }
);
```

---

### 2. Détails des shortlists en attente

**Endpoint:**
```
GET /job-applications/company/my/kpi/pending-shortlists/details
```

**Query Parameters:**
| Param | Type | Requis | Description |
|-------|------|--------|-------------|
| `postId` | string | ❌ | Filter par poste |
| `page` | number | ❌ | Numéro de page (défaut: 1) |
| `limit` | number | ❌ | Items par page (défaut: 20) |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Pending shortlist candidates retrieved successfully",
  "data": [
    {
      "_id": "app_id_123",
      "profile": {
        "_id": "profile_id",
        "firstName": "Jean",
        "lastName": "Dupont",
        "email": "jean.dupont@email.com",
        "location": "Paris",
        "skills": [
          { "name": "JavaScript", "Levelconfirmed": "Expert" },
          { "name": "React", "Levelconfirmed": "Avancé" }
        ],
        "yearsOfExperience": 5
      },
      "post": {
        "_id": "post_id",
        "jobDetails": {
          "title": "Développeur Senior React",
          "description": "..."
        }
      },
      "matchScore": 87,
      "matchReasoning": "Strong technical skills match with excellent React experience...",
      "appliedAt": "2026-05-10T14:30:00Z",
      "viewedAt": "2026-05-11T09:15:00Z",
      "shortlistedAt": null,
      "companyNotes": "À recontacter après vacances"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalCount": 45,
    "limit": 20,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "threshold": 60
}
```

**Cas d'usage:**
```javascript
// Récupérer les détails paginés
const response = await fetch(
  '/job-applications/company/my/kpi/pending-shortlists/details?page=1&limit=20',
  { headers: { Authorization: `Bearer ${token}` } }
);
const result = await response.json();
console.log(result.data); // Array de candidats
```

---

## 🎯 APIs Recruiter Decision

### 3. Mettre à jour la décision du recruteur

**Endpoint:**
```
PATCH /job-applications/:applicationId/recruiter-decision
```

**URL Parameters:**
| Param | Type | Requis | Description |
|-------|------|--------|-------------|
| `applicationId` | string | ✅ | ID de la candidature |

**Request Body:**
```json
{
  "decision": "shortlisted",
  "rejectionReason": "Excellent profil, à rencontrer" // optionnel, requis si decision="rejected"
}
```

**Valeurs acceptées:**
- `"shortlisted"` - Marquer comme shortlisté
- `"rejected"` - Marquer comme rejeté

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Application shortlisted successfully",
  "data": {
    "_id": "app_id_123",
    "profile": { ... },
    "post": { ... },
    "matchScore": 87,
    "recruiterDecision": "shortlisted",
    "recruiterDecisionAt": "2026-05-11T10:45:30Z",
    "company": { ... },
    "status": "visited"
  }
}
```

**Cas d'usage:**
```javascript
// Shortlister un candidat
const response = await fetch(
  '/job-applications/app_id_123/recruiter-decision',
  {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      decision: 'shortlisted',
      rejectionReason: 'Excellent profil techniques'
    })
  }
);

// Rejeter un candidat
const response = await fetch(
  '/job-applications/app_id_456/recruiter-decision',
  {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      decision: 'rejected',
      rejectionReason: 'Expérience insuffisante en React'
    })
  }
);
```

---

### 4. Récupérer les candidats shortlistés

**Endpoint:**
```
GET /job-applications/company/my/shortlisted
```

**Query Parameters:**
| Param | Type | Requis | Description |
|-------|------|--------|-------------|
| `postId` | string | ❌ | Filter par poste |
| `page` | number | ❌ | Numéro de page (défaut: 1) |
| `limit` | number | ❌ | Items par page (défaut: 20) |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Shortlisted candidates retrieved successfully",
  "data": [
    {
      "_id": "app_id_123",
      "profile": {
        "firstName": "Jean",
        "lastName": "Dupont",
        "email": "jean.dupont@email.com",
        "location": "Paris",
        "skills": [...]
      },
      "post": { "jobDetails": { "title": "Dev Senior" } },
      "matchScore": 87,
      "recruiterDecisionAt": "2026-05-11T10:45:30Z",
      "appliedAt": "2026-05-10T14:30:00Z",
      "companyNotes": "À rencontrer"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalCount": 8,
    "limit": 20,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

---

### 5. Récupérer les candidats rejetés

**Endpoint:**
```
GET /job-applications/company/my/rejected
```

**Query Parameters:**
| Param | Type | Requis | Description |
|-------|------|--------|-------------|
| `postId` | string | ❌ | Filter par poste |
| `page` | number | ❌ | Numéro de page (défaut: 1) |
| `limit` | number | ❌ | Items par page (défaut: 20) |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Rejected candidates retrieved successfully",
  "data": [
    {
      "_id": "app_id_789",
      "profile": {
        "firstName": "Marie",
        "lastName": "Martin",
        "email": "marie.martin@email.com",
        "location": "Lyon",
        "skills": [...]
      },
      "post": { "jobDetails": { "title": "Dev Senior" } },
      "matchScore": 45,
      "rejectionReason": "Expérience insuffisante",
      "recruiterDecisionAt": "2026-05-11T11:30:00Z",
      "appliedAt": "2026-05-10T15:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

---

### 6. Récupérer candidats par décision (générique)

**Endpoint:**
```
GET /job-applications/company/my/by-decision
```

**Query Parameters:**
| Param | Type | Requis | Description |
|-------|------|--------|-------------|
| `decision` | string | ✅ | `"shortlisted"` ou `"rejected"` |
| `postId` | string | ❌ | Filter par poste |
| `page` | number | ❌ | Numéro de page (défaut: 1) |
| `limit` | number | ❌ | Items par page (défaut: 20) |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Candidates with decision 'shortlisted' retrieved successfully",
  "data": [ ... ],
  "pagination": { ... }
}
```

---

## 💻 Exemples de consommation

### React Hook - Récupérer les shortlists en attente

```typescript
import { useEffect, useState } from 'react';

export const usePendingShortlists = (token: string) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          '/job-applications/company/my/kpi/pending-shortlists',
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        if (!response.ok) throw new Error('Failed to fetch');
        const json = await response.json();
        setData(json.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  return { data, loading, error };
};
```

### React Component - Shortlister/Rejeter un candidat

```typescript
const updateCandidateDecision = async (
  applicationId: string,
  decision: 'shortlisted' | 'rejected',
  rejectionReason?: string,
  token: string
) => {
  const response = await fetch(
    `/job-applications/${applicationId}/recruiter-decision`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        decision,
        rejectionReason: rejectionReason || null
      })
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  return await response.json();
};

// Usage
const handleShortlist = async (appId: string) => {
  try {
    await updateCandidateDecision(appId, 'shortlisted', undefined, token);
    toast.success('Candidat shortlisté!');
    // Refresh list
  } catch (error) {
    toast.error(error.message);
  }
};
```

### Afficher le badge "En attente de décision"

```typescript
const PendingDecisionBadge = ({ applicationId, token }: Props) => {
  const [isPending, setIsPending] = useState(true);

  useEffect(() => {
    // Après update, vérifier si encore en attente
    const checkStatus = async () => {
      const response = await fetch(
        `/job-applications/${applicationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const { data } = await response.json();
      setIsPending(data.recruiterDecision === null);
    };
    checkStatus();
  }, []);

  if (!isPending) return null;
  return <span className="badge badge-warning">⏳ En attente</span>;
};
```

---

## ⚠️ Codes d'erreur

| Code | Message | Description |
|------|---------|-------------|
| 400 | Missing required field | Paramètre requis manquant |
| 400 | Decision must be 'shortlisted' or 'rejected' | Valeur de décision invalide |
| 400 | Company ID is required | L'utilisateur n'est pas une company |
| 403 | You are not authorized | Tentative d'accès à d'autres applications |
| 404 | Application not found | Application introuvable |
| 500 | Internal server error | Erreur serveur |

---

## 📈 Flux de travail recommandé

```
1. Afficher le KPI (nombre de shortlists en attente)
   └─ GET /company/my/kpi/pending-shortlists

2. Afficher la liste paginée des candidats en attente
   └─ GET /company/my/kpi/pending-shortlists/details?page=1

3. Cliquer sur "Shortlist" ou "Reject"
   └─ PATCH /:applicationId/recruiter-decision

4. Rafraîchir la liste ou afficher les shortlistés
   └─ GET /company/my/shortlisted
```

---

## 🎓 Conseils d'intégration

### ✅ À FAIRE
- ✓ Mettre en cache les résultats avec un TTL court (60s)
- ✓ Afficher un loader pendant le chargement
- ✓ Afficher un toast de confirmation après action
- ✓ Rafraîchir la liste après une décision

### ❌ À NE PAS FAIRE
- ✗ Ne pas faire plusieurs requêtes simultanées au même endpoint
- ✗ Ne pas afficher les applications rejetées dans "pending"
- ✗ Ne pas oublier le header Authorization
- ✗ Ne pas supposer que tous les users sont des companies

---

## 📞 Support

Pour toute question, contactez le backend team ou consultez les logs du serveur:
```bash
Backend/logs/  # Logs détaillés des requêtes
```

---

**Document généré le:** 11 Mai 2026  
**Version API:** 1.0.0  
**Statut:** ✅ Production Ready
