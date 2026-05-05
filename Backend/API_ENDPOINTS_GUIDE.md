# API Endpoints Inventory - TalentAI Backend

**Généré le:** 5 mai 2026  
**Objectif:** Vérifier quelles APIs sont utilisées et lesquelles ne le sont pas

---

## 📊 Statistiques Globales

- **Total d'endpoints:** 156
- **Total de modules:** 33
- **Endpoints publics:** 15
- **Endpoints protégés:** 141
- **Types d'authentification:** JWT Token, API Key

---

## 🔐 Authentification

### Types d'authentification requis:
- **public** - Pas d'authentification
- **required** - Authentification JWT obligatoire
- **optional** - Authentification recommandée mais facultative

### Rôles:
- Candidate
- Company
- Employee
- Admin

---

## 📝 Endpoints par Module

### 1. 🔑 Authentication (`/auth`)

| Method | Endpoint | Description | Auth | Notes |
|--------|----------|-------------|------|-------|
| POST | `/auth/register` | Créer nouveau compte utilisateur | public | OTP envoyé, CV analysé pour candidats |
| POST | `/auth/login` | Connecter avec email | public | OTP envoyé |
| POST | `/auth/verify-otp` | Vérifier code OTP | public | - |
| POST | `/auth/resend-otp` | Renvoyer OTP (valide 5 min) | public | - |
| POST | `/auth/analyze` | Analyser CV via Bedrock | public | - |
| GET | `/auth/warnUser` | Notifier utilisateur connecté | required | - |
| POST | `/auth/logout` | Déconnecter | required | - |
| GET | `/auth/check-role?email=...` | Récupérer rôle utilisateur | public | - |

---

### 2. 👤 Profile (`/profiles`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/profiles/me` | Profil de l'utilisateur actuel | required |
| POST | `/profiles/createOrUpdateProfile` | Créer/modifier profil | required |
| PUT | `/profiles/updateProfileVisibility` | Changer visibilité du profil | required |
| PUT | `/profiles/:userId` | Mise à jour complète du profil | required |
| POST | `/profiles/createOrUpdateCompanyProfile` | Créer/modifier profil entreprise | required |
| GET | `/profiles/search/skills` | Chercher par compétences | required |
| POST | `/profiles/addSoftSkills` | Ajouter soft skills | required |
| GET | `/profiles/getSoftSkills` | Récupérer soft skills | required |
| GET | `/profiles/getSoftSkillsById/:userId` | Soft skills d'un utilisateur | required |
| DELETE | `/profiles/deleteHardSkill` | Supprimer hard skill | required |
| DELETE | `/profiles/deleteSoftSkills` | Supprimer soft skill | required |
| GET | `/profiles/getCompanyWithAssessments` | Entreprise avec assessments | required |
| GET | `/profiles/:profileId/payments` | Tous les paiements du profil | required |
| GET | `/profiles/:profileId/payments/active` | Paiement actif du profil | required |
| POST | `/profiles/:profileId/payments/add` | Ajouter paiement au profil | required |
| PUT | `/profiles/updateFinalBid` | Mise à jour enchère finale | optional |
| GET | `/profiles/:userId` | Profil public par ID | public |

---

### 3. 📋 Posts (Job Offers) (`/post`)

| Method | Endpoint | Description | Auth | Scope |
|--------|----------|-------------|------|-------|
| GET | `/post/search` | Tous les posts avec recherche | public | - |
| GET | `/post/details/:id` | Détails du post | public | - |
| GET | `/post/public-stats` | Stats publiques | public | - |
| POST | `/post/save-post` | Créer nouveau post | required | write:posts |
| GET | `/post/get-all-posts` | Tous les posts | required | read:posts |
| GET | `/post/my-posts` | Posts de l'utilisateur | required | read:posts |
| GET | `/post/metrics` | Métriques des posts | required | - |
| GET | `/post/getPostById/:id` | Détails du post | required | read:posts |
| PUT | `/post/updatePost/:id` | Mettre à jour post | required | write:posts |
| PATCH | `/post/updatePostStatus/:id` | Changer statut du post | required | write:posts |
| DELETE | `/post/deletePost/:id` | Supprimer post | required | delete:posts |
| POST | `/post/generate-job-post` | Générer post avec IA | required | - |

---

