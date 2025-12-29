# Guide de Test Postman - API MatchingConfig

## 📋 Configuration préalable

### 1. Variables d'environnement Postman
Créez un environnement avec les variables suivantes :
```
{
  "base_url": "http://localhost:5000",
  "admin_token": "YOUR_ADMIN_JWT_TOKEN"
}
```

### 2. Authentification
Vous devez être connecté avec un compte **Admin** pour accéder à tous les endpoints.

---

## 🔍 Tests des Endpoints

### 1️⃣ **GET - Récupérer la configuration actuelle**

**URL :**
```
GET {{base_url}}/api/matching-config
```

**Headers :**
```
Authorization: Bearer {{admin_token}}
Content-Type: application/json
```

**Description :** 
- Récupère la configuration actuelle de la base de données
- Si la collection est vide, crée un document avec les valeurs par défaut
- Les valeurs par défaut du schéma sont :
  - `hardSkill: 40`
  - `experience: 35`
  - `salary: 10`
  - `workMode: 7.5`
  - `contract: 7.5`

**Réponse attendue (200 OK) :**
```json
{
  "success": true,
  "config": {
    "_id": "674a1234567890abcdef1234",
    "name": "default",
    "weights": {
      "hardSkill": 40,
      "experience": 35,
      "salary": 10,
      "workMode": 7.5,
      "contract": 7.5
    },
    "importanceWeight": {
      "critical": 1.5,
      "high": 1.2,
      "medium": 1.0,
      "low": 0.8
    },
    "exchangeRates": {
      "USD": 1,
      "EUR": 1.1,
      "TND": 0.32
    },
    "createdAt": "2025-11-29T10:30:00.000Z",
    "updatedAt": "2025-11-29T10:30:00.000Z"
  }
}
```

---

### 2️⃣ **PUT - Mettre à jour la configuration**

**URL :**
```
PUT {{base_url}}/api/matching-config
```

**Headers :**
```
Authorization: Bearer {{admin_token}}
Content-Type: application/json
```

**Exemple 1 : Modifier les poids uniquement**

**Body (JSON) :**
```json
{
  "weights": {
    "hardSkill": 45,
    "experience": 30,
    "salary": 12,
    "workMode": 6,
    "contract": 7
  }
}
```

**Réponse attendue (200 OK) :**
```json
{
  "success": true,
  "config": {
    "_id": "674a1234567890abcdef1234",
    "weights": {
      "hardSkill": 45,
      "experience": 30,
      "salary": 12,
      "workMode": 6,
      "contract": 7
    },
    "importanceWeight": {
      "critical": 1.5,
      "high": 1.2,
      "medium": 1.0,
      "low": 0.8
    },
    "exchangeRates": {
      "USD": 1,
      "EUR": 1.1,
      "TND": 0.32
    }
  }
}
```

---

**Exemple 2 : Modifier les poids d'importance uniquement**

**Body (JSON) :**
```json
{
  "importanceWeight": {
    "critical": 2.0,
    "high": 1.5,
    "medium": 1.0,
    "low": 0.5
  }
}
```

**Réponse attendue (200 OK) :**
```json
{
  "success": true,
  "config": {
    "_id": "674a1234567890abcdef1234",
    "weights": {
      "hardSkill": 45,
      "experience": 30,
      "salary": 12,
      "workMode": 6,
      "contract": 7
    },
    "importanceWeight": {
      "critical": 2.0,
      "high": 1.5,
      "medium": 1.0,
      "low": 0.5
    },
    "exchangeRates": {
      "USD": 1,
      "EUR": 1.1,
      "TND": 0.32
    }
  }
}
```

---

**Exemple 3 : Modifier les taux de change**

**Body (JSON) :**
```json
{
  "exchangeRates": {
    "USD": 1,
    "EUR": 1.05,
    "TND": 0.35,
    "GBP": 1.25
  }
}
```

**Réponse attendue (200 OK) :**
```json
{
  "success": true,
  "config": {
    "_id": "674a1234567890abcdef1234",
    "weights": {
      "hardSkill": 45,
      "experience": 30,
      "salary": 12,
      "workMode": 6,
      "contract": 7
    },
    "importanceWeight": {
      "critical": 2.0,
      "high": 1.5,
      "medium": 1.0,
      "low": 0.5
    },
    "exchangeRates": {
      "USD": 1,
      "EUR": 1.05,
      "TND": 0.35,
      "GBP": 1.25
    }
  }
}
```

---

**Exemple 4 : Mettre à jour TOUT (poids + importance + exchange rates)**

