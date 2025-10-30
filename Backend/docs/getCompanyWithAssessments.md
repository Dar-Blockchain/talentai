# getCompanyWithAssessments — Documentation

## But
Fournir une documentation complète pour l'endpoint GET `getCompanyWithAssessments` qui renvoie les résultats d'évaluation (`JobAssessmentResult`) agrégés par candidat par job. L'agrégation regroupe toutes les évaluations (steps) existantes pour une paire (candidat, job) et retourne un seul document par candidat+job avec un tableau `steps` contenant : `interviewId`, `timestamp`, `assessmentType`, `numberOfQuestions` et `analysis` (objet complet tel que stocké dans le schéma).

## Emplacement du code
- Contrôleur: `Backend/controllers/profileController.js` — fonction exportée `exports.getCompanyWithAssessments`
- Service: `Backend/services/profileService.js` — fonction `getCompanyProfileWithAssessments` (implémente l'agrégation)

## Route / Auth
- Méthode : GET
- Route (exemple) :
  - GET /api/profile/company/assessments            -> renvoie toutes les évaluations groupées pour la compagnie connectée
  - GET /api/profile/company/assessments/:jobId     -> renvoie les évaluations groupées filtrées pour le jobId donné
- Auth : requiert un utilisateur authentifié (le contrôleur utilise `req.user` et `req.user.profile.id`) ; l'endpoint retourne les assessments pour l'entreprise associée au profil connecté.

> Remarque : adaptez l'URL exacte si votre routing differ (vérifier `routes/` pour le chemin final). Le contrôleur lit `req.user.profile.id` et `req.params.jobId`.

## Contrat (Inputs / Outputs)

Inputs
- Auth via session / JWT (objet `req.user`). Le `profile.id` de l'utilisateur connecté doit être une `Profile` de type `Company`.
- Paramètre optionnel : `jobId` (dans `req.params`) — ObjectId du post/job pour filtrer.

Outputs — Format de réponse JSON (200)
- Objet racine :
  - companyId: ObjectId — id du profil company
  - companyName: string
  - assessments: Array d'objets, chaque objet correspondant à une paire (candidateId, jobId) :
    - candidateId: ObjectId
    - jobId: ObjectId
    - candidateInfo: { name, email, skills, softSkills }
    - jobInfo: { title, description, requirements }
    - assessmentSummary: {
        steps: [
          { interviewId, timestamp, assessmentType, numberOfQuestions, analysis },
          ...
        ],
        latestAssessment: Date,
        totalAssessments: Number,
        averageOverallScore: Number
      }

Errors (exemples)
- 404 — Profil introuvable ou l'utilisateur connecté n'est pas une entreprise.
- 500 — Erreur serveur / erreur lors de l'agrégation.

## Logique d'agrégation (résumé technique)
- Source : collection `JobAssessmentResult`.
- Pipeline principal :
  1. `$match` sur `companyId` (et optionnellement `jobId`).
  2. `$group` par `{ condidateId, jobId }` et `$push` de chaque document dans un tableau `steps` avec les champs : `interviewId`, `timestamp`, `assessmentType`, `numberOfQuestions`, `analysis` (l'objet complet).
  3. Calculs supplémentaires dans le `$group` : `latestAssessment` (max sur timestamp), `totalAssessments` (sum), `averageOverallScore` ($avg : `analysis.overallScore`).
  4. `$lookup` pour récupérer `candidateInfo` depuis `profiles` puis `users` (username/email), et `$lookup` sur `posts` pour `jobInfo`.
  5. `$project` pour restructurer la réponse et exposer `assessmentSummary.steps` (steps fusionnés) et les métriques.

Cette approche retourne exactement une entrée par candidat+job et inclut une propriété `steps` contenant toutes les évaluations (JobAssessmentResult) existantes pour cette paire.

## Exemple de réponse (mock)

```json
{
  "companyId": "650f6a1f9f1a2c0012345678",
  "companyName": "TalentAI",
  "assessments": [
    {
      "candidateId": "6510b2f3a7c3e900abcd1234",
      "jobId": "6520f1a2b3c4567890def123",
      "candidateInfo": {
        "name": "John Doe",
        "email": "john.doe@example.com",
        "skills": [{ "name": "Node.js", "ScoreTest": 85 }],
        "softSkills": [{ "name": "Communication" }]
      },
      "jobInfo": {
        "title": "Senior Backend Developer",
        "description": "Develop APIs",
        "requirements": ["Node.js", "MongoDB"]
      },
      "assessmentSummary": {
        "steps": [
          {
            "interviewId": "60f6f3b1a1b2c3d4e5f67890",
            "timestamp": "2025-10-29T14:23:00.000Z",
            "assessmentType": "job",
            "numberOfQuestions": 12,
            "analysis": {
              "overallScore": 82.5,
              "skillAnalysis": [ /* ... full nested object ... */ ],
              "recommendations": ["Améliorer..."],
              "nextSteps": ["Step 1"]
            }
          },
          {
            "interviewId": "60f7a4c2b2c3d4e5f6a78901",
            "timestamp": "2025-09-10T09:15:00.000Z",
            "assessmentType": "job",
            "numberOfQuestions": 10,
            "analysis": { "overallScore": 78, "skillAnalysis": [ /* ... */ ] }
          }
        ],
        "latestAssessment": "2025-10-29T14:23:00.000Z",
        "totalAssessments": 2,
        "averageOverallScore": 80.25
      }
    }
  ]
}
```

> Note : `analysis` est retourné tel quel — il contient l'objet complet (structures imbriquées `skillAnalysis`, `jobMatch`, `skillProgression`, etc.) tel que défini dans `JobAssessmentResultModel`.

## Recommandations / Indexes MongoDB
- Indexer les champs souvent utilisés pour le match/tri :
  - `{ companyId: 1 }`
  - `{ jobId: 1 }`
  - `{ condidateId: 1 }`
  - `{ timestamp: -1 }` (si tri fréquent par date)

Ceci accélèrera le `$match` et le `$group` sur de grands volumes.

## Cas limites & comportements attendus
- Si une paire (candidate, job) n'a qu'une seule évaluation, `steps` contiendra un seul élément.
- Si `analysis.overallScore` est absent dans certains documents, l'agrégation `$avg` ignore les valeurs nulles — la valeur `averageOverallScore` peut être `null` si aucune valeur numérique n'est présente.
- Si le `jobId` passé est invalide (format non ObjectId), l'API retournera une erreur 500 côté service si une conversion est tentée. Le contrôleur/service actuel crée un ObjectId à partir du paramètre `jobId` dans le pipeline : prévoir un contrôle d'entrée si nécessaire.

## Suggestions de tests unitaires (mocha/jest)
- Test 1 — Récupération basique :
  - Préparer 3 documents `JobAssessmentResult` pour la même paire (candidateA, jobX) et 2 documents pour (candidateB, jobX).
  - Appeler `getCompanyProfileWithAssessments(companyProfileId)`.
  - Vérifier que `assessments` contient 2 objets (candidateA & candidateB) et que pour candidateA `assessmentSummary.steps.length === 3`.

- Test 2 — Filtrage par job :
  - Créer documents pour plusieurs jobs.
  - Appeler `getCompanyProfileWithAssessments(companyProfileId, jobX)`.
  - S'assurer que tous les résultats ont `jobId === jobX`.

- Test 3 — Validation du contenu `steps` :
  - Vérifier que chaque élément de `steps` contient `interviewId`, `timestamp`, `assessmentType`, `numberOfQuestions` et `analysis` complet.

- Test 4 — Calcul de la moyenne :
  - Calculer manuellement la moyenne des `analysis.overallScore` pour un groupe et comparer à `assessmentSummary.averageOverallScore` (utiliser `toBeCloseTo` si float).

- Test 5 — Cas sans `analysis.overallScore` :
  - Vérifier que la moyenne se comporte correctement (null ou calculée selon les documents présents).

- Test d'intégration rapide :
  - Monter une base de test (in-memory MongoDB comme `mongodb-memory-server`), insérer données, appeler l'endpoint via supertest pour vérifier la structure globale.

## Exemple de test Jest (ébauche)
```javascript
test('aggregate steps by candidate and job', async () => {
  // 1) seed JobAssessmentResult documents for company
  // 2) call profileService.getCompanyProfileWithAssessments(companyProfileId)
  const res = await profileService.getCompanyProfileWithAssessments(companyProfileId);
  expect(res.assessments).toBeDefined();
  const first = res.assessments.find(a => a.candidateId.toString() === candidateAId.toString());
  expect(first.assessmentSummary.steps.length).toBe(3);
  expect(typeof first.assessmentSummary.averageOverallScore).toBe('number');
});
```

## Points d'attention / améliorations possibles
- Pagination : si la compagnie a énormément d'évaluations, ajouter pagination ou streaming (limit/skip) au pipeline.
- Projection des champs `analysis` : `analysis` peut être volumineux ; si le frontend n'a pas besoin de tout, limiter les sous-champs renvoyés pour économiser la bande passante.
- Sécurité : vérifier que `req.user` correspond bien à la `company` voulue et que l'utilisateur a le droit de lire ces données.

---

Fichier implémenté : `Backend/docs/getCompanyWithAssessments.md`

Si vous voulez, je peux :
- ajouter un test d'intégration concret dans `Backend/test/` utilisant `mongodb-memory-server`,
- ou ajouter un exemple de route express dans `Backend/routes` si la route exacte n'existe pas encore.

Voulez-vous que j'ajoute aussi un exemple `supertest`/intégration ou que je crée un ticket TODO pour ajouter des index MongoDB recommandés ?