### 4. 💼 Job Applications (`/job-applications`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/job-applications/post/:postId` | Applications pour un post | public |
| POST | `/job-applications` | Créer nouvelle candidature | required |
| GET | `/job-applications` | Toutes les candidatures | required |
| GET | `/job-applications/candidate/my` | Mes candidatures (candidat) | required |
| GET | `/job-applications/candidate/my/stats` | Stats du candidat | required |
| GET | `/job-applications/company/my` | Candidatures de mon entreprise | required |
| POST | `/job-applications/contact-candidate` | Email direct au candidat | required |
| GET | `/job-applications/post/:postId/summary` | Résumé des candidatures | required |
| GET | `/job-applications/company/my/summary` | Résumé pour l'entreprise | required |
| GET | `/job-applications/company/my/metrics` | Métriques des candidatures | required |
| GET | `/job-applications/company/my/cvs/download` | Télécharger CVs en ZIP | required |
| POST | `/job-applications/auto-invite/trigger` | Déclencher auto-invitation | required |
| POST | `/job-applications/reminder/trigger` | Déclencher rappel | required |
| GET | `/job-applications/:applicationId` | Candidature par ID | required |
| PATCH | `/job-applications/:applicationId` | Mettre à jour candidature | required |
| POST | `/job-applications/:applicationId/withdraw` | Retirer candidature | required |
| POST | `/job-applications/:applicationId/archive` | Archiver candidature | required |
| POST | `/job-applications/:applicationId/invite-to-interview` | Invitation à l'entretien | required |

---

### 5. 📊 Skill Interview Assessments (`/skill-interview-assessments`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/skill-interview-assessments` | Créer assessment | required |
| GET | `/skill-interview-assessments/my` | Mes assessments | required |
| GET | `/skill-interview-assessments/:id` | Assessment par ID | required |
| GET | `/skill-interview-assessments` | Tous les assessments | required |

---

### 6. 🎯 Post Interview Assessments (`/post-interview-assessments`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/post-interview-assessments/post/:postId` | Assessments pour un post | public |
| GET | `/post-interview-assessments/post/:postId/candidate/:candidateUserId` | Assessment candidat/post | public |
| GET | `/post-interview-assessments/check/:postId` | Vérifier si candidat a assessment | required |
| GET | `/post-interview-assessments/matching/:postId` | Détails de correspondance | required |
| GET | `/post-interview-assessments` | Tous les assessments | required |
| GET | `/post-interview-assessments/company/mine` | Assessments de mon entreprise | required |
| GET | `/post-interview-assessments/company/mine/metrics` | Métriques des entretiens | required |
| GET | `/post-interview-assessments/candidate/my` | Mes assessments (candidat) | required |
| POST | `/post-interview-assessments` | Créer assessment | required |
| GET | `/post-interview-assessments/:assessmentId` | Assessment par ID | required |

---

### 7. 💬 Chat (`/chat`)

**23 endpoints** - Conversations et messages
- Gestion des conversations (create, read, archive, block, delete)
- Gestion des messages (send, read, delete, search)
- Réactions aux messages

---

### 8. 👥 Candidate Progress (`/candidate-progress`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/candidate-progress/getUserProgress` | Progression de l'utilisateur | required |
| POST | `/candidate-progress` | Créer progression | required |
| GET | `/candidate-progress` | Toutes les progressions | required |
| GET | `/candidate-progress/:id` | Progression par ID | required |
| PUT | `/candidate-progress/:id` | Mettre à jour progression | required |
| DELETE | `/candidate-progress/:id` | Supprimer progression | required |
| GET | `/candidate-progress/candidate/:candidateId` | Progression par candidat | required |
| GET | `/candidate-progress/post/:postId` | Progression par post | required |
| GET | `/candidate-progress/status/:status` | Progression par statut | required |

---

### 9. 🎬 Pipeline Interview (`/api/pipeline-interview`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/pipeline-interview/params/:jobId/:stepNumber` | Paramètres entretien | optional |
| GET | `/api/pipeline-interview/steps/:jobId` | Étapes d'entretien | optional |
| POST | `/api/pipeline-interview/progress/initialize` | Initialiser progression | optional |
| GET | `/api/pipeline-interview/progress/:candidateId/:jobId` | Progression candidat | optional |
| PUT | `/api/pipeline-interview/progress/update-step` | Mettre à jour étape | optional |
| POST | `/api/pipeline-interview/progress/next-step` | Passer à l'étape suivante | optional |

---

### 10. 📬 Post Steps (`/post-steps`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/post-steps/post/:postId/steps` | Ajouter étapes au post | required |
| PUT | `/post-steps/node/:nodeId/submit-task` | Soumettre tâche GitHub | required |

