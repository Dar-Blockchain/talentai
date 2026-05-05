# 📋 Inventaire des APIs Backend - Instructions d'Utilisation

**Généré pour:** Vérification de l'utilisation des APIs Backend  
**Date:** 5 mai 2026

---

## 📌 Fichiers Disponibles

### 1. **API_ENDPOINTS_INVENTORY.json** 📊
Format JSON structuré avec tous les endpoints, méthodes HTTP, descriptions et paramètres.

**Utilité:** 
- Vérification programmatique
- Intégration avec scripts d'analyse
- Consultation détaillée des paramètres

**Exemple de structure:**
```json
{
  "authentication": {
    "baseUrl": "/auth",
    "endpoints": [
      {
        "method": "POST",
        "path": "/auth/register",
        "description": "Create new user account",
        "auth": "public",
        "body": { ... }
      }
    ]
  }
}
```

---

### 2. **API_ENDPOINTS_GUIDE.md** 📖
Format Markdown lisible avec tableaux pour consultation facile.

**Utilité:**
- Lecture rapide
- Consultation dans GitHub/GitLab
- Partage facile avec l'équipe

**Contenu:**
- 30 modules d'API
- Tableaux récapitulatifs par endpoint
- Codes couleur visuels (✓, ✗, etc.)

---

### 3. **analyze-api-usage.js** 🔍
Script Node.js automatisé pour détecter les APIs utilisées.

**Utilité:**
- Analyse automatique du code frontend
- Génération de rapport JSON
- Identification des APIs inutilisées

**Comment l'utiliser:**
```bash
# Dans le dossier racine du projet frontend
node analyze-api-usage.js

# Génère: api-usage-report.json
```

---

## 🎯 Comment Vérifier les APIs Utilisées

### **Méthode 1: Manuel (Plus précis)**

1. Ouvrez `API_ENDPOINTS_GUIDE.md`
2. Pour chaque endpoint (ex: `/auth/register`):
   - Cherchez-le dans votre code frontend: `Ctrl+F` → `/auth/register`
   - Notez s'il est utilisé ou non
3. Créez un document avec vos résultats

**Avantage:** Compréhension complète  
**Inconvénient:** Long et fastidieux

---

### **Méthode 2: Script Automatisé (Recommandé)**

1. Placez `analyze-api-usage.js` à la racine de votre projet frontend
2. Exécutez:
```bash
node analyze-api-usage.js
```
3. Consultez le fichier généré: `api-usage-report.json`

**Exemple de rapport généré:**
```json
{
  "used": [
    "/auth/register",
    "/auth/login",
    "/auth/verify-otp",
    "/job-applications/post/:postId",
    ...
  ],
  "unused": [
    "/admin/backups/restore/:backupName",
    "/subscriptions/:companyProfileId/check-limit/:limitType",
    ...
  ],
  "patterns": {
    "/auth/login": [
      "src/pages/auth/login.tsx",
      "src/hooks/useAuth.ts"
    ]
  }
}
```

---

### **Méthode 3: Grep Search (Pour chercheurs avancés)**

```bash
# Chercher tous les appels API
grep -r "\/auth\/" src/
grep -r "\/post\/" src/
grep -r "fetch\|axios" src/ | grep "http"

# Créer une liste
grep -r "\/api\/" src/ | awk -F: '{print $1}' | sort -u > used-apis.txt
```

---

## 📊 Structure des Endpoints par Module

| Module | Endpoints | Type |
|--------|-----------|------|
| **Authentication** | 8 | Public + Protected |
| **Profile** | 17 | Protected |
| **Posts/Jobs** | 12 | Public + Protected |
| **Job Applications** | 18 | Mixed |
| **Chat** | 23 | Protected |
| **Assessments** | 14 | Mixed |
| **Dashboard** | 11 | Protected |
| **Subscriptions** | 5 | Protected |
| **CV Analysis** | 10 | Optional |
| **Departments** | 6 | Protected |
| **API Keys** | 7 | Protected |
| **Backups** | 5 | Admin only |
| **Autres** | 20+ | Various |

---

## 🔐 Types d'Authentification

```
┌─────────────────────────────────────────┐
│ AUTHENTIFICATION                        │
├─────────────────────────────────────────┤
│ 🟢 public     - Pas d'auth (15 endpoints)│
│ 🔴 required   - JWT Token (141 endpoints)│
│ 🟡 optional   - Auth recommandée (few)  │
└─────────────────────────────────────────┘
```

