const InterviewDetails = require("../models/InterviewDetailsModel");
const TodoList = require("../models/todoListModel");
const { SKILL_TYPES, SKILL_LEVELS } = require("../constants/profileConstants");
const { INTERVIEW_TYPES } = require("../constants/interviewDetailsConstants");
const { getExperienceLevelLabel } = require("./skillUtils");

const PROFICIENCY_TO_EXPERIENCE_VALUE = Object.fromEntries(
  Object.values(SKILL_LEVELS).map((level) => [
    level.proficiencyLevel,
    level.experienceLevel,
  ])
);

/**
 * Processes skill analysis data to assign the corresponding demonstratedExperienceLevel
 * based on confidenceScore and requiredLevel.
 */
function processSkillsData(analysis) {
  for (let i = 0; i < analysis.skillAnalysis.length; i++) {
    const skill = analysis.skillAnalysis[i];

    const requiredLevel = parseInt(skill.requiredLevel);
    const confidenceScore = parseFloat(skill.confidenceScore);
    let newLevel = 0;

    if (requiredLevel != 1) {
      if (confidenceScore >= 60) {
        newLevel = requiredLevel;
      } else if (confidenceScore >= 40) {
        newLevel = Math.floor(requiredLevel * 0.7);
      } else if (confidenceScore >= 25) {
        newLevel = Math.floor(requiredLevel * 0.4);
      } else {
        newLevel = 0;
      }
    }

    if (requiredLevel == 1) {
      if (confidenceScore >= 25) {
        newLevel = requiredLevel;
      } else {
        newLevel = 0;
      }
    }

    // Ensure the level is within bounds
    newLevel = Math.min(Math.max(newLevel, 0), requiredLevel);
    // Apply the updated level
    skill.demonstratedExperienceLevel = newLevel;
  }
}

/**
 * Updates existing profile skills if a higher demonstrated level is detected.
 * Only upgrades existing skills (does not add new ones).
 */
function updateUpgradedSkills(userSkills, skillAnalysis) {
  skillAnalysis.forEach((reqSkill) => {
    const skillName = reqSkill.skillName.toLowerCase();
    const profileSkill = userSkills.find(
      (s) => s.name.toLowerCase() === skillName
    );

    const newLevel = parseInt(reqSkill.demonstratedExperienceLevel);
    if (profileSkill && profileSkill.proficiencyLevel < newLevel) {
      profileSkill.proficiencyLevel = newLevel;
      profileSkill.experienceLevel = getExperienceLevelLabel(newLevel);
      profileSkill.ScoreTest = reqSkill.confidenceScore;
      profileSkill.Levelconfirmed = newLevel - 1;
    }
  });
}

/**
 * Adds new skills to the profile if they are not already present
 * and their demonstratedExperienceLevel is greater than 0.
 */
function updateProfileWithNewSkills(profile, skillAnalysis) {
  skillAnalysis.forEach((reqSkill) => {
    const skillName = reqSkill.skillName.toLowerCase();
    const skillLevel = parseInt(reqSkill.demonstratedExperienceLevel);

    const existingSkill = profile.skills.find(
      (s) => s.name.toLowerCase() === skillName
    );

    if (!existingSkill && skillLevel > 0) {
      profile.skills.push({
        name: reqSkill.skillName,
        proficiencyLevel: parseInt(reqSkill.demonstratedExperienceLevel),
        experienceLevel: getExperienceLevelLabel(
          reqSkill.demonstratedExperienceLevel
        ),
        ScoreTest: reqSkill.confidenceScore,
        Levelconfirmed:
          parseInt(reqSkill.demonstratedExperienceLevel) === 1
            ? 1
            : parseInt(reqSkill.demonstratedExperienceLevel) === 5
            ? 5
            : parseInt(reqSkill.demonstratedExperienceLevel) - 1,
      });
    }
  });
}

/**
 * 1. Adds soft skills to the profile if they are not already present
 * and their experienceLevel is greater than 0.
 * 2. Update todoList: Pass HR Test => isCompleted
 */
