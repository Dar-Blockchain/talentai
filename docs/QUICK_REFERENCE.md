# 🚀 Quick Reference - Job Application APIs

## 📌 Configuration
```javascript
const API_BASE = 'http://localhost:5000/api';
const TOKEN = 'your_jwt_token_here';
```

## 🎯 6 API Essentielles

### 1️⃣ Compter les en attente
```bash
GET /job-applications/company/my/kpi/pending-shortlists
# Retourne: { pendingShortlistsCount: 12, threshold: 60 }
```

### 2️⃣ Lister les en attente (avec détails)
```bash
GET /job-applications/company/my/kpi/pending-shortlists/details?page=1&limit=20
# Retourne: { data: [...], pagination: {...} }
```

### 3️⃣ Shortlister un candidat
```bash
PATCH /job-applications/{applicationId}/recruiter-decision
Body: { decision: "shortlisted", rejectionReason: "..." }
```

### 4️⃣ Rejeter un candidat
```bash
PATCH /job-applications/{applicationId}/recruiter-decision
Body: { decision: "rejected", rejectionReason: "Expérience insuffisante" }
```

### 5️⃣ Lister les shortlistés
```bash
GET /job-applications/company/my/shortlisted?page=1&limit=20
# Retourne: { data: [...], pagination: {...} }
```

### 6️⃣ Lister les rejetés
```bash
GET /job-applications/company/my/rejected?page=1&limit=20
# Retourne: { data: [...], pagination: {...} }
```

---

## 💻 Code Sample (JavaScript)

```javascript
// Service wrapper
class JobApplicationService {
  constructor(token) {
    this.token = token;
    this.baseUrl = 'http://localhost:5000/api';
  }

  async getPendingCount() {
    return fetch(`${this.baseUrl}/job-applications/company/my/kpi/pending-shortlists`, {
      headers: { Authorization: `Bearer ${this.token}` }
    }).then(r => r.json());
  }

  async getPendingDetails(page = 1, limit = 20) {
    return fetch(
      `${this.baseUrl}/job-applications/company/my/kpi/pending-shortlists/details?page=${page}&limit=${limit}`,
      { headers: { Authorization: `Bearer ${this.token}` } }
    ).then(r => r.json());
  }

  async shortlist(applicationId, reason = '') {
    return fetch(`${this.baseUrl}/job-applications/${applicationId}/recruiter-decision`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ decision: 'shortlisted', rejectionReason: reason })
    }).then(r => r.json());
  }

  async reject(applicationId, reason = '') {
    return fetch(`${this.baseUrl}/job-applications/${applicationId}/recruiter-decision`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ decision: 'rejected', rejectionReason: reason })
    }).then(r => r.json());
  }

  async getShortlisted(page = 1, limit = 20) {
    return fetch(
      `${this.baseUrl}/job-applications/company/my/shortlisted?page=${page}&limit=${limit}`,
      { headers: { Authorization: `Bearer ${this.token}` } }
    ).then(r => r.json());
  }

  async getRejected(page = 1, limit = 20) {
    return fetch(
      `${this.baseUrl}/job-applications/company/my/rejected?page=${page}&limit=${limit}`,
      { headers: { Authorization: `Bearer ${this.token}` } }
    ).then(r => r.json());
  }
}

// Utilisation
const service = new JobApplicationService(token);
const pending = await service.getPendingCount();
console.log(`${pending.data.pendingShortlistsCount} candidats en attente`);
```

---

## 📊 Modèle de données

```javascript
// Application
{
  _id: "app_id",
  profile: {
    _id: "profile_id",
    firstName: "Jean",
    lastName: "Dupont",
    email: "jean@email.com",
    skills: [{ name: "React", level: "Expert" }]
  },
  post: { _id: "post_id", jobDetails: { title: "Dev Senior" } },
  matchScore: 87,
  recruiterDecision: "shortlisted" | "rejected" | null,
  recruiterDecisionAt: "2026-05-11T10:45:30Z",
  appliedAt: "2026-05-10T14:30:00Z",
  rejectionReason: "Optional reason if rejected"
}
```

---

## ⚡ Checklist d'intégration

- [ ] Configurer `baseUrl` et `token`
- [ ] Afficher le KPI au chargement
- [ ] Implémenter la pagination
- [ ] Ajouter boutons Shortlist/Reject
- [ ] Afficher confirmations/toasts
- [ ] Rafraîchir la liste après action
- [ ] Gérer les erreurs (400, 403, 404, 500)
- [ ] Tester avec Postman collection

---

## 🔴 Erreurs courantes

| Erreur | Cause | Solution |
|--------|-------|----------|
| 401 | Token manquant/expiré | Vérifier l'authentification |
| 403 | Pas autorisé | Utiliser un compte Company |
| 404 | Application non trouvée | Vérifier l'ID |
| 400 | Decision invalide | Utiliser "shortlisted" ou "rejected" |

---

## 📚 Ressources

- 📖 [Documentation complète](./API_JOB_APPLICATION_RECRUITER_DECISION.md)
- 📬 [Collection Postman](./postman_collection_job_application.json)
- 🎯 [Backend Source](../Backend/controllers/jobApplication.controller.js)
