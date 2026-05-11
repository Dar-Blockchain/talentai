# 📦 Frontend Documentation Index

**Générée le:** 11 Mai 2026  
**Version API:** 1.0.0  
**Status:** ✅ Production Ready

---

## 📂 Documents Disponibles

### 🟢 Commencez ici

| Document | Type | Durée | Description |
|----------|------|-------|-------------|
| [README_FRONTEND_INTEGRATION.md](./README_FRONTEND_INTEGRATION.md) | 📖 Guide | 5 min | **START HERE** - Vue d'ensemble et quick start |
| [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) | ⚡ Cheat Sheet | 2 min | Référence rapide avec exemples de code |

### 🔵 Documentation Technique

| Document | Type | Durée | Description |
|----------|------|-------|-------------|
| [API_JOB_APPLICATION_RECRUITER_DECISION.md](./API_JOB_APPLICATION_RECRUITER_DECISION.md) | 📚 Complète | 20 min | Documentation exhaustive de tous les endpoints |
| [VISUAL_REFERENCE.md](./VISUAL_REFERENCE.md) | 📊 Visual | 5 min | Diagrammes ASCII, workflows, et formule de données |

### 💻 Code & Implémentation

| Document | Type | Langue | Description |
|----------|------|--------|-------------|
| [REACT_IMPLEMENTATION_EXAMPLE.ts](./REACT_IMPLEMENTATION_EXAMPLE.ts) | 💾 Code | TypeScript | Service class + React hooks + Composants exemples |

### 🧪 Tests & Postman

| Document | Type | Format | Description |
|----------|------|--------|-------------|
| [postman_collection_job_application.json](./postman_collection_job_application.json) | 📬 Collection | JSON | 6 requêtes prêtes à tester dans Postman |

---

## 🚀 Parcours de lecture recommandé

### Pour les **Product Managers** ⏱️ 5 minutes
1. Lire [README_FRONTEND_INTEGRATION.md](./README_FRONTEND_INTEGRATION.md) - section "Architecture"
2. Voir [VISUAL_REFERENCE.md](./VISUAL_REFERENCE.md) - section "Workflow"
3. ✅ Vous comprenez le flux

