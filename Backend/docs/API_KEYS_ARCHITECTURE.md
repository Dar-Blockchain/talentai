# 🏗️ Architecture du Système de Clés API

## 1️⃣ Flux Général

```
┌─────────────────────────────────────────────────────┐
│                   SERVICE EXTERNE                    │
│           (Frontend, Mobile, Service)                │
└────────────────────┬────────────────────────────────┘
                     │
                     │ 1. Requête avec clé API
                     │ Authorization: Bearer sk_xxxxx
                     ▼
    ┌────────────────────────────────────────────┐
    │           BACKEND EXPRESS.JS                │
    │                                             │
    │  ┌──────────────────────────────────────┐  │
    │  │  verifyApiKey Middleware             │  │
    │  │  - Extrait la clé du header          │  │
    │  │  - Hash la clé                       │  │
    │  │  - Cherche dans la BD                │  │
    │  └──────────────────────────┬───────────┘  │
    │                             │              │
    │                    ┌────────▼─────────┐    │
    │                    │  Valide ?        │    │
    │                    └────────┬─────────┘    │
    │                             │              │
    │          ┌──────────────────┴──────────────────┐
    │          │                                     │
    │    OUI   │                                NON  │
    │          │                                     │
    │          ▼                                     ▼
    │    ┌──────────┐                       ┌──────────────┐
    │    │ Vérifier │                       │ 401 Error    │
    │    │ Scopes   │                       │ Unauthorized │
    │    └────┬─────┘                       └──────────────┘
    │         │
    │    ┌────▼──────┐
    │    │ Autorisé? │
    │    └────┬──────┘
    │         │
    │    ┌────┴──────────────────┐
    │    │                       │
    │   OUI                     NON
    │    │                       │
    │    ▼                       ▼
    │  ┌───────────┐        ┌─────────────┐
    │  │ Exécuter  │        │ 403 Error   │
    │  │ Endpoint  │        │ Forbidden   │
    │  └─────────┬─┘        └─────────────┘
    │            │
    │            ▼
    │  ┌──────────────────┐
    │  │ Mettre à jour    │
    │  │ lastUsed         │
    │  └──────────────────┘
    │
    └────────────────────────────────────────────┘
                     │
                     │ 2. Réponse
                     ▼
┌─────────────────────────────────────────────────────┐
│                   SERVICE EXTERNE                    │
│                    Données JSON                       │
└─────────────────────────────────────────────────────┘
```

## 2️⃣ Modèle de Données - ApiKeySchema

```
ApiKey Collection (MongoDB)
│
├─ _id (ObjectId)
├─ key (String, unique) ← La clé visible (sk_xxxxx)
├─ keyHash (String, unique) ← Hash SHA-256 de la clé
├─ name (String) ← "Frontend App"
├─ userId (ObjectId) ← ref: User
├─ serviceName (String) ← "frontend", "mobile", etc
├─ scopes (Array) ← ["read:posts", "write:posts"]
├─ rateLimit (Number) ← 1000 requêtes/heure
├─ isActive (Boolean) ← true/false
├─ lastUsed (Date) ← Dernière fois utilisée
├─ expiresAt (Date) ← Date d'expiration
├─ ipWhitelist (Array) ← ["192.168.1.1"]
└─ timestamps (createdAt, updatedAt)
```

## 3️⃣ Chaîne de Traitement d'une Requête

```
Frontend envoie une requête
        │
        ▼
GET /post/get-all-posts
Authorization: Bearer sk_xxxxx
        │
        ├─► header.authorization existe ?
        │   ├─ Oui: extraire sk_xxxxx
        │   └─ Non: header["x-api-key"] exists ?
        │       ├─ Oui: utiliser celle-ci
        │       └─ Non: query.apiKey exists ?
        │           ├─ Oui: utiliser celle-ci
        │           └─ Non: 401 Unauthorized
        │
        ▼
Chercher en BD:
ApiKey.findOne({ key: sk_xxxxx })
        │
        ├─► Clé trouvée ?
        │   ├─ Oui: Continuer
        │   └─ Non: 401 Invalid API Key
        │
        ▼
Valider les conditions
        ├─► isActive === true ?
        │   ├─ Non: 401 Disabled Key
        │
        ├─► expiresAt > now() ?
        │   ├─ Non: 401 Expired Key
        │
        ├─► ipWhitelist check
        │   ├─ Non: 403 IP Not Allowed
        │
        ▼
Vérifier les scopes (si nécessaire)
        ├─► scopes.includes(requiredScope) ?
        │   ├─ Non: 403 Insufficient Permissions
        │
        ▼
✅ Autorisation réussie
        │
        ├─► Mettre à jour lastUsed = now()
        ├─► req.userId = apiKey.userId
        ├─► req.isApiKeyAuth = true
        │
        ▼
Exécuter le contrôleur
        │
        ▼
Envoyer la réponse
```

