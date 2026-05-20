# 📚 TalentAI Backend API - Postman Collection Guide

## 📋 Overview

Ce guide explique comment utiliser la collection Postman complète du backend TalentAI contenant **253 endpoints** organisés en **33 modules**.

### 📊 Statistiques

- **Total des endpoints**: 253
- **Endpoints d'authentification**: 8
- **Modules**: 33
- **Format**: Postman Collection v2.1 (compatible avec Postman 7.0+)

## 🚀 Quick Start

### 1. Importer la Collection

1. Ouvrez **Postman**
2. Cliquez sur **Import** (en haut à gauche)
3. Sélectionnez le fichier `postman_collection.json`
4. Cliquez sur **Import**

### 2. Configurer les Variables

La collection utilise 3 variables principales :

| Variable | Valeur par défaut | Description |
|----------|-----------------|-------------|
| `{{base_url}}` | `http://localhost:3000` | URL de base du serveur API |
| `{{token}}` | `your_jwt_token_here` | Token JWT pour l'authentification |
| `{{api_key}}` | `your_api_key_here` | Clé API (optionnel) |

**Pour configurer les variables:**
1. Allez dans **Environment** (haut à droite)
2. Créez un nouvel environnement ou éditez "TalentAI Backend API"
3. Mettez à jour les valeurs:
   - **base_url**: ex: `http://localhost:3000` ou `https://api.talentai.com`
   - **token**: Obtenez-le après connexion via l'endpoint `/auth/`

### 3. Obtenir un Token JWT

