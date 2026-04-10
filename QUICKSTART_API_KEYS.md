# 🚀 QUICKSTART - Clés API en 5 Minutes

## 📦 Ce qui a été installé

✅ Modèle ApiKey pour MongoDB  
✅ Middleware de sécurité  
✅ Contrôleur avec 7 endpoints  
✅ Routes enregistrées  
✅ Intégration aux routes existantes  

**Tout ce qui reste:** Test et configuration

---

## ⚡ 5 Étapes Rapides

### 1️⃣ Redémarrer le Serveur Backend
```bash
# Terminal dans Backend/
npm install  # Si nécessaire
node app.js  # ou nodemon app.js
```

### 2️⃣ Obtenir JWT Token
Si vous n'avez pas de JWT authentifié, connectez-vous d'abord.  
Gardez le token pour les tests.

### 3️⃣ Créer une Clé API (Copier-Coller)

**Option A: cURL (Quick)**
```bash
curl -X POST http://localhost:5000/api/api-keys \
  -H "Authorization: Bearer VOTRE_JWT_ICI" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Key","serviceName":"test"}'
```

**Option B: PowerShell (Windows)**
```powershell
$headers = @{
    "Authorization" = "Bearer VOTRE_JWT_ICI"
    "Content-Type" = "application/json"
}

$body = @{
    name = "Test Key"
    serviceName = "test"
} | ConvertTo-Json

$response = Invoke-WebRequest `
    -Uri "http://localhost:5000/api/api-keys" `
    -Method POST `
    -Headers $headers `
    -Body $body

$response.Content | ConvertFrom-Json | Select-Object -ExpandProperty data | Select-Object -ExpandProperty key
```

### 4️⃣ Copier la Clé Retournée
La réponse contient:
```json
{
  "success": true,
  "data": {
    "key": "sk_VOTRE_CLE_ICI"  ← 🔑 COPIER CETTE VALEUR
  }
}
```

### 5️⃣ Tester Immédiatement
```bash
curl -X GET "http://localhost:5000/post/get-all-posts" \
  -H "Authorization: Bearer sk_VOTRE_CLE_ICI"
```

**✅ Si vous voyez une liste de posts: Succès!**

---

## 📚 Fichiers Créés

| Fichier | Purpose |
|---------|---------|
| [`Backend/models/ApiKey.model.js`](Backend/models/ApiKey.model.js) | Base de données |
| [`Backend/middleware/security/api-key.middleware.js`](Backend/middleware/security/api-key.middleware.js) | Vérification sécurité |
| [`Backend/controllers/ApiKey.controller.js`](Backend/controllers/ApiKey.controller.js) | Logique métier |
| [`Backend/routes/apiKey.routes.js`](Backend/routes/apiKey.routes.js) | Routes CRUD |
| [`Backend/docs/API_KEYS_GUIDE.md`](Backend/docs/API_KEYS_GUIDE.md) | Documentation complète |
| [`Backend/docs/TEST_API_KEYS.sh`](Backend/docs/TEST_API_KEYS.sh) | Exemples cURL |
| [`Backend/docs/postman-api-keys-collection.json`](Backend/docs/postman-api-keys-collection.json) | Collection Postman |
| [`Backend/docs/API_KEYS_ARCHITECTURE.md`](Backend/docs/API_KEYS_ARCHITECTURE.md) | Diagrammes & flux |

---

## 🔑 Endpoints Disponibles

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/api-keys` | Créer une clé |
| GET | `/api/api-keys` | Lister les clés |
| GET | `/api/api-keys/:id` | Détails d'une clé |
| PUT | `/api/api-keys/:id` | Mettre à jour |
| PATCH | `/api/api-keys/:id/toggle` | Activer/Désactiver |
| POST | `/api/api-keys/:id/regenerate` | Créer une nouvelle |
| DELETE | `/api/api-keys/:id` | Supprimer |

---

## 🎯 3 Façons d'Utiliser une Clé API

```bash
# Option 1: Authorization Header ⭐ (Recommandé)
curl -H "Authorization: Bearer sk_xxxxx" http://localhost:5000/post/get-all-posts