### Pour les **Frontend Developers** ⏱️ 30 minutes
1. Lire [README_FRONTEND_INTEGRATION.md](./README_FRONTEND_INTEGRATION.md) - complet
2. Étudier [REACT_IMPLEMENTATION_EXAMPLE.ts](./REACT_IMPLEMENTATION_EXAMPLE.ts) - code example
3. Consulter [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - pendant le développement
4. ✅ Vous êtes prêts à implémenter

### Pour les **QA/Testers** ⏱️ 15 minutes
1. Lire [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
2. Importer [postman_collection_job_application.json](./postman_collection_job_application.json)
3. Tester les 6 requêtes
4. ✅ Vous pouvez valider les APIs

### Pour les **Backend Developers** ⏱️ 10 minutes
1. Consulter [API_JOB_APPLICATION_RECRUITER_DECISION.md](./API_JOB_APPLICATION_RECRUITER_DECISION.md) - section "Response Format"
2. Vérifier les codes d'erreur
3. ✅ Vous comprenez ce qui a été implémenté

---

## 📊 Vue d'ensemble des APIs

### 7 Endpoints créés

```javascript
// 1. KPI - Compter les en attente
GET /job-applications/company/my/kpi/pending-shortlists

// 2. KPI - Détails des en attente
GET /job-applications/company/my/kpi/pending-shortlists/details

// 3. Decision - Shortlister
PATCH /job-applications/:applicationId/recruiter-decision
Body: { decision: "shortlisted" }

// 4. Decision - Rejeter
PATCH /job-applications/:applicationId/recruiter-decision
Body: { decision: "rejected" }

// 5. Consultation - Shortlistés
GET /job-applications/company/my/shortlisted

// 6. Consultation - Rejetés
GET /job-applications/company/my/rejected

// 7. Consultation - Par décision (générique)
GET /job-applications/company/my/by-decision?decision=shortlisted
```

---

## 🔑 Points clés à retenir

### ✅ À faire

- ✓ Utiliser le token JWT fourni par l'authentification
- ✓ Mettre en cache les résultats (TTL: 60s)
- ✓ Afficher un loader pendant le chargement
- ✓ Afficher un toast après chaque action
- ✓ Rafraîchir la liste après une décision
- ✓ Gérer les erreurs (400, 403, 404, 500)

### ❌ À éviter

- ✗ Ne pas oublier le header `Authorization`
- ✗ Ne pas faire plusieurs requêtes simultanées au même endpoint
- ✗ Ne pas afficher les rejetés dans "pending"
- ✗ Ne pas supposer que tous les users sont des companies

---

## 📋 Checklist d'intégration

### Phase 1: Setup (1 jour)
- [ ] Installer axios ou fetch wrapper
- [ ] Créer le service JobApplicationService
- [ ] Configurer l'authentification

### Phase 2: Implémentation (2 jours)
- [ ] Créer le composant KPI Card
- [ ] Implémenter la liste paginée
- [ ] Ajouter les boutons Shortlist/Reject
- [ ] Implémenter les hooks React personnalisés

### Phase 3: Polissage (1 jour)
- [ ] Ajouter les toasts de confirmation
- [ ] Implémenter la gestion des erreurs
- [ ] Ajouter les loaders/spinners
- [ ] Mettre en cache avec TTL

### Phase 4: QA (1 jour)
- [ ] Tester avec Postman collection
- [ ] Valider tous les cas d'erreur
- [ ] Tester la pagination
- [ ] Tester les filtres par poste

---

## 🧪 Quickstart avec Postman

1. **Télécharger** [postman_collection_job_application.json](./postman_collection_job_application.json)
2. **Importer** dans Postman (File → Import)
3. **Configurer** les variables:
   - `baseUrl`: `http://localhost:5000/api`
   - `token`: Votre JWT token
   - `applicationId`: Un ID de test
   - `postId`: Un ID de test (optionnel)
4. **Exécuter** les 6 requêtes dans l'ordre
5. **Observer** les réponses

---

## 🎯 Cas d'usage principaux

### Récruteur veut voir les candidats en attente
```
1. GET /kpi/pending-shortlists          → Afficher "12 en attente"
2. GET /kpi/pending-shortlists/details  → Afficher la liste paginée
```

### Récruteur veut shortlister un candidat
```
1. PATCH /:id/recruiter-decision        → Marquer shortlisté
2. GET /company/my/shortlisted          → Voir les shortlistés
```

### Récruteur veut voir les décisions prises
```
1. GET /company/my/shortlisted          → Voir les shortlistés
2. GET /company/my/rejected             → Voir les rejetés
```

---

## 🆘 Dépannage courant

### "Authorization failed (401)"
**Cause:** Token manquant ou expiré  
**Solution:** Vérifier que le token est valide et non expiré

### "You are not authorized (403)"
**Cause:** L'utilisateur n'est pas une company  
**Solution:** Utiliser un compte avec role "Company"

### "Application not found (404)"
**Cause:** L'ID n'existe pas ou n'appartient pas à votre company  
**Solution:** Vérifier l'ID de l'application

### "Decision must be 'shortlisted' or 'rejected' (400)"
**Cause:** Valeur de décision invalide  
**Solution:** Utiliser exactement "shortlisted" ou "rejected"

### Page blanche / Pas de données
**Cause:** Pas de candidats avec score >= 60  
**Solution:** C'est normal, attendre plus de candidatures

---

## 📞 Support

### Questions sur l'API?
→ Consulter [API_JOB_APPLICATION_RECRUITER_DECISION.md](./API_JOB_APPLICATION_RECRUITER_DECISION.md)

### Besoin d'exemples de code?
→ Consulter [REACT_IMPLEMENTATION_EXAMPLE.ts](./REACT_IMPLEMENTATION_EXAMPLE.ts)

### Besoin de tester rapidement?
→ Importer [postman_collection_job_application.json](./postman_collection_job_application.json)

### Besoin d'une vue d'ensemble?
→ Voir [VISUAL_REFERENCE.md](./VISUAL_REFERENCE.md)

---

## 📈 Roadmap (À venir)

- [ ] Bulk shortlist/reject (5+ candidats)
- [ ] Export CSV de candidats
- [ ] Notifications temps réel (WebSocket)
- [ ] Commentaires sur candidats
- [ ] Scoring détaillé par critère
- [ ] Historique des décisions
- [ ] Analytics tableau de bord

---

## 📊 Statistiques

| Métrique | Valeur |
|----------|--------|
| Endpoints créés | 7 |
| Documentation pages | 6 |
| Exemples de code | 3+ |
| Postman requêtes | 6 |
| Seuil shortlist | 60/100 |
| Temps d'implémentation estimé | 3-5 jours |

---

## 🎓 Formation recommandée

1. **Vidéo (10 min):** Tour guide des APIs
2. **Documentation (20 min):** Lire les guides
3. **Hands-on (30 min):** Tester avec Postman
4. **Développement (4 heures):** Implémenter le service
5. **QA (2 heures):** Tester en détail

---

## 📝 Version History

| Date | Version | Changes |
|------|---------|---------|
| 2026-05-11 | 1.0.0 | ✅ Initial release - 7 endpoints |

---

**Documentation Générée:** 11 Mai 2026  
**Statut:** ✅ Production Ready  
**Contact:** Backend Team

---

### 🚀 Prêt à commencer?

1. Commencez par [README_FRONTEND_INTEGRATION.md](./README_FRONTEND_INTEGRATION.md)
2. Téléchargez [postman_collection_job_application.json](./postman_collection_job_application.json)
3. Testez les APIs avec Postman
4. Implémentez le service TypeScript
5. Intégrez dans vos composants React

**Bonne chance! 💪**