---

### 11. 🏢 Company Invitations (`/company-invitations`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/company-invitations/details/:invitationId` | Détails invitation | public |
| POST | `/company-invitations/respondInvitation/:invitationId` | Répondre invitation | public |
| POST | `/company-invitations/sentInvitation` | Envoyer invitation | required |
| POST | `/company-invitations/resendInvitation/:invitationId` | Renvoyer invitation | required |
| DELETE | `/company-invitations/deleteInvitation/:invitationId` | Supprimer invitation | required |
| GET | `/company-invitations/myInvitations` | Mes invitations | required |

---

### 12. 👨‍💼 Company Memberships (`/company-memberships`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/company-memberships/memberships/stats` | Stats adhésions | required |
| GET | `/company-memberships/memberships` | Adhésions entreprise | required |
| GET | `/company-memberships/user/:userId` | Adhésion par utilisateur | required |
| DELETE | `/company-memberships/:membershipId` | Supprimer adhésion | required |
| PATCH | `/company-memberships/:membershipId` | Mettre à jour adhésion | required |
| PATCH | `/company-memberships/:membershipId/role` | Mettre à jour rôle | required |
| PATCH | `/company-memberships/:membershipId/department` | Mettre à jour département | required |

---

### 13. 📈 Dashboard (`/dashboard`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/dashboard/getAllUsers` | Tous les utilisateurs | required |
| GET | `/dashboard/getCounts` | Compteurs globaux | required |
| GET | `/dashboard/statsCards` | Statistiques cartes | required |
| GET | `/dashboard/richStats` | Statistiques détaillées | required |
| GET | `/dashboard/getUserCountsByDay` | Évolution quotidienne utilisateurs | required |
| GET | `/dashboard/getUserCountsByLocation` | Statistiques par localisation | required |
| GET | `/dashboard/job-assessment-results-grouped` | Résultats assessments groupés | required |
| POST | `/dashboard/getJobAssessmentsBySkill` | Assessments par compétence | required |
| GET | `/dashboard/downloadUserExcel` | Export Excel utilisateurs | required |
| GET | `/dashboard/download-users-with-assessment-zero` | Export sans assessment | required |
| GET | `/dashboard/download-users-with-assessment-Above50` | Export score > 50 | required |

---

### 14. 📑 Plan Limits (`/plan-limits`)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/plan-limits` | Créer plan | required | Admin |
| GET | `/plan-limits` | Tous les plans | public | - |
| GET | `/plan-limits/:id` | Plan par ID | public | - |
| PUT | `/plan-limits` | Mettre à jour plan | required | Admin |

---

### 15. 💳 Subscriptions (`/subscriptions`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/subscriptions/active` | Abonnement actif | required |
| GET | `/subscriptions/combined` | Détails combinés actifs | required |
| GET | `/subscriptions` | Abonnements entreprise | required |
| GET | `/subscriptions/:subscriptionId/details` | Détails abonnement | required |
| GET | `/subscriptions/:companyProfileId/check-limit/:limitType` | Vérifier limite | required |

---

### 16. 🧪 CV Analysis (`/cv-analysis`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/cv-analysis` | Créer analyse CV | optional |
| GET | `/cv-analysis` | Toutes les analyses | optional |
| GET | `/cv-analysis/stats` | Statistiques | optional |
| GET | `/cv-analysis/search` | Chercher analyses | optional |
| GET | `/cv-analysis/:id` | Analyse par ID | optional |
| PUT | `/cv-analysis/:id` | Mettre à jour analyse | optional |
| DELETE | `/cv-analysis/:id` | Supprimer analyse | optional |
| GET | `/cv-analysis/user/:userId` | Analyses utilisateur | optional |
| GET | `/cv-analysis/company/:companyId` | Analyses entreprise | optional |
| GET | `/cv-analysis/seniority/:seniority` | Analyses par séniorité | optional |

---

### 17. 🏭 Departments (`/departments`)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/departments` | Créer département | required | Company/Employee |
| GET | `/departments` | Départements entreprise | required | - |
| GET | `/departments/stats` | Statistiques | required | - |
| GET | `/departments/:id` | Département par ID | required | - |
| PUT | `/departments/:id` | Mettre à jour département | required | - |
| DELETE | `/departments/:id` | Supprimer département | required | - |

---

### 18. ✉️ Contact (`/contact`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/contact` | Soumettre formulaire | public |
| POST | `/contact/enterprise` | Demande entreprise | public |
| GET | `/contact/status` | Statut du service | required |

