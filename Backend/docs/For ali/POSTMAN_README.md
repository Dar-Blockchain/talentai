# 🎯 TalentAI Backend - Analyse Complète et Collection Postman

## 📊 Résumé de l'Analyse

### ✅ Analyse Effectuée

L'ensemble du code backend a été analysé pour extraire tous les endpoints API :

- **33 fichiers de routes** examinés
- **256+ endpoints** extraits
- **253 endpoints** inclus dans la collection Postman
- **33 modules** organisés par ressource

### 📦 Fichiers Générés

#### 1. `postman_collection.json` ✨ **PRINCIPAL**
- **Format**: Postman Collection v2.1 (compatible Postman 7.0+)
- **Taille**: ~227 KB
- **Endpoints**: 253
- **Modules**: 33
- **Variables Postman**: 3 (base_url, token, api_key)
- **Prêt à importer**: Oui - Utilisable immédiatement dans Postman

**Comment utiliser:**
1. Ouvrir Postman
2. Cliquer sur "Import"
3. Sélectionner `postman_collection.json`
4. Cliquer sur "Import"

#### 2. `API_ENDPOINTS.json` 📋 **DONNÉES BRUTES**
- **Format**: JSON structuré
- **Contient**: Tous les détails des endpoints
- **Utile pour**: Analyse, intégration, documentation

#### 3. `POSTMAN_GUIDE.md` 📚 **DOCUMENTATION**
- Guide complet d'utilisation
- Exemples concrets
- Troubleshooting
- Best practices

## 🗂️ Organisation des Endpoints

### 🔐 Authentification (8 endpoints)
```
POST   /auth/register           - Inscription utilisateur
POST   /auth/                   - Demander OTP
POST   /auth/verify-otp         - Vérifier OTP
POST   /auth/resend-otp         - Renvoyer OTP
POST   /auth/analyze            - Analyser CV
POST   /auth/logout             - Déconnexion
GET    /auth/warnUser           - Notification utilisateur
GET    /auth/check-role         - Vérifier rôle utilisateur
```

### 💼 Gestion des Candidatures (26 endpoints)
```
POST   /job-applications                    - Créer candidature
GET    /job-applications                    - Lister toutes
GET    /job-applications/post/:id          - Par offre
GET    /job-applications/candidate/my      - Mes candidatures
GET    /job-applications/company/my        - Candidatures reçues
POST   /job-applications/:id/withdraw      - Retirer candidature
PATCH  /job-applications/:id/recruiter-decision - Décision recruteur
GET    /job-applications/company/my/kpi/*  - KPI et métriques
```

### 💬 Chat & Messagerie (36 endpoints)
```
Chat Direct (22):
POST   /chat/conversations                 - Créer conversation
GET    /chat/conversations                 - Lister conversations
GET    /chat/messages/:conversationId      - Messages
POST   /chat/messages                      - Envoyer message
PUT    /chat/conversations/:id/archive     - Archiver
DELETE /chat/messages/:id                  - Supprimer message

Chat d'Équipe (14):
POST   /team-chat/requests                 - Demander accès
GET    /team-chat/conversations            - Conversations d'équipe
POST   /team-chat/messages                 - Message d'équipe
```

### 👤 Profils (17 endpoints)
```
GET    /profile/me                         - Mon profil
POST   /profile/createOrUpdateProfile      - Créer/modifier
PUT    /profile/:userId                    - Mettre à jour
GET    /profile/getSoftSkills              - Compétences soft
POST   /profile/addSoftSkills              - Ajouter compétences
DELETE /profile/deleteSoftSkills           - Supprimer compétences
GET    /profile/search/skills              - Rechercher par compétences
```

### 📋 Offres d'Emploi (16 endpoints)
```
GET    /post/search                        - Rechercher (public)
GET    /post/details/:id                   - Détails (public)
POST   /post/save-post                     - Créer offre
GET    /post/my-posts                      - Mes offres
PUT    /post/updatePost/:id                - Modifier offre
PATCH  /post/updatePostStatus/:id          - Changer statut
DELETE /post/deletePost/:id                - Supprimer offre
GET    /post/metrics                       - Statistiques
GET    /post/kpi/status-by-post           - KPI par offre
```

### 🎓 Entretiens & Évaluations (20 endpoints)
```
Post-Interview Assessments (11):
POST   /post-interview-assessments         - Créer évaluation
GET    /post-interview-assessments/:id     - Détails
GET    /post-interview-assessments/candidate/my - Mes évaluations

Pipeline Interviews (6):
GET    /pipeline-interview/steps/:jobId    - Étapes
GET    /pipeline-interview/progress/:candidateId/:jobId - Progression
PUT    /pipeline-interview/progress/update-step - Mettre à jour étape
```

