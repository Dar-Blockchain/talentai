# Documentation: analyzeProfileAnswers

Description
-----------
La fonction `analyzeProfileAnswers` est un handler Express qui analyse les réponses d'un candidat (technique ou soft) en utilisant l'API Together AI, parse le résultat JSON retourné par le modèle, met à jour le profil utilisateur, crée ou met à jour des `InterviewDetails`, et renvoie un résumé structuré.

Emplacement
-----------
`Backend/services/evaluation/analyzeProfileService.js`

Signature
---------
async function analyzeProfileAnswers(req, res)

Contrat (inputs / outputs)
-------------------------
- Inputs (via `req.body`):
  - type (string): type d'évaluation. Valeurs attendues: `technical`, `soft`, `technicalSkill` (utilisé dans le code). Requis.
  - skill (Array): tableau d'objets skill, chaque objet attend au minimum `{ name: string, proficiencyLevel: number (1-5) }`. Requis.
  - questions (Array): tableau de paires question/answer. Requis.

- Inputs additionnels:
  - `req.user._id` (attendu) — l'ID de l'utilisateur (dans le code présent un id hardcodé est utilisé lors du développement).

- Outputs (HTTP response):
  - 200: { success: true, result } — `result` inclut `timestamp`, `assessmentType`, `skillsAssessed`, `numberOfQuestions`, `analysis`.
  - 400: format de requête invalide ou skills non conformes.
  - 500: erreur serveur.

Format du résultat `analysis`
-----------------------------
`analysis` est un objet avec au minimum les champs:
- overallScore: number
- skillAnalysis: Array of skillAnalysis where each item contains:
  - skillName
  - currentProficiency
  - demonstratedProficiency
  - currentExperienceLevel
  - demonstratedExperienceLevel
  - strengths
  - weaknesses
  - confidenceScore
  - questionAnswerList
  - improvement
  - subcategory
- generalAssessment: string
- recommendations: Array
- technicalLevel: string
- nextSteps: Array

Effets secondaires (side-effects)
---------------------------------
- Appel à Together AI pour obtenir une analyse (streaming). Nécessite `TOGETHER_API_KEY`.
- Parse et validation du JSON retourné par le modèle.
- Mise à jour du profil via `profileService.createOrUpdateProfile`.
- Création / mise à jour d'un `InterviewDetails` (selon le type d'évaluation).
- Pour `soft`: sauvegarde des `softSkills` dans `Profile` et création d'un `InterviewDetails` type HR (nouveau comportement).
- Pour `technical` / `technicalSkill`: merge des skills et sauvegarde, création d'un `InterviewDetails` type SKILL ou POST selon le flux.

Erreurs courantes et comportement de secours
-------------------------------------------
- Si le modèle retourne un JSON malformé, la fonction tente plusieurs stratégies de nettoyage (suppression de blocs de code, remplacement de quotes, suppression de caractères invisibles), et si l'analyse échoue, renvoie un payload partiel (success: true) avec un `analysis` par défaut montrant une évaluation incomplète (overallScore=70 par défaut dans le fallback).
- Si `TOGETHER_API_KEY` est manquant, une erreur 500 est levée.

Exemples d'appel (curl)
-----------------------
```bash
curl -X POST http://localhost:3000/api/evaluation/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "type": "soft",
    "skill": [{"name":"Communication","proficiencyLevel":3}],
    "questions": [{"question":"Give an example","answer":"..."}]
  }'
```

Recommandations pour tests unitaires
-----------------------------------
- Mocker `together.chat.completions.create` pour renvoyer un stream contrôlé (chunks) contenant un JSON valide et vérifier le parsing.
- Tester le fallback en renvoyant du texte non-JSON et vérifier la réponse de secours.
- Mocker `profileService.createOrUpdateProfile` et `InterviewDetails` pour vérifier que la création / mise à jour est appelée avec les bons arguments.

Notes de maintenance
--------------------
- Le code contient beaucoup de logs de debug (`console.log`). Vous pouvez réduire la verbosité ou utiliser un logger (winston) en production.
- Le Handler utilise un ID hardcodé pour le développement (`const id = "68f221b2a2455196ee88fec0"`) — remplacer par `req.user._id` en production.
- Centraliser les prompts dans `Backend/services/evaluation/prompts` (déjà partiellement fait pour d'autres services).

Historique des modifications
----------------------------
- 2025-10-22: Ajout de la sauvegarde `InterviewDetails` pour les soft skills et persistance de l'ID d'entretien dans le `Profile`.

---

Si vous voulez, je peux aussi générer un petit test Mocha/Jest qui couvre le happy path et le fallback JSON malformé. Voulez-vous que je l'ajoute ?
