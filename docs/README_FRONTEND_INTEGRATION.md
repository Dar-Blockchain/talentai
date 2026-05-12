# 📋 Frontend Integration Guide - Job Application & Recruiter Decision APIs

**Date:** 11 Mai 2026  
**Statut:** ✅ Production Ready  
**Version API:** 1.0.0

---

## 📂 Documentation disponible

### 1. **[API_JOB_APPLICATION_RECRUITER_DECISION.md](./API_JOB_APPLICATION_RECRUITER_DECISION.md)** 📖
La documentation **complète et détaillée** - lisez ceci en premier!
- ✓ Vue d'ensemble
- ✓ Endpoints complets avec exemples
- ✓ Query parameters et response formats
- ✓ Codes d'erreur
- ✓ Flux de travail recommandé

### 2. **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** ⚡
Un "cheat sheet" rapide pour les développeurs
- ✓ 6 APIs essentielles
- ✓ Exemples de code JavaScript
- ✓ Modèle de données
- ✓ Checklist d'intégration

### 3. **[postman_collection_job_application.json](./postman_collection_job_application.json)** 📬
Collection Postman pour tester les APIs
- ✓ 6 requêtes prêtes à l'emploi
- ✓ Variables préconfigurées
- ✓ Headers d'authentification

---

## 🎯 Quick Start (5 minutes)

### Étape 1: Configurer Postman
```
1. Importer postman_collection_job_application.json
2. Remplir les variables:
   - baseUrl: http://localhost:5000/api
   - token: VOTRE_JWT_TOKEN
   - applicationId: UN_APPLICATION_ID
   - postId: UN_POST_ID (optionnel)
3. Tester les 6 endpoints
```

### Étape 2: Implémenter le service
Voir le [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) → section "Code Sample"

### Étape 3: Intégrer dans React
```javascript
import { useEffect, useState } from 'react';

const PendingShortlistsComponent = () => {
  const [pending, setPending] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPending = async () => {
      const response = await fetch(
        '/job-applications/company/my/kpi/pending-shortlists',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      setPending(data.data.pendingShortlistsCount);
      setLoading(false);
    };
    fetchPending();
  }, []);

  return (
    <div>
      {loading ? <Spinner /> : <h1>⏳ {pending} en attente</h1>}
    </div>
  );
};
```

---

## 📊 Architecture des APIs

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND TEAM                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. GET /kpi/pending-shortlists                    [COUNT]  │
│  2. GET /kpi/pending-shortlists/details      [DETAILS LIST] │
│  3. PATCH /:id/recruiter-decision            [SHORTLIST]    │
│  4. PATCH /:id/recruiter-decision              [REJECT]     │
│  5. GET /company/my/shortlisted              [SHORTLISTED]  │
│  6. GET /company/my/rejected                    [REJECTED]   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                   BACKEND SERVICES                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  jobApplicationService.getPendingShortlistsKPI              │
│  jobApplicationService.getPendingShortlistDetails            │
│  jobApplicationService.updateRecruiterDecision              │
│  jobApplicationService.getShortlistedCandidates             │
│  jobApplicationService.getRejectedCandidates                │
│  jobApplicationService.getCandidatesByDecision              │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                    MONGODB QUERIES                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Query: matchScore >= 60 AND recruiterDecision = null       │
│  Query: recruiterDecision = "shortlisted"                   │
│  Query: recruiterDecision = "rejected"                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔑 Points clés à retenir

### ✅ Succès (200 OK)
```json
{
  "success": true,
  "message": "Description du succès",
  "data": { /* réponse */ },
  "pagination": { /* si applicable */ }
}
```

### ❌ Erreur (4xx/5xx)
```json
{
  "success": false,
  "error": "Description de l'erreur"
}
```

### 🔐 Authentification
Tous les endpoints requièrent:
```
Authorization: Bearer <JWT_TOKEN>
```

### 📋 Paramètres courants
- `page` - Numéro de page (défaut: 1)
- `limit` - Items par page (défaut: 20)
- `postId` - Filter par poste (optionnel)

---

## 🏗️ Structure du projet

```
Frontend/
├── src/
│   ├── components/
│   │   ├── CandidateList.tsx          ← Afficher les candidats
│   │   ├── DecisionButtons.tsx         ← Shortlist/Reject
│   │   └── KPICard.tsx                 ← Afficher le KPI
│   ├── hooks/
│   │   └── useJobApplications.ts       ← Hook personnalisé
│   ├── services/
│   │   └── jobApplicationService.ts    ← Appels API
│   └── pages/
│       └── RecruitmentDashboard.tsx    ← Page principale
```

---

## 🧪 Tests

### Avec Postman
1. Importer la collection
2. Configurer les variables
3. Exécuter les requêtes dans l'ordre

### Avec curl
```bash
# KPI count
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/job-applications/company/my/kpi/pending-shortlists

# KPI details
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/job-applications/company/my/kpi/pending-shortlists/details

# Shortlist
curl -X PATCH \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"decision":"shortlisted"}' \
  http://localhost:5000/api/job-applications/APP_ID/recruiter-decision
```

---

## 📞 Problèmes courants

### "Authorization failed"
→ Vérifier que le token est valide et non expiré

### "Company ID is required"
→ Utiliser un compte avec role "Company"

### "Application not found"
→ Vérifier que l'applicationId existe et appartient à votre company

### "Decision must be 'shortlisted' or 'rejected'"
→ Vérifier la valeur du champ `decision`

---

## 📞 Support & Questions

Pour plus d'informations:
1. Lire la [documentation complète](./API_JOB_APPLICATION_RECRUITER_DECISION.md)
2. Consulter le [quick reference](./QUICK_REFERENCE.md)
3. Tester avec la [collection Postman](./postman_collection_job_application.json)
4. Vérifier les logs du serveur: `Backend/logs/`

---

## 📅 Roadmap (à venir)

- [ ] Bulk actions (shortlist/reject multiples)
- [ ] Export candidates (CSV/Excel)
- [ ] Notifications en temps réel (WebSocket)
- [ ] Commentaires sur candidats
- [ ] Scoring détaillé par critère

---

**Bonne intégration! 🚀**

Pour toute question, contacter l'équipe backend.