## 4️⃣ Flux de Création d'une Clé API

```
Utilisateur (authentifié JWT)
        │
        ▼
POST /api/api-keys
Authorization: Bearer JWT_TOKEN
Body: { name, serviceName, scopes, rateLimit, expiresAt }
        │
        ├─► Middleware requireAuthUser
        │   ├─► req.userId = 12345
        │
        ▼
createApiKey Controller
        │
        ├─► Générer une nouvelle clé
        │   └─► ApiKey.generateKey() = sk_xxxxx
        │
        ├─► Hacher la clé
        │   └─► ApiKey.hashKey(sk_xxxxx) = hash_xxxxx
        │
        ├─► Créer un document
        │   ├─ key: sk_xxxxx
        │   ├─ keyHash: hash_xxxxx
        │   ├─ name: "Frontend App"
        │   ├─ userId: 12345
        │   ├─ scopes: ["read:posts", "write:posts"]
        │   └─ isActive: true
        │
        ├─► Sauvegarder en BD
        │
        ▼
✅ Réponse 201
{
  success: true,
  data: {
    id: "650abc123",
    name: "Frontend App",
    key: "sk_xxxxx",  ← ⚠️ Affiché UNE SEULE FOIS
    scopes: ["read:posts", "write:posts"],
    createdAt: "2024-03-18T10:30:00Z"
  }
}
```

## 5️⃣ Flux de Utilisation d'une Clé

```
Frontend React
        │
        ├─► .env.local
        │   REACT_APP_API_KEY=sk_xxxxx
        │
        ▼
fetch('/post/get-all-posts', {
  headers: {
    'Authorization': 'Bearer sk_xxxxx'
  }
})
        │
        ▼
Node.js Backend
        │
        ├─► verifyApiKey Middleware
        │   ├─ Extrait sk_xxxxx du header
        │   ├─ Cherche { key: sk_xxxxx } en BD
        │   ├─ Valide les conditions
        │   ├─ Inject req.userId, req.apiKey
        │   │
        │   ▼
        │ postController.getAllPosts()
        │   ├─ Accès à req.userId
        │   ├─ Récupère les posts de l'utilisateur
        │   │
        │   ▼
        │ Répondre les données
        │
        ▼
Frontend React
        │
        ▼
Afficher les posts
```

## 6️⃣ Architecture des Fichiers

```
Backend/
├─ models/
│  └─ ApiKey.model.js ..................... Schéma MongoDB
│     • generateKey()  ← Générer clé aléatoire
│     • hashKey()      ← Hacher la clé
│     • verifyKey()    ← Comparer une clé avec un hash
│
├─ middleware/
│  └─ security/
│     └─ api-key.middleware.js ............ Vérification des clés
│        • verifyApiKey()  ← Main middleware
│        • checkScope()    ← Vérifier les permissions
│
├─ controllers/
│  └─ ApiKey.controller.js ............... Logique métier
│     • createApiKey()
│     • listApiKeys()
│     • getApiKeyDetails()
│     • updateApiKey()
│     • toggleApiKey()
│     • regenerateApiKey()
│     • deleteApiKey()
│
├─ routes/
│  ├─ apiKey.routes.js ................... Routes de gestion
│  │  POST   /api-keys
│  │  GET    /api-keys
│  │  GET    /api-keys/:id
│  │  PUT    /api-keys/:id
│  │  PATCH  /api-keys/:id/toggle
│  │  POST   /api-keys/:id/regenerate
│  │  DELETE /api-keys/:id
│  │
│  └─ post.routes.js [MODIFIÉ] .......... Intégration des clés API
│     • verifyApiKey middleware intégré
│
├─ config/
│  └─ register-routes.js [MODIFIÉ] ...... Enregistrement des routes
│
└─ docs/
   ├─ API_KEYS_GUIDE.md ................. Documentation complète
   ├─ TEST_API_KEYS.sh .................. Exemples cURL
   └─ postman-api-keys-collection.json .. Collection Postman
```

