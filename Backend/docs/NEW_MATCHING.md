# Documentation — New Matching

## Vue d'ensemble

Ce document décrit le fonctionnement du controller `NewMatchingController` et de la fonction `calculateSkillMatchScore` utilisée pour évaluer la correspondance entre les compétences requises d'une annonce et celles d'un candidat.

- Fichiers :
  - `Backend/controllers/NewMatchingController.js`
  - `Backend/services/newMatchingService.js` (exporte `calculateSkillMatchScore`)

---

## NewMatchingController

### But

Trouver et classer les candidats pertinents pour une annonce d'emploi en se basant sur la correspondance des compétences (skills) entre l'annonce et les profils candidats, puis renvoyer une liste triée de correspondances avec des informations complémentaires (nom, score, offre finale, entreprise, skills appariés).

### Points d'entrée

- Route attendue : GET /api/matching/job/:jobPostId (exemple)
- Paramètre de route : `jobPostId` (ObjectId Mongo)

### Dépendances

- `calculateSkillMatchScore` (service)
- Modèles Mongoose : `PostModel` (alias `JobPost`) et `ProfileModel` (alias `Profile`)

### Contrat (entrées / sorties)

Entrée :
- `jobPostId` en paramètre de route

Sortie (JSON) :
- Succès (200) :
  ```json
  {
    "success": true,
    "jobTitle": "string",
    "matches": [
      {
        "candidateId": Object,
        "name": "string",
        "score": number,
        "finalBid": number|null,
        "biddingCompany": string|null,
        "matchedSkills": Array,
        "requiredSkills": Array
      }
    ],
    "count": number
  }
  ```
- Erreurs :
  - 404 : `{ error: "Job post not found" }`
  - 400 : `{ error: "Job post has no skill analysis data" }`
  - 500 : `{ error: "Matching failed", details, stack? }`

### Algorithme

1. Récupère tous les profils de type `Candidate` :
   - populate `userId` (username, email)
   - populate `companyBid.company` (username, email)
   - select `userId skills companyDetails.name companyBid`
   - `.lean()` pour optimiser
2. Récupère l'annonce via `JobPost.findById(jobPostId)` et sélectionne `skillAnalysis.requiredSkills` et `jobDetails.title`.
3. Valide la présence de `skillAnalysis`.
4. Normalise `requiredSkills` (filtre null et normalise les noms via `normalizeSkillName`).
5. Pour chaque candidat :
   - Ignore si pas de `userId`.
   - Normalise ses `skills` (filtre null, normalise noms).
   - Calcule `score` via `calculateSkillMatchScore(requiredSkills, candidateSkills)`.
   - Construit l'objet match contenant candidateId, name, score, finalBid, biddingCompany, matchedSkills, requiredSkills.
6. Filtre les matches null et ceux avec score <= 0.
7. Trie les matches par score décroissant.
8. Renvoie JSON avec jobTitle, matches et count.

### Fonction utilitaire

`normalizeSkillName(name)` :
- Défensive : retourne "" si falsy
- Coupe sur le premier "." et garde la première partie
- Trim et capitalise la première lettre, minuscules pour le reste
- Exemple : `react.js` -> `React`

### Cas d'erreurs et protections

- 404 si l'annonce n'existe pas.
- 400 si `skillAnalysis` absent.
- Filtrage robuste contre `null/undefined` pour `skills` et `userId`.
- Si `requiredSkills` vide, la fonction de scoring renverra 0.

### Tests suggérés

- Mock `Profile.find()` et `JobPost.findById()` pour tester :
  - 404 si annonce manquante
  - 400 si skillAnalysis absent
  - Ignorer candidats sans userId
  - Tri et filtrage correct
  - Intégration avec `calculateSkillMatchScore` (peut être mockée)

### Améliorations possibles

- Factoriser `normalizeSkillName` dans un util commun.
- Ajouter pagination et seuil minimal de score.
- Supporter poids par compétence.
- Logging détaillé pour debugging.

---

## calculateSkillMatchScore (Backend/services/newMatchingService.js)

### But

Calculer un score de correspondance entre les compétences requises d'un poste (`jobSkills`) et les compétences confirmées d'un candidat (`candidateSkills`). Le score final est une moyenne des scores individuels par compétence, exprimée sur 100 et arrondie à une décimale.

