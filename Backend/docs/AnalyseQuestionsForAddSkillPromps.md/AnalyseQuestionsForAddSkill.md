# Documentation des Prompts d'Analyse des Questions

Ce document détaille les prompts utilisés pour analyser les réponses des candidats lors des évaluations techniques et comportementales.

## Vue d'ensemble

Le module exporte deux fonctions principales :
- `getSystemPrompt(type)` : Définit le rôle et les règles d'évaluation pour l'IA
- `getUserPrompt(type, skillList, questions)` : Structure l'analyse des réponses du candidat

## 1. `getSystemPrompt(type)`

### Objectif
Configure l'IA comme un évaluateur expert dans un domaine spécifique pour analyser les réponses et la progression des candidats.

### Paramètres
- `type` : Le type d'évaluation (technique, comportemental, etc.)

### Règles d'évaluation des réponses

#### Statuts possibles
1. **correct**
   - Réponse précise et complète
   - Pas de champs additionnels requis

2. **partial_correct**
   - Réponse conceptuellement correcte mais incomplète (60-70% correct)
   - Champs additionnels requis :
     - `partialCorrectPercentage` : Nombre entre 60 et 70
     - `partialCorrectReason` : Explication des éléments manquants

3. **incorrect**
   - Réponse majoritairement fausse, vague ou hors sujet
   - Champ additionnel requis :
     - `exampleCorrectAnswer` : Exemple de réponse correcte

### Exigences pour les recommandations
- Minimum deux conseils d'amélioration spécifiques et actionnables
- Format : tableau de chaînes
- Critères :
  - Pratiques et techniquement pertinents
  - Reflètent les dernières tendances
  - Au moins une ressource externe à jour
  - Conseils concrets, pas de généralités

### Exemple de recommandations
```json
{
  "recommendations": [
    "Adoptez React Server Components pour améliorer la performance. Guide : https://react.dev/reference/react-server/components",
    "Utilisez TypeScript 5.x pour la sécurité du typage. Documentation : https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html"
  ]
}
```

## 2. `getUserPrompt(type, skillList, questions)`

### Objectif
Structure l'analyse détaillée des réponses du candidat pour chaque compétence évaluée.

### Paramètres
- `type` : Type d'évaluation
- `skillList` : Liste des compétences évaluées avec leurs niveaux
- `questions` : Questions et réponses du candidat

### Format de la liste des compétences
```javascript
skillList = [
  {
    name: "NomCompétence",
    proficiencyLevel: 1-5,
    subcategory: "Sous-catégorie" // optionnel
  }
]
```

### Structure de sortie JSON

```json
{
  "overallScore": 0-100,
  "skillAnalysis": [
    {
      "skillName": "string",
      "currentProficiency": 1-5,
      "demonstratedProficiency": 1-5,
      "strengths": ["string"],
      "weaknesses": ["string"],
      "confidenceScore": 0-100,
      "improvement": "increased|unchanged|decreased",
      "subcategory": "string",
      "questionAnswerList": [
        {
          "question": "string",
          "answer": "string",
          "status": "correct|partial_correct|incorrect",
          "exampleCorrectAnswer": "string",
          "partialCorrectPercentage": 60-70,
          "partialCorrectReason": "string"
        }
      ]
    }
  ],
  "generalAssessment": "string",
  "recommendations": ["string"],
  "technicalLevel": "string",
  "nextSteps": ["string"],
  "assessmentType": "string",
  "evaluationContext": "string"
}
```

## Champs principaux de l'analyse

### 1. Scores et niveaux
- `overallScore` : Score global (0-100)
- `confidenceScore` : Niveau de confiance par compétence
- `currentProficiency` : Niveau actuel (1-5)
- `demonstratedProficiency` : Niveau démontré (1-5)

### 2. Analyse qualitative
- `strengths` : Points forts identifiés
- `weaknesses` : Points à améliorer
- `generalAssessment` : Évaluation globale
- `technicalLevel` : Niveau technique général

### 3. Plan d'action
- `recommendations` : Conseils d'amélioration spécifiques
- `nextSteps` : Prochaines étapes concrètes
- `improvement` : Indication de la progression

## Bonnes pratiques d'utilisation

1. **Évaluation objective**
   - Se baser sur les réponses réelles
   - Éviter les suppositions
   - Noter précisément les points forts/faibles

2. **Recommandations**
   - Spécifiques et actionnables
   - Basées sur les technologies actuelles
   - Inclure des ressources vérifiées

3. **Analyse des réponses**
   - Évaluer chaque réponse individuellement
   - Justifier les évaluations partielles
   - Fournir des exemples pour les réponses incorrectes

## Exemple d'utilisation

```javascript
const type = "technical";
const skillList = [{
  name: "React",
  proficiencyLevel: 3,
  subcategory: "frontend"
}];
const questions = [{
  question: "Explain React hooks",
  answer: "Hooks are functions that let you use state in functional components"
}];

const systemPrompt = getSystemPrompt(type);
const userPrompt = getUserPrompt(type, skillList, questions);
```

## Conclusion

Ces prompts permettent une évaluation structurée et objective des compétences techniques et comportementales, avec un focus sur :
- La précision de l'évaluation
- Les recommandations actionnables
- Le suivi de la progression
- L'amélioration continue des compétences