async function handleAddSoftSkills(profile, skillAnalysis) {
  let softSkillAdded = false;
  skillAnalysis.forEach((softSkill) => {
    const skillName = softSkill.skillName.toLowerCase();
    const skillLevel = parseInt(softSkill.experienceLevel);

    const existingSkill = profile.softSkills.find(
      (s) => s.name.toLowerCase() === skillName
    );

    if (!existingSkill && skillLevel > 0) {
      profile.softSkills.push({
        name: softSkill.skillName,
        experienceLevel: softSkill.experienceLevel,
        ScoreTest: softSkill.confidenceScore,
      });
      softSkillAdded = true;
    }
  });

  if (softSkillAdded) {
    if (softSkillAdded) {
      await profile.save();

      await TodoList.updateOne(
        { profile: profile._id, "todos.title": "Pass HR Test" },
        { $set: { "todos.$.isCompleted": true } }
      );
    }
  }
}

/**
 * Identifies which job-required skills are already proven in the user's profile
 * based on skill name and sufficient proficiency level.
 */
function findAlreadyProvenSkills(userSkills, jobSkills) {
  return jobSkills.filter((jobSkill) =>
    userSkills.some(
      (userSkill) =>
        userSkill.name.toLowerCase() === jobSkill.name.toLowerCase() &&
        userSkill.proficiencyLevel >= parseInt(jobSkill.level)
    )
  );
}

/**
 * Merges already proven skills into the skill analysis.
 */
function mergeAlreadyProvenSkills(skillAnalysis, provenSkills, userSkills) {
  provenSkills.forEach((provenSkill) => {
    const matchingUserSkill = userSkills.find(
      (userSkill) =>
        userSkill.name.toLowerCase() === provenSkill.name.toLowerCase()
    );

    const confidenceScore = matchingUserSkill?.ScoreTest ?? 100;

    const updatedSkill = {
      skillName: matchingUserSkill.name,
      requiredLevel: matchingUserSkill.proficiencyLevel,
      demonstratedExperienceLevel: matchingUserSkill.proficiencyLevel,
      strengths: [
        `Your skills in ${matchingUserSkill.name} were already present in your profile.\nThat is why there was no need to reevaluate for this Job Offer.\n
If you need to reevaluate your skills in ${matchingUserSkill.name}, you can navigate to your skills section in your profile and pass a new Test.`,
      ],
      weaknesses: ["No weaknesses found"],
      confidenceScore: confidenceScore,
      match: "Strong match",
      levelGap: 0,
    };

    const index = skillAnalysis.findIndex(
      (item) => item.skillName.toLowerCase() === provenSkill.name.toLowerCase()
    );

    if (index !== -1) {
      skillAnalysis[index] = updatedSkill;
    } else {
      skillAnalysis.push(updatedSkill);
    }
  });
}

/**
 * Computes the overallScore based on the average of all skill confidenceScores.
 * Sets the jobMatch percentage and status based on the overall score.
 */
function processAnalysisData(analysis) {
  // process the overallScore
  let scoreSum = 0;
  for (const skill of analysis.skillAnalysis) {
    const confidenceScore = parseFloat(skill.confidenceScore) || 0;
    scoreSum += confidenceScore;
  }
  analysis.overallScore = parseFloat(
    (scoreSum / analysis.skillAnalysis.length).toFixed(2)
  );

  // process the jobMatch
  let status;
  if (analysis.overallScore >= 70) {
    status = "Strong match";
  } else if (analysis.overallScore >= 50) {
    status = "Moderate match";
  } else {
    status = "Poor match";
  }

  analysis.jobMatch.percentage = analysis.overallScore;
  analysis.jobMatch.status = status;
}

async function updateTodoListWithNewSkills(todoList, analysis) {
  analysis.skillAnalysis.forEach((reqSkill) => {
    const skillName = reqSkill.skillName.trim();
    const demonstratedExperienceLevel = reqSkill.demonstratedExperienceLevel;

    if (
      demonstratedExperienceLevel > 0 &&
      Array.isArray(analysis.todoList) &&
      analysis.todoList.length > 0
    ) {
      const alreadyExists = todoList.todos.some(
        (todo) => todo.type === "Skill" && todo.title.trim() == skillName
      );

      if (!alreadyExists) {
        const todoFromAnalysis = analysis.todoList.find(
          (t) => t.title.trim() == skillName
        );

        if (todoFromAnalysis) {
          const tasks = todoFromAnalysis.tasks.map((task) => ({
            title: task.title,
            type: task.type,
            description: task.description,
            url: task.url || undefined,
            priority: task.priority,
            dueDate: task.dueDate,
            isCompleted: false,
          }));

          todoList.todos.push({
            type: "Skill",
            title: reqSkill.skillName,
            isCompleted: false,
            tasks,
          });
        } else {
          console.log("No matching todo found in analysis for:", skillName);
        }
      }
    }
  });

  await todoList.save();
}

