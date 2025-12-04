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

    }
  });

  const finalScore =
    skillCount > 0
      ? (totalExpScore / skillCount) * (MAX_EXPERIENCE_SCORE / 10)
      : 0;

  return finalScore;
}

/* ------------------------------------------------
   3️⃣ Salary Score
------------------------------------------------ */
function calculateSalaryScore(
  jobDetails,
  candidateProfile,
  EXCHANGE_RATES,
  MAX_SALARY_SCORE,
  // ratesArePerUSD = true  => EXCHANGE_RATES[c] = amount of currency per 1 USD (ex: TND:2.94)
  // ratesArePerUSD = false => EXCHANGE_RATES[c] = amount of USD per 1 currency (ex: EUR:1.16)
  ratesArePerUSD = true
) {

  const jobSalary = jobDetails?.salary || {};
  const candidateSalary = candidateProfile?.expectedSalary || {};
  let salaryScore = 0;

  function convertToUSD(amount, currency) {
    if (amount == null || !currency) return null;

    const rate = EXCHANGE_RATES && EXCHANGE_RATES[currency];
    if (rate == null || rate === 0) {
      console.warn(`[convertToUSD] Missing or invalid rate for currency=${currency}`);
      return null;
    }

    // Si ratesArePerUSD === true => EXCHANGE_RATES[currency] = currency per 1 USD
    // Exemple: TND: 2.945439 (1 USD = 2.945439 TND) => USD = amount / rate
    if (ratesArePerUSD) {
      return amount / rate;
    }

    // Sinon EXCHANGE_RATES[currency] = USD per 1 currency => USD = amount * rate
    return amount * rate;
  }

  const requiredFieldsPresent =
    jobSalary.min != null &&
    jobSalary.max != null &&
    jobSalary.currency &&
    candidateSalary.min != null &&
    candidateSalary.max != null &&
    candidateSalary.currency;

  if (!requiredFieldsPresent) {
    console.log("Salary score skipped (missing min/max or currency)");
    return 0;
  }

  const jobMinUSD = convertToUSD(jobSalary.min, jobSalary.currency);
  const jobMaxUSD = convertToUSD(jobSalary.max, jobSalary.currency);
  const candidateMinUSD = convertToUSD(candidateSalary.min, candidateSalary.currency);
  const candidateMaxUSD = convertToUSD(candidateSalary.max, candidateSalary.currency);

  if (
    jobMinUSD == null ||
    jobMaxUSD == null ||
    candidateMinUSD == null ||
    candidateMaxUSD == null
  ) {
    console.log("Salary score skipped (could not convert one of the currencies)");
    return 0;
  }

  const overlapMin = Math.max(candidateMinUSD, jobMinUSD);
  const overlapMax = Math.min(candidateMaxUSD, jobMaxUSD);

  if (overlapMax > overlapMin) {
    const overlap = overlapMax - overlapMin;
    const jobRange = jobMaxUSD - jobMinUSD;

    salaryScore = jobRange > 0 ? (overlap / jobRange) * MAX_SALARY_SCORE : MAX_SALARY_SCORE;
  } else {
    // pas de chevauchement => salaireScore reste 0
  }

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

  if (!jobDetails.location || !candidateProfile.workModePreference) return 0;

  const score =
    jobDetails.location.toLowerCase() ===
    candidateProfile.workModePreference.toLowerCase()
      ? MAX_WORKMODE_SCORE
      : MAX_WORKMODE_SCORE / 2;

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

  if (!jobDetails.employmentType || !candidateProfile.preferredContractType)
    return 0;

  const score =
    jobDetails.employmentType.toLowerCase() ===
    candidateProfile.preferredContractType.toLowerCase()
      ? MAX_CONTRACT_SCORE
      : 0;

  return score;
}

/* ------------------------------------------------
   6️⃣ Check if unlocked
------------------------------------------------ */
async function checkIfCandidateUnlocked(idCompany, idCandidate) {

  try {
    const unlocked = await UnlockCandidate.findOne({ idCompany, idCandidate });

    return !!unlocked;
  } catch (error) {
    console.error("Error checking unlock status:", error);
    return false;
  }
}

/* ------------------------------------------------
   MAIN FUNCTION
------------------------------------------------ */
async function calculateSkillMatchScore(
  jobSkills,
  candidateSkills,
  jobDetails = {},
  candidateProfile = {},
  idCompany,
  jobPostId
) {
  console.log("⚡ MATCHING PROCESS STARTED");

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

  const cfg = await getMatchingConfig(idCompany, jobPostId);

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

  console.log(`🏁 FINAL SCORE = ${finalScore}`);

  return { score: finalScore, unlocked };
}

module.exports = { calculateSkillMatchScore };