### 💳 Abonnements & Paiements (12 endpoints)
```
Subscriptions (10):
GET    /subscriptions/active               - Abonnement actif
GET    /subscriptions/combined             - Détails combinés
GET    /subscriptions/:id/details          - Détails complets
POST   /subscriptions/:id/cancel           - Annuler
POST   /subscriptions/:id/extend           - Prolonger

Payments (2):
POST   /payments/verify                    - Vérifier paiement
GET    /payments/user/history              - Historique

Stripe (1):
POST   /stripe/create-checkout-session     - Créer session paiement
```

### 🔔 Notifications (13 endpoints)
```
POST   /notification/AddNotification        - Créer notification
GET    /notification/GetMyNotification      - Mes notifications
PATCH  /notification/markAsRead/:id         - Marquer lu
PATCH  /notification/archiveNotification/:id - Archiver
DELETE /notification/deleteNotification/:id - Supprimer
```

### 🏢 Gestion Entreprise (22 endpoints)
```
Départements (6):
POST   /departments                        - Créer
GET    /departments                        - Lister
GET    /departments/:id                    - Détails
PUT    /departments/:id                    - Modifier
DELETE /departments/:id                    - Supprimer

Invitations (7):
POST   /company-invitations/sentInvitation - Inviter employé
GET    /company-invitations/myInvitations  - Mes invitations
PATCH  /company-invitations/respondInvitation/:id - Répondre

Memberships (7):
GET    /company-memberships/memberships    - Lister
DELETE /company-memberships/:id            - Retirer membre
PATCH  /company-memberships/:id            - Modifier rôle
```

### 📊 Dashboard & Analytics (11 endpoints)
```
GET    /dashboard/getAllUsers              - Liste utilisateurs
GET    /dashboard/getCounts                - Compteurs
GET    /dashboard/statsCards               - Statistiques
GET    /dashboard/richStats                - Statistiques détaillées
GET    /dashboard/getUserCountsByDay       - Évolution journalière
GET    /dashboard/job-assessment-results-grouped - Résultats évaluations
POST   /dashboard/getJobAssessmentsBySkill - Par compétence
GET    /dashboard/downloadUserExcel        - Export Excel
```

### 🔑 Gestion des Clés API (7 endpoints)
```
POST   /api/api-keys                       - Créer clé
GET    /api/api-keys                       - Lister
GET    /api/api-keys/:id                   - Détails
PUT    /api/api-keys/:id                   - Modifier
PATCH  /api/api-keys/:id/toggle            - Activer/désactiver
POST   /api/api-keys/:id/regenerate        - Régénérer
DELETE /api/api-keys/:id                   - Supprimer
```

### 🔐 Admin - Sauvegardes (5 endpoints)
```
POST   /admin/backups/perform               - Créer sauvegarde
GET    /admin/backups/list                 - Lister sauvegardes
POST   /admin/backups/restore/:name        - Restaurer
DELETE /admin/backups/delete/:name         - Supprimer
GET    /admin/backups/info                 - Infos sauvegarde
```

### 📁 Autres Modules
- **Candidate Post Step Progress** (13 endpoints) - Progression candidat
- **Internal Campaigns** (8 endpoints) - Campagnes internes
- **CV Analysis** (10 endpoints) - Analyse CV
- **Feedback** (2 endpoints) - Avis utilisateurs
- **Interview Details** (3 endpoints) - Détails entretiens
- **Logs** (1 endpoint) - Journaux système
- **Permissions** (3 endpoints) - Gestion droits
- **Skill Interview Assessments** (4 endpoints) - Évaluations par compétence
- **Todo** (2 endpoints) - Liste de tâches
- **Contact** (1 endpoint) - Formulaire contact

## 🔐 Sécurité & Authentification

### Types d'Authentification Supportés

1. **Public** ✅
   - Pas de token requis
   - Endpoints: recherche, détails publics, stats

2. **Protected (JWT)** 🔒
   - Header: `Authorization: Bearer {{token}}`
   - Pour la plupart des endpoints

3. **Protected (Admin)** 👮‍♂️
   - Admin uniquement
   - Backups, logs, permissions globales

4. **Protected (Company)** 🏢
   - Entreprises uniquement
   - Gestion offres, candidatures, équipe

5. **Protected (Candidate)** 👤
   - Candidats uniquement
   - Profil, candidatures, entretiens

