# 📊 API: Interviews IA Non Reviewés > 48h

**Version:** 1.0.0  
**Statut:** ✅ Production Ready  
**Type:** KPI Metrics API  
**Date Création:** 11 Mai 2026

---

## 🎯 Objectif

Fournir une API KPI pour suivre et gérer les entretiens IA générés automatiquement qui n'ont pas encore été reviewés par un recruteur pendant plus de 48 heures.

**Important:** 
- ✅ Tous les entretiens dans `PostInterviewAssessment` sont **générés par IA** (pas des entretiens humains)
- ✅ La date de fin d'entretien = `createdAt` (moment de création)
- ✅ "Non reviewé" = `recruiterFeedback` est null/vide

---

## 📋 Contexte Technique

### Model Updates

Le modèle `PostInterviewAssessment` a été étendu avec 2 nouveaux champs:

```javascript
// Champs ajoutés à PostInterviewAssessment.model.js

// Feedback du recruteur après review de l'entretien IA
recruiterFeedback: {
  type: String,
  default: null,
  description: 'Feedback from recruiter after reviewing AI interview - null means not yet reviewed',
  index: true
}

// Timestamp du review
recruiterFeedbackAt: {
  type: Date,
  default: null,
  description: 'Timestamp when recruiter reviewed the interview'
}
```

### Logique de Calcul

```
Unreviewed Interview = {
  ✓ completed = true          (L'entretien IA est terminé)
  ✓ recruiterFeedback = null  (Aucun feedback du recruteur)
  ✓ createdAt < NOW - 48h     (Créé il y a plus de 48h)
}
```

---

## 🔌 Endpoints

### 1️⃣ GET - KPI Count (Compter les non-reviewés)

**Endpoint:**
```
GET /post-interview-assessments/company/mine/kpi/unreviewed-48h
```

**Authentication:** `Bearer <JWT_TOKEN>`  
**Method:** GET  
**Permissions:** Company role required

**Query Parameters:**

| Paramètre | Type | Required | Description |
|-----------|------|----------|-------------|
| `postId` | ObjectId | No | Filtrer par poste spécifique |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "12 AI interviews pending recruiter review (3 urgent - over 72h)",
  "data": {
    "count": 12,
    "urgent": 3,
    "lastCheck": "2026-05-11T14:30:00Z",
    "description": "AI-generated interviews pending recruiter feedback for 48+ hours"
  }
}
```

**Response Fields:**

| Champ | Type | Description |
|-------|------|-------------|
| `count` | Number | Total non-reviewés > 48h |
| `urgent` | Number | Non-reviewés > 72h (très urgents) |
| `lastCheck` | ISO Date | Timestamp du check |
| `description` | String | Description pour l'UI |

**Error Responses:**

```json
// 401 - Non authentifié
{
  "success": false,
  "message": "Authorization failed"
}
```

```json
// 403 - Pas une company
{
  "success": false,
  "message": "Only company accounts can access this"
}
```

---

### 2️⃣ GET - KPI Details (Lister les non-reviewés)

**Endpoint:**
```
GET /post-interview-assessments/company/mine/kpi/unreviewed-48h/details
```

**Authentication:** `Bearer <JWT_TOKEN>`  
**Method:** GET  
**Permissions:** Company role required

**Query Parameters:**

| Paramètre | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | Number | 1 | Numéro de page |
| `limit` | Number | 10 | Records par page (max: 100) |
| `postId` | ObjectId | - | Filtrer par poste |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Unreviewed interviews retrieved successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "candidateName": "Jean Dupont",
      "candidateEmail": "jean@example.com",
      "postTitle": "Senior Developer",
      "completedAt": "2026-05-09T10:30:00Z",
      "hoursPending": 52,
      "isUrgent": false,
      "overallScore": 78,
      "aiGenerated": true
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "candidateName": "Marie Martin",
      "candidateEmail": "marie@example.com",
      "postTitle": "Product Manager",
      "completedAt": "2026-05-08T14:15:00Z",
      "hoursPending": 74,
      "isUrgent": true,
      "overallScore": 82,
      "aiGenerated": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalCount": 12,
    "totalPages": 2
  },
  "metadata": {
    "timestamp": "2026-05-11T14:30:00Z",
    "allInterviewsAreAIGenerated": true,
    "sortedByOldestFirst": true
  }
}
```

**Response Fields:**

| Champ | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | ID unique de l'entretien |
| `candidateName` | String | Nom du candidat |
| `candidateEmail` | String | Email du candidat |
| `postTitle` | String | Titre du poste |
| `completedAt` | ISO Date | Date de création/fin de l'entretien |
| `hoursPending` | Number | Heures écoulées depuis la fin |
| `isUrgent` | Boolean | true si > 72h |
| `overallScore` | Number | Score IA de 0-100 |
| `aiGenerated` | Boolean | Toujours true (entretien IA) |

