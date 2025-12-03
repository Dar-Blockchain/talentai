const { getMatchingConfig } = require("./matchingConfigService");
const UnlockCandidate = require("../../models/UnlockCandidateModel");

const LEVELS = {
  Beginner: 1,
  Intermediate: 3,
  Advanced: 4,
  Expert: 5,
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
};

function convertLevelToNumber(level) {
  return LEVELS[level] || 1;
}

function normalizeSkillName(name) {
  if (!name) return "";
  const part = name.split(".")[0].trim();
  return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
}

/* ------------------------------------------------
   0️⃣ Hard Skills Score
------------------------------------------------ */
function calculateHardSkillsScore(
  jobSkills,
  candidateSkills,
  IMPORTANCE_WEIGHT,
  MAX_HARD_SKILL_SCORE
) {
  console.log("\n--- Hard Skills Calculation ---");

  let hardSkillScore = 0;
  const totalPercentage = jobSkills.reduce(
    (sum, s) => sum + (s.percentage || 0),
    0
  );

  const normalizedJobSkills = jobSkills.map((skill) => ({
    ...skill,
    weight:
      totalPercentage > 0
        ? (skill.percentage || 0) / totalPercentage
        : 1 / jobSkills.length,
  }));

  normalizedJobSkills.forEach((jobSkill) => {
    const candidateSkill = candidateSkills.find(
      (s) => s.name?.toLowerCase() === jobSkill.name?.toLowerCase()
    );

    if (candidateSkill) {
      const jobLevel = convertLevelToNumber(jobSkill.level);
      const candidateLevel =
        candidateSkill.Levelconfirmed ||
        convertLevelToNumber(candidateSkill.proficiencyLevel);

      const importanceWeight = IMPORTANCE_WEIGHT[jobSkill.importance] || 1;

      const rawScore = Math.min((candidateLevel / jobLevel) * 100, 100);
      const weightedScore = rawScore * importanceWeight;
      hardSkillScore += weightedScore * jobSkill.weight;

      console.log(
        `Matched skill: ${
          jobSkill.name
        } | CandidateLevel: ${candidateLevel} | JobLevel: ${jobLevel} | Importance: ${
          jobSkill.importance
        } | WeightedScore: ${(weightedScore * jobSkill.weight).toFixed(2)}`
      );
    }
  });

  const finalScore = Math.min(
    (hardSkillScore / 100) * MAX_HARD_SKILL_SCORE,
    MAX_HARD_SKILL_SCORE
  );
  console.log(`Hard skill score (${MAX_HARD_SKILL_SCORE}% max): ${finalScore}`);

  return finalScore;
}

/* ------------------------------------------------
   1️⃣ Soft Skills Score
------------------------------------------------ */
function calculateSoftSkillsScore(
  jobSoftSkills,
  candidateSoftSkills,
  MAX_SOFT_SKILL_SCORE
) {
  console.log("\n--- Soft Skills Calculation ---");
  console.log(
    "Job soft skills:",
    jobSoftSkills.map((s) => s.name)
  );
  console.log(
    "Candidate soft skills:",
    candidateSoftSkills.map((s) => s.name)
  );

  if (!jobSoftSkills?.length || !candidateSoftSkills?.length) {
    console.log("No soft skills provided.");
    return 0;
  }

  let matchCount = 0;

  jobSoftSkills.forEach((jobSoft) => {
    const match = candidateSoftSkills.find(
      (s) => s.name?.toLowerCase() === jobSoft.name?.toLowerCase()
    );
    if (match) {
      matchCount++;
      console.log(`Matched soft skill: ${jobSoft.name}`);
    }
  });

  const softSkillScore =
    (matchCount / jobSoftSkills.length) * MAX_SOFT_SKILL_SCORE;
  console.log(
    `Soft skill score (${MAX_SOFT_SKILL_SCORE}% max):`,
    softSkillScore.toFixed(2)
  );
  return softSkillScore;
}