### Contrat

Entrées :
- `jobSkills`: Array d'objets { name: string, level: number }
- `candidateSkills`: Array d'objets { name: string, Levelconfirmed: number }

Sortie :
- number (score entre 0 et 100, arrondi à 1 décimale). Retourne 0 en cas d'entrée invalide ou d'aucune correspondance.

### Algorithme détaillé

1. Vérifie que `jobSkills` et `candidateSkills` sont des arrays.
2. Pour chaque `jobSkill` :
   - Normalise le nom (`normalizeSkillName`).
   - Convertit `jobSkill.level` en Number (fallback 0).
   - Cherche un `candidateSkill` correspondant par nom normalisé.
   - Si trouvé et `Levelconfirmed` non null :
     - Convertit `Levelconfirmed` en Number (fallback 0).
     - diff = |jobLevel - candidateLevel|
     - skillScore = max(0, ((5 - diff) / 5) * 100)
     - totalScore += skillScore; skillCount++
3. Si skillCount === 0 => retourne 0.
4. averageScore = totalScore / skillCount
5. Retourne averageScore arrondi à 1 décimale.

### Hypothèses

- L'échelle des niveaux est 0..5. Si ce n'est pas le cas, adapter la formule.
- La propriété candidat se nomme `Levelconfirmed` (sensible à la casse).

### Complexité

- Temps : O(J * C) (J = jobSkills.length, C = candidateSkills.length). Recommandation : utiliser une Map sur `candidateSkills` pour O(J + C).
- Mémoire : O(1) additionnel (ou O(J+C) si on construit une Map).

### Exemples

- jobSkills = [{ name: "Javascript", level: 4 }]
  candidateSkills = [{ name: "javascript", Levelconfirmed: 4 }]
  => score = 100.0

- jobSkills = [{ name: "React", level: 5 }]
  candidateSkills = [{ name: "react", Levelconfirmed: 3 }]
  => diff=2 => skillScore=60 => score = 60.0

- jobSkills = [{ name: "Go", level: 3 }]
  candidateSkills = []
  => score = 0

### Tests unitaires suggérés (Jest)

- Cas standard (happy path) : 2 skills correspondantes => score attendu
- Aucun match : retourne 0
- Input invalide (non-array) : retourne 0
- Normalisation des noms valable
- Levelconfirmed null => compétence ignorée

### Suggestions d'amélioration

- Ajouter un paramètre `maxLevel` ou détecter l'échelle automatiquement.
- Accepter `weight` par jobSkill pour pondérer la moyenne.
- Renvoyer un breakdown: { totalScore, perSkill: [{ name, score }] } pour l'UI.
- Optimiser en mapant `candidateSkills` par nom normalisé.

---

## Exemples de test (rapide)

### Jest - calculateSkillMatchScore

```js
const { calculateSkillMatchScore } = require('../newMatchingService');

test('basic match returns 100', () => {
  const job = [{ name: 'Javascript', level: 4 }];
  const cand = [{ name: 'javascript', Levelconfirmed: 4 }];
  expect(calculateSkillMatchScore(job, cand)).toBe(100.0);
});
```

### Integration - NewMatchingController (schéma)

- Mock `Profile.find()` pour retourner 2 candidats : un valide, un sans `userId`.
- Mock `JobPost.findById()` pour retourner un job avec `skillAnalysis.requiredSkills`.
- Appeler `matchCandidatesToJob` et vérifier la réponse JSON.

---

## Fichiers suggérés

- `Backend/docs/NEW_MATCHING.md` (this file)
- `Backend/services/__tests__/newMatchingService.test.js` (tests unitaires)
- `Backend/controllers/__tests__/NewMatchingController.test.js` (tests controller)

---

## Notes finales

Si vous souhaitez, je peux :
- ajouter les fichiers de tests Jest et les exécuter localement,
- optimiser `calculateSkillMatchScore` (utilisation d'une Map) et ajouter un breakdown,
- ou extraire `normalizeSkillName` dans un util commun et l'importer depuis le controller et le service.

Indiquez la suite que vous préférez.
