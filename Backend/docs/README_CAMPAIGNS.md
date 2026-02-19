# 📚 Campagnes Internes & Participants - Documentation Complète

## 📖 Vue d'ensemble

Ce projet fournit une API RESTful complète pour gérer:
- **Campagnes Internes** - Création et gestion des campagnes d'évaluation des employés
- **Participants** - Gestion des employés/participants aux campagnes

Chaque campagne peut contenir plusieurs modules (Questionnaires, Entretiens IA, Tests de Compétences, Parcours de Formation) et suivre la progression de chaque participant.

---

## 🗂️ Structure des Fichiers

```
Backend/
├── controllers/
│   ├── internalCampaign.controller.js       ✅ CRUD Campagnes
│   └── campaignParticipant.controller.js    ✅ CRUD Participants
├── services/
│   ├── internalCampaign.service.js          ✅ Logique métier Campagnes
│   └── campaignParticipant.service.js       ✅ Logique métier Participants
├── routes/
│   ├── internalCampaign.routes.js           ✅ Routes Campagnes
│   └── campaignParticipant.routes.js        ✅ Routes Participants
├── models/
│   ├── internalCampaign.model.js            ✅ Schéma MongoDB Campagnes
│   └── campaignParticipant.model.js         ✅ Schéma MongoDB Participants
├── docs/
│   ├── swagger-campaigns.json              📋 Documentation Swagger
│   ├── CAMPAIGNS_API_GUIDE.md             📖 Guide complet d'utilisation
│   ├── Postman_Campaigns_Collection.json  🧪 Collection Postman pour tester
│   ├── SWAGGER_CAMPAIGNS_SETUP.js         ⚙️ Configuration Swagger
│   └── README_CAMPAIGNS.md                📝 Ce fichier
└── config/
    └── register-routes.js                  ✅ Routes enregistrées (modifié)
```

---

## 🚀 Démarrage Rapide

### 1. Vérifier que les câbles sont correctement enregistrés

Les routes ont déjà été ajoutées au fichier `register-routes.js`:

```javascript
// Internal Campaign Routes
app.use('/internal-campaigns', internalCampaignRoutes);
app.use('/campaign-participants', campaignParticipantRoutes);

// Campaign API Documentation (Swagger)
app.use("/api/docs/campaigns", swaggerUi.serve, swaggerUi.setup(campaignSwagger));
```

### 2. Accéder à la documentation interactive

