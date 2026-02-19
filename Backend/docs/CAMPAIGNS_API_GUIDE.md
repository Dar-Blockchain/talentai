# Documentation - Campagnes Internes & Participants

## 📖 Accès à la Documentation Swagger

La documentation Swagger interactive est disponible aux URLs suivantes:

- **Documentation Swagger Campagnes**: http://localhost:5000/api/docs/campaigns
- **Documentation Swagger Globale**: http://localhost:5000/api/docs (si intégrée)

## 🚀 Quick Start - Exemples de Requêtes

### 1. Créer une Campagne

```bash
curl -X POST http://localhost:5000/api/internal-campaigns \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Employee Skills Assessment 2026",
    "type": "SKILLS_MAPPING",
    "description": "Évaluer les compétences actuelles des employés",
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
    "targetDepartment": "Engineering",
    "targetEmployeeCount": 50,
    "deadline": "2026-03-31T23:59:59Z"
  }'
```

**Réponse (201 Created):**
```json
{
  "success": true,
  "message": "Campaign created successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "company": "company_id",
    "title": "Employee Skills Assessment 2026",
    "type": "SKILLS_MAPPING",
    "status": "DRAFT",
    "anonymityMode": "NOMINATIVE",
    "modules": [...],
    "createdAt": "2026-02-19T10:30:00Z",
    "updatedAt": "2026-02-19T10:30:00Z"
  }
}
```

---

### 2. Récupérer Toutes les Campagnes de l'Entreprise

```bash
curl -X GET "http://localhost:5000/api/internal-campaigns?status=ACTIVE" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Query Parameters:**
- `status` (optionnel): `DRAFT`, `ACTIVE`, `PAUSED`, `CLOSED`, `EXPIRED`

**Réponse (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "title": "Employee Skills Assessment 2026",
      "type": "SKILLS_MAPPING",
      "status": "ACTIVE",
      "modules": [...],
      "createdAt": "2026-02-19T10:30:00Z"
    }
  ]
}
```

---

### 3. Obtenir une Campagne Spécifique

```bash
curl -X GET http://localhost:5000/api/internal-campaigns/65a1b2c3d4e5f6g7h8i9j0k1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 4. Mettre à Jour une Campagne

```bash
curl -X PUT http://localhost:5000/api/internal-campaigns/65a1b2c3d4e5f6g7h8i9j0k1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Campaign Title",
    "description": "Updated description",
    "deadline": "2026-04-30T23:59:59Z"
  }'
```

---

### 5. Changer le Statut d'une Campagne

```bash
curl -X PATCH http://localhost:5000/api/internal-campaigns/65a1b2c3d4e5f6g7h8i9j0k1/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "ACTIVE"
  }'
```

**Statuts valides:** `DRAFT`, `ACTIVE`, `PAUSED`, `CLOSED`, `EXPIRED`

---

### 6. Supprimer une Campagne

```bash
curl -X DELETE http://localhost:5000/api/internal-campaigns/65a1b2c3d4e5f6g7h8i9j0k1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 7. Obtenir les Statistiques d'une Campagne

```bash
curl -X GET http://localhost:5000/api/internal-campaigns/65a1b2c3d4e5f6g7h8i9j0k1/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Réponse:**
```json
{
  "success": true,
  "data": {
    "campaignId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "title": "Employee Skills Assessment 2026",
    "totalParticipants": 45,
    "participantStats": [
      { "_id": "INVITED", "count": 20 },
      { "_id": "IN_PROGRESS", "count": 15 },
      { "_id": "COMPLETED", "count": 10 }
    ],
    "moduleStats": [...]
  }
}
```

---

## 👥 Gestion des Participants

### 8. Ajouter un Participant

```bash
curl -X POST http://localhost:5000/api/campaign-participants/65a1b2c3d4e5f6g7h8i9j0k1/participants \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com"
  }'
```

**Ou avec employeeId interne:**
```bash
curl -X POST http://localhost:5000/api/campaign-participants/65a1b2c3d4e5f6g7h8i9j0k1/participants \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "emp_123456"
  }'
```

---

### 9. Ajouter Plusieurs Participants en Masse

```bash
curl -X POST http://localhost:5000/api/campaign-participants/65a1b2c3d4e5f6g7h8i9j0k1/participants/bulk \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "participants": [
      { "email": "john@example.com" },
      { "email": "jane@example.com" },
      { "employeeId": "emp_123" },
      { "email": "bob@example.com" }
    ]
  }'
```

---

### 10. Récupérer les Participants d'une Campagne

```bash
curl -X GET "http://localhost:5000/api/campaign-participants/65a1b2c3d4e5f6g7h8i9j0k1/participants?status=IN_PROGRESS" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Query Parameters:**
- `status` (optionnel): `INVITED`, `IN_PROGRESS`, `COMPLETED`, `DROPPED`

