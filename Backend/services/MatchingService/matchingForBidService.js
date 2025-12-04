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

/* ------------------ Hard Skills (simplifié) ------------------ */
function calculateHardSkillsScore(jobSkills, candidateSkills) {
  if (!jobSkills?.length || !candidateSkills?.length) {
    console.log("❌ [Hard Skills] No job or candidate skills available");
    return 0;
  }

  console.log("📋 [Hard Skills] Calculating...");
  const totalPercentage = jobSkills.reduce((sum, s) => sum + (s.percentage || 0), 0);
  console.log(`   Total percentage: ${totalPercentage}`);

  const normalizedJobSkills = jobSkills.map((skill) => ({
    ...skill,
    weight: totalPercentage > 0 ? (skill.percentage || 0) / totalPercentage : 1 / jobSkills.length,
  }));

  let totalScore = 0;

  normalizedJobSkills.forEach((jobSkill) => {
    const candidateSkill = candidateSkills.find(
      (s) => s.name?.toLowerCase() === jobSkill.name?.toLowerCase()
    );

    if (candidateSkill) {
      const jobLevel = convertLevelToNumber(jobSkill.level);
      const candidateLevel = convertLevelToNumber(candidateSkill.proficiencyLevel);
      const skillScore = Math.min((candidateLevel / jobLevel) * 100, 100);
      totalScore += skillScore * jobSkill.weight;
      console.log(`   ✓ ${jobSkill.name}: job_level=${jobLevel}, candidate_level=${candidateLevel}, score=${skillScore.toFixed(1)}, weight=${jobSkill.weight.toFixed(3)}`);
    } else {
      console.log(`   ✗ ${jobSkill.name}: NOT FOUND in candidate skills`);
    }
  });

  const finalScore = Math.round(totalScore * 10) / 10;
  console.log(`   🎯 Hard Skills Score: ${finalScore}\n`);
  return finalScore;
}

/* ------------------ Soft Skills ------------------ */
function calculateSoftSkillsScore(jobSoftSkills, candidateSoftSkills, MAX_SOFT_SKILL_SCORE) {
  if (!jobSoftSkills?.length || !candidateSoftSkills?.length) {
    console.log("❌ [Soft Skills] No job or candidate soft skills available");
    return 0;
  }

  console.log("📋 [Soft Skills] Calculating...");
  let matchCount = 0;

  jobSoftSkills.forEach((jobSoft) => {
    const match = candidateSoftSkills.find(
      (s) => s.name?.toLowerCase() === jobSoft.name?.toLowerCase()
    );
    if (match) {
      matchCount++;
      console.log(`   ✓ ${jobSoft.name}: MATCHED`);
    } else {
      console.log(`   ✗ ${jobSoft.name}: NOT FOUND`);
    }
  });

  const score = (matchCount / jobSoftSkills.length) * MAX_SOFT_SKILL_SCORE;
  console.log(`   🎯 Soft Skills Score: ${score} (${matchCount}/${jobSoftSkills.length} matches, max=${MAX_SOFT_SKILL_SCORE})\n`);
  return score;
}

/* ------------------ Experience ------------------ */
function calculateExperienceScore(jobSkills, candidateSkills, MAX_EXPERIENCE_SCORE) {
  console.log("📋 [Experience] Calculating...");
  let totalExpScore = 0;
  let skillCount = 0;

  jobSkills.forEach((jobSkill) => {
    const candidateSkill = candidateSkills.find(
      (s) => s.name?.toLowerCase() === jobSkill.name?.toLowerCase()
    );

    if (candidateSkill) {
      const jobLevel = convertLevelToNumber(jobSkill.level);
      const candidateLevel = convertLevelToNumber(candidateSkill.proficiencyLevel);

      let score = 0;
      if (candidateLevel >= jobLevel) score = 10;
      else if (candidateLevel === jobLevel - 1) score = 5;

      totalExpScore += score;
      skillCount++;
      console.log(`   ✓ ${jobSkill.name}: job_level=${jobLevel}, candidate_level=${candidateLevel}, exp_score=${score}`);
    }
  });

  const finalScore = skillCount > 0 ? (totalExpScore / skillCount) * (MAX_EXPERIENCE_SCORE / 10) : 0;
  console.log(`   🎯 Experience Score: ${finalScore} (${skillCount} skills matched)\n`);
  return finalScore;
}

