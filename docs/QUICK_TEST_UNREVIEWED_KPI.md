# 🧪 Quick Test - Interviews IA Non Reviewés > 48h

**Durée Totale:** 5 minutes ⚡  
**Outils:** Postman ou cURL  
**Niveau:** Débutant

---

## 📋 Avant de Commencer

### Prérequis
1. ✅ Serveur backend en cours d'exécution (`npm run dev`)
2. ✅ Un JWT token valide (depuis login)
3. ✅ Une company account (pas candidate)
4. ✅ Des interviews IA complétés dans la DB

### Vérifier que tout est up
```bash
# Terminal 1: Backend running?
cd Backend && npm run dev

# Terminal 2: Check if server is up
curl http://localhost:5000/api/health
# Should return 200 OK
```

---

## ⚡ Test Rapide (2 min)

### Via cURL

**1. Obtenir le token**
```bash
# Login d'abord
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"company@example.com","password":"password123"}'

# Copy le token de la réponse
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**2. Tester l'endpoint KPI Count**
```bash
curl -X GET \
  'http://localhost:5000/api/post-interview-assessments/company/mine/kpi/unreviewed-48h' \
  -H "Authorization: Bearer $TOKEN"

# Expected response:
# {
#   "success": true,
#   "message": "X AI interviews pending...",
#   "data": { "count": X, "urgent": Y }
# }
```

**3. Tester l'endpoint KPI Details**
```bash
curl -X GET \
  'http://localhost:5000/api/post-interview-assessments/company/mine/kpi/unreviewed-48h/details?page=1&limit=5' \
  -H "Authorization: Bearer $TOKEN"

# Expected response:
# {
#   "success": true,
#   "data": [ {...}, {...} ],
#   "pagination": { "page": 1, "totalPages": 2 }
# }
```

---

## 🎯 Test Complet (5 min) avec Postman

### Étape 1: Importer Collection

1. Ouvrir **Postman**
2. Cliquer **File → Import**
3. Sélectionner `postman_unreviewed_interviews_kpi.json`
4. Cliquer **Import**

### Étape 2: Configurer Variables

1. Dans Postman, aller à **Environment → Manage Environments**
2. Créer un nouvel environment `Dev`
3. Ajouter les variables:

```json
{
  "baseUrl": "http://localhost:5000/api",
  "token": "PASTE_YOUR_JWT_TOKEN_HERE",
  "postId": "607f1f77bcf86cd799439010"  // Optional
}
```

### Étape 3: Tester les Endpoints

**Requête 1️⃣ - KPI Count**
```
GET {{baseUrl}}/post-interview-assessments/company/mine/kpi/unreviewed-48h
Headers: Authorization: Bearer {{token}}

Expected: 200 OK
{
  "success": true,
  "data": {
    "count": 12,
    "urgent": 3,
    ...
  }
}
```

**Requête 2️⃣ - KPI Details (Page 1)**
```
GET {{baseUrl}}/post-interview-assessments/company/mine/kpi/unreviewed-48h/details?page=1&limit=10
Headers: Authorization: Bearer {{token}}

Expected: 200 OK
{
  "success": true,
  "data": [
    {
      "candidateName": "Jean Dupont",
      "hoursPending": 52,
      "isUrgent": false
    },
    ...
  ],
  "pagination": { "page": 1, "totalPages": 2 }
}
```

**Requête 3️⃣ - KPI Details (avec filtre post)**
```
GET {{baseUrl}}/post-interview-assessments/company/mine/kpi/unreviewed-48h/details?postId={{postId}}&page=1&limit=10
Headers: Authorization: Bearer {{token}}

Expected: 200 OK (filtré par post)
```

**Requête 4️⃣ - KPI Details (Page 2)**
```
GET {{baseUrl}}/post-interview-assessments/company/mine/kpi/unreviewed-48h/details?page=2&limit=10
Headers: Authorization: Bearer {{token}}

Expected: 200 OK (données page 2)
```

**Requête 5️⃣ - Error Test (pas de token)**
```
GET {{baseUrl}}/post-interview-assessments/company/mine/kpi/unreviewed-48h
(NO Authorization header)

Expected: 401 Unauthorized
{
  "success": false,
  "message": "Authorization failed"
}
```

---

## ✅ Checklist de Vérification

### Response Format
- [ ] `success: true/false` - présent
- [ ] `message: string` - présent
- [ ] `data: object` - correct
- [ ] Status code correct (200, 401, etc)

### Data Validation
- [ ] `count >= 0` - nombre positif
- [ ] `urgent <= count` - cohérent
- [ ] `hoursPending > 48` - tous > 48h
- [ ] `isUrgent = hoursPending > 72` - calcul correct
- [ ] `aiGenerated = true` - toujours true

### Pagination
- [ ] `page >= 1` - page positive
- [ ] `limit = 10` ou la valeur envoyée
- [ ] `totalPages = ceil(totalCount/limit)` - calcul correct
- [ ] Array a bien `limit` items max

### Performance
- [ ] Response time < 500ms
- [ ] Pas d'erreur 500
- [ ] Logs serveur clairs

---

## 🐛 Dépannage

### Erreur: 401 Unauthorized
```
❌ Problème: Token absent ou expiré
✅ Solution: 
   1. Récupérer nouveau token via login
   2. Copier dans {{token}}
   3. Réessayer
