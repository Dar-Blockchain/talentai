// generateQuestions.js
require("dotenv").config();
const { Together } = require("together-ai");
const together = new Together({ apiKey: process.env.TOGETHER_API_KEY });

const { HttpError } = require("../../../utils/httpUtils");
const { SKILL_TYPES } = require("../../../constants/profileConstants");
const {
  INTERVIEW_TYPES,
} = require("../../../constants/interviewDetailsConstants");

const profileService = require("../../../services/profileService");
const Profile = require("../../../models/ProfileModel");
const InterviewDetails = require("../../../models/InterviewDetailsModel");

const {
  saveInterviewDetailsForAddSkill,
} = require("../../../utils/evaluationUtils");

const techniqueService = require("../../../services/evaluation/techniqueQuestionsService");

exports.generateTechniqueQuestions = async (req, res) => {
  try {
    const { skill, experienceLevel, proficiencyLevel } = req.body;

    const result = await techniqueService.generateTechniqueQuestions({
      skill,
      experienceLevel,
      proficiencyLevel,
      userId: req.user._id,
    });

    res.json(result);
  } catch (error) {
    console.error("Error generating technical questions:", error);
    if (error && error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to generate technical questions" });
  }
};

// Helper function to get experience level from proficiency level
function getExperienceLevel(proficiencyLevel) {
  const levels = ["Entry Level", "Junior", "Mid Level", "Senior", "Expert"];
  return levels[Math.min(Math.max(0, proficiencyLevel - 1), 4)];
}

// Helper function to determine mastery category
function getMasteryCategory(score) {
  if (score >= 90) return "Mastered";
  if (score >= 75) return "Proficient";
  if (score >= 60) return "Competent";
  if (score >= 40) return "Developing";
  return "Novice";
}

/**
 * Calcule le score moyen et le nombre total de compétences
 * @param {Array} skills - Tableau des compétences de l'utilisateur
 * @returns {Object} { totalSkills, averageScore }
 */
function calculateSkillsStats(skills = []) {
  console.log("Étape 1 - Entrée de la fonction:", skills);

  if (!Array.isArray(skills) || skills.length === 0) {
    console.log("Étape 2 - Tableau invalide ou vide");
    return { totalSkills: 0, averageScore: 0 };
  }

  // Nombre total réel de skills
  const totalSkills = skills.length;
  console.log("Étape 3 - Nombre total de skills calculé:", totalSkills);

  // On récupère tous les scores valides (numériques)
  const scores = skills.map((s, index) => {
    const score = Number(s.ScoreTest);
    console.log(
      `Étape 4.${index + 1} - ScoreTest pour la skill ${
        s.name || s.skill || "inconnue"
      }:`,
      score
    );
    return isNaN(score) ? 0 : score;
  });

  console.log("Étape 5 - Liste complète des scores:", scores);

  // Somme totale
  const totalScore = scores.reduce((sum, score) => sum + score, 0);
  console.log("Étape 6 - Somme totale des scores:", totalScore);

  // Moyenne = somme / nombre de skills
  const averageScore = totalScore / totalSkills;
  console.log("Étape 7 - Score moyen calculé:", averageScore);

  const result = { totalSkills, averageScore };
  console.log("Étape 8 - Résultat final:", result);

  return result;
}

const analyzeProfileService = require("../../../services/evaluation/analyzeProfileService");

exports.analyzeProfileAnswers = async (req, res) => {
  return analyzeProfileService.analyzeProfileAnswers(req, res);
};
