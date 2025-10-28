# Explication détaillée du prompt `analyzeOnbordingQuestionsPrompts`

Ce prompt est utilisé pour analyser les réponses d'un candidat à des questions d'onboarding (oral, transcrit par IA) et évaluer son niveau de compétence sur une skill donnée. Il structure l'analyse, le scoring, la génération de feedbacks et de recommandations personnalisées.

## 1. Objectif général
- Évaluer la compétence d'un candidat à partir de ses réponses orales (transcrites).
- Générer une analyse complète, un score de confiance, des points forts/faibles, une todoList d'amélioration, et des recommandations actionnables.

## 2. Structure de l'analyse
- **Niveau de compétence démontré** (`demonstratedExperienceLevel` de 0 à 5)
- **Points forts** (`strengths`) et **faiblesses** (`weaknesses`)
- **Score de confiance** (`confidenceScore` de 0 à 100)
- **todoList** : jusqu'à 2 tâches d'amélioration, chacune avec :
	- titre, type (Course, Certification, Project, Article), description, url (optionnelle), priorité (low/medium/high), dueDate (timestamp ms), isCompleted (false)
- **questionAnswerList** : tableau de paires question/réponse, avec :
	- question, answer, status ("correct", "partial_correct", "incorrect"), exampleCorrectAnswer (si incorrect)
	- Si "partial_correct", ajouter partialCorrectPercentage (60-70) et partialCorrectReason

## 3. Règles d'évaluation des réponses
- **correct** : réponse complète et précise
- **partial_correct** : réponse environ 60-70% correcte (concept juste mais détails manquants, exemples absents, etc.)
	- Ajouter partialCorrectPercentage (ex : 65) et partialCorrectReason (ex : "manque d'exemple concret")
- **incorrect** : réponse fausse, vague ou hors sujet
	- Fournir exampleCorrectAnswer pour guider l'amélioration

## 4. Pondération et calcul du confidenceScore
- 10 questions, réparties par niveau (2 par niveau, du 1 au 5)
- Pondération croissante selon le niveau :
	- Q1-Q2 (Entry) : poids 1 (+3.33% chacune)
	- Q3-Q4 (Junior) : poids 2 (+6.67% chacune)
	- Q5-Q6 (Mid) : poids 3 (+10% chacune)
	- Q7-Q8 (Senior) : poids 4 (+13.33% chacune)
	- Q9-Q10 (Expert) : poids 5 (+16.67% chacune)
- **Réponse partielle** : score proportionnel (ex : 65% correct → 0.65 × poids)
- **Réponse incorrecte/absente** : 0%
- **confidenceScore** = somme des contributions (max 100%)

## 5. todoList (plan d'amélioration)
- Maximum 2 tâches, chacune unique et pertinente
- Priorité : "low", "medium" ou "high"
- dueDate réaliste selon le type :
	- Project/Certification : ≥ 2-3 semaines
	- Course : ≥ 1 semaine
	- Article : ≥ 2-3 jours
	- Jamais dans le passé
- Chaque tâche doit apporter une vraie valeur ajoutée
- Lien externe valide si possible

## 6. Recommandations
- Minimum 2 conseils actionnables, concrets et à jour
- Au moins 1 ressource externe (doc, cours, guide, etc.)
- Pas de conseils vagues
- Exemples :
	- "Adoptez React Server Components pour améliorer la performance... https://react.dev/reference/react-server/components"
	- "Utilisez TypeScript 5.x pour renforcer la sécurité de typage... https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html"

## 7. Exigences strictes
- Objectivité : se baser uniquement sur les réponses fournies ou clairement déductibles
- Ne pas supposer de connaissances non démontrées
- Prendre en compte les erreurs de transcription possibles
- Interpréter le sens uniquement si clairement inférable
- Répondre **exclusivement** en JSON valide, sans texte additionnel

## 8. Exemple de format de sortie JSON
```json
{
	"overallScore": 87,
	"technicalLevel": "Mid Level",
	"generalAssassment": "Le candidat maîtrise les concepts intermédiaires mais doit approfondir les aspects avancés.",
	"recommendations": [
		"Approfondir la gestion des erreurs en Node.js avec ce guide: https://nodejs.dev/learn/error-handling-in-nodejs",
		"Suivre le cours avancé sur la conception d'API REST."
	],
	"nextSteps": [
		"Compléter un projet Node.js avec gestion avancée des erreurs.",
		"Lire la documentation officielle sur les middlewares."
	],
	"skillAnalysis": [
		{
			"skillName": "Node.js",
			"requiredLevel": 4,
			"demonstratedExperienceLevel": 3,
			"strengths": ["Bonne compréhension des bases"],
			"weaknesses": ["Manque d'exemples concrets sur la scalabilité"],
			"confidenceScore": 87,
			"todoList": {
				"title": "Node.js",
				"type": "Skill",
				"tasks": [
					{
						"title": "Projet Node.js avancé",
						"type": "Project",
						"description": "Développer une API REST complète avec gestion des erreurs avancée.",
						"url": "https://nodejs.dev/learn/error-handling-in-nodejs",
						"priority": "high",
						"dueDate": 1730000000000,
						"isCompleted": false
					}
				]
			},
			"questionAnswerList": [
				{
					"question": "How do you handle errors in Node.js?",
					"answer": "J'utilise try/catch et les middlewares d'erreur.",
					"status": "partial_correct",
					"partialCorrectPercentage": 65,
					"partialCorrectReason": "Manque d'exemple sur la gestion asynchrone."
				},
				{
					"question": "What is a middleware?",
					"answer": "C'est une fonction qui traite les requêtes.",
					"status": "correct"
				}
			]
		}
	]
}
```

---

Ce prompt permet donc une évaluation fine, objective et structurée des compétences, avec un scoring pondéré, des feedbacks personnalisés et des plans d'amélioration concrets, le tout dans un format JSON strictement exploitable par une application ou un système d'analyse automatisé.