/* ------------------ Salary ------------------ */
function calculateSalaryScore(jobDetails, candidateProfile, EXCHANGE_RATES, MAX_SALARY_SCORE, ratesArePerUSD = true) {
  console.log("💰 [Salary] Calculating...");
  const jobSalary = jobDetails?.salary || {};
  const candidateSalary = candidateProfile?.expectedSalary || {};
  if (!jobSalary.min || !jobSalary.max || !candidateSalary.min || !candidateSalary.max) {
    console.log("   ❌ Missing salary data");
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

  if ([jobMinUSD, jobMaxUSD, candidateMinUSD, candidateMaxUSD].some((v) => v == null)) {
    console.log("   ❌ Conversion error or missing rates");
    return 0;
  }

  console.log(`   Job salary: ${jobMinUSD?.toFixed(2)}-${jobMaxUSD?.toFixed(2)} USD | Candidate: ${candidateMinUSD?.toFixed(2)}-${candidateMaxUSD?.toFixed(2)} USD`);

  const overlapMin = Math.max(candidateMinUSD, jobMinUSD);
  const overlapMax = Math.min(candidateMaxUSD, jobMaxUSD);

  if (overlapMax > overlapMin) {
    const overlap = overlapMax - overlapMin;
    const jobRange = jobMaxUSD - jobMinUSD;
    const score = jobRange > 0 ? (overlap / jobRange) * MAX_SALARY_SCORE : MAX_SALARY_SCORE;
    console.log(`   ✓ Overlap: ${overlap.toFixed(2)} USD | Score: ${score}\n`);
    return score;
  }
  console.log(`   ✗ No salary overlap\n`);
  return 0;
}

/* ------------------ Work Mode ------------------ */
function calculateWorkModeScore(jobDetails, candidateProfile, MAX_WORKMODE_SCORE) {
  console.log("📍 [Work Mode] Calculating...");
  if (!jobDetails.location || !candidateProfile.workModePreference) {
    console.log("   ❌ Missing work mode data\n");
    return 0;
  }
  const match = jobDetails.location.toLowerCase() === candidateProfile.workModePreference.toLowerCase();
  const score = match ? MAX_WORKMODE_SCORE : MAX_WORKMODE_SCORE / 2;
  console.log(`   Job: ${jobDetails.location} | Candidate: ${candidateProfile.workModePreference} | Match: ${match} | Score: ${score}\n`);
  return score;
}

/* ------------------ Contract ------------------ */
function calculateContractScore(jobDetails, candidateProfile, MAX_CONTRACT_SCORE) {
  console.log("📄 [Contract] Calculating...");
  if (!jobDetails.employmentType || !candidateProfile.preferredContractType) {
    console.log("   ❌ Missing contract data\n");
    return 0;
  }
  const match = jobDetails.employmentType.toLowerCase() === candidateProfile.preferredContractType.toLowerCase();
  const score = match ? MAX_CONTRACT_SCORE : 0;
  console.log(`   Job: ${jobDetails.employmentType} | Candidate: ${candidateProfile.preferredContractType} | Match: ${match} | Score: ${score}\n`);
  return score;
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
async function calculateMatchScore(
  jobSkills,
  candidateSkills,
  jobDetails = {},
  candidateProfile = {},
  idCompany,
  jobPostId
) {
  if (!jobSkills?.length || !candidateSkills?.length) {
    console.log("⚠️ [calculateMatchScore] No skills available, returning 0");
    return 0;
  }

  console.log("\n🔍 [calculateMatchScore] Starting calculation...\n");

  const cfg = await getMatchingConfig(idCompany, jobPostId);

  const MAX_HARD_SKILL_SCORE = cfg.weights.hardSkill;
  const MAX_SOFT_SKILL_SCORE = cfg.weights.SoftSkill;
  const MAX_EXPERIENCE_SCORE = cfg.weights.experience;
  const MAX_SALARY_SCORE = cfg.weights.salary;
  const MAX_WORKMODE_SCORE = cfg.weights.workMode;
  const MAX_CONTRACT_SCORE = cfg.weights.contract;
  const EXCHANGE_RATES = cfg.exchangeRates || { USD: 1, EUR: 1.1, TND: 0.32 };

  console.log(`⚙️  Config weights: hardSkill=${MAX_HARD_SKILL_SCORE}, softSkill=${MAX_SOFT_SKILL_SCORE}, experience=${MAX_EXPERIENCE_SCORE}, salary=${MAX_SALARY_SCORE}, workMode=${MAX_WORKMODE_SCORE}, contract=${MAX_CONTRACT_SCORE}\n`);

  const hardSkillScore = calculateHardSkillsScore(jobSkills, candidateSkills);
  if (hardSkillScore === 0) {
    console.log("⛔ Hard skills score is 0, aborting calculation\n");
    return 0;
  }

  const softSkillScore = calculateSoftSkillsScore(jobDetails.skillAnalysis?.softSkills || [], candidateProfile.softSkills || [], MAX_SOFT_SKILL_SCORE);
  const experienceScore = calculateExperienceScore(jobSkills, candidateSkills, MAX_EXPERIENCE_SCORE);
  const salaryScore = calculateSalaryScore(jobDetails, candidateProfile, EXCHANGE_RATES, MAX_SALARY_SCORE);
  const workModeScore = calculateWorkModeScore(jobDetails, candidateProfile, MAX_WORKMODE_SCORE);
  const contractScore = calculateContractScore(jobDetails, candidateProfile, MAX_CONTRACT_SCORE);

  const totalScore = hardSkillScore + softSkillScore + experienceScore + salaryScore + workModeScore + contractScore;
  const finalScore = Math.round(totalScore * 10) / 10;

  console.log("=" .repeat(60));
  console.log(`📊 [FINAL SCORES] Hard=${hardSkillScore} + Soft=${softSkillScore} + Exp=${experienceScore} + Salary=${salaryScore} + WorkMode=${workModeScore} + Contract=${contractScore} = ${finalScore}`);
  console.log("=".repeat(60) + "\n");

  return finalScore;
}

module.exports = {
  calculateMatchScore,
  normalizeSkillName,
  checkIfCandidateUnlocked,
  calculateHardSkillsScore, // expose if needed
};