async function saveInterviewDetails(
  profile,
  overallScore,
  skillAnalysis,
  formData,
  recommendations
) {
  console.log("check : recommendations", recommendations);
  const details = skillAnalysis.map((skill) => ({
    name: skill.skillName,
    type: SKILL_TYPES.SOFT,
    proficiencyLevel: skill.proficiencyLevel,
    // experienceLevel : PROFICIENCY_TO_EXPERIENCE_VALUE[skill.proficiencyLevel],
    confidenceScore: skill.confidenceScore,
    questionAnswerList: (skill.questionAnswerList || []).map((qa) => ({
      question: qa.question,
      answer: qa.answer && qa.answer.trim() !== "" ? qa.answer : "No answer provided",
      status: qa.status,
      exampleCorrectAnswer: qa.exampleCorrectAnswer || null,
    })),
  }));

  const interviewDetails = new InterviewDetails({
    candidate: profile._id,
    type: INTERVIEW_TYPES.HR,
    overallScore: overallScore,
    interviewContext: formData ? formData : null,
    skillDetails: details,
    recommendations: recommendations,
  });

  await interviewDetails.save();
  return interviewDetails._id;
}

async function saveInterviewDetailsForJob(
  profile,
  overallScore,
  skillAnalysis,
  jobId, 
  recommendations,
  questions = null
) {
  const details = skillAnalysis.map((skill) => ({
    name: skill.skillName,
    type: SKILL_TYPES.HARD,
    proficiencyLevel: skill.demonstratedExperienceLevel,
    // experienceLevel : PROFICIENCY_TO_EXPERIENCE_VALUE[skill.proficiencyLevel],
    confidenceScore: skill.confidenceScore,
    questionAnswerList: (skill.questionAnswerList || []).map((qa) => ({
      question: qa.question,
      answer: qa.answer && qa.answer.trim() !== "" ? qa.answer : "No answer provided",
      status: qa.status,
      exampleCorrectAnswer: qa.exampleCorrectAnswer || null,
    })),
  }));

  const interviewDetailsData = {
    candidate: profile._id,
    post: jobId,
    type: INTERVIEW_TYPES.POST,
    overallScore: overallScore,
    skillDetails: details,
    recommendations: recommendations,
  };

  // Ajouter les questions si elles sont fournies
  if (questions && Array.isArray(questions)) {
    interviewDetailsData.questions = questions.map((qa) => {
      const hasAnswer = qa.answer && qa.answer.trim() !== "";
      return {
        question: qa.question,
        answer: hasAnswer ? qa.answer : "No answer provided",
        status: hasAnswer ? (qa.status || "correct") : "incorrect",
        exampleCorrectAnswer: qa.exampleCorrectAnswer || null,
      };
    });
  }

  const interviewDetails = new InterviewDetails(interviewDetailsData);

  await interviewDetails.save();
  return interviewDetails._id;
}

async function saveInterviewDetailsForOnboarding(
  profile,
  overallScore,
  skillAnalysis,
  recommendations
) {
  const details = skillAnalysis.map((skill) => ({
    name: skill.skillName,
    type: SKILL_TYPES.HARD,
    proficiencyLevel: skill.demonstratedExperienceLevel,
    // experienceLevel : PROFICIENCY_TO_EXPERIENCE_VALUE[skill.proficiencyLevel],
    confidenceScore: skill.confidenceScore,
    questionAnswerList: (skill.questionAnswerList || []).map((qa) => ({
      question: qa.question,
      answer: qa.answer && qa.answer.trim() !== "" ? qa.answer : "No answer provided",
      status: qa.status,
      exampleCorrectAnswer: qa.exampleCorrectAnswer || null,
      partialCorrectPercentage: qa.partialCorrectPercentage || null,
      partialCorrectReason: qa.partialCorrectReason || null,
    })),
  }));
  const interviewDetails = new InterviewDetails({
    candidate: profile._id,
    type: INTERVIEW_TYPES.ONBOARDING,
    overallScore: overallScore,
    skillDetails: details,
    recommendations: recommendations,
  });

  await interviewDetails.save();
  return interviewDetails._id;
}

