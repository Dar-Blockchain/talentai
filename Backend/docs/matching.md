# Documentation — Matching (TalentAI)

Ce document décrit en détail le composant de matching : architecture, algorithme, configuration, endpoints, modèles et recommandations pour l'exploitation et l'amélioration.

**Fichiers sources principaux**
- `Backend/controllers/MatchingController/matchingController.js`
- `Backend/controllers/MatchingController/MatchingConfigController.js`
- `Backend/services/MatchingService/matchingService.js`
- `Backend/services/MatchingService/matchingConfigService.js`
- `Backend/models/MatchingConfigModel.js`
- `Backend/models/PostModel.js`
- `Backend/models/ProfileModel.js`

--------------------------------------------------------------------------------

## 1. Objectif du module

Le matching cherche à associer des candidats aux offres (posts) en utilisant :
- compétences techniques / hard skills
- soft skills
- expérience
- attentes salariales
- préférences de travail (remote/hybrid/on-site)
- type de contrat

Le module calcule un score pondéré (0-100+) pour chaque candidat et renvoie une liste triée.

--------------------------------------------------------------------------------

## 2. Architecture et flux

1. Le contrôleur `matchCandidatesToJob` (endpoint) :
   - charge la configuration `MatchingConfig` (via `getMatchingConfig`) une seule fois par requête;
   - récupère la liste des candidats (projection ciblée pour minimiser I/O);
   - récupère le `JobPost` (compétences requises et jobDetails);
   - récupère les enregistrements d'unlock (débloqués) en une seule requête pour améliorer les performances;
   - calcule le score pour chaque candidat via `calculateMatchScore` en parallèle (`Promise.all`);
   - filtre, trie et renvoie la réponse JSON.

2. `calculateMatchScore` (service) : calcule les sous-scores (hard skills, soft skills, expérience, salaire, workMode, contract) puis combine avec les poids provenant de `MatchingConfig`.

3. `MatchingConfig` (modèle) : document qui contient les `weights` et `exchangeRates` (conversion monétaire), et peut être associé à un `Post`.

--------------------------------------------------------------------------------

## 3. Détails de l'algorithme

Le calcul est divisé en sous-fonctions :

- `calculateHardSkillsScore(jobSkills, candidateSkills, MAX, candidateProfile)`
  - Normalise les noms (clé interne) et construit une map candidate pour accès O(1).
  - Pour chaque skill requise : calcule un ratio candidateLvl/jobLvl, borne à 100, pondère par `percentage` du skill, puis normalise sur `MAX`.
  - Si aucun hard skill trouvé → score global = 0 (filtre fort pour pertinence).

- `calculateSoftSkillsScore(jobSoft, candSoft, MAX, candidateProfile)`
  - Compare par clé normalisée et compte les correspondances;
  - Score proportionnel au taux de match sur la liste soft skills du job.

- `calculateExperienceScore(jobSkills, candidateSkills, MAX, candidateProfile)`
  - Pour chaque skill, attribue 10 (satisfait ou supérieur), 5 (à -1), 0 sinon;
  - Moyenne sur les skills, convertie à l'échelle `MAX`.

- `calculateSalaryScore(jobDetails, candProf, RATES, MAX)`
  - Convertit salaires selon `exchangeRates` (par défaut `MatchingConfig.exchangeRates`);
  - Si pas de chevauchement, calcule un ratio pénalisé; sinon score maximal partiel;

- `calculateWorkModeScore` et `calculateContractScore` : comparaisons directes avec score binaire ou demi-score.

Combinaison finale : somme des sous-scores puis arrondi. Le service renvoie `{ score, unlocked }`.

--------------------------------------------------------------------------------

## 4. Configuration & tuning

- `MatchingConfig.weights` (exemple dans `MatchingConfigModel`):
  - `hardSkill` (ex: 40)
  - `experience` (ex: 30)
  - `SoftSkill` (ex: 10)
  - `salary` (ex: 5)
  - `workMode` (ex: 7.5)
  - `contract` (ex: 7.5)

- `MatchingConfig.exchangeRates` : map de conversion monétaire (ex: { USD:1, EUR:1.1, TND:0.32 }).

Recommandations pour tuning :
- Augmenter `hardSkill` si priorité sur compétences techniques.
- Augmenter `salary` si l'adéquation salariale est critique pour le matching.
- Ajuster `experience` pour métiers où l'expérience prime.

Il est conseillé d'utiliser A/B tests sur un sous-ensemble d'offres en production pour valider l'impact des poids.

--------------------------------------------------------------------------------

## 5. Endpoints et usage