# Option 2: X-API-Key Header
curl -H "X-API-Key: sk_xxxxx" http://localhost:5000/post/get-all-posts

# Option 3: Query Parameter
curl "http://localhost:5000/post/get-all-posts?apiKey=sk_xxxxx"
```

---

## 💻 Intégration Frontend (Template)

```javascript
// .env.local
REACT_APP_API_KEY=sk_xxxxx

// api.js
export const apiClient = {
  async get(endpoint) {
    const response = await fetch(`http://localhost:5000${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${process.env.REACT_APP_API_KEY}`
      }
    });
    return response.json();
  }
};

// Usage
const posts = await apiClient.get('/post/get-all-posts');
```

---

## 🐛 Erreurs Courantes

| Erreur | Solution |
|--------|----------|
| `401 Unauthorized` | Vérifiez la clé API et son format |
| `401 Invalid API Key` | Clé n'existe pas ou mal tapée |
| `401 Disabled Key` | Clé désactivée → Toggle pour activer |
| `403 IP Not Allowed` | Vérifiez/mettez à jour ipWhitelist |
| `API key manquante` | Vérifiez le header Authorization |

---

## 📊 Cas D'Usage

### Frontend React
```javascript
// .env.local
REACT_APP_API_KEY=sk_frontend_xxxxx

// fetch
fetch('/post/search', {
  headers: { 'Authorization': `Bearer ${process.env.REACT_APP_API_KEY}` }
})
```

### Backend Service
```javascript
// .env
BACKEND_API_KEY=sk_backend_xxxxx

// Appel interne
fetch('http://api.service.com/posts', {
  headers: { 'Authorization': `Bearer ${process.env.BACKEND_API_KEY}` }
})
```

### Mobile App
```javascript
// Stocké de manière sécurisée
const apiKey = await SecureStore.getItemAsync('apiKey');

fetch('/post/get-all-posts', {
  headers: { 'Authorization': `Bearer ${apiKey}` }
})
```

---

## ✅ Checklist Post-Installation

- [ ] Serveur Backend redémarré
- [ ] Clé API créée avec succès
- [ ] Test avec cURL réussi
- [ ] Intégration Frontend en cours
- [ ] Variables .env configurées
- [ ] Endpoints sécurisés avec clés API

---

## 🔐 Meilleure Pratique: Stockage Sécurisé

❌ **Ne pas faire:**
```javascript
const apiKey = "sk_xxxxx";  // Jamais hardcoder
fetch(url, { headers: { 'Authorization': `Bearer ${apiKey}` } })
```

✅ **À faire:**
```javascript
// .env.local (dans .gitignore)
REACT_APP_API_KEY=sk_xxxxx

// Code
const apiKey = process.env.REACT_APP_API_KEY;
fetch(url, { headers: { 'Authorization': `Bearer ${apiKey}` } })
```

---

## 📖 Documentation Complète

Pour plus de détails, consultez:
- **Guide Complet:** [`Backend/docs/API_KEYS_GUIDE.md`](Backend/docs/API_KEYS_GUIDE.md)
- **Architecture:** [`Backend/docs/API_KEYS_ARCHITECTURE.md`](Backend/docs/API_KEYS_ARCHITECTURE.md)
- **Examples cURL:** [`Backend/docs/TEST_API_KEYS.sh`](Backend/docs/TEST_API_KEYS.sh)
- **Postman:** [`Backend/docs/postman-api-keys-collection.json`](Backend/docs/postman-api-keys-collection.json)

---

## 🆘 Support Rapide

**Besoin d'aide?**

1. Vérifiez l'erreur exacte dans les logs
2. Testez avec cURL directement
3. Consultez le guide de dépannage
4. Vérifiez que le serveur tourne sur le bon port

---

**C'est tout! 🎉**

Votre système de clés API est prêt à l'emploi.