---

### 19. 🔑 API Keys (`/api/api-keys`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/api-keys` | Créer clé API | required |
| GET | `/api/api-keys` | Lister clés API | required |
| GET | `/api/api-keys/:id` | Détails clé API | required |
| PUT | `/api/api-keys/:id` | Mettre à jour clé | required |
| PATCH | `/api/api-keys/:id/toggle` | Activer/Désactiver clé | required |
| POST | `/api/api-keys/:id/regenerate` | Régénérer clé | required |
| DELETE | `/api/api-keys/:id` | Supprimer clé | required |

---

### 20. 👥 Campaign Participants (`/campaign-participants`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/campaign-participants/:campaignId/participants` | Ajouter participant | required |
| GET | `/campaign-participants/:campaignId/participants` | Participants campagne | required |
| GET | `/campaign-participants/:participantId` | Participant par ID | required |
| GET | `/campaign-participants/token/:token` | Participant par token | public |
| PUT | `/campaign-participants/:participantId` | Mettre à jour participant | required |
| DELETE | `/campaign-participants/:participantId` | Supprimer participant | required |
| PATCH | `/campaign-participants/:participantId/drop` | Marquer comme abandonné | required |

---

### 21. 📋 Todo (`/todo`)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/todo/profile` | Générer liste TODO | required | Candidate |
| GET | `/todo/profile` | Récupérer liste TODO | required | Candidate |

---

### 22. 💬 Feedback (`/feedback`)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/feedback/addFeedback` | Ajouter feedback | required | Any |
| GET | `/feedback/getAllFeedback` | Tous les feedbacks | required | Admin |

---

### 23. 📋 Tasks (`/task`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/task/send-task` | Envoyer test technique | required |
| GET | `/task/test-email` | Tester configuration email | required |

---

### 24. 💳 Stripe (`/stripe`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/stripe/create-checkout-session` | Créer session paiement | required |

---

### 25. ⚙️ Backup (`/admin/backups`)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/admin/backups/perform` | Déclencher backup | required | Admin |
| GET | `/admin/backups/list` | Lister backups | required | Admin |
| POST | `/admin/backups/restore/:backupName` | Restaurer backup | required | Admin |
| DELETE | `/admin/backups/delete/:backupName` | Supprimer backup | required | Admin |
| GET | `/admin/backups/info` | Info service backup | required | Admin |

---

### 26. 🛡️ Permissions (`/permissions`)

**Admin:** `/admin/companies/:companyId/permissions`
**Employee:** `/employee-permissions/:userId`

---

### 27. 📜 Logs (`/logs`)

Gestion des logs système - Voir `log.routes.js`

---

### 28. 🎪 Internal Campaigns (`/internal-campaigns`)

Gestion des campagnes internes - Voir `internalCampaign.routes.js`

---

### 29. 💰 Payments (`/payments`)

Gestion des paiements - Voir `payment.routes.js`

---

### 30. 📢 Notifications (`/notification-system`)

Système de notifications - Voir `notificationSystem.routes.js`

---

## 🎯 Guide pour Frontend

### Comment vérifier l'utilisation ?

1. **Rechercher dans votre code frontend:**
   - Utilisez `Ctrl+F` pour chercher les endpoints (ex: `/auth/register`)
   - Cherchez les URLs avec fetch/axios/http requests

2. **Créer un rapport:**
   - Pour chaque endpoint de ce fichier, notez si vous l'utilisez
   - Marquez les endpoints non utilisés pour optimisation

3. **Optimisation:**
   - Supprimez les endpoints inutilisés du frontend
   - Réduisez les appels API redondants
   - Consolidez les endpoints similaires

---

## 📊 Statistiques par Type d'Authentification

- **Public (15):** Register, Login, OTP, Profile Public, Post Search, etc.
- **Required (141):** Toutes les autres opérations (CRUD, gestion, analytics)
- **Optional (few):** CV Analysis, Pipeline Interview (pour certains cas)

---

## 🚨 Points Importants

- ⚠️ **Backup Restore** : Écrase la base de données actuelle
- 🔒 **API Keys** : Nécessaire pour l'intégration tierce
- 📅 **Plan Limits** : Gère les quotas par plan
- 💳 **Subscriptions** : Suit l'utilisation du plan
- 🎯 **Job Applications** : Possède une logique de scoring

---

**Dernière mise à jour:** 5 mai 2026
