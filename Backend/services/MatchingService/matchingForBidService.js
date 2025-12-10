const { getMatchingConfig } = require("./matchingConfigService");
const UnlockCandidate = require("../../models/UnlockCandidateModel");

/* ------------------ Helper ------------------ */
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

/* ------------------ Hard Skills ------------------ */
function calculateHardSkillsScore(jobSkills, candidateSkills, MAX_HARD_SKILL_SCORE) {
  if (!jobSkills?.length || !candidateSkills?.length) return 0;

  let hardSkillScore = 0;
  const totalPercentage = jobSkills.reduce((sum, s) => sum + (s.percentage || 0), 0);
  const normalizedJobSkills = jobSkills.map((skill) => ({
    ...skill,
    weight: totalPercentage > 0 ? (skill.percentage || 0) / totalPercentage : 1 / jobSkills.length,
  }));

  normalizedJobSkills.forEach((jobSkill) => {
    const candidateSkill = candidateSkills.find(
      (s) => s.name?.toLowerCase() === jobSkill.name?.toLowerCase()
    );

    if (candidateSkill) {
      const jobLevel = convertLevelToNumber(jobSkill.level);
      const candidateLevel = candidateSkill.Levelconfirmed || convertLevelToNumber(candidateSkill.proficiencyLevel);
      // importanceWeight removed — all importance levels are treated equally
      const rawScore = Math.min((candidateLevel / jobLevel) * 100, 100);
      const weightedScore = rawScore;
      hardSkillScore += weightedScore * jobSkill.weight;
    }
  });

  const finalScore = Math.min((hardSkillScore / 100) * MAX_HARD_SKILL_SCORE, MAX_HARD_SKILL_SCORE);
  return finalScore;
}

/* ------------------ Soft Skills ------------------ */
function calculateSoftSkillsScore(jobSoftSkills, candidateSoftSkills, MAX_SOFT_SKILL_SCORE) {
  if (!jobSoftSkills?.length || !candidateSoftSkills?.length) return 0;

  let matchCount = 0;
  jobSoftSkills.forEach((jobSoft) => {
    const match = candidateSoftSkills.find((s) => s.name?.toLowerCase() === jobSoft.name?.toLowerCase());
    if (match) matchCount++;
  });

  const softSkillScore = (matchCount / jobSoftSkills.length) * MAX_SOFT_SKILL_SCORE;
  return softSkillScore;
}

/* ------------------ Experience ------------------ */
function calculateExperienceScore(jobSkills, candidateSkills, MAX_EXPERIENCE_SCORE) {
  let totalExpScore = 0;
  let skillCount = 0;

  jobSkills.forEach((jobSkill) => {
    const candidateSkill = candidateSkills.find((s) => s.name?.toLowerCase() === jobSkill.name?.toLowerCase());
    if (candidateSkill) {
      const jobLevel = convertLevelToNumber(jobSkill.level);
      const candidateLevel = candidateSkill.Levelconfirmed || convertLevelToNumber(candidateSkill.proficiencyLevel);
      let score = 0;
      if (candidateLevel >= jobLevel) score = 10;
      else if (candidateLevel === jobLevel - 1) score = 5;
      totalExpScore += score;
      skillCount++;
    }
  });

  const finalScore = skillCount > 0 ? (totalExpScore / skillCount) * (MAX_EXPERIENCE_SCORE / 10) : 0;
  return finalScore;
}

/* ------------------ Salary ------------------ */
function calculateSalaryScore(jobDetails, candidateProfile, EXCHANGE_RATES, MAX_SALARY_SCORE, ratesArePerUSD = true) {
  const jobSalary = jobDetails?.salary || {};
  const candidateSalary = candidateProfile?.expectedSalary || {};
  if (!jobSalary.min || !jobSalary.max || !candidateSalary.min || !candidateSalary.max) {
    return 0;
  }

  function convertToUSD(amount, currency) {
    const rate = EXCHANGE_RATES?.[currency];
    if (!rate) return null;
    return ratesArePerUSD ? amount / rate : amount * rate;
  }

  const jobMinUSD = convertToUSD(jobSalary.min, jobSalary.currency);
  const jobMaxUSD = convertToUSD(jobSalary.max, jobSalary.currency);
  const candidateMinUSD = convertToUSD(candidateSalary.min, candidateSalary.currency);
  const candidateMaxUSD = convertToUSD(candidateSalary.max, candidateSalary.currency);

  if ([jobMinUSD, jobMaxUSD, candidateMinUSD, candidateMaxUSD].some((v) => v == null)) return 0;

  const overlapMin = Math.max(candidateMinUSD, jobMinUSD);
  const overlapMax = Math.min(candidateMaxUSD, jobMaxUSD);

  let salaryScore = 0;
  if (overlapMax > overlapMin) {
    const overlap = overlapMax - overlapMin;
    const jobRange = jobMaxUSD - jobMinUSD;
    salaryScore = jobRange > 0 ? (overlap / jobRange) * MAX_SALARY_SCORE : MAX_SALARY_SCORE;
  }
  return salaryScore;
}