/* ------------------------------------------------
   2️⃣ Experience Score
------------------------------------------------ */
function calculateExperienceScore(
  jobSkills,
  candidateSkills,
  MAX_EXPERIENCE_SCORE
) {
  console.log("\n--- Experience Score Calculation ---");

  let totalExpScore = 0;
  let skillCount = 0;

  jobSkills.forEach((jobSkill) => {
    const candidateSkill = candidateSkills.find(
      (s) => s.name?.toLowerCase() === jobSkill.name?.toLowerCase()
    );

    if (candidateSkill) {
      const jobLevel = convertLevelToNumber(jobSkill.level);
      const candidateLevel =
        candidateSkill.Levelconfirmed ||
        convertLevelToNumber(candidateSkill.proficiencyLevel);

      let score = 0;
      if (candidateLevel >= jobLevel) score = 10;
      else if (candidateLevel === jobLevel - 1) score = 5;

      totalExpScore += score;
      skillCount++;

      console.log(
        `Experience score for ${jobSkill.name}: ${score} | CandidateLevel: ${candidateLevel} | JobLevel: ${jobLevel}`
      );
    }
  });

  const finalScore =
    skillCount > 0
      ? (totalExpScore / skillCount) * (MAX_EXPERIENCE_SCORE / 10)
      : 0;

  console.log(
    `Total Experience Score (${MAX_EXPERIENCE_SCORE}% max): ${finalScore}`
  );

  return finalScore;
}

/* ------------------------------------------------
   3️⃣ Salary Score
------------------------------------------------ */
function calculateSalaryScore(
  jobDetails,
  candidateProfile,
  EXCHANGE_RATES,
  MAX_SALARY_SCORE
) {
  console.log("\n--- Salary Score Calculation ---");

  let salaryScore = 0;
  const jobSalary = jobDetails.salary || {};
  const candidateSalary = candidateProfile.expectedSalary || {};

  if (
    jobSalary.min != null &&
    jobSalary.max != null &&
    candidateSalary.min != null &&
    candidateSalary.max != null
  ) {
    const jobMinUSD = jobSalary.min * (EXCHANGE_RATES[jobSalary.currency] || 1);
    const jobMaxUSD = jobSalary.max * (EXCHANGE_RATES[jobSalary.currency] || 1);
    const candidateMinUSD =
      candidateSalary.min * (EXCHANGE_RATES[candidateSalary.currency] || 1);
    const candidateMaxUSD =
      candidateSalary.max * (EXCHANGE_RATES[candidateSalary.currency] || 1);

    console.log(
      `Converted salaries to USD | Job: ${jobMinUSD}-${jobMaxUSD} | Candidate: ${candidateMinUSD}-${candidateMaxUSD}`
    );

    const overlapMin = Math.max(candidateMinUSD, jobMinUSD);
    const overlapMax = Math.min(candidateMaxUSD, jobMaxUSD);

    if (overlapMax > overlapMin) {
      const overlap = overlapMax - overlapMin;
      const jobRange = jobMaxUSD - jobMinUSD;
      salaryScore = (overlap / jobRange) * MAX_SALARY_SCORE;
    }
  }

  console.log(
    `Salary score (${MAX_SALARY_SCORE}% max): ${salaryScore.toFixed(1)}`
  );
  return salaryScore;
}

/* ------------------------------------------------
   4️⃣ Work Mode Score
------------------------------------------------ */
function calculateWorkModeScore(
  jobDetails,
  candidateProfile,
  MAX_WORKMODE_SCORE
) {
  console.log("\n--- Work Mode Score ---");

  if (!jobDetails.location || !candidateProfile.workModePreference) return 0;

  const score =
    jobDetails.location.toLowerCase() ===
    candidateProfile.workModePreference.toLowerCase()
      ? MAX_WORKMODE_SCORE
      : MAX_WORKMODE_SCORE / 2;

  console.log(`WorkMode score (${MAX_WORKMODE_SCORE}% max): ${score}`);
  return score;
}

/* ------------------------------------------------
   5️⃣ Contract Score
------------------------------------------------ */
function calculateContractScore(
  jobDetails,
  candidateProfile,
  MAX_CONTRACT_SCORE
) {
  console.log("\n--- Contract Type Score ---");

  if (!jobDetails.employmentType || !candidateProfile.preferredContractType)
    return 0;

  const score =
    jobDetails.employmentType.toLowerCase() ===
    candidateProfile.preferredContractType.toLowerCase()
      ? MAX_CONTRACT_SCORE
      : 0;

  console.log(`Contract score (${MAX_CONTRACT_SCORE}% max): ${score}`);
  return score;
}