- Endpoint principal (exposé via routes) : `GET /matching?jobPostId=<id>` ou `POST /matching/:jobPostId/match` selon configuration router.
- Contrôleur utilisé : `matchCandidatesToJob` dans `matchingController.js`.

Requête minimale :
```
GET /matching/:jobPostId
Authorization: Bearer <JWT>
```

Réponse :
```
{
  success: true,
  jobTitle: 'Senior Backend Dev',
  matches: [ { candidateId, name, email, score, unlocked, matchedSkills, requiredSkills, ... }, ... ],
  count: 12
}
```

--------------------------------------------------------------------------------

## 6. Modèles & schémas

- `MatchingConfig` (`MatchingConfigModel.js`) : contient `weights`, `exchangeRates`, `updatedBy`, `job`.
- `Post` (`PostModel.js`) : `jobDetails`, `skillAnalysis` (requiredSkills, suggestedSkills), référence optionnelle `MatchingConfig`.
- `Profile` (`ProfileModel.js`) : `skills`, `softSkills`, `expectedSalary`, `workModePreference`, `preferredContractType`, `companyBid`.

Notes :
- Les schémas garantissent validations (ex: pour `percentage` des skills) — la présence de ces validations facilite la robustesse du matching.

--------------------------------------------------------------------------------

## 7. Performance & optimisation

- Récupérations optimisées : le contrôleur projette uniquement les champs nécessaires des `Profile` pour réduire la charge réseau et mémoire.
- Regroupement : les enregistrements `UnlockCandidate` sont chargés en une seule requête et convertis en `Set` pour lookup O(1).
- Parallelisme : `Promise.all` pour exécuter `calculateMatchScore` en parallèle (attention à la mémoire CPU si la liste est très grande).

Recommandations d'amélioration :
- Pagination & batch processing : traiter les candidats par lot (ex: batch de 500) pour offres avec >10k candidats.
- Worker queue (Bull + Redis) : déporter matching en tâche asynchrone avec priorités.
- Cache : mettre en cache le `jobSkills` et `MatchingConfig` (Redis) pour éviter lectures répétées.
- Profiler : instrumenter le service pour mesurer latence par candidat et taux d'erreur.

--------------------------------------------------------------------------------

## 8. Tests & validation

- Tests unitaires :
  - `calculateHardSkillsScore`, `calculateSoftSkillsScore`, `calculateExperienceScore`, `calculateSalaryScore` doivent posséder des tests unitaires couvrant cas limites;
  - tests pour normalisation des skills et cas d'absence de données.

- Tests d'intégration :
  - exécuter matching complet sur des fixtures (Post + 100 Profiles) et vérifier distribution de scores.

- Monitoring en production :
  - exposer métriques (nombre de matches, latence moyenne, % de scores > seuil) et alertes pour erreurs 5xx.

--------------------------------------------------------------------------------

## 9. Sécurité & conformité

- S'assurer que l'endpoint vérifie `req.user` (auth JWT) et que la société n'accède qu'aux candidats autorisés.
- Ne pas exposer d'informations sensibles (clefs, private tokens) dans la réponse.

--------------------------------------------------------------------------------

## 10. Exemples et snippets

Exemple de `MatchingConfig` JSON :

```
{
  "name": "default",
  "weights": {
    "hardSkill": 45,
    "experience": 30,
    "SoftSkill": 10,
    "salary": 5,
    "workMode": 5,
    "contract": 5
  },
  "exchangeRates": { "USD": 1, "EUR": 1.1 }
}
```

Exemple d'appel cURL :

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://api.example.com/matching/1234567890"
```

--------------------------------------------------------------------------------

## 11. Limitations connues

- Le calcul actuel retourne `score === 0` si aucun hard skill n'est trouvé — ceci est volontaire pour réduire faux positifs, mais peut exclure des profils avec compétences transférables.
- Pas de gestion fine des gaps d'expérience (actuellement discret : 10/5/0).

--------------------------------------------------------------------------------

## 12. Améliorations proposées

1. Ajout d'un matching vectoriel (embeddings) pour capter compétences proches et similarité sémantique.
2. Pipeline asynchrone pour matching de masse (workers, files, backpressure).
3. Dashboard d'audit pour visualiser pourquoi un candidat a obtenu un score (breakdown des sous-scores).
4. A/B testing des poids et apprentissage automatique pour ajuster les poids en fonction des hires réels.

--------------------------------------------------------------------------------

Document créé automatiquement — je peux aussi :
- générer des fixtures de test et un script pour exécuter le matching sur N candidats;
- produire un diagramme de séquence Mermaid pour le flow complet de matching.
