const { getExperienceLevelLabel } = require("./skillUtils");

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

    if (confidenceScore >= 70) {
      newLevel = requiredLevel;
    } else if (confidenceScore >= 50) {
      newLevel = Math.floor(requiredLevel * 0.7);
    } else if (confidenceScore >= 30) {
      newLevel = Math.floor(requiredLevel * 0.4);
    } else {
      newLevel = 0;
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
        Levelconfirmed: parseInt(reqSkill.demonstratedExperienceLevel) - 1,
      });
    }
  });
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

module.exports = {
  processSkillsData,
  updateUpgradedSkills,
  updateProfileWithNewSkills,
  findAlreadyProvenSkills,
  mergeAlreadyProvenSkills,
  processAnalysisData,
};
