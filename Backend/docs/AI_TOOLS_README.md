# AI Tools Integration

Ce module permet aux agents IA d'interagir avec les APIs du projet TalentAI de manière structurée via des "outils" (tools).

## Architecture

- **Outils** (`tools/ai-tools.js`) : Définition des fonctions disponibles pour les agents IA
- **Contrôleur** (`controllers/ai.controller.js`) : Gestion des requêtes IA
- **Routes** (`routes/ai.routes.js`) : Endpoints pour l'interaction IA

## Endpoints Disponibles

### GET /ai/health
Vérifie que le service IA fonctionne.

**Réponse :**
```json
{
  "success": true,
  "message": "AI Tools service is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "availableTools": 7
}
```

### GET /ai/tools
Retourne la liste des outils disponibles avec leurs descriptions et paramètres.

**Réponse :**
```json
{
  "success": true,
  "tools": [
    {
      "name": "createPost",
      "description": "Créer une nouvelle offre d'emploi (post)",
      "parameters": {
        "type": "object",
        "properties": {
          "title": { "type": "string", "description": "Titre du poste" },
          "description": { "type": "string", "description": "Description du poste" },
          // ... autres paramètres
        },
        "required": ["title", "description"]
      }
    }
    // ... autres outils
  ]
}
```

### POST /ai/execute-tool
Exécute un outil spécifique. **Nécessite une authentification.**

**Corps de la requête :**
```json
{
  "toolName": "createPost",
  "parameters": {
    "title": "Développeur Full Stack",
    "description": "Nous recherchons un développeur expérimenté...",
    "skills": ["JavaScript", "React", "Node.js"],
    "location": "Paris"
  }
}
```

**Réponse de succès :**
```json
{
  "success": true,
  "tool": "createPost",
  "result": {
    "status": 201,
    "data": { /* données du post créé */ }
  }
}
```

**Réponse d'erreur :**
```json
{
  "success": false,
  "error": "Missing required parameters: title, description"
}
```

## Outils Disponibles

### 1. createPost
Crée une nouvelle offre d'emploi.

**Paramètres requis :**
- `title` (string) : Titre du poste
- `description` (string) : Description du poste

**Paramètres optionnels :**
- `requirements` (array) : Exigences du poste
- `skills` (array) : Compétences requises
- `location` (string) : Localisation
- `salary` (object) : Salaire {min, max, currency}
- `employmentType` (string) : Type d'emploi
- `experienceLevel` (string) : Niveau d'expérience

### 2. searchPosts
Recherche des offres d'emploi avec filtres.

**Paramètres optionnels :**
- `query` (string) : Terme de recherche
- `skills` (array) : Compétences à filtrer
- `location` (string) : Localisation
- `experienceLevel` (string) : Niveau d'expérience
- `employmentType` (string) : Type d'emploi
- `page` (number) : Page de résultats (défaut: 1)
- `limit` (number) : Nombre de résultats par page (défaut: 10)

### 3. getPostDetails
Obtient les détails complets d'une offre d'emploi.

**Paramètres requis :**
- `postId` (string) : ID du post

### 4. updatePost
Met à jour une offre d'emploi existante.

**Paramètres requis :**
- `postId` (string) : ID du post à mettre à jour

**Paramètres optionnels :**
- `title`, `description`, `requirements`, `skills`, `status`, etc.

### 5. deletePost
Supprime une offre d'emploi.

**Paramètres requis :**
- `postId` (string) : ID du post à supprimer

### 6. calculatePostPrice
Calcule le prix de publication d'une offre d'emploi.

**Paramètres requis :**
- `postId` (string) : ID du post

### 7. getPublicStats
Obtient les statistiques publiques de la plateforme.

**Aucun paramètre requis.**

## Utilisation par un Agent IA

Un agent IA peut :

1. **Découvrir les outils** : Appeler `GET /ai/tools` pour connaître les outils disponibles
2. **Exécuter des actions** : Utiliser `POST /ai/execute-tool` avec le nom de l'outil et ses paramètres
3. **Gérer les erreurs** : Traiter les réponses d'erreur et ajuster les paramètres si nécessaire

## Sécurité

- Tous les endpoints d'exécution nécessitent une authentification utilisateur
- Les outils respectent les permissions de l'utilisateur authentifié
- Les actions sont journalisées via le middleware `authLogMiddleware`

## Extension

Pour ajouter de nouveaux outils :

1. Définir l'outil dans `tools/ai-tools.js`
2. L'ajouter à la liste `availableTools`
3. Tester l'exécution via `POST /ai/execute-tool`

## Exemple d'utilisation

```javascript
// Découvrir les outils
const toolsResponse = await fetch('/ai/tools');
const { tools } = await toolsResponse.json();

// Exécuter un outil
const executeResponse = await fetch('/ai/execute-tool', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <token>'
  },
  body: JSON.stringify({
    toolName: 'createPost',
    parameters: {
      title: 'Data Scientist',
      description: 'Join our team...',
      skills: ['Python', 'Machine Learning']
    }
  })
});

const result = await executeResponse.json();
```