## 7️⃣ Points de Sécurité

```
┌─────────────────────────────────────────────────┐
│         SÉCURITÉ DES CLÉS API                   │
└─────────────────────────────────────────────────┘

1. La clé en Base de Données
   ├─ NE JAMAIS stocker la clé en clair
   ├─ TOUJOURS stocker le HASH (SHA-256)
   └─ Comparaison: hash(requête) === hash(BD)

2. Transmission sur le Réseau
   ├─ HTTPS obligatoire en production
   ├─ Jamais en HTTP non chiffré
   └─ Les logs ne doivent pas afficher la clé complète

3. Stockage Client
   ├─ Variables d'environnement (.env.local)
   ├─ .gitignore pour les fichiers secrets
   ├─ Jamais commiter les clés
   └─ Jamais exposer en JavaScript côté client

4. Validation
   ├─ Vérifier isActive
   ├─ Vérifier expiresAt
   ├─ Vérifier ipWhitelist
   └─ Vérifier scopes

5. Monitoring
   ├─ Tracker lastUsed
   ├─ Détecter les clés inutilisées
   ├─ Alerter si trop d'erreurs d'auth
   └─ Logger les tentatives invalides
```

## 8️⃣ Cas d'Usage

### Frontend React
```
Frontend → [Bearer sk_frontend_xxxxx] → Backend
  ├─ Lecture: read:posts, read:profiles
  ├─ Écriture: write:posts
  └─ Rate limit: 5000/heure
```

### Application Mobile
```
Mobile App → [Bearer sk_mobile_xxxxx] → Backend
  ├─ Lecture: read:posts
  ├─ Écriture: (aucune)
  └─ Rate limit: 2000/heure
```

### Service Interne
```
Backend Service → [Bearer sk_internal_xxxxx] → Backend
  ├─ Lecture: read:posts, read:profiles, read:metrics
  ├─ Écriture: write:posts, write:profiles, write:payments
  └─ Rate limit: 10000/heure
```

### Service Tiers
```
Third-party API → [Bearer sk_partner_xxxxx] → Backend
  ├─ Lecture: read:posts
  ├─ Écriture: (aucune)
  ├─ Expiration: oui
  └─ Whitelist IP: oui
```

## 9️⃣ Exemple de Flux Complet

```
JOUR 1: Création de la Clé
┌─────────────────────────┐
│ Administrateur          │
│ POST /api/api-keys      │
│ JWT: admin_token_xxx    │
│ Body:                   │
│ {                       │
│   "name": "Mobile App", │
│   "serviceName":        │
│     "mobile"            │
│ }                       │
└──────────┬──────────────┘
           │
           ▼
    ┌─────────────────────────┐
    │ BD: ApiKey document     │
    │ key: sk_abc123xyz...    │
    │ keyHash: hash_...       │
    │ userId: admin_id        │
    │ isActive: true          │
    │ createdAt: 2024-03-18   │
    └──────────┬──────────────┘
               │
               ▼
    ┌──────────────────────────┐
    │ Réponse Administrateur   │
    │ {                        │
    │   key: sk_abc123xyz...   │
    │   ⚠️  Copier immédiatement
    │ }                        │
    └──────────────────────────┘


JOUR 2+: Utilisation de la Clé
┌──────────────────────────┐      ┌─────────────────────┐
│ Application Mobile       │      │ Backend Node.js     │
│                          │      │                     │
│ fetch('/post', {         │      │ verifyApiKey()      │
│   headers: {             │      │ ├─ Récupère la clé  │
│ 'Authorization':         │      │ ├─ Hash la clé      │
│ 'Bearer sk_abc123...'    ├─────►│ ├─ Cherche en BD     │
│   }                      │      │ ├─ Valide scopes    │
│ })                       │      │ └─ next()           │
└──────────────────────────┘      │                     │
                             postController...
                             ├─ req.userId = ...
                             ├─ req.isApiKeyAuth = true
                             └─ Récupère données
                                      │
                                      ▼
                             ┌─────────────────────┐
                             │ Mise à jour BD      │
                             │ lastUsed: now()     │
                             └─────────────────────┘
```

---

**Architecture mise à jour:** 18 mars 2024
**Système:** TalentAI Backend API Keys
**Version:** 1.0.0