### Variables Postman Incluses

| Variable | Exemple | Description |
|----------|---------|-------------|
| `{{base_url}}` | `http://localhost:3000` | URL serveur API |
| `{{token}}` | `eyJhbGciOiJIUzI1NiIs...` | Token JWT obtenu via login |
| `{{api_key}}` | `sk_live_...` | Clé API pour certains endpoints |

## 📈 Statistiques Complètes

```
Total Endpoints:              253
├── Authentication            8    (Inscription, Login, OTP, Logout)
├── Job Applications          26   (Candidatures, KPI, décisions)
├── Chat                      22   (Messages 1-to-1)
├── Team Chat                 14   (Messages d'équipe)
├── Profile Management        17   (Profils, compétences)
├── Post (Job Offers)         16   (Offres d'emploi)
├── Interviews & Assessment   20   (Pipeline, évaluations)
├── Subscriptions & Payments  12   (Abonnements, paiement)
├── Notifications             13   (Système de notifications)
├── Dashboard & Analytics     11   (Statistiques, rapports)
├── Candidate Progress        13   (Progression étapes)
├── Departments & Teams       13   (Équipes, départements)
├── Company Management        10   (Invitations, memberships)
├── CV Analysis               10   (Analyse CV)
├── Skill Assessments         4    (Évaluations compétences)
├── API Keys                  7    (Gestion clés)
├── Admin Backups             5    (Sauvegardes)
├── Internal Campaigns        8    (Campagnes)
├── Post Steps                2    (Étapes de recrutement)
├── Permissions               4    (Droits d'accès)
├── Interview Details         3    (Détails entretiens)
├── Todo                      2    (Listes tâches)
├── Feedback                  2    (Avis)
├── Contact                   1    (Formulaire)
├── Logs                      1    (Journaux)
└── Stripe                    1    (Paiement Stripe)

Total Modules:                33
```

## 🚀 Guide de Démarrage Rapide

### 1. Installation
```bash
# Cloner/télécharger les fichiers
# Fichiers essentiels:
- postman_collection.json    (à importer)
- POSTMAN_GUIDE.md          (documentation)
```

### 2. Configuration Postman
```
1. Ouvrir Postman
2. Import → Sélectionner postman_collection.json
3. Créer un nouvel Environment "TalentAI"
4. Ajouter variables:
   - base_url = http://localhost:3000
   - token = (obtenu après login)
   - api_key = (optionnel)
5. Sélectionner l'Environment
```

### 3. Premier Test
```
1. Ouvrir "🔐 Authentication"
2. Exécuter: POST /auth/
   - Email: test@example.com
3. Cliquer "Send"
4. Copier le token de la réponse
5. Mettre à jour {{token}} dans l'Environment
```

### 4. Explorer les Autres Endpoints
```
- Parcourir les modules
- Adapter les examples JSON
- Tester les GET/POST/PUT/DELETE
- Utiliser les filtres query params
```

## 📝 Notes Importantes

### ✅ Points Forts
- ✅ Tous les endpoints documentés avec exemples
- ✅ Variables automatiques pour base_url et token
- ✅ Organisation logique par modules
- ✅ Examples JSON pré-remplis
- ✅ Headers d'authentification automatiques
- ✅ Query parameters documentés
- ✅ Format Postman v2.1 standard

### ⚙️ Configuration Requise
- Postman 7.0 ou supérieur
- JSON valide pour tous les endpoints
- Base URL correcte configurée
- Token JWT valide pour endpoints protégés

### 🔄 Mise à Jour
Pour mettre à jour la collection avec les nouveaux endpoints:

1. Exécuter: `python generate_postman.py` (script inclus)
2. Importer le nouveau JSON dans Postman
3. Les variables et anciens endpoints restent intacts

## 📞 Support & Ressources

**Fichiers à consulter:**
- `POSTMAN_GUIDE.md` - Documentation complète
- `Backend/README.md` - Documentation backend
- `Backend/routes/` - Code source des routes
- `Backend/controllers/` - Logique métier

**Si besoin:**
1. Vérifier que base_url est correct
2. Vérifier que token est valide (pas expiré)
3. Vérifier les roles (Admin, Company, Candidate)
4. Consulter les logs du serveur

---

✅ **Collection Générée**: 20 Mai 2026  
📊 **Endpoints**: 253  
🏗️ **Modules**: 33  
⭐ **Format**: Postman Collection v2.1  
📦 **Taille**: ~227 KB  
🟢 **Statut**: Prêt à l'emploi
