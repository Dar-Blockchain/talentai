require("dotenv").config();
const { Together } = require("together-ai");
const together = new Together({ apiKey: process.env.TOGETHER_API_KEY });

const { HttpError } = require("../../utils/httpUtils");
const { SKILL_TYPES } = require("../../constants/profileConstants");
const { INTERVIEW_TYPES } = require("../../constants/interviewDetailsConstants");

const profileService = require("../profileService");
const Profile = require("../../models/ProfileModel");
const InterviewDetails = require("../../models/InterviewDetailsModel");

const {
  saveInterviewDetailsForAddSkill,
} = require("../../utils/evaluationUtils");

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

async function analyzeProfileAnswers(req, res) {
  try {
    // 1. Validate request body
    const { type, skill, questions } = req.body;
   // const id = req.user._id;
    const id = "68f221b2a2455196ee88fec0";

    if (!type || !Array.isArray(skill) || !Array.isArray(questions)) {
      return res.status(400).json({
        error: "Invalid request format",
        required: {
          type: "Type of assessment (e.g., 'technical')",
          skill:
            "Array of skill objects with name and proficiencyLevel (and optional subcategory)",
          questions: "Array of question-answer pairs",
        },
      });
    }

    // Validate skill objects - allow optional subcategory for soft skills
    const isValidSkill = skill.every(
      (s) =>
        s.name &&
        typeof s.name === "string" &&
        typeof s.proficiencyLevel === "number" &&
        s.proficiencyLevel >= 1 &&
        s.proficiencyLevel <= 5
    );

    if (!isValidSkill) {
      return res.status(400).json({
        error: "Invalid skill format",
        message:
          "Each skill must have a name (string) and proficiencyLevel (number 1-5)",
      });
    }

    // Build a map for skillName -> subcategory (for soft skills)
    const skillSubcategories = {};
    skill.forEach((s) => {
      if (s.name && s.subcategory) {
        skillSubcategories[s.name] = s.subcategory;
      }
    });

    // 2. Prepare the data for GPT analysis
    const prompt = `
As an expert ${type} interviewer, analyze the following assessment:

Assessment Type: ${type}
Skills being assessed: 
${skill
      .map(
        (s) =>
          `- ${s.name} (Current Proficiency Level: ${s.proficiencyLevel}/5${
            s.subcategory ? `, Subcategory: ${s.subcategory}` : ""
          })`
      )
      .join("\n")}

Questions and Answers:
${questions.map((qa) => `Q: ${qa.question}\nA: ${qa.answer}`).join("\n\n")}

Based on this ${type} assessment, provide a detailed analysis in the following JSON format ONLY (no additional text):
{
  "overallScore": 85,
  "skillAnalysis": [
    {
      "skillName": "Teamwork",
      "currentProficiency": 3,
      "demonstratedProficiency": 4,
      "strengths": ["Good communication"],
      "weaknesses": ["Needs improvement in conflict resolution"],
      "confidenceScore": 80,
      "improvement": "increased",
      "subcategory": "conflict-resolution",  // optional, if applicable
      "questionAnswerList": [
        {
          "question": string,
          "answer": string,
          "status": "correct" | "partial_correct" | "incorrect",
          "exampleCorrectAnswer": string (optional, only if status is "incorrect")
        }
      ]
    },
  ],
  "generalAssessment": "Strong foundational knowledge with some areas for improvement",
  "recommendations": [
    "Focus on advanced communication techniques",
    "Practice conflict management"
  ],
  "technicalLevel": "intermediate",
  "nextSteps": [
    "Suggested learning resources",
    "Practice projects to undertake"
  ],
  "assessmentType": "${type}",
  "evaluationContext": "Based on ${type} interview standards"
}`;

    const response = await together.chat.completions.create({
      model: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
      messages: [
        {
          role: "system",
          content: `You are an expert ${type} interviewer specializing in evaluating developer skills. 
Analyze both the answers and the progression from their current proficiency levels.
Provide detailed, actionable feedback in JSON format only.

#STRICT REQUIREMENTS FOR RECOMMENDATIONS:
 "recommendations": (array of strings, required):  
 -must be an array of strings.
 -Provide at least **two specific, actionable improvement tips** for the technology's use in this project.  
 - Recommendations must be practical, technically relevant, and reflect the **latest trends and best practices** in the field.
 - At least **one external resource** (doc, course, guide, etc.) per technology is required, and it should be up-to-date and reputable.
 - **Do not provide vague advice.**  
 - Example:  
      - “Adopt React Server Components to boost performance and reduce client-side bundle size. Detailed guide and best practices: https://react.dev/reference/react-server/components”
      - “Use TypeScript 5.x to enhance type safety and leverage new language features. Official release notes and migration tips: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html”
`,
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 2500,
      temperature: 0.7,
      stream: true,
    });

    let rawResponse = "";
    for await (const chunk of response) {
      const content = chunk.choices?.[0]?.delta?.content;
      if (content) rawResponse += content;
    }

    // 4. Parse and validate the response
    let analysis;
    try {
      rawResponse = rawResponse.trim();

      let jsonStr = rawResponse;
      const jsonMatch = rawResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }

      jsonStr = jsonStr
        .trim()
        .replace(/[\u200B-\u200D\uFEFF]/g, "") // Remove zero-width spaces
        .replace(/^[^{]*/, "") // Remove any text before the first {
        .replace(/[^}]*$/, ""); // Remove any text after the last }

      try {
        analysis = JSON.parse(jsonStr);
      } catch (firstError) {
        // Attempt to fix common JSON issues
        jsonStr = jsonStr
          .replace(/,(\s*[}\]])/g, "$1") // Remove trailing commas
          .replace(/'/g, '"') // Replace single quotes with double quotes
          .replace(/\n/g, " ") // Remove newlines
          .replace(/\s+/g, " "); // Normalize whitespace

        analysis = JSON.parse(jsonStr);
      }

      if (!analysis || typeof analysis !== "object") {
        throw new Error("Analysis is not an object");
      }

      if (!analysis.skillAnalysis || !Array.isArray(analysis.skillAnalysis)) {
        throw new Error("Missing or invalid skillAnalysis array");
      }

      const requiredFields = [
        "overallScore",
        "skillAnalysis",
        "generalAssessment",
        "recommendations",
      ];
      const missingFields = requiredFields.filter(
        (field) => !(field in analysis)
      );
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
      }

      analysis = {
        overallScore: Number(analysis.overallScore) || 0,
        skillAnalysis: analysis.skillAnalysis.map((skill) => {
          const current = Number(skill.currentProficiency) || 0;
          const rawDemo = Number(skill.demonstratedProficiency) || current;
          const score = Number(skill.confidenceScore) || 0;

          let demo;
          /*if (score > 70) demo = current + 1;
          else if (score >= 50) demo = current;
          else demo = current - 1;*/

          if (score >= 65) demo = current + 1;
          else demo = current;

          demo = Math.min(Math.max(demo, 1), 5);

          return {
            skillName: skill.skillName || skill.skill || "",
            currentProficiency: current,
            demonstratedProficiency: demo,
            currentExperienceLevel: getExperienceLevel(current),
            demonstratedExperienceLevel: getExperienceLevel(demo),
            strengths: Array.isArray(skill.strengths) ? skill.strengths : [],
            weaknesses: Array.isArray(skill.weaknesses) ? skill.weaknesses : [],
            confidenceScore: score,
            questionAnswerList: Array.isArray(skill.questionAnswerList)
              ? skill.questionAnswerList
              : [],
            improvement:
              demo > current
                ? "increased"
                : demo < current
                ? "decreased"
                : "unchanged",
            // Pass subcategory if returned by GPT or fallback to known from front
            subcategory:
              skill.subcategory ||
              skillSubcategories[skill.skillName || skill.skill] ||
              "",
          };
        }),
        generalAssessment: analysis.generalAssessment || "",
        recommendations: Array.isArray(analysis.recommendations)
          ? analysis.recommendations
          : [],
        technicalLevel: analysis.technicalLevel || "intermediate",
        nextSteps: Array.isArray(analysis.nextSteps) ? analysis.nextSteps : [],
        experienceLevels: [
          "Entry Level",
          "Junior",
          "Mid Level",
          "Senior",
          "Expert",
        ],
      };
    } catch (error) {
      console.error("Detailed error in analysis parsing:", error);
      return res.status(200).json({
        success: true,
        result: {
          timestamp: new Date(),
          assessmentType: type,
          skillsAssessed: skill.map((s) => ({
            ...s,
            experienceLevel: getExperienceLevel(s.proficiencyLevel),
          })),
          numberOfQuestions: questions.length,
          analysis: {
            overallScore: 70,
            experienceLevels: [
              "Entry Level",
              "Junior",
              "Mid Level",
              "Senior",
              "Expert",
            ],
            skillAnalysis: skill.map((s) => ({
              skillName: s.name,
              currentProficiency: s.proficiencyLevel,
              demonstratedProficiency: s.proficiencyLevel,
              currentExperienceLevel: getExperienceLevel(s.proficiencyLevel),
              demonstratedExperienceLevel: getExperienceLevel(
                s.proficiencyLevel
              ),
              strengths: ["Assessment incomplete"],
              weaknesses: ["Could not analyze in detail"],
              confidenceScore: 60,
              improvement: "unchanged",
              subcategory: s.subcategory || "",
            })),
            generalAssessment: "Analysis could not be completed fully",
            recommendations: ["Please try the assessment again"],
            technicalLevel: "intermediate",
            nextSteps: ["Retry the assessment"],
          },
        },
      });
    }

    // 5. Add metadata to the response
    const result = {
      timestamp: new Date(),
      assessmentType: type,
      skillsAssessed: skill.map((s) => ({
        ...s,
        experienceLevel: getExperienceLevel(s.proficiencyLevel),
      })),
      numberOfQuestions: questions.length,
      analysis: {
        ...analysis,
        skillProgression: analysis.skillAnalysis.map((skillAnalysis) => {
          const originalSkill = skill.find(
            (s) => s.name === skillAnalysis.skillName
          );
          const currentLevel = originalSkill
            ? originalSkill.proficiencyLevel
            : 1;
          return {
            ...skillAnalysis,
            proficiencyChange:
              skillAnalysis.demonstratedProficiency - currentLevel,
            masteryCategory: getMasteryCategory(skillAnalysis.confidenceScore),
            levelProgression: {
              from: getExperienceLevel(currentLevel),
              to: getExperienceLevel(skillAnalysis.demonstratedProficiency),
              changed: currentLevel !== skillAnalysis.demonstratedProficiency,
            },
          };
        }),
      },
    };

    const existingProfile = await profileService.getProfileByUserId(id);
    const existingSkills = existingProfile.skills || [];

    const { totalSkills, averageScore } = calculateSkillsStats(existingSkills);

    console.log("Nombre total de skills:", totalSkills);
    console.log("Score moyen global:", averageScore);

    // 6. Save profile data based on assessment type
    if (type === "technical") {
      console.log("type", type);
      skillType = SKILL_TYPES.HARD;
      interviewProfile = existingProfile;

      // Merge existing skills with new analysis results.
      // For each existing skill, keep its ScoreTest unless analysis provides a new confidenceScore for that skill.
      const skillMapForMerge = new Map();

      // Seed with existing skills
      (existingSkills || []).forEach((s) => {
        const name = (s.name || s.skill || "").trim();
        if (!name) return;
        skillMapForMerge.set(name, {
          name,
          proficiencyLevel: Number(s.proficiencyLevel) || 1,
          experienceLevel:
            s.experienceLevel ||
            getExperienceLevel(Number(s.proficiencyLevel) || 1),
          ScoreTest: Number(s.ScoreTest) || 0,
          Levelconfirmed: s.Levelconfirmed || 0,
        });
      });

      // Apply analysis updates (override ScoreTest for matching skill names, or add new skill)
      (analysis.skillAnalysis || []).forEach((skill) => {
        const name = (skill.skillName || skill.skill || "").trim();
        if (!name) return;
        const conf = Number(skill.confidenceScore) || 0;
        const demo =
          Number(skill.demonstratedProficiency) ||
          Number(skill.currentProficiency) ||
          1;

        if (skillMapForMerge.has(name)) {
          const prev = skillMapForMerge.get(name);
          prev.ScoreTest = conf;
          prev.proficiencyLevel = demo;
          prev.experienceLevel = getExperienceLevel(demo);
          prev.Levelconfirmed =
            demo === 5 && conf > 75 ? 5 : Math.max(demo - 1, 0);
          skillMapForMerge.set(name, prev);
        } else {
          skillMapForMerge.set(name, {
            name,
            proficiencyLevel: demo,
            experienceLevel: getExperienceLevel(demo),
            ScoreTest: conf,
            Levelconfirmed: demo === 5 && conf > 75 ? 5 : Math.max(demo - 1, 0),
          });
        }
      });

      // Build merged skills array and compute overall average from merged ScoreTest
      const mergedSkillsForProfile = Array.from(
        skillMapForMerge.values()
      ).filter(
        (s) => s.name && typeof s.name === "string" && s.name.trim() !== ""
      );

      const mergedScores = mergedSkillsForProfile.map(
        (s) => Number(s.ScoreTest) || 0
      );
      const mergedCount = mergedScores.length;
      const mergedSum = mergedScores.reduce((acc, n) => acc + n, 0);
      const overallScoreMerged =
        mergedCount > 0 ? Number((mergedSum / mergedCount).toFixed(2)) : 0;

      console.log(
        "Computed overallScoreMerged from merged skills:",
        overallScoreMerged,
        "mergedSkillsCount:",
        mergedCount
      );

      await profileService.createOrUpdateProfile(id, {
        overallScore: overallScoreMerged,
        skills: mergedSkillsForProfile.map((s) => ({
          name: s.name,
          proficiencyLevel: s.proficiencyLevel,
          experienceLevel: s.experienceLevel,
          ScoreTest: s.ScoreTest,
          Levelconfirmed: s.Levelconfirmed,
        })),
      });

      try {
        // 🧩 Récupération des infos principales
        const candidateId = existingProfile._id;
        const skillNames = analysis.skillAnalysis.map((s) => s.skillName);
        const interviewType = INTERVIEW_TYPES.SKILL;

        // 🔍 1️⃣ Recherche de l’interview correspondante
        // On cherche un InterviewDetails du même candidat, de type SKILL,
        // et contenant au moins un skill correspondant (même nom)
        let interview = await InterviewDetails.findOne({
          candidate: candidateId,
          "skillDetails.name": { $in: skillNames },
        }).sort({ updatedAt: -1 });

        // 🧠 2️⃣ Préparation des skillDetails à insérer / mettre à jour
        const skillDetailsData = analysis.skillAnalysis.map((skill) => ({
          name: skill.skillName,
          type: SKILL_TYPES.HARD,
          proficiencyLevel: skill.demonstratedProficiency,
          confidenceScore: skill.confidenceScore,
          questionAnswerList: Array.isArray(skill.questionAnswerList)
            ? skill.questionAnswerList.map((qa) => ({
                question: qa.question,
                answer: qa.answer || "unanswered",
                status: qa.status || "incorrect",
                exampleCorrectAnswer: qa.exampleCorrectAnswer || null,
              }))
            : [],
        }));

        // 🧩 3️⃣ Si une interview correspondante existe → mise à jour
        if (interview) {
          interview.skillDetails = skillDetailsData;
          // Use the overallFromNew computed above (from confidenceScore)
          interview.overallScore = overallScoreMerged;
          interview.recommendations = analysis.recommendations || [];
          await interview.save();
        } else {
          // 🆕 4️⃣ Sinon → création d’une nouvelle interview
          const newInterview = await InterviewDetails.create({
            candidate: candidateId,
            type: interviewType,
            // Persist the overall score computed from new confidenceScore values
            overallScore: overallScoreMerged,
            skillDetails: skillDetailsData,
            recommendations: analysis.recommendations || [],
            questions:
              questions?.map((q) => ({
                question: q.question,
                answer: q.answer,
                status: "pending",
              })) || [],
          });

          // 🧷 Ajout de l’interview au profil
          if (!existingProfile.interviewDetails)
            existingProfile.interviewDetails = [];
          existingProfile.interviewDetails.push(newInterview._id);
          await existingProfile.save();
        }
      } catch (err) {
        console.warn("⚠️ Erreur mise à jour InterviewDetails:", err.message);
      }
    }

    if (type === "soft") {
      skillType = SKILL_TYPES.SOFT;
      const profile = await Profile.findOne({ userId: id });
      interviewProfile = profile;

      const updated = await Profile.findOneAndUpdate(
        { userId: id },
        {
          overallScore: averageScore,
          softSkills: analysis.skillAnalysis.map((s) => ({
            name: s.skillName,
            category: s.subcategory || "",
            experienceLevel: getExperienceLevel(s.demonstratedProficiency),
            ScoreTest: s.confidenceScore,
            Levelconfirmed:
              s.demonstratedProficiency === 5 && s.confidenceScore > 75
                ? 5
                : s.demonstratedProficiency - 1,
          })),
        },
        { new: true }
      );
      console.log("Updated profile softSkills:", updated.softSkills);
    }

    // Après avoir reçu et parsé la réponse brute de GPT en "analysis"
    if (type === "technicalSkill") {
      console.log("=== Début technicalSkill ===");

      // Réutilisation du profil et des skills existants déjà chargés plus haut
      const existingSkillsLocal = Array.isArray(existingSkills)
        ? existingSkills
        : [];

      console.log(
        "Étape A - existingProfile.overallScore:",
        existingProfile.overallScore
      );
      console.log("Étape A - existingSkills:", existingSkills);

      // Utilisation de la fonction utilitaire pour stats
      const { totalSkills: existingTotal, averageScore: existingAverage } =
        calculateSkillsStats(existingSkillsLocal);
      console.log(
        "Étape B - existingTotal:",
        existingTotal,
        "existingAverage:",
        existingAverage
      );

      // Filtrer les skills valides venant de l'analyse GPT
      const validSkills = Array.isArray(analysis.skillAnalysis)
        ? analysis.skillAnalysis.filter((s) => {
            const name = (s.skillName || s.skill || "").trim();
            const score = Number(s.confidenceScore);
            // ✅ Exclure skills sans nom ou sans score valide
            return name !== "" && !isNaN(score) && score > 0;
          })
        : [];
      console.log("Étape C - validSkills filtrées:", validSkills.length);

      // Fonction utilitaire pour convertir score -> proficiency level
      const proficiencyFromConfidenceScore = (score) =>
        [20, 30, 50, 80, 100].findIndex((limit) => score <= limit) + 1 || 1;

      const experienceLevels = [
        "Entry Level",
        "Junior",
        "Mid Level",
        "Senior",
        "Expert",
      ];

      // Map des nouvelles skills analysées
      const newMappedSkills = validSkills
        .map((skill) => {
          const rawName = (skill.skillName || skill.skill || "").trim();
          if (!rawName) return null; // ✅ Ignorer skill vide
          const confScore = Number(skill.confidenceScore) || 0;
          const profLevel = proficiencyFromConfidenceScore(confScore);

          const currentProf = Number(skill.currentProficiency) || 1;
          const demoProf = Number(skill.demonstratedProficiency) || currentProf;

          return {
            name: rawName,
            skillName: rawName,
            currentProficiency: currentProf,
            demonstratedProficiency: demoProf,
            confidenceScore: confScore,
            proficiencyLevel: profLevel,
            experienceLevel:
              experienceLevels[profLevel - 1] || experienceLevels[0],
            strengths: Array.isArray(skill.strengths) ? skill.strengths : [],
            weaknesses: Array.isArray(skill.weaknesses) ? skill.weaknesses : [],
            subcategory: skill.subcategory || "",
            ScoreTest: confScore,
            Levelconfirmed:
              demoProf === 5 && confScore > 75 ? 5 : Math.max(profLevel - 1, 0),
          };
        })
        .filter(Boolean); // ✅ Enlève les null du map
      console.log("Étape D - newMappedSkills filtrées:", newMappedSkills);

      // Calcul des scores existants et nouveaux pour la moyenne combinée
      const existingScores = existingSkillsLocal.map((s) => {
        const v = Number(s.ScoreTest);
        return isNaN(v) ? 0 : v;
      });
      const newScores = newMappedSkills.map((s) => {
        const v = Number(s.ScoreTest);
        return isNaN(v) ? 0 : v;
      });

      console.log("Étape E - existingScores:", existingScores);
      console.log("Étape E - newScores:", newScores);

      const combinedScores = existingScores.concat(newScores);
      const combinedCount = combinedScores.length;
      const combinedSum = combinedScores.reduce((acc, n) => acc + n, 0);
      const combinedAverage =
        combinedCount > 0 ? combinedSum / combinedCount : 0;

      console.log(
        "Étape F - combinedCount:",
        combinedCount,
        "combinedSum:",
        combinedSum,
        "combinedAverage:",
        combinedAverage
      );

      // Merge/Update des skills : on met à jour celles qui existent (par name), sinon on ajoute
      const skillMap = new Map(
        existingSkillsLocal.map((s) => [s.name, { ...s }])
      );

      newMappedSkills.forEach((ns) => {
        const name = ns.name?.trim();
        if (!name) {
          console.warn("⚠️ Skill ignorée car nom vide:", ns);
          return;
        }
        if (skillMap.has(name)) {
          const prev = skillMap.get(name);
          skillMap.set(name, {
            ...prev,
            proficiencyLevel: ns.proficiencyLevel,
            experienceLevel: ns.experienceLevel,
            ScoreTest: ns.ScoreTest,
            Levelconfirmed: ns.Levelconfirmed,
          });
          console.log(`Étape G - Mise à jour skill existante: ${name}`);
        } else {
          skillMap.set(name, {
            name,
            proficiencyLevel: ns.proficiencyLevel,
            experienceLevel: ns.experienceLevel,
            ScoreTest: ns.ScoreTest,
            Levelconfirmed: ns.Levelconfirmed,
            category: ns.subcategory || "",
          });
          console.log(`Étape G - Ajout nouvelle skill: ${name}`);
        }
      });

      const mergedSkills = Array.from(skillMap.values())
        // ✅ Supprime tout objet sans `name` valide
        .filter(
          (s) => s.name && typeof s.name === "string" && s.name.trim() !== ""
        );
      console.log("Étape H - mergedSkills nettoyées:", mergedSkills);

      const overallScore = Number(combinedAverage.toFixed(2));

      // Sauvegarde du profil (overallScore = moyenne combinée)
      const updatedProfilePayload = {
        overallScore: overallScore,
        skills: mergedSkills,
      };
      console.log("Étape I - updatedProfilePayload:", updatedProfilePayload);

      await profileService.createOrUpdateProfile(id, updatedProfilePayload);
      console.log("Étape J - profileService.createOrUpdateProfile terminé");

      // Save interview details et update profile avec interview ID
      const interviewId = await saveInterviewDetailsForAddSkill(
        existingProfile,
        overallScore,
        analysis.skillAnalysis,
        SKILL_TYPES.HARD,
        analysis.recommendations
      );
      console.log("Étape K - interviewId créé:", interviewId);

      // push interviewId dans le profile s'il existe et save
      if (!existingProfile.interviewDetails)
        existingProfile.interviewDetails = [];
      existingProfile.interviewDetails.push(interviewId);
      try {
        await existingProfile.save();
        console.log(
          "Étape L - existingProfile sauvegardé avec interviewDetails"
        );
      } catch (err) {
        console.warn(
          "Étape L - impossible de save() existingProfile (peut être déjà géré par createOrUpdateProfile):",
          err.message
        );
      }

      console.log("=== Fin technicalSkill ===");
    }

    // 7. Return the response
    res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Error analyzing profile answers:", error);
    res.status(500).json({
      success: false,
      error: "Failed to analyze profile",
      details: error.message,
    });
  }
}

module.exports = { analyzeProfileAnswers };
