# Guide de Test Postman - API createOrUpdateCompanyProfile

## Endpoint à tester

```
PUT http://localhost:5000/profiles/createOrUpdateCompanyProfile
```

## Headers requis

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

**Note**: Remplacez `YOUR_JWT_TOKEN` par votre token JWT valide obtenu lors de la connexion.

---

## 1️⃣ Créer un profil entreprise (Création)

### URL
```
POST http://localhost:5000/profiles/createOrUpdateCompanyProfile
```

### Headers
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

### Body (JSON)
```json
{
  "name": "TechCorp Solutions",
  "industry": "Technology",
  "size": "500-1000",
  "location": "San Francisco, CA",
  "employmentType": "Remote",
  "requiredSkills": ["JavaScript", "React", "Node.js"],
  "requiredExperienceLevel": "Mid Level",
  "email": "contact@techcorp.com"
}
```

### Réponse attendue (200 OK)
```json
{
  "message": "Company profile created/updated successfully",
  "profile": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439010",
    "type": "Company",
    "companyDetails": {
      "email": "contact@techcorp.com",
      "name": "TechCorp Solutions",
      "industry": "Technology",
      "size": "500-1000",
      "location": "San Francisco, CA",
      "employmentType": "Remote"
    },
    "requiredSkills": ["JavaScript", "React", "Node.js"],
    "requiredExperienceLevel": "Mid Level",
    "createdAt": "2025-11-14T10:30:00.000Z",
    "updatedAt": "2025-11-14T10:30:00.000Z"
  }
}
```

---

## 2️⃣ Mettre à jour un profil entreprise existant

### URL
```
POST http://localhost:5000/profiles/createOrUpdateCompanyProfile
```

### Headers
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

### Body (JSON) - Ajouter employmentType
```json
{
  "name": "TechCorp Solutions",
  "industry": "Technology",
  "size": "1000-5000",
  "location": "San Francisco, CA",
  "employmentType": "Hybrid",
  "requiredSkills": ["JavaScript", "React", "Node.js", "Python"],
  "requiredExperienceLevel": "Senior",
  "email": "contact@techcorp.com"
}
```

### Réponse attendue (200 OK)
```json
{
  "message": "Company profile created/updated successfully",
  "profile": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439010",
    "type": "Company",
    "companyDetails": {
      "email": "contact@techcorp.com",
      "name": "TechCorp Solutions",
      "industry": "Technology",
      "size": "1000-5000",
      "location": "San Francisco, CA",
      "employmentType": "Hybrid"
    },
    "requiredSkills": ["JavaScript", "React", "Node.js", "Python"],
    "requiredExperienceLevel": "Senior",
    "updatedAt": "2025-11-14T10:35:00.000Z"
  }
}
```

---

## 3️⃣ Test avec employmentType invalide

### URL
```
POST http://localhost:5000/profiles/createOrUpdateCompanyProfile
```

### Body (JSON) - employmentType invalide
```json
{
  "name": "TechCorp Solutions",
  "industry": "Technology",
  "size": "500-1000",
  "location": "San Francisco, CA",
  "employmentType": "PartTime",
  "requiredSkills": ["JavaScript"],
  "email": "contact@techcorp.com"
}
```

### Réponse attendue (400 Bad Request)
```json
{
  "message": "Invalid employment type. Must be 'Remote', 'Hybrid', or 'On-site'"
}
```

---

## 4️⃣ Test sans nom d'entreprise (Validation)

### URL
```
POST http://localhost:5000/profiles/createOrUpdateCompanyProfile
```

### Body (JSON) - name manquant
```json
{
  "industry": "Technology",
  "size": "500-1000",
  "location": "San Francisco, CA",
  "employmentType": "Remote",
  "requiredSkills": ["JavaScript"],
  "email": "contact@techcorp.com"
}
```

### Réponse attendue (400 Bad Request)
```json
{
  "message": "Company name is required"
}
```

---

## 5️⃣ Valeurs valides pour employmentType

```
- Remote
- Hybrid
- On-site
```

---

## 📋 Paramètres disponibles

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `name` | String | ✅ Oui | Nom de l'entreprise |
| `industry` | String | ❌ Non | Secteur d'activité |
| `size` | String | ❌ Non | Taille de l'entreprise |
| `location` | String | ❌ Non | Localisation |
| `employmentType` | String | ❌ Non | Type d'emploi (Remote, Hybrid, On-site) |
| `email` | String | ❌ Non | Email de l'entreprise |
| `requiredSkills` | Array | ❌ Non | Liste des compétences requises |
| `requiredExperienceLevel` | String | ❌ Non | Niveau d'expérience requis |

---

## 🔑 Niveaux d'expérience valides

```
- Entry Level
- Junior
- Mid Level
- Senior
- Expert
```

---

## 🔄 Workflow complet dans Postman

### Étape 1: Créer une collection
1. Ouvrez Postman
2. Cliquez sur "New" → "Collection"
3. Nommez-la "TalentAI - Company Profile"

### Étape 2: Ajouter des variables
1. Sélectionnez la collection
2. Onglet "Variables"
3. Ajoutez:
   - `base_url` = `http://localhost:5000`
   - `jwt_token` = Votre token JWT
   - `company_id` = ID de l'entreprise (après création)

### Étape 3: Créer les requêtes

**Requête 1 - Créer un profil**
```
Method: POST
URL: {{base_url}}/profiles/createOrUpdateCompanyProfile
Headers:
  Authorization: Bearer {{jwt_token}}
  Content-Type: application/json
Body:
{
  "name": "My Company",
  "employmentType": "Remote",
  "industry": "Tech"
}
```

**Requête 2 - Mettre à jour le profil**
```
Method: POST
URL: {{base_url}}/profiles/createOrUpdateCompanyProfile
Headers:
  Authorization: Bearer {{jwt_token}}
  Content-Type: application/json
Body:
{
  "name": "My Company",
  "employmentType": "Hybrid",
  "industry": "Technology",
  "size": "100-500"
}
```

---

## ⚠️ Erreurs courantes

| Erreur | Cause | Solution |
|--------|-------|----------|
| 401 Unauthorized | Token JWT manquant ou invalide | Vérifiez le token dans l'Authorization header |
| 400 Bad Request | Champ requis manquant | Vérifiez que `name` est fourni |
| 400 Bad Request | employmentType invalide | Utilisez Remote, Hybrid ou On-site |
| 500 Internal Server Error | Erreur serveur | Vérifiez les logs du serveur |

---

## 🧪 Exemple de test complet

### 1. Connexion (Obtenez le JWT)
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "company@example.com",
    "password": "password123"
  }'
```

Récupérez le `token` de la réponse.

### 2. Créer le profil
```bash
curl -X POST http://localhost:5000/profiles/createOrUpdateCompanyProfile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Tech Innovations Inc",
    "industry": "Software Development",
    "size": "50-100",
    "location": "Paris, France",
    "employmentType": "Hybrid",
    "requiredSkills": ["Node.js", "React", "MongoDB"],
    "requiredExperienceLevel": "Mid Level",
    "email": "hr@techinnovations.fr"
  }'
```

---

## 📝 Notes importantes

- ✅ L'API crée automatiquement un profil si l'utilisateur n'en a pas
- ✅ L'API met à jour le profil si l'utilisateur en a déjà un
- ✅ Un compte Hedera est automatiquement créé pour les nouvelles entreprises
- ✅ L'employmentType est optionnel mais recommandé
- ✅ Tous les champs companyDetails sont sauvegardés dans la base de données

