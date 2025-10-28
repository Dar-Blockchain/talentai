# Documentation des Prompts de Génération de Questions Techniques    

Ce document explique les deux prompts utilisés pour générer des questions techniques d'entretien : `targetedPrompt` et `mixedPrompt`.

## Vue d'ensemble

Ces prompts sont conçus pour générer des questions d'entretien technique qui :
- Sont basées sur des scénarios réels
- Évaluent la réflexion et la prise de décision
- Sont répondables oralement (pas de codage en direct)
- Simulent des défis professionnels réels

## 1. `targetedPrompt(skill, experienceLevel, proficiencyLevel)`

### Objectif
Générer des questions techniques ciblées pour une compétence spécifique, en tenant compte du niveau d'expérience et du niveau de maîtrise requis.

### Paramètres
- `skill` : La compétence technique à évaluer
- `experienceLevel` : Le niveau d'expérience du candidat
- `proficiencyLevel` : Le niveau de maîtrise requis (1-5)

### Fonctionnement
- Génère **exactement 10 questions**
- Adapte la difficulté selon le niveau de maîtrise :
  - **Niveaux 1-2** : Questions théoriques et fondamentales
  - **Niveaux 3-5** : Questions situationnelles et pratiques

### Format des questions
- Questions basées sur des scénarios réels
- Focus sur la prise de décision
- Évaluation des meilleures pratiques
- Réflexion sur l'expérience et les pièges courants

## 2. `mixedPrompt(skill)`

### Objectif
Générer un ensemble diversifié de questions couvrant tous les niveaux de difficulté pour une compétence donnée.

### Paramètres
- `skill` : La compétence technique à évaluer

### Fonctionnement
- Génère **exactement 10 questions**, réparties équitablement :
  - 2 questions niveau 1 (contexte simple)
  - 2 questions niveau 2 (résolution de problèmes basique)
  - 2 questions niveau 3 (scénarios intermédiaires)
  - 2 questions niveau 4 (problèmes complexes)
  - 2 questions niveau 5 (décisions expertes)

### Format des questions
- Toutes les questions sont situationnelles
- Accent sur la connaissance appliquée
- Basées sur des projets réels
- Répondables oralement uniquement

## Différences clés entre les deux prompts

| Aspect | `targetedPrompt` | `mixedPrompt` |
|--------|-----------------|---------------|
| **Paramètres** | 3 (skill, experienceLevel, proficiencyLevel) | 1 (skill) |
| **Ciblage** | Adapté à un niveau spécifique | Couvre tous les niveaux |
| **Distribution** | Selon le niveau de maîtrise requis | Distribution fixe (2 questions par niveau) |
| **Flexibilité** | Plus flexible, adapte le contenu au niveau | Structure rigide, mais complète |
| **Cas d'utilisation** | Évaluation ciblée d'un niveau précis | Évaluation globale des compétences |

## Format de sortie

Les deux prompts retournent un tableau JSON de chaînes de caractères :

```json
[
  "Question 1?",
  "Question 2?",
  ...
  "Question 10?"
]
```

## Cas d'utilisation recommandés

### `targetedPrompt`
- Évaluation pour un poste avec un niveau requis spécifique
- Tests techniques ciblés
- Évaluation de progression de carrière

### `mixedPrompt`
- Évaluation initiale des compétences
- Cartographie complète des connaissances
- Identification du niveau optimal d'un candidat

## Bonnes pratiques

1. **Pour les deux prompts** :
   - Ne pas demander de code écrit
   - Favoriser les questions de réflexion
   - Se concentrer sur les scénarios réels

2. **Pour `targetedPrompt`** :
   - Bien définir le niveau d'expérience requis
   - Adapter les scénarios au niveau ciblé
   - Utiliser pour des évaluations spécifiques

3. **Pour `mixedPrompt`** :
   - Utiliser pour une première évaluation
   - Exploiter la progression des niveaux
   - Identifier les points forts et faibles

## Conclusion

Les deux prompts offrent des approches complémentaires pour l'évaluation technique :
- `targetedPrompt` pour une évaluation précise à un niveau donné
- `mixedPrompt` pour une évaluation complète sur tous les niveaux

Le choix dépendra du contexte d'évaluation et des objectifs spécifiques du processus de recrutement ou d'évaluation.