Une fois le serveur démarré (http://localhost:5000):

- **Documentation Swagger**: http://localhost:5000/api/docs/campaigns
- **Documentation Globale**: http://localhost:5000/api/docs

### 3. Importer dans Postman

1. Téléchargez `Postman_Campaigns_Collection.json`
2. Dans Postman: **Import** → **Upload Files**
3. Sélectionnez le fichier `.json` téléchargé
4. Configurez les variables d'environnement (token, URLs)

---

## 📊 Modèles de Données

### Campagne Interne (InternalCampaign)

```typescript
{
  _id: ObjectId,
  company: ObjectId,           // Référence à l'entreprise
  title: string,              // Titre de la campagne
  type: enum,                 // PRODUCTIVITY_DIAGNOSTIC | SKILLS_MAPPING | ENABLEMENT | CUSTOM
  description: string,        // Description optionnelle
  status: enum,              // DRAFT | ACTIVE | PAUSED | CLOSED | EXPIRED
  anonymityMode: enum,       // ANONYMOUS | NOMINATIVE
  modules: Array<Module>,    // Tableau des modules
  accessMethod: enum,        // LINK | ACCOUNTS | BOTH
  linkToken: string,         // Token d'accès pour mode LINK
  targetDepartment: string,  // Département cible
  targetEmployeeCount: number, // Nombre d'employés cibles
  deadline: Date,            // Date limite
  createdBy: ObjectId,       // Créateur de la campagne
  createdAt: Date,
  updatedAt: Date
}
```

### Module

```typescript
{
  type: enum,      // QUESTIONNAIRE | AI_INTERVIEW | SKILL_TEST | TRAINING_PATH
  config: object,  // Configuration spécifique
  order: number    // Ordre d'affichage
}
```

### Participant (CampaignParticipant)

```typescript
{
  _id: ObjectId,
  campaign: ObjectId,              // Référence à la campagne
  employee: ObjectId,              // Employé (optionnel)
  anonymousToken: string,          // Token pour accès anonyme
  email: string,                   // Email du participant
  status: enum,                    // INVITED | IN_PROGRESS | COMPLETED | DROPPED
  moduleProgress: Array<ModuleProgress>, // Progression par module
  accessedAt: Date,
  completedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Progression du Module (ModuleProgress)

```typescript
{
  moduleType: enum,     // QUESTIONNAIRE | AI_INTERVIEW | SKILL_TEST | TRAINING_PATH
  status: enum,        // NOT_STARTED | IN_PROGRESS | COMPLETED
  completedAt: Date,   // Date de complétion
  responseRef: ObjectId // Référence à la réponse/évaluation
}
```

---

## 🔌 Points de Terminaison API

### Campagnes Internes

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/internal-campaigns` | Créer une campagne | ✅ |
| GET | `/internal-campaigns` | Lister les campagnes | ✅ |
| GET | `/internal-campaigns/:id` | Détails d'une campagne | ✅ |
| GET | `/internal-campaigns/:id/stats` | Statistiques | ✅ |
| PUT | `/internal-campaigns/:id` | Mettre à jour | ✅ |
| PATCH | `/internal-campaigns/:id/status` | Changer le statut | ✅ |
| DELETE | `/internal-campaigns/:id` | Supprimer | ✅ |

### Participants

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/campaign-participants/:campaignId/participants` | Ajouter un participant | ✅ |
| POST | `/campaign-participants/:campaignId/participants/bulk` | Ajouter en masse | ✅ |
| GET | `/campaign-participants/:campaignId/participants` | Lister les participants | ✅ |
| GET | `/campaign-participants/:id` | Détails d'un participant | ✅ |
| GET | `/campaign-participants/token/:token` | Accès par token (anonyme) | ❌ |
| PUT | `/campaign-participants/:id` | Mettre à jour | ✅ |
| PUT | `/campaign-participants/:id/module-progress` | Progression d'un module | ✅ |
| PATCH | `/campaign-participants/:id/drop` | Marquer comme abandonné | ✅ |
| DELETE | `/campaign-participants/:id` | Supprimer | ✅ |

---

## 📝 Exemple de Flux Complet

### 1️⃣ Créer une Campagne

```bash
POST /api/internal-campaigns
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Évaluation des Compétences 2026",
  "type": "SKILLS_MAPPING",
  "description": "Évaluer les compétences actuelles",
  "anonymityMode": "NOMINATIVE",
  "modules": [
    {
      "type": "QUESTIONNAIRE",
      "order": 1,
      "config": {}
    },
    {
      "type": "SKILL_TEST",
      "order": 2,
      "config": {}
    }
  ],
  "accessMethod": "BOTH",
  "deadline": "2026-03-31T23:59:59Z"
}

// Réponse: campaign_id = "65a1b2c3d4e5f6g7h8i9j0k1"
```

### 2️⃣ Ajouter des Participants

```bash
POST /api/campaign-participants/65a1b2c3d4e5f6g7h8i9j0k1/participants/bulk
Authorization: Bearer <token>
Content-Type: application/json

{
  "participants": [
    { "email": "john@example.com" },
    { "email": "jane@example.com" },
    { "employeeId": "emp_123" }
  ]
}

// Réponse: Participants créés avec their IDs
```

### 3️⃣ Lancer la Campagne

```bash
PATCH /api/internal-campaigns/65a1b2c3d4e5f6g7h8i9j0k1/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "ACTIVE"
}
```

### 4️⃣ Suivre la Progression

```bash
GET /api/internal-campaigns/65a1b2c3d4e5f6g7h8i9j0k1/stats
Authorization: Bearer <token>

// Réponse: Stats des participants et des modules
```

### 5️⃣ Mettre à Jour la Progression d'un Module

```bash
PUT /api/campaign-participants/participant_id/module-progress
Authorization: Bearer <token>
Content-Type: application/json

