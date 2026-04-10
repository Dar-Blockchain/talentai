# Guide de Gestion des Clés API

## 📋 Vue d'ensemble

Le système de clés API permet aux services externes et autres backends d'accéder à vos endpoints sans authentification JWT. Les clés API offrent une alternative sécurisée pour l'API-to-API communication.

## ✨ Caractéristiques

- 🔐 Génération sécurisée des clés (SHA-256)
- ⏰ Expiration optionnelle des clés
- 🎯 Scopes/permissions granulaires
- 📊 Rate limiting par clé
- 🔒 Whitelist d'IP optionnelle
- 📝 Historique d'utilisation (lastUsed)
- 🔄 Régénération des clés à tout moment

## 🚀 Démarrage rapide

### 1. Créer une clé API

**Endpoint:** `POST /api/api-keys`

**Headers requis:**
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Frontend App",
  "serviceName": "frontend",
  "scopes": ["read:posts", "write:posts"],
  "rateLimit": 5000,
  "expiresAt": "2025-12-31T23:59:59Z",
  "ipWhitelist": ["192.168.1.1", "10.0.0.1"]
}
```

**Réponse:**
```json
{
  "success": true,
  "message": "Clé API créée avec succès",
  "data": {
    "id": "650abc123def456",
    "name": "Frontend App",
    "serviceName": "frontend",
    "key": "sk_1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0",
    "scopes": ["read:posts", "write:posts"],
    "rateLimit": 5000,
    "isActive": true,
    "expiresAt": "2025-12-31T23:59:59Z",
    "createdAt": "2024-03-18T10:30:00Z"
  }
}
```

⚠️ **Important:** La clé complète n'est affichée qu'à la création. Sauvegardez-la immédiatement car vous ne pourrez pas la récupérer ultérieurement.

### 2. Utiliser une clé API

Vous avez 3 façons d'utiliser la clé API:

#### Option A: Header Authorization (Recommandé)
```bash
curl -X GET "http://localhost:5000/post/search" \
  -H "Authorization: Bearer sk_1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0"
```

#### Option B: Header personnalisé X-API-Key
```bash
curl -X GET "http://localhost:5000/post/search" \
  -H "X-API-Key: sk_1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0"
```

#### Option C: Query Parameter (Moins recommandé)
```bash
curl -X GET "http://localhost:5000/post/search?apiKey=sk_1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0"
```

### 3. Exemple avec Node.js/Fetch

```javascript
// Créer une clé API
async function createApiKey() {
  const response = await fetch('http://localhost:5000/api/api-keys', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer {JWT_TOKEN}',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'Mobile App',
      serviceName: 'mobile',
      scopes: ['read:posts'],
      rateLimit: 1000
    })
  });
  return await response.json();
}