---

### 11. Récupérer un Participant Spécifique

```bash
curl -X GET http://localhost:5000/api/campaign-participants/65a1b2c3d4e5f6g7h8i9j0k1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 12. Récupérer par Token Anonyme (Pas d'authentification requise)

```bash
curl -X GET http://localhost:5000/api/campaign-participants/token/abc123def456ghi789jkl
```

---

### 13. Mettre à Jour un Participant

```bash
curl -X PUT http://localhost:5000/api/campaign-participants/65a1b2c3d4e5f6g7h8i9j0k2 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "IN_PROGRESS",
    "accessedAt": "2026-02-19T10:30:00Z"
  }'
```

---

### 14. Mettre à Jour la Progression d'un Module

```bash
curl -X PUT http://localhost:5000/api/campaign-participants/65a1b2c3d4e5f6g7h8i9j0k2/module-progress \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "moduleType": "QUESTIONNAIRE",
    "status": "COMPLETED",
    "completedAt": "2026-02-19T11:45:00Z",
    "responseRef": "response_id_12345"
  }'
```

**Module Types:** `QUESTIONNAIRE`, `AI_INTERVIEW`, `SKILL_TEST`, `TRAINING_PATH`
**Statuts:** `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`

---

### 15. Marquer un Participant comme Abandonné

```bash
curl -X PATCH http://localhost:5000/api/campaign-participants/65a1b2c3d4e5f6g7h8i9j0k2/drop \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "No response after 2 reminders"
  }'
```

---

### 16. Supprimer un Participant

```bash
curl -X DELETE http://localhost:5000/api/campaign-participants/65a1b2c3d4e5f6g7h8i9j0k2 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔐 Authentification

Tous les endpoints (sauf `/token/:token`) nécessitent un JWT Bearer token dans le header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📊 Codes de Réponse

| Code | Signification |
|------|---------------|
| 200 | OK - Requête réussie |
| 201 | Created - Ressource créée |
| 400 | Bad Request - Paramètres invalides |
| 403 | Forbidden - Accès non autorisé |
| 404 | Not Found - Ressource non trouvée |
| 500 | Internal Server Error - Erreur serveur |

---

## 🧪 Testing avec Postman

### Importer la Collection Swagger

1. Allez à http://localhost:5000/api/docs/campaigns
2. Cliquez sur le bouton **"Swagger Editor"**
3. Sélectionnez **"Download"** pour télécharger le JSON
4. Dans Postman: **New** → **API** → **Import** → Collez l'URL ou le JSON

### Variables d'Environnement Recommandées

```json
{
  "name": "Development",
  "values": [
    {
      "key": "base_url",
      "value": "http://localhost:5000/api",
      "enabled": true
    },
    {
      "key": "token",
      "value": "YOUR_JWT_TOKEN_HERE",
      "enabled": true
    },
    {
      "key": "campaign_id",
      "value": "",
      "enabled": true
    },
    {
      "key": "participant_id",
      "value": "",
      "enabled": true
    }
  ]
}
```

---

## 💡 Cas d'Utilisation Courants

### Scénario 1: Créer et Lancer une Campagne d'Évaluation

1. **Créer la campagne** (POST)
2. **Ajouter les participants** (POST bulk)
3. **Changer le statut à ACTIVE** (PATCH)
4. **Monitorer la progression** (GET stats)

### Scénario 2: Suivi d'un Participant

1. **Créer le participant** (POST)
2. **Mettre à jour module par module** (PUT module-progress)
3. **Vérifier la completion** (GET participant)

### Scénario 3: Campagne Anonyme

1. **Créer avec anonymityMode: ANONYMOUS** (POST)
2. **Générer des tokens anonymes** (service)
3. **Partager les liens** aux participants
4. **Suivre via tokens** (GET /token/:token)

---

## 🛠️ Dépannage

**Erreur: "Unauthorized"**
- Vérifiez que le token est inclus dans le header Authorization
- Vérifiez que le token n'a pas expiré

**Erreur: "Campaign not found"**
- Vérifiez l'ID de la campagne
- Assurez-vous que la campagne appartient à votre entreprise

**Erreur: "At least one module required"**
- Included au moins un module dans le tableau modules lors de la création

---

## 📝 Notes Importantes

- Les **campagnes** sont liées à une **entreprise** (company)
- Les **participants** sont liés à une **campagne**
- Chaque participant a une **progression par module**
- Les **modules** suivent l'ordre défini par la propriété `order`
- Les **timestamps** sont en format ISO 8601 (UTC)
