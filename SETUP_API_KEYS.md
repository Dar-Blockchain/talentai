# ✅ Système de Gestion des Clés API - Résumé Complet

## 📦 Fichiers Créés

### 1. **Modèle de Base de Données**
- **Fichier:** [`Backend/models/ApiKey.model.js`](Backend/models/ApiKey.model.js)
- **Description:** Schéma MongoDB pour stocker les clés API
- **Fonctionnalités:**
  - Génération sécurisée des clés (SHA-256)
  - Stockage du hash de la clé (jamais la clé en clair)
  - Support des scopes/permissions
  - Rate limiting par clé
  - Expiration des clés
  - Whitelist d'IP optionnelle
  - Historique d'utilisation

### 2. **Middleware de Sécurité**
- **Fichier:** [`Backend/middleware/security/api-key.middleware.js`](Backend/middleware/security/api-key.middleware.js)
- **Description:** Middleware pour vérifier les clés API
- **Fonctionnalités:**
  - Vérification du header Authorization
  - Vérification du header personnalisé X-API-Key
  - Vérification du query parameter apiKey
  - Gestion de l'expiration
  - Vérification de la whitelist IP
  - Système de scopes/permissions

### 3. **Contrôleur (Logique Métier)**
- **Fichier:** [`Backend/controllers/ApiKey.controller.js`](Backend/controllers/ApiKey.controller.js)
- **Description:** Gestion complète des clés API
- **Endpoints fournis:**
  - `POST /api/api-keys` - Créer une clé
  - `GET /api/api-keys` - Lister les clés
  - `GET /api/api-keys/:id` - Détails d'une clé
  - `PUT /api/api-keys/:id` - Mettre à jour une clé
  - `PATCH /api/api-keys/:id/toggle` - Désactiver/réactiver
  - `POST /api/api-keys/:id/regenerate` - Créer une nouvelle clé
  - `DELETE /api/api-keys/:id` - Supprimer une clé

### 4. **Routes API**
- **Fichier:** [`Backend/routes/apiKey.routes.js`](Backend/routes/apiKey.routes.js)
- **Description:** Définition des routes pour gérer les clés API

### 5. **Configuration Enregistrée**
- **Fichier:** [`Backend/config/register-routes.js`](Backend/config/register-routes.js)
- **Modification:** Ajout de l'import et enregistrement des routes API Key

### 6. **Routes Posts Mises à Jour**
- **Fichier:** [`Backend/routes/post.routes.js`](Backend/routes/post.routes.js)
- **Modification:** Support de l'authentification par clé API en parallèle du JWT

### 7. **Documentation**
- **Fichier:** [`Backend/docs/API_KEYS_GUIDE.md`](Backend/docs/API_KEYS_GUIDE.md)
- **Contenu:** Guide complet avec exemples, bonnes pratiques et dépannage

### 8. **Script de Test**
- **Fichier:** [`Backend/docs/TEST_API_KEYS.sh`](Backend/docs/TEST_API_KEYS.sh)
- **Contenu:** Commandes cURL prêtes à exécuter pour tester

### 9. **Collection Postman**
- **Fichier:** [`Backend/docs/postman-api-keys-collection.json`](Backend/docs/postman-api-keys-collection.json)
- **Contenu:** Collection Postman complète pour tester tous les endpoints

### 10. **Fichier de Configuration **
- **Fichier:** [`Backend/.env.api-keys.example`](Backend/.env.api-keys.example)
- **Contenu:** Variables d'environnement pour les clés API

---

## 🚀 Comment Démarrer

### Étape 1: Créer une Clé API

**Option A: Via Postman (Facile)**
1. Ouvrez Postman
2. Importez le fichier `postman-api-keys-collection.json`
3. Configurez les variables: `base_url`, `jwt_token`
4. Cliquez sur "Create API Key"

**Option B: Via cURL**
```bash
curl -X POST http://localhost:5000/api/api-keys \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Frontend App",
    "serviceName": "frontend",
    "scopes": ["read:posts", "write:posts"],
    "rateLimit": 5000
  }'
```

**Option C: Via Node.js**
```javascript
const response = await fetch('http://localhost:5000/api/api-keys', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Frontend App',
    serviceName: 'frontend',
    scopes: ['read:posts', 'write:posts'],
    rateLimit: 5000
  })
});
const data = await response.json();
console.log('API Key:', data.data.key);
```

### Étape 2: Utiliser la Clé API

Une fois la clé créée, utilisez-la pour accéder à vos endpoints:

```bash
# Option 1: Header Authorization
curl -X GET "http://localhost:5000/post/get-all-posts" \
  -H "Authorization: Bearer sk_votre_clé"

# Option 2: Header X-API-Key
curl -X GET "http://localhost:5000/post/get-all-posts" \
  -H "X-API-Key: sk_votre_clé"

# Option 3: Query Parameter
curl -X GET "http://localhost:5000/post/get-all-posts?apiKey=sk_votre_clé"
```

### Étape 3: Configuration dans votre Frontend/Service

```javascript
// src/config/api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const API_KEY = process.env.REACT_APP_API_KEY; // Stocké dans .env.local

export const apiCall = async (endpoint, options = {}) => {
  const headers = {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
};
```

---

## 🛠️ Intégrations Prêtes

### Pour Frontend React/Next.js
```javascript
// Créer client API
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Authorization': `Bearer ${process.env.REACT_APP_API_KEY}`
  }
});

export default apiClient;
```

