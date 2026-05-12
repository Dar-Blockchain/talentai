# 📊 API Summary - Visual Reference

```
╔════════════════════════════════════════════════════════════════════════════════╗
║                    JOB APPLICATION APIs - SUMMARY 2026                        ║
╚════════════════════════════════════════════════════════════════════════════════╝

┌─ LAYER 1: KPI ENDPOINTS ──────────────────────────────────────────────────────┐
│                                                                               │
│  1️⃣  GET /company/my/kpi/pending-shortlists                      [COUNT]     │
│      📊 Retourne: { pendingShortlistsCount: 12, threshold: 60 }              │
│      Query: ?postId=optional                                                 │
│                                                                               │
│  2️⃣  GET /company/my/kpi/pending-shortlists/details              [DETAILS]   │
│      📋 Retourne: { data: [...], pagination: {...}, threshold: 60 }          │
│      Query: ?page=1&limit=20&postId=optional                                 │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘

┌─ LAYER 2: RECRUITER DECISION ENDPOINTS ────────────────────────────────────────┐
│                                                                               │
│  3️⃣  PATCH /:applicationId/recruiter-decision                   [SHORTLIST]  │
│      Body: { decision: "shortlisted", rejectionReason: "..." }              │
│      📊 Retourne: Application mise à jour                                    │
│                                                                               │
│  4️⃣  PATCH /:applicationId/recruiter-decision                     [REJECT]   │
│      Body: { decision: "rejected", rejectionReason: "..." }                 │
│      📊 Retourne: Application mise à jour                                    │
│                                                                               │
│  5️⃣  GET /company/my/shortlisted                              [SHORTLISTED] │
│      📋 Retourne: { data: [...shortlisted...], pagination: {...} }           │
│      Query: ?page=1&limit=20&postId=optional                                 │
│                                                                               │
│  6️⃣  GET /company/my/rejected                                    [REJECTED]  │
│      📋 Retourne: { data: [...rejected...], pagination: {...} }              │
│      Query: ?page=1&limit=20&postId=optional                                 │
│                                                                               │
│  7️⃣  GET /company/my/by-decision                            [GENERIC QUERY] │
│      📋 Retourne: { data: [...], pagination: {...} }                         │
│      Query: ?decision=shortlisted&page=1&limit=20&postId=optional            │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘

┌─ WORKFLOW ────────────────────────────────────────────────────────────────────┐
│                                                                              │
│   START                                                                     │
│    │                                                                        │
│    ▼                                                                        │
│  ┌──────────────────────────┐                                              │
│  │  GET KPI Count (1)       │ ◄─ Afficher badge "12 en attente"           │
│  └──────────────────────────┘                                              │
│    │                                                                        │
│    ▼                                                                        │
│  ┌──────────────────────────┐                                              │
│  │  GET Details (2)         │ ◄─ Lister les candidats                      │
│  │  Page 1, 20 items        │                                              │
│  └──────────────────────────┘                                              │
│    │                                                                        │
│    ├─ Shortlist (3) ─────────────────────────────────────┐                │
│    │  PATCH /:id/recruiter-decision                      │                │
│    │  { decision: "shortlisted" }                        │                │
│    │  ├─ ✅ Success → Refresh list                       │                │
│    │  └─ ❌ Error → Show toast                          │                │
│    │                                                     │                │
│    └─ Reject (4) ──────────────────────────────────────┐                 │
│       PATCH /:id/recruiter-decision                   │                 │
│       { decision: "rejected", rejectionReason: "..." }│                 │
│       ├─ ✅ Success → Refresh list                    │                 │
│       └─ ❌ Error → Show toast                        │                 │
│                                                        │                 │
│    ▼                                                    │                 │
│  ┌──────────────────────────┐                         │                 │
│  │  GET Shortlisted (5)     │ ◄─ OR Get Rejected (6) ┘                 │
│  │  View results            │                                             │
│  └──────────────────────────┘                                             │
│    │                                                                       │
│    ▼                                                                       │
│   END                                                                      │
│                                                                            │
└───────────────────────────────────────────────────────────────────────────┘

┌─ REQUEST/RESPONSE FORMAT ─────────────────────────────────────────────────────┐
│                                                                              │
│  REQUEST HEADERS:                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │  Authorization: Bearer eyJhbGciOiJIUzI1NiIs...                    │  │
│  │  Content-Type: application/json (pour PATCH)                      │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  SUCCESS RESPONSE (200):                                                   │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │  {                                                                 │  │
│  │    "success": true,                                               │  │
│  │    "message": "...",                                              │  │
│  │    "data": { /* réponse */ },                                    │  │
│  │    "pagination": { /* si applicable */ }                         │  │
│  │  }                                                                 │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ERROR RESPONSE (4xx/5xx):                                                 │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │  {                                                                 │  │
│  │    "success": false,                                              │  │
│  │    "error": "Description de l'erreur"                            │  │
│  │  }                                                                 │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└───────────────────────────────────────────────────────────────────────────┘

┌─ DATA MODEL ──────────────────────────────────────────────────────────────────┐
│                                                                              │
│  Application {                                                             │
│    _id: ObjectId                                                           │
│    profile: {                                                              │
│      _id, firstName, lastName, email,                                     │
│      location, skills, yearsOfExperience                                  │
│    }                                                                        │
│    post: {                                                                 │
│      _id, jobDetails: { title, description }                              │
│    }                                                                        │
│    matchScore: number (0-100)  ← AI calculated                            │
│    recruiterDecision: null | "shortlisted" | "rejected"  ← Manual action  │
│    recruiterDecisionAt: Date                                              │
│    rejectionReason: string (optional)                                     │
│    appliedAt: Date                                                        │
│  }                                                                          │
│                                                                              │
└───────────────────────────────────────────────────────────────────────────┘

┌─ ERROR CODES ─────────────────────────────────────────────────────────────────┐
│                                                                              │
│  200  ✅ OK                         → Success                              │
│  400  ⚠️  Bad Request                → Invalid params or decision          │
│  401  🔐 Unauthorized                → Token manquant/expiré              │
│  403  🚫 Forbidden                   → Pas autorisé pour cette action     │
│  404  ❌ Not Found                   → Application/user non trouvé        │
│  500  💥 Server Error                → Erreur interne                      │
│                                                                              │
└───────────────────────────────────────────────────────────────────────────┘

┌─ INTEGRATION CHECKLIST ───────────────────────────────────────────────────────┐
│                                                                              │
│  □ Créer JobApplicationService classe                                       │
│  □ Implémenter les 6 méthodes API                                          │
│  □ Créer hooks React personnalisés                                         │
│  □ Implémenter la pagination                                               │
│  □ Ajouter les boutons Shortlist/Reject                                    │
│  □ Afficher les toasts de confirmation                                     │
│  □ Gérer les erreurs (400, 403, 404, 500)                                 │
│  □ Tester avec Postman collection                                          │
│  □ Rafraîchir la liste après action                                        │
│  □ Cacher/montrer loader pendant chargement                               │
│  □ Cacher les applications rejetées des "pending"                          │
│  □ Afficher le nombre exact de candidats en attente                        │
│  □ Implémenter les filtres par poste                                       │
│  □ Ajouter les commentaires sur les candidats                              │
│  □ Mettre en cache avec TTL court (60s)                                    │
│                                                                              │
└───────────────────────────────────────────────────────────────────────────┘

╔════════════════════════════════════════════════════════════════════════════════╗
║                       📚 DOCUMENTATION DISPONIBLE                             ║
╠════════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  1. API_JOB_APPLICATION_RECRUITER_DECISION.md  ← Doc complète et détaillée ║
║  2. QUICK_REFERENCE.md                         ← Cheat sheet pour devs     ║
║  3. REACT_IMPLEMENTATION_EXAMPLE.ts            ← Code TypeScript/React     ║
║  4. postman_collection_job_application.json    ← Tests prêts à l'emploi    ║
║  5. README_FRONTEND_INTEGRATION.md             ← Guide de démarrage        ║
║  6. THIS FILE - Visual Reference               ← Résumé visuel            ║
║                                                                              ║
╚════════════════════════════════════════════════════════════════════════════════╝
```

---

## 🎯 Cas d'usage courants

### Tableau de bord recruteur
```
Dashboard
├─ KPI Card: "12 candidats en attente de décision"  [GET KPI Count]
├─ Candidate List
│  ├─ Score badge
│  ├─ Shortlist button  [PATCH shortlist]
│  ├─ Reject button     [PATCH reject]
│  └─ Pagination
└─ Filter by post
```

### Vues filtrées
```
Tabs Navigation
├─ Pending (12)        [GET Details]
├─ Shortlisted (8)     [GET Shortlisted]
└─ Rejected (5)        [GET Rejected]
```

---

## ⚡ Performance Tips

| Optimization | Description | Benefit |
|--------------|-------------|---------|
| Cache KPI | TTL 60s | Réduit les requêtes |
| Virtual scrolling | Lazy load dans liste | Handle 1000+ items |
| Debounce actions | 300ms avant refresh | Évite les double-calls |
| Batch operations | Shortlist 5 à la fois | Faster decisions |
| Pagination | 20 items par page | Meilleur UX |

---

Generated: 11 May 2026 | Version: 1.0.0 | Status: ✅ Production Ready