---

## 📱 Exemples d'Utilisation

### JavaScript / Fetch

```javascript
// 1. Obtenir le KPI count
async function getUnreviewedCount() {
  const response = await fetch(
    'http://localhost:5000/api/post-interview-assessments/company/mine/kpi/unreviewed-48h',
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${yourJWTToken}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  const data = await response.json();
  console.log(`${data.data.count} interviews à reviewer`);
  console.log(`${data.data.urgent} très urgents (> 72h)`);
  
  return data;
}

// 2. Obtenir la liste paginée
async function getUnreviewedDetails(page = 1) {
  const response = await fetch(
    `http://localhost:5000/api/post-interview-assessments/company/mine/kpi/unreviewed-48h/details?page=${page}&limit=10`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${yourJWTToken}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  const data = await response.json();
  
  data.data.forEach(interview => {
    console.log(`${interview.candidateName} - ${interview.hoursPending}h pending`);
    if (interview.isUrgent) {
      console.warn('⚠️ URGENT!');
    }
  });
  
  return data;
}
```

### React Hook

```typescript
import { useState, useEffect } from 'react';

const useUnreviewedInterviews = (token: string) => {
  const [kpi, setKpi] = useState(null);
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch KPI count
        const kpiRes = await fetch(
          '/api/post-interview-assessments/company/mine/kpi/unreviewed-48h',
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        const kpiData = await kpiRes.json();
        setKpi(kpiData.data);

        // Fetch details
        const detailsRes = await fetch(
          '/api/post-interview-assessments/company/mine/kpi/unreviewed-48h/details?page=1&limit=20',
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        const detailsData = await detailsRes.json();
        setDetails(detailsData.data);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  return { kpi, details, loading };
};

// Usage in component
function UnreviewedInterviewsWidget() {
  const { kpi, details, loading } = useUnreviewedInterviews(userToken);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Interviews à reviewer</h2>
      <p>Total: {kpi?.count} (Urgent: {kpi?.urgent})</p>
      
      <ul>
        {details.map(interview => (
          <li key={interview._id} style={{
            backgroundColor: interview.isUrgent ? '#ffcccc' : '#f0f0f0'
          }}>
            <strong>{interview.candidateName}</strong> - {interview.postTitle}
            <br/>
            Score: {interview.overallScore}/100 | {interview.hoursPending}h pending
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### cURL

```bash
# 1. Obtenir le KPI count
curl -X GET \
  'http://localhost:5000/api/post-interview-assessments/company/mine/kpi/unreviewed-48h' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'

# 2. Obtenir les détails (page 1)
curl -X GET \
  'http://localhost:5000/api/post-interview-assessments/company/mine/kpi/unreviewed-48h/details?page=1&limit=10' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'

# 3. Filtrer par poste
curl -X GET \
  'http://localhost:5000/api/post-interview-assessments/company/mine/kpi/unreviewed-48h/details?postId=507f1f77bcf86cd799439010&page=1' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

---

## 🔄 Cas d'Utilisation

### Dashboard - Widget KPI

```
┌─────────────────────────────────────┐
│  📊 Interviews à reviewer           │
│                                     │
│  Total: 12                          │
│  Urgent (> 72h): 3 ⚠️               │
└─────────────────────────────────────┘
```

**Code:**
```javascript
async function refreshKPI() {
  const res = await fetch(
    '/api/post-interview-assessments/company/mine/kpi/unreviewed-48h',
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  const data = await res.json();
  
  document.getElementById('total').textContent = data.data.count;
  document.getElementById('urgent').textContent = data.data.urgent;
  
  if (data.data.urgent > 0) {
    document.getElementById('alert').style.display = 'block';
  }
}

// Refresh toutes les 5 minutes
setInterval(refreshKPI, 5 * 60 * 1000);
```

### Liste Paginée avec Tri

```javascript
async function displayUnreviewedList() {
  let page = 1;
  const limit = 20;

  async function loadPage(pageNum) {
    const res = await fetch(
      `/api/post-interview-assessments/company/mine/kpi/unreviewed-48h/details?page=${pageNum}&limit=${limit}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    
    const data = await res.json();
    const interviews = data.data;
    const pagination = data.pagination;

    // Afficher les interviews
    const html = interviews
      .sort((a, b) => b.hoursPending - a.hoursPending) // Tri par urgence
      .map(i => `
        <tr style="background: ${i.isUrgent ? '#ffe6e6' : 'white'}">
          <td>${i.candidateName}</td>
          <td>${i.postTitle}</td>
          <td>${i.overallScore}/100</td>
          <td>${i.hoursPending}h</td>
          <td>${i.isUrgent ? '🔴 URGENT' : '🟡 Normal'}</td>
          <td>
            <button onclick="reviewInterview('${i._id}')">Review</button>
          </td>
        </tr>
      `).join('');

    document.getElementById('list').innerHTML = html;
    
    // Afficher pagination
    document.getElementById('pagination').textContent = 
      `Page ${pagination.page}/${pagination.totalPages}`;
  }

  loadPage(1);
}
```

---

## ⚙️ Configuration

### Threshold Timestamps

| Métrique | Valeur | Calcul |
|----------|--------|--------|
| Standard | 48h | NOW() - 48 * 60 * 60 * 1000 ms |
| Urgent | 72h | NOW() - 72 * 60 * 60 * 1000 ms |

Pour modifier le seuil, éditer `postInterviewAssessment.service.js`:
```javascript
// Ligne ~640
const hours48Ago = new Date(now.getTime() - 48 * 60 * 60 * 1000); // Modifier ici
const hours72Ago = new Date(now.getTime() - 72 * 60 * 60 * 1000); // Et ici
```

---

## 🧪 Test avec Postman

### Import Collection

1. Créer une nouvelle requête dans Postman
2. Copier les exemples cURL ci-dessus
3. Remplacer `YOUR_JWT_TOKEN` par un vrai token

### Variables d'Environnement

```json
{
  "baseUrl": "http://localhost:5000/api",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "companyId": "507f1f77bcf86cd799439001"
}
```

---

## 📊 Métriques & Monitoring

### Logging

Tous les appels génèrent des logs détaillés:

```
📊 [UNREVIEWED INTERVIEWS KPI] - Fetching unreviewed AI interviews > 48h for company 507f1f77bcf86cd799439001
✅ Unreviewed AI Interviews Retrieved:
   Total unreviewed > 48h: 12
   Urgent unreviewed > 72h: 3
```

### Performance

- **Query time:** ~50-100ms (avec index)
- **Pagination:** Optimisée pour limit ≤ 100
- **Cache:** Recommandé TTL 60s

---

## 🚨 Codes d'Erreur

| Code | Message | Cause | Solution |
|------|---------|-------|----------|
| 400 | Invalid page/limit | Paramètres invalides | Vérifier les valeurs numériques |
| 401 | Authorization failed | Token absent/invalide | Fournir un JWT valide |
| 403 | Not authorized | User n'est pas Company | Utiliser un compte Company |
| 404 | Post not found | postId invalide | Vérifier l'ID du poste |
| 500 | Server error | Erreur DB/serveur | Vérifier les logs serveur |

---

## 🔒 Sécurité

- ✅ Authentification JWT requise
- ✅ Company-level isolation (seules les données de sa company)
- ✅ Les utilisateurs non-Company ne peuvent pas accéder
- ✅ Soft delete protection (archived records exclus)

---

## 📝 Notes Importantes

### À Retenir

1. **Tous les interviews sont IA** - Pas d'entretiens humains dans ce modèle
2. **createdAt = date de fin** - L'entretien IA se termine immédiatement après création
3. **recruiterFeedback = review status** - null = pas reviewé, sinon = feedback du recruteur
4. **Tri par urgence** - Les plus anciens (> 72h) d'abord
5. **Soft delete safe** - Les interviews archivées sont exclues

### Workflows Recommandés

```
1. Dashboard refresh
   GET /kpi/unreviewed-48h (toutes les 5 min)
   → Afficher badge with count

2. UI List Display
   GET /kpi/unreviewed-48h/details?page=1&limit=20
   → Afficher avec tri par urgence

3. Batch Review
   Loop + PATCH /jobApplications/:id/recruiter-decision
   → Marquer comme reviewed
```

---

## 🚀 Prochaines Étapes

1. **Intégrer dans le Dashboard** - Widget KPI
2. **Ajouter notifications** - Alert pour urgent (> 72h)
3. **Bulk review** - Ability to mark multiple as reviewed
4. **Export CSV** - Exporter la liste pour reporting
5. **Comments** - Ajouter des notes lors du review

---

## 📞 Support

**Questions?**
- Consulter les exemples de code ci-dessus
- Vérifier les logs serveur pour debug
- Tester avec Postman d'abord

**Bug?**
- Vérifier le token JWT
- Vérifier que l'utilisateur est une Company
- Vérifier que des interviews existent dans la DB

---

**Dernière Mise à Jour:** 11 Mai 2026  
**Status:** ✅ Production Ready  
**Support:** Backend Team