**Body (JSON) :**
```json
{
  "weights": {
    "hardSkill": 50,
    "experience": 25,
    "salary": 15,
    "workMode": 5,
    "contract": 5
  },
  "importanceWeight": {
    "critical": 2.0,
    "high": 1.5,
    "medium": 1.0,
    "low": 0.5
  },
  "exchangeRates": {
    "USD": 1,
    "EUR": 1.08,
    "TND": 0.33
  }
}
```

---

### ❌ Erreur - Pas de champs valides

**Body (JSON) :**
```json
{
  "invalid_field": "test"
}
```

**Réponse attendue (400 Bad Request) :**
```json
{
  "success": false,
  "error": "No valid fields provided"
}
```

---

### ❌ Erreur - Non authentifié

**Request sans le header Authorization :**

**Réponse attendue (401 Unauthorized) :**
```json
{
  "error": "Unauthorized"
}
```

---

### ❌ Erreur - Non autorisé (pas Admin)

**Request avec un token d'utilisateur non-Admin :**

**Réponse attendue (403 Forbidden) :**
```json
{
  "error": "Access denied"
}
```

---

## 📊 Scénario de Test Complet

### Étape 1 : Connexion
```
POST {{base_url}}/api/auth/login
Body :
{
  "email": "admin@example.com",
  "password": "password123"
}
```
Récupérez le token JWT et sauvegardez-le dans la variable `admin_token`.

### Étape 2 : Vérifier la config par défaut
```
GET {{base_url}}/api/matching-config
Header: Authorization: Bearer {{admin_token}}
```

### Étape 3 : Modifier les poids
```
PUT {{base_url}}/api/matching-config
Header: Authorization: Bearer {{admin_token}}
Body :
{
  "weights": {
    "hardSkill": 50,
    "experience": 25,
    "salary": 12,
    "workMode": 6.5,
    "contract": 6.5
  }
}
```

### Étape 4 : Vérifier les modifications
```
GET {{base_url}}/api/matching-config
Header: Authorization: Bearer {{admin_token}}
```
Vous devez voir les nouveaux poids appliqués.

---

## 🔄 Workflow de Matching avec Config Dynamique

### 1. Lancer un matching de candidats
```
GET {{base_url}}/api/matching/:jobPostId
Header: Authorization: Bearer {{user_token}}
```

**Points clés :**
- Le service `matchingConfigService.getMatchingConfig()` charge la config depuis la DB
- Les scores sont calculés avec les poids personnalisés
- La config est mise en cache (TTL 1 minute)
- Le résultat inclut `unlockPrice: 5`

**Réponse :**
```json
{
  "success": true,
  "jobTitle": "Senior Developer",
  "matches": [
    {
      "candidateId": "507f1f77bcf86cd799439011",
      "name": "john_doe",
      "firstName": "John",
      "lastName": "Doe",
      "score": 82.4,
      "unlockPrice": 5,
      "finalBid": null,
      "biddingCompany": null,
      "matchedSkills": [...],
      "requiredSkills": [...]
    }
  ],
  "count": 1
}
```

---

## 🛠️ Commandes cURL (Alternative)

### GET Config
```bash
curl -X GET "http://localhost:5000/api/matching-config" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

### PUT Config
```bash
curl -X PUT "http://localhost:5000/api/matching-config" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "weights": {
      "hardSkill": 45,
      "experience": 30,
      "salary": 12,
      "workMode": 6,
      "contract": 7
    }
  }'
```

---

## 📝 Checklist de Test

- [ ] GET config avec admin authentifié → Retourne configuration
- [ ] PUT config avec nouvelles valeurs → Mises à jour appliquées
- [ ] GET config après PUT → Vérifie les modifications
- [ ] PUT avec champs partiels → Fusionne avec existants
- [ ] PUT sans champs valides → Erreur 400
- [ ] GET sans token → Erreur 401
- [ ] GET avec token non-Admin → Erreur 403
- [ ] Première GET crée la config par défaut → Document inséré en DB
- [ ] Matching utilise la config dynamique → Scores calculés avec poids personnalisés
- [ ] Cache expire après 1 minute → Nouvelle config lue après TTL

---

## 🔐 Notes de Sécurité

✅ **Protégé par :**
- `requireAuthUser` : Authentification JWT requise
- `controledAcces('Admin')` : Seuls les Admin peuvent modifier
- `authLogMiddleware("MatchingConfig")` : Audit trail des modifications

⚠️ **À faire :**
- Utiliser HTTPS en production
- Valider et sanitizer les données reçues (notamment exchangeRates)
- Implémenter des limites de taux (rate limiting)
- Ajouter des logs d'audit détaillés

---

## 📞 Support

Pour toute question sur l'intégration ou les tests, vérifiez les logs :
```bash
# Terminal backend
tail -f logs/app.log | grep MatchingConfig
```

Les logs doivent afficher :
```
MatchingConfig: default configuration created in DB
MatchingConfig: config updated
```