async function saveInterviewDetailsForAddSkill(
  profile,
  overallScore,
  skillAnalysis,
  skillType,
  recommendations
) {
  // Normalize incoming skillType to one of SKILL_TYPES values
  let normalizedSkillType = SKILL_TYPES.HARD; // default
  if (typeof skillType === "string") {
    const st = skillType.toLowerCase();
    if (st === "soft" || st === "softskill" || st === "soft_skill") {
      normalizedSkillType = SKILL_TYPES.SOFT;
    } else if (st === "hard" || st === "technical" || st === "technicalskill" || st === "technical_skill") {
      normalizedSkillType = SKILL_TYPES.HARD;
    } else if (st === SKILL_TYPES.SOFT) {
      normalizedSkillType = SKILL_TYPES.SOFT;
    } else if (st === SKILL_TYPES.HARD) {
      normalizedSkillType = SKILL_TYPES.HARD;
    }
  }

  // Helper to infer proficiency level from experience label if needed
  const experienceLabelToProficiency = (label) => {
    if (!label) return undefined;
    const found = Object.values(SKILL_LEVELS).find(
      (lvl) => lvl.experienceLevel && lvl.experienceLevel.toLowerCase() === String(label).toLowerCase()
    );
    return found ? found.proficiencyLevel : undefined;
  };

  const details = (skillAnalysis || []).map((skill) => {
    // Prefer numeric demonstratedProficiency if present, else try to infer from demonstratedExperienceLevel
    let prof = undefined;
    if (skill.demonstratedProficiency !== undefined && skill.demonstratedProficiency !== null) {
      prof = Number(skill.demonstratedProficiency);
    } else if (skill.demonstratedExperienceLevel) {
      prof = experienceLabelToProficiency(skill.demonstratedExperienceLevel);
    } else if (skill.proficiencyLevel !== undefined) {
      prof = Number(skill.proficiencyLevel);
    }

    const qList = (skill.questionAnswerList || []).map((qa) => ({
      question: qa.question || "",
      answer: qa.answer && qa.answer.trim() !== "" ? qa.answer : "No answer provided",
      status: qa.status || "incorrect",
      exampleCorrectAnswer: qa.exampleCorrectAnswer || null,
      partialCorrectPercentage: qa.partialCorrectPercentage || null,
      partialCorrectReason: qa.partialCorrectReason || null,
    }));

    return {
      name: skill.skillName || skill.name || "",
      type: normalizedSkillType,
      proficiencyLevel: Number.isFinite(prof) ? prof : undefined,
      experienceLevel: skill.demonstratedExperienceLevel || skill.experienceLevel || undefined,
      // confidenceScore may be under different keys
      confidenceScore: skill.confidenceScore || skill.confidence || undefined,
      questionAnswerList: qList,
    };
  });

  const interviewDetails = new InterviewDetails({
    candidate: profile._id,
    type: INTERVIEW_TYPES.SKILL,
    overallScore: overallScore,
    skillDetails: details,
    recommendations: recommendations,
  });

  try {
    console.debug("saveInterviewDetailsForAddSkill: saving InterviewDetails, details sample:", JSON.stringify(details, null, 2));
    await interviewDetails.save();
    return interviewDetails._id;
  } catch (err) {
    console.error("Error saving interview details for add-skill:", err && err.message ? err.message : err);
    if (err && err.errors) {
      console.error("Validation errors:", err.errors);
    }
    // Re-throw so callers can handle the error and we don't silently swallow it
    throw err;
  }
}

/**
 * Calculates the overallScore for HR analysis as the average of confidenceScores of the skills.
 * @param {Array} skillAnalysis - Array of skill analysis objects, each with a confidenceScore property.
 * @returns {number} The average confidenceScore (0-100, rounded to nearest integer)
 */
function handleHROverallScore(skillAnalysis) {
  if (!Array.isArray(skillAnalysis) || skillAnalysis.length === 0) return 0;
  const total = skillAnalysis.reduce(
    (sum, skill) =>
      sum +
      (typeof skill.confidenceScore === "number" ? skill.confidenceScore : 0),
    0
  );
  return Math.round(total / skillAnalysis.length);
}

module.exports = {
  processSkillsData,
  updateUpgradedSkills,
  updateProfileWithNewSkills,
  findAlreadyProvenSkills,
  mergeAlreadyProvenSkills,
  processAnalysisData,
  updateTodoListWithNewSkills,
  handleAddSoftSkills,
  saveInterviewDetails,
  saveInterviewDetailsForJob,
  saveInterviewDetailsForOnboarding,
  saveInterviewDetailsForAddSkill,
  handleHROverallScore,
};