```

### Erreur: 403 Forbidden
```
❌ Problème: L'utilisateur n'est pas une Company
✅ Solution:
   1. Vérifier que vous êtes connecté avec un compte Company
   2. Pas avec un compte Candidate
```

### Erreur: Empty Data Array
```
❌ Problème: Pas d'interviews non-reviewés
✅ Solution:
   1. C'est NORMAL si aucun interview > 48h non-reviewé
   2. Vérifier qu'il existe des interviews complétés
   3. Vérifier que recruiterFeedback est null
```

### Erreur: 500 Internal Server Error
```
❌ Problème: Erreur serveur
✅ Solution:
   1. Vérifier les logs du serveur backend
   2. Rechercher "❌" ou "Error" dans les logs
   3. Vérifier la connexion MongoDB
   4. Redémarrer le serveur: npm run dev
```

---

## 📊 Résultats Attendus

### Si tout fonctionne ✅

**KPI Count Response:**
```json
{
  "success": true,
  "message": "12 AI interviews pending recruiter review (3 urgent - over 72h)",
  "data": {
    "count": 12,
    "urgent": 3,
    "lastCheck": "2026-05-11T14:30:00.000Z",
    "description": "AI-generated interviews pending recruiter feedback for 48+ hours"
  }
}
```

**KPI Details Response:**
```json
{
  "success": true,
  "message": "Unreviewed interviews retrieved successfully",
  "data": [
    {
      "_id": "507f...",
      "candidateName": "Jean Dupont",
      "candidateEmail": "jean@example.com",
      "postTitle": "Senior Developer",
      "completedAt": "2026-05-09T10:30:00.000Z",
      "hoursPending": 52,
      "isUrgent": false,
      "overallScore": 78,
      "aiGenerated": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalCount": 12,
    "totalPages": 2
  }
}
```

---

## 🎓 Cas de Test Additionnels

### Test: Pagination Works
```bash
# Tester page 1
GET /kpi/unreviewed-48h/details?page=1&limit=5

# Tester page 2
GET /kpi/unreviewed-48h/details?page=2&limit=5

# Vérifier: Les données de page 2 sont différentes de page 1 ✓
```

### Test: Filter by Post
```bash
# Sans filtre (tous les posts)
GET /kpi/unreviewed-48h/details?page=1&limit=10
→ Count total: 12

# Avec filtre (un poste)
GET /kpi/unreviewed-48h/details?postId=607f...&page=1&limit=10
→ Count: 3 (exemple)

# Vérifier: Filtered count <= total count ✓
```

### Test: Urgent Flag Correct
```bash
# Vérifier que isUrgent = true seulement si hoursPending > 72
GET /kpi/unreviewed-48h/details

Exemples:
{hoursPending: 50, isUrgent: false}   ✓ Correct (50 < 72)
{hoursPending: 75, isUrgent: true}    ✓ Correct (75 > 72)
{hoursPending: 74, isUrgent: true}    ✓ Correct (74 > 72)
{hoursPending: 72, isUrgent: false}   ✓ Correct (72 = 72, pas >)
```

---

## 🚀 Après le Test

Si tout fonctionne ✅:

1. **Copier la Postman collection** pour le frontend team
2. **Montrer les résultats** au Product Manager
3. **Commencer l'implémentation frontend** avec IMPLEMENTATION_UNREVIEWED_INTERVIEWS_KPI.md
4. **Monitorer les logs** en production

Si erreur ❌:

1. **Consulter DÉPANNAGE** ci-dessus
2. **Vérifier les logs** du serveur
3. **Relancer le backend** si problème de connexion
4. **Vérifier le token** est valide et pas expiré

---

## 📝 Notes Importantes

### Limitations Actuelles
- ❌ Pas de bulk update (peut venir plus tard)
- ❌ Pas de export CSV (peut venir plus tard)
- ❌ Pas de webhooks (peut venir plus tard)

### À Venir
- ✅ Endpoints pour marquer comme reviewed
- ✅ Real-time notifications
- ✅ Comments sur interviews
- ✅ Analytics dashboard

### Seuils Fixes
- 48h = Seuil normal (not reviewed)
- 72h = Seuil urgent (need attention)
- 60/100 = Match score min (Job Application)

Pour modifier ces seuils, éditer le service:
```javascript
// Backend/services/InterviewServices/postInterviewAssessment.service.js ligne ~640
const hours48Ago = new Date(now.getTime() - 48 * 60 * 60 * 1000); // Modifier ici
const hours72Ago = new Date(now.getTime() - 72 * 60 * 60 * 1000); // Ou ici
```

---

**Status: ✅ Ready to Test**

Vous êtes prêt à tester! Allons-y 🚀

Pour questions, consultez: [API_UNREVIEWED_INTERVIEWS_KPI.md](./API_UNREVIEWED_INTERVIEWS_KPI.md)