// Utiliser une clé API pour accéder à un endpoint
async function searchPosts(apiKey) {
  const response = await fetch('http://localhost:5000/post/search', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${apiKey}`
    }
  });
  return await response.json();
}
```

### 4. Exemple avec Python

```python
import requests

# Créer une clé API
def create_api_key(jwt_token):
    headers = {
        'Authorization': f'Bearer {jwt_token}',
        'Content-Type': 'application/json'
    }
    payload = {
        'name': 'Python Bot',
        'serviceName': 'python-bot',
        'scopes': ['read:posts', 'write:posts'],
        'rateLimit': 2000
    }
    response = requests.post(
        'http://localhost:5000/api/api-keys',
        json=payload,
        headers=headers
    )
    return response.json()

# Utiliser une clé API
def search_posts(api_key):
    headers = {
        'Authorization': f'Bearer {api_key}'
    }
    response = requests.get(
        'http://localhost:5000/post/search',
        headers=headers
    )
    return response.json()
```

## 📚 Endpoints de Gestion des Clés API

### Créer une clé
```
POST /api/api-keys
Authorization: Bearer {JWT}
Body: { name, serviceName?, scopes?, rateLimit?, expiresAt?, ipWhitelist? }
```

### Lister vos clés
```
GET /api/api-keys
Authorization: Bearer {JWT}
```

Réponse:
```json
{
  "success": true,
  "data": [
    {
      "id": "650abc123def456",
      "name": "Frontend App",
      "serviceName": "frontend",
      "keyPreview": "sk_1a2b...r9s0",
      "scopes": ["read:posts", "write:posts"],
      "rateLimit": 5000,
      "isActive": true,
      "lastUsed": "2024-03-18T14:20:00Z",
      "expiresAt": "2025-12-31T23:59:59Z",
      "createdAt": "2024-03-18T10:30:00Z"
    }
  ]
}
```

### Obtenir les détails d'une clé
```
GET /api/api-keys/:id
Authorization: Bearer {JWT}
```

### Mettre à jour une clé
```
PUT /api/api-keys/:id
Authorization: Bearer {JWT}
Body: { name?, serviceName?, scopes?, rateLimit?, expiresAt?, ipWhitelist?, isActive? }
```

### Désactiver/Réactiver une clé
```
PATCH /api/api-keys/:id/toggle
Authorization: Bearer {JWT}
```

### Régénérer une clé (créer une nouvelle)
```
POST /api/api-keys/:id/regenerate
Authorization: Bearer {JWT}
```

⚠️ Cette action génère une nouvelle clé. Sauvegardez-la immédiatement.

### Supprimer une clé
```
DELETE /api/api-keys/:id
Authorization: Bearer {JWT}
```

## 🔐 Scopes Disponibles

- `read:posts` - Lire les posts/offres
- `write:posts` - Créer/modifier les posts
- `read:profiles` - Lire les profils
- `write:profiles` - Modifier les profils
- `read:metrics` - Accéder aux métriques
- `write:payments` - Traiter les paiements

*(Vous pouvez ajouter d'autres scopes selon vos besoins)*

## 🛡️ Bonnes Pratiques de Sécurité

1. **Ne pas commiter les clés en git**
   ```
   # .gitignore
   .env
   .env.local
   api-keys.secretes
   ```

2. **Stocker les clés de manière sécurisée**
   - Variables d'environnement
   - Gestionnaires de secrets (AWS Secrets Manager, HashiCorp Vault)
   - Fichiers .env non versionés

3. **Utiliser HTTPS en production**
   - Les clés doivent toujours transiter en HTTPS
   - Jamais en HTTP non chiffré

4. **Renouveler les clés régulièrement**
   - Utilisez l'endpoint `/regenerate` pour créer une nouvelle
   - Supprimez l'ancienne clé après mise à jour sur tous les clients

5. **Limiter les permissions**
   - Utilisez uniquement les scopes nécessaires
   - Exemple: Frontend ne devrait pas avoir `write:users`

6. **Utiliser la whitelist IP**
   - Activez si vous connaissez l'IP fixe du service
   - Réduit le risque si la clé est compromise

7. **Ajouter une expiration**
   - Définez `expiresAt` pour les clés avec une durée de vie courte
   - Idéal pour les clés temporaires ou de test

8. **Monitorer l'utilisation**
   - Vérifiez `lastUsed` régulièrement
   - Supprimez les clés non utilisées depuis longtemps

## 📊 Exemple Complet: Intégration Frontend

```javascript
// config/api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const API_KEY = process.env.REACT_APP_API_KEY;

export const apiClient = {
  async get(endpoint) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return response.json();
  },

  async post(endpoint, data) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return response.json();
  }
};

// .env.local
REACT_APP_API_URL=http://localhost:5000
REACT_APP_API_KEY=sk_votre_clé_secrète_ici
```

```javascript
// services/postService.js
import { apiClient } from '../config/api';

export const postService = {
  async searchPosts(query) {
    return apiClient.get(`/post/search?q=${query}`);
  },

  async createPost(postData) {
    return apiClient.post('/post/save-post', postData);
  }
};
```

## 🐛 Dépannage

### "API key manquante"
- Vérifiez que la clé est dans le header correct
- Vérifiez le format: `Bearer sk_xxxxx`
- Assurez-vous que la clé n'est pas tronquée

### "Clé API invalide"
- Vérifiez que vous utilisez la bonne clé
- La clé peut être expirée (vérifiez `expiresAt`)
- La clé a peut-être été régénérée

### "Clé API désactivée"
- La clé a été désactivée intentionnellement
- Utilisez le toggle pour la réactiver
- Ou créez une nouvelle clé

### "IP non autorisée"
- Vérifiez votre IP actuelle
- Mettez à jour la whitelist IP
- Ou supprimez la restriction de whitelist

### "Permissions insuffisantes"
- Vérifiez les scopes assignés à la clé
- Mettez à jour les scopes si nécessaire
- Créez une nouvelle clé avec les bons scopes

## 📞 Support

Pour toute question ou problème:
1. Vérifiez la documentation ci-dessus
2. Consultez les logs du serveur
3. Testez avec cURL pour isoler le problème
4. Contactez l'équipe de développement

---

**Dernière mise à jour:** 18 mars 2024
