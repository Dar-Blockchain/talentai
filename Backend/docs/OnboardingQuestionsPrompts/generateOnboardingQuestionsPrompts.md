# Explication détaillée du prompt `generateOnboardingQuestionsPrompts`

Ce prompt est conçu pour générer des questions d'entretien oral de haute qualité, adaptées à l'évaluation du niveau de compétence d'un candidat sur une compétence donnée. Il se compose de deux fonctions principales : `getSystemPrompt` et `getUserPrompt`. Voici une explication détaillée de leur fonctionnement et des règles à respecter :

## 1. Objectif général
- Générer un ensemble de questions d'entretien oral, sous forme d'un tableau JSON, permettant d'évaluer différents niveaux de maîtrise d'une compétence (de 1 à 5).
- Les questions doivent être adaptées à un entretien oral (réponse en moins de 2 minutes), réalistes, non génériques, et ne pas demander d'écriture de code.

## 2. Règles strictes de formulation des questions
- **Format** : Retourner uniquement un tableau JSON valide de chaînes de caractères (une question par chaîne).
- **Longueur** : Chaque question doit être une seule phrase, portant sur un seul concept.
- **Structure** :
  - Commencer par un mot interrogatif (What, How, Why, When, Where).
  - Se concentrer sur un aspect précis de la compétence.
- **Interdits** :
  - Pas de questions avec "and", "or", points-virgules, ou plusieurs propositions.
  - Pas de questions demandant plusieurs exemples ou aspects.
  - Pas de questions composées ou génériques.
- **Obligations** :
  - Chaque question doit être spécifique au niveau de compétence visé.
  - Être réaliste et refléter des situations professionnelles.
  - Ne pas se répéter.
  - Ne pas demander d'écrire ou d'implémenter du code.

## 3. Répartition par niveau de compétence
- 1 = Entry-level (débutant)
- 2 = Junior
- 3 = Mid
- 4 = Senior
- 5 = Expert

## 4. Exemples de questions par niveau
### Technique (ex : JavaScript)
- 1 : What does "undefined" mean in JavaScript?
- 2 : What is a JavaScript Promise?
- 3 : How would you organize routes for a REST API?
- 4 : How do you identify performance issues in Node.js?
- 5 : How would you architect APIs for microservices?

### Non-technique (ex : Marketing)
- 1 : What is a buyer persona?
- 2 : How would you analyze competitor social media?
- 3 : How would you design a content marketing strategy?
- 4 : How do you manage brand consistency?
- 5 : How would you re-prioritize marketing mix with budget constraints?

## 5. Fonctionnement des prompts
### `getSystemPrompt(questionsCount)`
- Génère les instructions pour l'IA afin de produire exactement `questionsCount` questions, en respectant toutes les règles ci-dessus.
- Insiste sur le format JSON, l'absence de texte additionnel, et la structure des questions.

### `getUserPrompt(questionsCount, skillName)`
- Précise la compétence (`skillName`) et le nombre de questions à générer.
- Demande 2 questions par niveau de compétence (soit 10 questions au total).
- Rappelle toutes les règles de structure, d'interdits et d'exemples.
- Exige un tableau JSON de chaînes, sans texte additionnel.

## 6. Exemple de sortie attendue
```json
[
  "What is Node.js?",
  "How do you measure marketing campaign success?",
  ...
]
```

## 7. Résumé
Ce prompt permet de générer des questions d'entretien ciblées, structurées et adaptées à chaque niveau de compétence, tout en garantissant la clarté, la spécificité et la pertinence des questions pour un entretien oral.