/* ------------------------------------------------
   6️⃣ Check if unlocked
------------------------------------------------ */
async function checkIfCandidateUnlocked(idCompany, idCandidate) {
  console.log("\n--- Checking Unlock Status ---");

  try {
    const unlocked = await UnlockCandidate.findOne({ idCompany, idCandidate });

    console.log(`Candidate is ${unlocked ? "UNLOCKED" : "LOCKED"}`);
    return !!unlocked;
  } catch (error) {
    console.error("Error checking unlock status:", error);
    return false;
  }
}

/* ------------------------------------------------
   MAIN FUNCTION
------------------------------------------------ */
async function calculateMatchScore(
  jobSkills,
  candidateSkills,
  jobDetails = {},
  candidateProfile = {},
  idCompany,
  jobPostId
) {
  console.log("============================================");
  console.log("⚡ MATCHING PROCESS STARTED");
  console.log("============================================");

  console.log(
    "Job required skills:",
    jobSkills.map((s) => s.name)
  );
  console.log(
    "Candidate skills:",
    candidateSkills.map((s) => s.name)
  );

  if (!jobSkills?.length || !candidateSkills?.length) {
    console.log("❌ Missing skills → Score = 0");
    return 0;
  }

  // Unlock check
  let unlocked = false;

  if (idCompany && candidateProfile.userId?._id) {
    unlocked = await checkIfCandidateUnlocked(
      idCompany,
      candidateProfile.userId._id
    );
  }

  console.log("\n--- Loading Matching Configuration ---");
  const cfg = await getMatchingConfig(idCompany, jobPostId);
  console.log("✓ Config loaded.");

  const MAX_HARD_SKILL_SCORE = cfg.weights.hardSkill;
  const MAX_SOFT_SKILL_SCORE = cfg.weights.SoftSkill;
  const MAX_EXPERIENCE_SCORE = cfg.weights.experience;
  const MAX_SALARY_SCORE = cfg.weights.salary;
  const MAX_WORKMODE_SCORE = cfg.weights.workMode;
  const MAX_CONTRACT_SCORE = cfg.weights.contract;

  const IMPORTANCE_WEIGHT = cfg.importanceWeight;
  const EXCHANGE_RATES = cfg.exchangeRates || { USD: 1, EUR: 1.1, TND: 0.32 };

  const hardSkillScore = calculateHardSkillsScore(
    jobSkills,
    candidateSkills,
    IMPORTANCE_WEIGHT,
    MAX_HARD_SKILL_SCORE
  );

  if (hardSkillScore === 0) {
    console.log("❌ Candidate eliminated: no hard skill match");
    return 0;
  }

  const softSkillScore = calculateSoftSkillsScore(
    jobDetails.skillAnalysis?.softSkills || [],
    candidateProfile.softSkills || [],
    MAX_SOFT_SKILL_SCORE
  );

  const experienceScore = calculateExperienceScore(
    jobSkills,
    candidateSkills,
    MAX_EXPERIENCE_SCORE
  );

  const salaryScore = calculateSalaryScore(
    jobDetails,
    candidateProfile,
    EXCHANGE_RATES,
    MAX_SALARY_SCORE
  );

  const workModeScore = calculateWorkModeScore(
    jobDetails,
    candidateProfile,
    MAX_WORKMODE_SCORE
  );

  const contractScore = calculateContractScore(
    jobDetails,
    candidateProfile,
    MAX_CONTRACT_SCORE
  );

  const totalScore =
    hardSkillScore +
    softSkillScore +
    experienceScore +
    salaryScore +
    workModeScore +
    contractScore;

  const finalScore = Math.round(totalScore * 10) / 10;

  console.log("\n============================================");
  console.log(`🏁 FINAL SCORE = ${finalScore}`);
  console.log(`🔓 UNLOCKED = ${unlocked}`);
  console.log("============================================");

  return { score: finalScore, unlocked };
}

module.exports = {
  calculateMatchScore,
  normalizeSkillName,
  checkIfCandidateUnlocked,
};