/* ------------------ Work Mode ------------------ */
function calculateWorkModeScore(jobDetails, candidateProfile, MAX_WORKMODE_SCORE) {
  if (!jobDetails.location || !candidateProfile.workModePreference) return 0;
  return jobDetails.location.toLowerCase() === candidateProfile.workModePreference.toLowerCase()
    ? MAX_WORKMODE_SCORE
    : MAX_WORKMODE_SCORE / 2;
}

/* ------------------ Contract ------------------ */
function calculateContractScore(jobDetails, candidateProfile, MAX_CONTRACT_SCORE) {
  if (!jobDetails.employmentType || !candidateProfile.preferredContractType) return 0;
  return jobDetails.employmentType.toLowerCase() === candidateProfile.preferredContractType.toLowerCase()
    ? MAX_CONTRACT_SCORE
    : 0;
}

/* ------------------ Check unlock ------------------ */
async function checkIfCandidateUnlocked(idCompany, idCandidate) {
  try {
    const unlocked = await UnlockCandidate.findOne({ idCompany, idCandidate });
    return !!unlocked;
  } catch (error) {
    console.error("Error checking unlock status:", error);
    return false;
  }
}

/* ------------------ MAIN ------------------ */
async function calculateMatchScore(jobSkills, candidateSkills, jobDetails = {}, candidateProfile = {}, idCompany, jobPostId) {
  if (!jobSkills?.length || !candidateSkills?.length) return 0;

  let unlocked = false;
  if (idCompany && candidateProfile.userId?._id) {
    unlocked = await checkIfCandidateUnlocked(idCompany, candidateProfile.userId._id);
  }

  const cfg = await getMatchingConfig(idCompany, jobPostId);

  const MAX_HARD_SKILL_SCORE = cfg.weights.hardSkill;
  const MAX_SOFT_SKILL_SCORE = cfg.weights.SoftSkill;
  const MAX_EXPERIENCE_SCORE = cfg.weights.experience;
  const MAX_SALARY_SCORE = cfg.weights.salary;
  const MAX_WORKMODE_SCORE = cfg.weights.workMode;
  const MAX_CONTRACT_SCORE = cfg.weights.contract;
  const EXCHANGE_RATES = cfg.exchangeRates || { USD: 1, EUR: 1.1, TND: 0.32 };
  const hardSkillScore = calculateHardSkillsScore(jobSkills, candidateSkills, MAX_HARD_SKILL_SCORE);
  if (hardSkillScore === 0) return 0;

  const softSkillScore = calculateSoftSkillsScore(jobDetails.skillAnalysis?.softSkills || [], candidateProfile.softSkills || [], MAX_SOFT_SKILL_SCORE);
  const experienceScore = calculateExperienceScore(jobSkills, candidateSkills, MAX_EXPERIENCE_SCORE);
  const salaryScore = calculateSalaryScore(jobDetails, candidateProfile, EXCHANGE_RATES, MAX_SALARY_SCORE);
  const workModeScore = calculateWorkModeScore(jobDetails, candidateProfile, MAX_WORKMODE_SCORE);
  const contractScore = calculateContractScore(jobDetails, candidateProfile, MAX_CONTRACT_SCORE);

  const totalScore = hardSkillScore + softSkillScore + experienceScore + salaryScore + workModeScore + contractScore;
  const finalScore = Math.round(totalScore * 10) / 10;

  const candidateLabel = candidateProfile.userId?.username || candidateProfile.userId?._id || 'unknown';
  console.log(
    `MATCH | candidate=${candidateLabel} | hard=${hardSkillScore} soft=${softSkillScore} exp=${experienceScore} salary=${salaryScore} workMode=${workModeScore} contract=${contractScore} → total=${finalScore} | unlocked=${unlocked}`
  );

  return finalScore;
}

module.exports = {
  calculateMatchScore,
  normalizeSkillName,
  checkIfCandidateUnlocked,
  calculateHardSkillsScore, // expose si besoin
};
