require("dotenv").config();
const { Together } = require("together-ai");

function getTogetherClient() {
  const apiKey = process.env.TOGETHER_API_KEY;
  if (!apiKey) {
    throw { status: 500, message: "TOGETHER_API_KEY is not configured on the server" };
  }
  return new Together({ apiKey });
}

const { HttpError } = require("../../utils/httpUtils");
const { SKILL_TYPES } = require("../../constants/profileConstants");
const { INTERVIEW_TYPES } = require("../../constants/interviewDetailsConstants");

const profileService = require("../profileService");
const Profile = require("../../models/ProfileModel");
const InterviewDetails = require("../../models/InterviewDetailsModel");

const {
  saveInterviewDetailsForAddSkill,
} = require("../../utils/evaluationUtils");
// Also use saveInterviewDetails for soft skills (HR)
const { saveInterviewDetails } = require("../../utils/evaluationUtils");

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
    const id = req.user._id;
    //const id = "68f221b2a2455196ee88fec0";

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

    // 2. Prepare the data for GPT analysis (prompts are extracted to helper)
    const { getSystemPrompt, getUserPrompt } = require("../../prompts/Hard_SoftPromptsAnalyse");
    const systemContent = getSystemPrompt(type);
    const userContent = getUserPrompt(type, skill, questions);

  const together = getTogetherClient();
  const response = await together.chat.completions.create({
      model: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
      messages: [
        { role: "system", content: systemContent },
        { role: "user", content: userContent },
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
    /**
     * Bloc de traitement pour les assessments techniques (type === "technical").
     * But :
     *  - fusionner les compétences existantes avec les résultats de l'analyse
     *  - mettre à jour le profil (overallScore + skills)
     *  - créer / mettre à jour un document InterviewDetails lié au candidat
     *
     * Entrées attendues :
     *  - existingProfile (profil récupéré depuis profileService)
     *  - existingSkills (tableau de compétences dans le profil)
     *  - analysis.skillAnalysis (résultats renvoyés par le modèle)
     *
     * Effets secondaires :
     *  - appelle profileService.createOrUpdateProfile
     *  - crée/met à jour InterviewDetails
     *  - modifie existingProfile.interviewDetails
     */
    if (type === "technical") {
      console.log("[technical] Enter technical processing block. type:", type);
      skillType = SKILL_TYPES.HARD;
      interviewProfile = existingProfile;

      // Merge existing skills with new analysis results.
      // For each existing skill, keep its ScoreTest unless analysis provides a new confidenceScore for that skill.
      const skillMapForMerge = new Map();

      // Seed with existing skills
      console.log("[technical] Seeding skillMapForMerge with existing skills count:", (existingSkills || []).length);
      (existingSkills || []).forEach((s, idx) => {
        const name = (s.name || s.skill || "").trim();
        if (!name) {
          console.log(`[technical] Skipping existing skill at index ${idx} because name is empty.`);
          return;
        }
        const seeded = {
          name,
          proficiencyLevel: Number(s.proficiencyLevel) || 1,
          experienceLevel:
            s.experienceLevel || getExperienceLevel(Number(s.proficiencyLevel) || 1),
          ScoreTest: Number(s.ScoreTest) || 0,
          Levelconfirmed: s.Levelconfirmed || 0,
        };
        skillMapForMerge.set(name, seeded);
        console.log(`[technical] Seeded skill '${name}':`, seeded);
      });

      // Apply analysis updates (override ScoreTest for matching skill names, or add new skill)
      console.log("[technical] Applying analysis.skillAnalysis items count:", (analysis.skillAnalysis || []).length);
      (analysis.skillAnalysis || []).forEach((skill, idx) => {
        const name = (skill.skillName || skill.skill || "").trim();
        if (!name) {
          console.log(`[technical] Skipping analysis entry at index ${idx} because skillName is empty.`);
          return;
        }
        const conf = Number(skill.confidenceScore) || 0;
        const demo = Number(skill.demonstratedProficiency) || Number(skill.currentProficiency) || 1;
        console.log(`[technical] Processing analyzed skill '${name}' (index ${idx}) - confidence:${conf}, demonstrated:${demo}`);

        if (skillMapForMerge.has(name)) {
          const prev = skillMapForMerge.get(name);
          console.log(`[technical] Found existing seeded skill '${name}' before update:`, prev);
          prev.ScoreTest = conf;

          // Augmenter les niveaux si ScoreTest > 60
          if (conf > 60) {
            prev.proficiencyLevel = Math.min(prev.proficiencyLevel + 1, 5); // max 5
            prev.Levelconfirmed = Math.min((prev.proficiencyLevel - 1) , 5);
            console.log(`[technical] Updated '${name}' by increment due to confidence (${conf}) -> proficiencyLevel:${prev.proficiencyLevel}, Levelconfirmed:${prev.Levelconfirmed}`);
          } else {
            prev.proficiencyLevel = demo;
            prev.Levelconfirmed = demo === 5 && conf > 75 ? 5 : Math.max(demo - 1, 0);
            console.log(`[technical] Updated '${name}' using demonstrated level -> proficiencyLevel:${prev.proficiencyLevel}, Levelconfirmed:${prev.Levelconfirmed}`);
          }

          prev.experienceLevel = getExperienceLevel(prev.proficiencyLevel);
          skillMapForMerge.set(name, prev);
          console.log(`[technical] Final merged entry for '${name}':`, prev);
        } else {
          let newProf = demo;
          let newLevelConfirmed = demo === 5 && conf > 75 ? 5 : Math.max(demo - 1, 0);

          if (conf > 60) {
            newProf = Math.min(newProf + 1, 5);
            newLevelConfirmed = Math.min(newLevelConfirmed + 1, 5);
            console.log(`[technical] New skill '${name}' boosted due to high confidence (${conf}) -> newProf:${newProf}, newLevelConfirmed:${newLevelConfirmed}`);
          }

          const created = {
            name,
            proficiencyLevel: newProf,
            experienceLevel: getExperienceLevel(newProf),
            ScoreTest: conf,
            Levelconfirmed: newLevelConfirmed,
          };

          skillMapForMerge.set(name, created);
          console.log(`[technical] Added new merged skill '${name}':`, created);
        }
      });

      // Build merged skills array and compute overall average from merged ScoreTest
      const mergedSkillsForProfile = Array.from(skillMapForMerge.values()).filter(
        (s) => s.name && typeof s.name === "string" && s.name.trim() !== ""
      );

      console.log("[technical] Total merged skills count:", mergedSkillsForProfile.length);
      const mergedScores = mergedSkillsForProfile.map((s) => Number(s.ScoreTest) || 0);
      const mergedCount = mergedScores.length;
      const mergedSum = mergedScores.reduce((acc, n) => acc + n, 0);
      const overallScoreMerged = mergedCount > 0 ? Number((mergedSum / mergedCount).toFixed(2)) : 0;

      console.log("[technical] Computed overallScoreMerged from merged skills:", overallScoreMerged, "mergedSkillsCount:", mergedCount, "mergedSum:", mergedSum);

      console.log("[technical] Persisting profile with overallScore and updated skills...");
      
      // S'assurer que Levelconfirmed est toujours proficiencyLevel - 1 pour toutes les skills
      const finalSkills = mergedSkillsForProfile.map(skill => {
        const updatedSkill = {
          ...skill,
          Levelconfirmed: Math.max(0, skill.proficiencyLevel - 1) // Assure que Levelconfirmed ne soit jamais négatif
        };
        console.log(`[technical] Setting Levelconfirmed for skill '${skill.name}':`, {
          proficiencyLevel: skill.proficiencyLevel,
          Levelconfirmed: updatedSkill.Levelconfirmed
        });
        return updatedSkill;
      });

      console.log("[technical] Final skills prepared for profile update:", JSON.stringify(finalSkills, null, 2));
      
      // Utiliser directement le modèle Profile pour assurer la mise à jour de Levelconfirmed
      const pro = await Profile.findOneAndUpdate(
        { userId: id },
        {
          $set: {
            overallScore: overallScoreMerged,
            skills: finalSkills.map((s) => ({
              name: s.name,
              proficiencyLevel: s.proficiencyLevel,
              experienceLevel: s.experienceLevel,
              ScoreTest: s.ScoreTest,
              Levelconfirmed: s.Levelconfirmed,
            }))
          }
        },
        { new: true }
      );
      
      if (!pro) {
        console.error("[technical] Profile not found for update. Creating new profile...");
        pro = await profileService.createOrUpdateProfile(id, {
          overallScore: overallScoreMerged,
          skills: finalSkills.map((s) => ({
            name: s.name,
            proficiencyLevel: s.proficiencyLevel,
            experienceLevel: s.experienceLevel,
            ScoreTest: s.ScoreTest,
            Levelconfirmed: s.Levelconfirmed,
          })),
        });
      }
      console.log("[technical] profileService.createOrUpdateProfile completed for user:", pro);

      try {
        // 🧩 Récupération des infos principales
        const candidateId = existingProfile._id;
        const skillNames = analysis.skillAnalysis.map((s) => s.skillName);
        const interviewType = INTERVIEW_TYPES.SKILL;

        // 🔍 1️⃣ Recherche de l’interview correspondante
        console.log("[technical] Looking for existing InterviewDetails for candidate:", candidateId);
        let interview = await InterviewDetails.findOne({
          candidate: candidateId,
          "skillDetails.name": { $in: skillNames },
        }).sort({ updatedAt: -1 });

        console.log("[technical] InterviewDetails lookup result:", !!interview ? `found (id:${interview._id})` : "not found");

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

        console.debug("[technical] skillDetailsData (sample):", JSON.stringify(skillDetailsData.slice(0, 5), null, 2));
        if (interview) {
          console.log("[technical] Updating existing InterviewDetails (id):", interview._id);
          interview.skillDetails = skillDetailsData;
          // Use the overallFromNew computed above (from confidenceScore)
          interview.overallScore = overallScoreMerged;
          interview.recommendations = analysis.recommendations || [];
          try {
            await interview.save();
            console.log("[technical] InterviewDetails saved (updated) id:", interview._id);
          } catch (errSave) {
            console.error("[technical] Error saving existing InterviewDetails:", errSave && errSave.message ? errSave.message : errSave);
            if (errSave && errSave.errors) console.error("[technical] Validation errors:", errSave.errors);
            throw errSave;
          }
        } else {
          // 🆕 4️⃣ Sinon → création d’une nouvelle interview
          try {
            console.log("[technical] Creating new InterviewDetails for candidate:", candidateId);
            console.debug("[technical] Creating new InterviewDetails with questions sample:", JSON.stringify(questions?.slice(0, 3) || [], null, 2));
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
                  // Use a valid ANSWER_STATUS default ("incorrect") instead of "pending"
                  status: q.status || "incorrect",
                })) || [],
            });

            console.log("[technical] Created InterviewDetails id:", newInterview._id);

            // 🧷 Ajout de l’interview au profil
            if (!existingProfile.interviewDetails) existingProfile.interviewDetails = [];
            existingProfile.interviewDetails.push(newInterview._id);
            await existingProfile.save();
            console.log("[technical] existingProfile updated with new interview id and saved (profile id):", existingProfile._id);
          } catch (errCreate) {
            console.error("[technical] Error creating new InterviewDetails:", errCreate && errCreate.message ? errCreate.message : errCreate);
            if (errCreate && errCreate.errors) console.error("[technical] Validation errors:", errCreate.errors);
            throw errCreate;
          }
        }
      } catch (err) {
        console.warn("⚠️ Erreur mise à jour InterviewDetails:", err && err.message ? err.message : err);
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

      // Save InterviewDetails for soft skills (HR interview)
      try {
        // Use the add-skill saver so InterviewDetails.type === INTERVIEW_TYPES.SKILL
        // and skillDetails.type === SKILL_TYPES.SOFT
        const interviewId = await saveInterviewDetailsForAddSkill(
          profile || updated,
          averageScore,
          analysis.skillAnalysis,
          SKILL_TYPES.SOFT,
          analysis.recommendations || []
        );

        // Attach interview id to profile if possible
        const profileToUpdate = profile || updated;
        if (!profileToUpdate.interviewDetails) profileToUpdate.interviewDetails = [];
        profileToUpdate.interviewDetails.push(interviewId);
        try {
          await profileToUpdate.save();
        } catch (err) {
          // If save fails, log but continue
          console.warn("Could not save profile with soft interview id:", err.message);
        }
      } catch (err) {
        console.warn("Failed to save InterviewDetails for soft skills:", err.message);
      }
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