{
  "moduleType": "QUESTIONNAIRE",
  "status": "COMPLETED",
  "completedAt": "2026-02-19T11:45:00Z"
}
```

---

## 🔐 Authentification & Autorisation

### Authentification

- **Type**: JWT Bearer Token
- **Header**: `Authorization: Bearer <token>`
- **Tous les endpoints** (sauf `/token/:token`) nécessitent un token valide

### Autorisation

- **Campagnes**: Réservées aux profils **Company**
- **Participants (gestion)**: Réservées aux profils **Company**
- **Participants (accès anonyme)**: `/token/:token` accessible sans auth

### Middleware Appliqué

```javascript
router.use(
  requireAuthUser,                    // Token JWT valide
  controledAcces("Company"),          // Rôle Company
  authLogMiddleware("InternalCampaign") // Journalisation
);
```

---

## 📊 Codes de Réponse HTTP

| Code | Signification | Exemple |
|------|---------------|---------|
| 200 | OK | GET réussi |
| 201 | Created | POST réussi |
| 400 | Bad Request | Paramètres manquants |
| 403 | Forbidden | Accès non autorisé |
| 404 | Not Found | Ressource n'existe pas |
| 500 | Server Error | Erreur serveur |

---

## 🧪 Testing

### Avec Swagger UI

1. Allez à http://localhost:5000/api/docs/campaigns
2. Cliquez sur un endpoint
3. Cliquez sur **"Try it out"**
4. Entrez les paramètres
5. Cliquez sur **"Execute"**

### Avec Postman

1. Importez `Postman_Campaigns_Collection.json`
2. Configurez les variables:
   - `base_url`: http://localhost:5000/api
   - `token`: Votre JWT token
3. Exécutez les requêtes

### Avec cURL

```bash
curl -X GET http://localhost:5000/api/internal-campaigns \
  -H "Authorization: Bearer <token>"
```

---

## 🐛 Dépannage

### Erreur: "Unauthorized"
- ✅ Vérifiez que le token est inclus
- ✅ Vérifiez que le token n'a pas expiré
- ✅ Vérifiez que c'est un profil Company

### Erreur: "Campaign not found"
- ✅ Vérifiez l'ID de la campagne
- ✅ Assurez-vous qu'elle appartient à votre entreprise

### Erreur: "Route.get() requires a callback function"
- ✅ Routes spécifiques placées AVANT routes générales
- ✅ Tous les handlers sont des fonctions valides

---

## 📚 Ressources Additionnelles

### Fichiers de Documentation

- **[CAMPAIGNS_API_GUIDE.md](CAMPAIGNS_API_GUIDE.md)** - Guide détaillé avec exemples cURL
- **[swagger-campaigns.json](swagger-campaigns.json)** - Spécification OpenAPI complète
- **[Postman_Campaigns_Collection.json](Postman_Campaigns_Collection.json)** - Collection pour Postman

### URLs Utiles

- Swagger UI: http://localhost:5000/api/docs/campaigns
- Post Man : Importez le fichier JSON fourni
- Code Source: `/Backend/controllers`, `/Backend/services`, `/Backend/routes`

---

## 👥 Support

Pour toute question ou problème:
1. Consultez [CAMPAIGNS_API_GUIDE.md](CAMPAIGNS_API_GUIDE.md)
2. Vérifiez la documentation Swagger: http://localhost:5000/api/docs/campaigns
3. Testez avec Postman Collection
4. Vérifiez les logs du serveur

---

## ✅ Checklist de Vérification

- [x] Controllers créés et implémentés
- [x] Services créés avec logique métier
- [x] Routes enregistrées
- [x] Middlewares d'authentification appliqués
- [x] Documentation Swagger générée
- [x] Guide d'utilisation créé
- [x] Collection Postman fournie
- [x] Intégration dans register-routes.js effectuée
- [x] Modèles MongoDB validés

---

**Dernière mise à jour**: 19 février 2026
**Status**: ✅ Production Ready