1. Allez dans le dossier **Authentication** (🔐)
2. Exécutez **POST /auth/** pour envoyer un OTP
3. Utilisez **POST /auth/verify-otp** pour vérifier le code OTP
4. La réponse contiendra le **token**
5. Copiez le token et mettez-le à jour dans la variable `{{token}}`

## 📁 Structure des Modules

La collection est organisée en 33 modules :

### 🔐 Authentification (8 endpoints)
- `POST /auth/register` - Inscription utilisateur
- `POST /auth/` - Demander OTP
- `POST /auth/verify-otp` - Vérifier OTP
- `POST /auth/resend-otp` - Renvoyer OTP
- `POST /auth/analyze` - Analyser CV
- `GET /auth/check-role` - Vérifier rôle
- `GET /auth/warnUser` - Notification utilisateur
- `POST /auth/logout` - Déconnexion

### 💼 Gestion des Candidatures (Job Applications - 26 endpoints)
- Créer/lire candidatures
- Filtrer par statut, compétences, score
- Gérer les décisions du recruteur
- Télécharger CVs
- KPI et métriques

### 💬 Système de Chat (Chat - 22 endpoints, Team Chat - 14 endpoints)
- Conversations 1-to-1
- Système de chat d'équipe
- Messages, réactions
- Archive/suppression

### 👤 Profils (Profile - 17 endpoints)
- Gestion profil utilisateur/entreprise
- Compétences (soft skills, hard skills)
- Image de profil
- Visibilité du profil

### 📋 Autres Modules Clés
- **Interviews**: Pipeline interviews, évaluations post-interview
- **Posts**: Création/gestion offres d'emploi
- **Subscriptions**: Gestion abonnements et limites
- **Notifications**: Système de notifications
- **Departments**: Gestion départements
- **Permissions**: Gestion des droits d'accès
- **Dashboard**: Statistiques et rapports
- **Campaigns**: Campagnes d'entretien

## 🔒 Authentification & Autorisations

### Types d'Authentification

Les endpoints supportent:

1. **Public** - Pas d'authentification requise
   ```
   Header Authorization: NON REQUIS
   ```

2. **Protected (JWT)** - Token JWT requis
   ```
   Header: Authorization: Bearer {{token}}
   ```

3. **Protected (Admin)** - Administrateur uniquement
4. **Protected (Company)** - Accès entreprise uniquement
5. **Protected (Candidate)** - Accès candidat uniquement

### Headers Requis

Pour les endpoints protégés:

```http
Authorization: Bearer {{token}}
Content-Type: application/json
```

## 💡 Exemples d'Utilisation

### Exemple 1: Inscription et Connexion

```bash
# 1. Inscription
POST {{base_url}}/auth/register
{
  "email": "candidate@example.com",
  "roleType": "Candidate",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}

# 2. Demander OTP
POST {{base_url}}/auth/
{
  "email": "candidate@example.com"
}

# 3. Vérifier OTP
POST {{base_url}}/auth/verify-otp
{
  "email": "candidate@example.com",
  "otp": "123456"
}
# Réponse: {"success": true, "token": "eyJhbGciOiJIUzI1NiIs..."}

# 4. Copier le token dans {{token}}
```

### Exemple 2: Créer une Offre d'Emploi

```bash
POST {{base_url}}/post/save-post
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "title": "Senior React Developer",
  "description": "We are looking for...",
  "skills": ["React", "Node.js", "TypeScript"],
  "salary": {
    "min": 5000,
    "max": 8000
  }
}
```

### Exemple 3: Postuler à une Offre

```bash
POST {{base_url}}/job-applications
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "postId": "post_id_here",
  "candidateId": "candidate_id_here"
}
```

### Exemple 4: Consulter les Statistiques du Dashboard

```bash
GET {{base_url}}/dashboard/statsCards
Authorization: Bearer {{token}}

# Retourne les statistiques principales
```

## 🔍 Filtrage & Pagination

### Query Parameters Courants

```
page=1              # Numéro de page (défaut: 1)
limit=20            # Nombre de résultats par page
search=query        # Recherche textuelle
sort=field_asc      # Tri (asc/desc)
status=active       # Filtre par statut
```

### Exemple: Recherche avec Filtrage

```bash
GET {{base_url}}/job-applications/company/my/summary?page=1&limit=20&status=pending&sort=appliedAt_desc
Authorization: Bearer {{token}}
```

## 📤 Upload de Fichiers

Certains endpoints acceptent des fichiers (ex: CV, images):

```http
POST {{base_url}}/auth/register
Content-Type: multipart/form-data

Form Data:
- email: john@example.com
- firstName: John
- lastName: Doe
- resume: [file]
```

## ⚠️ Statuts HTTP Courants

| Statut | Signification |
|--------|---------------|
| 200 | OK - Requête réussie |
| 201 | Created - Ressource créée |
| 400 | Bad Request - Erreur dans les paramètres |
| 401 | Unauthorized - Token manquant/invalide |
| 403 | Forbidden - Accès refusé |
| 404 | Not Found - Ressource inexistante |
| 500 | Internal Server Error - Erreur serveur |

## 🛠️ Conseils d'Utilisation

### 1. Testez d'Abord les Endpoints Publics

Commencez par les endpoints publics avant de nécessiter l'authentification:
- `GET /post/search` - Rechercher des offres
- `GET /post/details/:id` - Détails d'une offre
- `GET /post/public-stats` - Statistiques publiques

### 2. Utilisez les Pré-remplissages de Données

Les exemples JSON sont pré-remplis dans chaque endpoint. Adaptez-les à votre cas d'usage.

### 3. Monitoring avec la Fenêtre Response

Vérifiez toujours:
- Status code
- Response JSON
- Headers de réponse
- Temps de réponse

### 4. Utilisez les Globals & Environments

Créez différents environnements:
- `Local` (http://localhost:3000)
- `Staging` (https://staging.api.talentai.com)
- `Production` (https://api.talentai.com)

### 5. Sauvegardez les Responses Utiles

Utilisez les **Tests** et **Scripts** pour automatiser:
```javascript
// Extrait le token de la réponse
var jsonData = pm.response.json();
pm.environment.set("token", jsonData.token);
```

## 📖 Documentation des Endpoints

Chaque endpoint inclut:
- ✅ Description claire
- ✅ Méthode HTTP
- ✅ URL complète
- ✅ Headers requis
- ✅ Body JSON exemple
- ✅ Query parameters
- ✅ Exemple de réponse

## 🔗 Endpoints Importants

### Pour les Candidats
- `/auth/register` - Inscription
- `/profile/me` - Profil
- `/post/search` - Rechercher offres
- `/job-applications` - Candidatures
- `/interview-details` - Détails entretien
- `/chat/conversations` - Messagerie

### Pour les Entreprises
- `/auth/register` - Création compte
- `/post/save-post` - Créer offre
- `/post/my-posts` - Mes offres
- `/job-applications/company/my` - Candidatures reçues
- `/post-interview-assessments` - Évaluations
- `/subscriptions` - Gestion abonnement
- `/dashboard` - Statistiques

### Pour les Administrateurs
- `/admin/backups` - Sauvegardes
- `/admin/companies` - Gestion entreprises
- `/logs/getAllLogs` - Journaux
- `/dashboard` - Statistiques globales

## 🐛 Troubleshooting

### Erreur 401 - Unauthorized
**Solution**: Token manquant ou expiré
- Vérifiez que `{{token}}` est défini
- Reconnectez-vous via `/auth/`
- Vérifiez l'expiration du token

### Erreur 400 - Bad Request
**Solution**: Paramètres invalides
- Vérifiez le JSON du body
- Contrôlez les types de données
- Vérifiez les query parameters

### Erreur 404 - Not Found
**Solution**: Ressource inexistante
- Vérifiez l'ID utilisé
- Assurez-vous que `{{base_url}}` est correct

### Timeout
**Solution**: Requête trop longue
- Augmentez le timeout dans les settings Postman
- Optimisez les filtres/query parameters
- Vérifiez la connexion réseau

## 📞 Support

Pour des questions:
1. Consultez la documentation du backend: `Backend/README.md`
2. Vérifiez les logs du serveur
3. Utilisez la console developer (F12) dans Postman
4. Activez la logging dans les scripts Postman

## ✅ Checklist Avant la Production

- [ ] Changez `{{base_url}}` vers le serveur de production
- [ ] Vérifiez les tokens d'authentification
- [ ] Testez tous les endpoints critiques
- [ ] Vérifiez les timeouts
- [ ] Configurez le SSL/HTTPS
- [ ] Activez les logs de sécurité
- [ ] Testez avec différents rôles (Candidate, Company, Admin)

---

**Version**: 1.0.0  
**Date**: 20 Mai 2026  
**Endpoints**: 253  
**Format**: Postman Collection v2.1