---

## ⚠️ Endpoints Critiques à Connaître

### 🚨 **Attention Particulière**

| Endpoint | Risque | Action |
|----------|--------|--------|
| `/admin/backups/restore/:backupName` | Écrase la BD | Ne pas utiliser en prod |
| `/api/api-keys` | Sécurité | Gérer les clés avec soin |
| `/subscriptions/*/check-limit` | Critique | Vérifier avant actions |
| `/post/deletePost/:id` | Données | Pas de récupération |

---

## 🚀 Optimisations Recommandées

### 1. **Supprimer les APIs inutilisées du frontend**
```javascript
// ❌ Avant (importé mais jamais utilisé)
import * as backupApi from './api/backup';

// ✅ Après
// Supprimé
```

### 2. **Consolider les appels similaires**
```javascript
// ❌ Avant (3 appels)
const users = await getUsers();
const posts = await getPosts();
const stats = await getStats();

// ✅ Après (1 appel bulk)
const data = await getDashboardData();
```

### 3. **Mettre en cache les données statiques**
```javascript
// ❌ Avant
const plans = await planLimitsApi.getAll(); // À chaque page

// ✅ Après
const plans = useStaticData('plans', () => planLimitsApi.getAll());
```

---

## 📋 Checklist pour Votre Collègue

- [ ] Télécharger les fichiers dans le dossier Backend/
- [ ] Lire `API_ENDPOINTS_GUIDE.md` pour aperçu
- [ ] Exécuter `analyze-api-usage.js` pour rapport automatique
- [ ] Comparer avec `API_ENDPOINTS_INVENTORY.json`
- [ ] Identifier les APIs non utilisées
- [ ] Documenter les usages pour chaque endpoint
- [ ] Proposer les optimisations
- [ ] Discuter avec l'équipe backend

---

## 💡 Cas d'Usage Courants

### **Cas 1: Vérifier une API spécifique**
```bash
grep -r "interview" . --include="*.ts" --include="*.tsx" --include="*.js"
```

### **Cas 2: Lister tous les endpoints utilisés**
```bash
node analyze-api-usage.js | grep "✓" > used-endpoints.txt
```

### **Cas 3: Documenter l'utilisation**
Créer un tableau Excel/Sheets:
```
| Endpoint | Utilisé? | Module | Fichiers | Notes |
|----------|----------|--------|----------|-------|
| /auth/register | OUI | Auth | auth.ts | Login initial |
| /admin/backups | NON | Admin | - | Non utilisé |
```

---

## 📞 Questions Fréquentes

### Q: Comment différencier les endpoints ?
**R:** Par le **path** (chemin) - ex: `/auth/register` vs `/auth/login`

### Q: Peut-on appeler les APIs sans authentification ?
**R:** Seulement celles marquées **public** (15 endpoints)

### Q: Quels endpoints sont critiques ?
**R:** Tous ceux marqués **Admin** ou avec **data destruction**

### Q: Comment ajouter un nouvel endpoint ?
**R:** 
1. Créer la route dans Backend
2. Ajouter à `API_ENDPOINTS_INVENTORY.json`
3. Mettre à jour `API_ENDPOINTS_GUIDE.md`
4. Relancer `analyze-api-usage.js`

---

## 📚 Ressources Supplémentaires

- **Frontend API Client:** Voir `src/services/api/`
- **Backend Routes:** Voir `Backend/config/register-routes.js`
- **Documentation API:** Voir `Backend/routes/*.routes.js`

---

## 🎯 Prochaines Étapes

1. **Analyse (1-2 jours)**
   - Exécuter le script
   - Parcourir les fichiers
   - Identifier les patterns

2. **Documentation (1-2 jours)**
   - Documenter chaque usage
   - Créer des notes

3. **Optimisation (Selon résultats)**
   - Supprimer les imports inutiles
   - Consolider les appels
   - Améliorer les performances

---

## 📞 Support

Si vous avez des questions:
1. Consultez les commentaires dans les routes: `Backend/routes/*.routes.js`
2. Vérifiez les contrôleurs: `Backend/controllers/`
3. Consultez les modèles: `Backend/models/`

---

**Créé avec ❤️ pour optimiser votre architecture API**

Dernière mise à jour: **5 mai 2026**