### Pour Backend Node.js
```javascript
const fetch = require('node-fetch');

const apiKey = process.env.BACKEND_API_KEY;

async function callApi(endpoint, options = {}) {
  const response = await fetch(`http://localhost:5000${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    }
  });
  return response.json();
}
```

### Pour Python
```python
import requests
import os

API_KEY = os.getenv('API_KEY')
BASE_URL = 'http://localhost:5000'

headers = {
    'Authorization': f'Bearer {API_KEY}',
    'Content-Type': 'application/json'
}

response = requests.get(
    f'{BASE_URL}/post/get-all-posts',
    headers=headers
)
data = response.json()
```

---

## 📊 Scopes Disponibles

- `read:posts` - Lire les posts
- `write:posts` - Créer/modifier les posts
- `read:profiles` - Lire les profils
- `write:profiles` - Modifier les profils
- `read:metrics` - Accéder aux métriques
- `write:payments` - Traiter les paiements

*Vous pouvez ajouter d'autres scopes selon vos besoins en modifiant le contrôleur*

---

## 🔐 Bonnes Pratiques de Sécurité ⭐⭐⭐

### ✅ À FAIRE
1. **Stocker les clés dans des variables d'environnement**
   ```bash
   # .env.local (ne pas commiter)
   REACT_APP_API_KEY=sk_xxxxx
   ```

2. **Utiliser HTTPS en production**
   ```javascript
   // Votre serveur devrait utiliser HTTPS
   https://api.example.com
   ```

3. **Ajouter une expiration**
   ```javascript
   expiresAt: "2025-12-31T23:59:59Z"
   ```

4. **Utiliser une whitelist IP si possible**
   ```javascript
   ipWhitelist: ["192.168.1.1", "10.0.0.1"]
   ```

5. **Limiter les scopes**
   ```javascript
   // Frontend: seulement read:posts
   scopes: ["read:posts"]
   
   // Backend: accès complet
   scopes: ["read:posts", "write:posts", "read:profiles", "write:profiles"]
   ```

### ❌ À NE PAS FAIRE
1. ❌ Commiter les clés API en git
2. ❌ Envoyer les clés en HTTP non chiffré
3. ❌ Exposer les clés en JavaScript côté client (utiliser les proxies)
4. ❌ Porter les clés dans l'URL
5. ❌ Garder une même clé pendant des années

---

## 🧪 Tester le Système

### Via Postman
1. Ouvrez Postman
2. Importez: `Backend/docs/postman-api-keys-collection.json`
3. Définissez les variables:
   - `base_url`: `http://localhost:5000`
   - `jwt_token`: Votre JWT
   - `api_key`: La clé créée
4. Exécutez les requêtes

### Via Script cURL
```bash
bash Backend/docs/TEST_API_KEYS.sh
```

### Via Ligne de Commande
```bash
# Lister les clés
curl -X GET http://localhost:5000/api/api-keys \
  -H "Authorization: Bearer YOUR_JWT"

# Utiliser une clé
curl -X GET http://localhost:5000/post/get-all-posts \
  -H "Authorization: Bearer sk_xxxxx"
```

---

## 📋 Checklist d'Implémentation

- [x] Modèle ApiKey créé
- [x] Middleware de vérification créé
- [x] Contrôleur complet créé
- [x] Routes ApiKey enregistrées
- [x] Routes POST mises à jour pour supporter les clés API
- [x] Documentation complète rédigée
- [x] Exemples de test fournis
- [x] Collection Postman créée
- [x] Configuration .env fournie

**À faire par vous:**
- [ ] Tester la création d'une clé API
- [ ] Tester l'accès à un endpoint avec la clé
- [ ] Intégrer dans votre frontend
- [ ] Intégrer dans vos services
- [ ] Configurer les variables d'environnement
- [ ] Activer HTTPS en production

---

## ❓ Questions Fréquentes

**Q: Comment je récupère la clé si je l'ai perdue ?**
A: Malheureusement non. Pour des raisons de sécurité, la clé n'est affichée qu'une fois. Utilisez `/regenerate` pour créer une nouvelle clé.

**Q: Puis-je changer les scopes d'une clé existante ?**
A: Oui, avec `PUT /api/api-keys/:id`, mettez à jour le champ `scopes`.

**Q: Comment les clés API permettent au frontend et backend de communiquer ?**
A: Les clés API remplacent le JWT. Au lieu d'envoyer `Authorization: Bearer JWT_TOKEN`, vous envoyez `Authorization: Bearer sk_API_KEY`.

**Q: Puis-je utiliser à la fois JWT et clé API ?**
A: Oui, le middleware accepte les deux. Les clés API sont une **alternative** au JWT, pas une replacement.

**Q: Comment monétiser selon les clés API ?**
A: Utilisez le champ `rateLimit` pour contrôler le nombre de requêtes. Facturez selon le rate limit utilisé.

---

## 📞 Support Technique

Si vous rencontrez des problèmes:

1. Vérifiez les erreurs dans les logs du serveur
2. Testez avec cURL d'abord
3. Vérifiez la documentation: `Backend/docs/API_KEYS_GUIDE.md`
4. Consultez le guide de dépannage dans la documentation

---

**Dernière mise à jour:** 18 mars 2024
**Créé par:** Système d'Assistant IA
**Version:** 1.0.0
