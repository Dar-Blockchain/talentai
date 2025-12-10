const { getMatchingConfig } = require("./matchingConfigService");
const UnlockCandidate = require("../../models/UnlockCandidateModel");

/* ------------------------------------------------
   CONSTANTS & HELPERS
------------------------------------------------ */
const LEVELS = { Beginner:1, Intermediate:3, Advanced:4, Expert:5, 1:1,2:2,3:3,4:4,5:5 };
const convertLevelToNumber = (level) => LEVELS[level] || 1;

const normalizeSkillName = (name) =>
  name ? name.split(".")[0].trim().replace(/^./, c => c.toUpperCase()) : "";

/* ------------------------------------------------
   0️⃣ HARD SKILLS (Optimisé — importance ignorée)
------------------------------------------------ */
function calculateHardSkillsScore(jobSkills, candidateSkills, MAX) {
  console.log("\n--- Hard Skills Calculation (Updated: candLvl=0 → skill ignored) ---");

  if (!jobSkills.length) return 0;

  const totalPct = jobSkills.reduce((sum, s) => sum + (s.percentage || 0), 0) || jobSkills.length;
  const candidateMap = Object.fromEntries(candidateSkills.map(s => [s.name?.toLowerCase(), s]));

  let hardSkillScore = 0;

  for (const job of jobSkills) {
    const candidate = candidateMap[job.name?.toLowerCase()];

    if (!candidate) {
      console.log(`❌ Candidate does not have skill: ${job.name}`);
      continue; // pas trouvé → ignorée
    }

    const jobLvl = convertLevelToNumber(job.level);
    const candidateLvl = convertLevelToNumber(candidate.Levelconfirmed);

    // 🆕 Nouvelle règle : candLvl = 0 = skill absente → on ignore
    if (candidate.Levelconfirmed === 0 || candidateLvl === 0) {
      console.log(`⚪ Skill ignored (candLvl=0): ${job.name}`);
      continue;
    }

    const raw = Math.min((candidateLvl / jobLvl) * 100, 100);
    const weighted = raw * ((job.percentage || 0) / totalPct);

    console.log(
      `✅ Matched Skill: ${job.name} | JobLvl: ${jobLvl} | CandLvl: ${candidateLvl} | RawScore: ${raw.toFixed(2)} | WeightedScore: ${weighted.toFixed(2)}`
    );

    hardSkillScore += weighted;
  }

  const final = Math.min((hardSkillScore / 100) * MAX, MAX);
  console.log(`💯 Hard skill score (${MAX}% max): ${final.toFixed(2)}`);
  return final;
}

/* ------------------------------------------------
   1️⃣ SOFT SKILLS (Optimisé)
------------------------------------------------ */
function calculateSoftSkillsScore(jobSoft, candSoft, MAX) {
  console.log("\n--- Soft Skills Calculation ---");
  if (!jobSoft.length || !candSoft.length) return 0;

  const candSet = new Set(candSoft.map(s => s.name?.toLowerCase()));
  let matchCount = 0;

  jobSoft.forEach(skill => {
    if (candSet.has(skill.name?.toLowerCase())) {
      console.log(`✅ Matched Soft Skill: ${skill.name}`);
      matchCount++;
    } else {
      console.log(`❌ Soft Skill not matched: ${skill.name}`);
    }
  });

  const score = (matchCount / jobSoft.length) * MAX;
  console.log(`💯 Soft skill score (${MAX}% max): ${score.toFixed(2)}`);
  return score;
}

/* ------------------------------------------------
   2️⃣ EXPERIENCE (Optimisé)
------------------------------------------------ */
function calculateExperienceScore(jobSkills, candidateSkills, MAX) {
  console.log("\n--- Experience Score Calculation ---");
  const candidateMap = Object.fromEntries(candidateSkills.map(s => [s.name?.toLowerCase(), s]));

  let total = 0;
  let count = 0;

  jobSkills.forEach(job => {
    const cand = candidateMap[job.name?.toLowerCase()];
    if (!cand) {
      console.log(`❌ No candidate experience for skill: ${job.name}`);
      return;
    }

    const jobLvl = convertLevelToNumber(job.level);
    const candLvl = convertLevelToNumber(cand.Levelconfirmed);
    const score = candLvl >= jobLvl ? 10 : candLvl === jobLvl - 1 ? 5 : 0;

    console.log(`💡 Experience for ${job.name}: JobLvl=${jobLvl}, CandLvl=${candLvl}, Score=${score}`);
    total += score;
    count++;
  });

  const finalScore = count ? (total / count) * (MAX / 10) : 0;
  console.log(`💯 Total Experience Score (${MAX}% max): ${finalScore.toFixed(2)}`);
  return finalScore;
}

/* ------------------------------------------------
   3️⃣ SALARY (Optimisé)
------------------------------------------------ */
function calculateSalaryScore(jobDetails, candProf, RATES, MAX, perUSD = true) {
  console.log("\n--- Salary Score Calculation ---");
  const job = jobDetails?.salary;
  const cand = candProf?.expectedSalary;

  if (!job?.min || !job?.max || !job.currency || !cand?.min || !cand?.max || !cand.currency) {
    console.log("❌ Salary info missing, skipping salary score.");
    return 0;
  }

  const convert = (amt, cur) => perUSD ? amt * (RATES[cur] || 1) : amt / (RATES[cur] || 1);
  const jobMin = convert(job.min, job.currency);
  const jobMax = convert(job.max, job.currency);
  const candMin = convert(cand.min, cand.currency);
  const candMax = convert(cand.max, cand.currency);

  console.log(`💡 Job Salary: ${jobMin.toFixed(2)}-${jobMax.toFixed(2)}, Cand Salary: ${candMin.toFixed(2)}-${candMax.toFixed(2)}`);

  // Calcul de score partiel si pas de chevauchement
  let score = 0;
  if (candMax < jobMin) {
    // Salaire candidat < job → score décroissant
    score = ((candMax / jobMin) * MAX);
    console.log("⚠️ Candidate salary below job range → Partial score applied");
  } else if (candMin > jobMax) {
    // Salaire candidat > job → score décroissant
    score = ((jobMax / candMin) * MAX);
    console.log("⚠️ Candidate salary above job range → Partial score applied");
  } else {
    // Chevauchement
    const overlapMin = Math.max(jobMin, candMin);
    const overlapMax = Math.min(jobMax, candMax);
    score = ((overlapMax - overlapMin) / (jobMax - jobMin)) * MAX;
    console.log("✅ Salary overlap → Normal score");
  }

  score = Math.min(score, MAX);
  console.log(`💯 Salary score (${MAX}% max): ${score.toFixed(2)}`);
  return score;
}


/* ------------------------------------------------
   4️⃣ WORK MODE
------------------------------------------------ */
const calculateWorkModeScore = (job, cand, MAX) => {
  if (!job.location || !cand.workModePreference) return 0;
  const score = job.location.toLowerCase() === cand.workModePreference.toLowerCase() ? MAX : MAX / 2;
  console.log(`💡 WorkMode: Job=${job.location}, Cand=${cand.workModePreference}, Score=${score}`);
  return score;
};

/* ------------------------------------------------
   5️⃣ CONTRACT
------------------------------------------------ */
const calculateContractScore = (job, cand, MAX) => {
  if (!job.employmentType || !cand.preferredContractType) return 0;
  const score = job.employmentType.toLowerCase() === cand.preferredContractType.toLowerCase() ? MAX : 0;
  console.log(`💡 Contract: Job=${job.employmentType}, Cand=${cand.preferredContractType}, Score=${score}`);
  return score;
};

/* ------------------------------------------------
   6️⃣ UNLOCK CHECK
------------------------------------------------ */
async function checkIfCandidateUnlocked(companyId, candidateId) {
  try {
    const unlocked = await UnlockCandidate.findOne({ idCompany: companyId, idCandidate: candidateId });
    console.log(`🔓 Candidate ${candidateId} unlocked: ${!!unlocked}`);
    return !!unlocked;
  } catch (err) {
    console.log("❌ Error checking unlock status:", err);
    return false;
  }
}

/* ------------------------------------------------
   🚀 MAIN FUNCTION (Optimisée)
------------------------------------------------ */
async function calculateMatchScore(
  jobSkills,
  candidateSkills,
  jobDetails = {},
  candidateProfile = {},
  idCompany,
  jobPostId
) {
  console.log("\n========== MATCHING START ==========");
  console.log(candidateProfile.firstName + " " + candidateProfile.lastName);
  console.log(`Job Skills: ${jobSkills.map(s => s.name).join(", ")}`);
  console.log(`Candidate Skills: ${candidateSkills.map(s => s.name).join(", ")}`);

  if (!jobSkills?.length || !candidateSkills?.length) {
    console.log("❌ Missing skills → Score = 0");
    return 0;
  }

  const unlocked =
    idCompany && candidateProfile.userId?._id
      ? await checkIfCandidateUnlocked(idCompany, candidateProfile.userId._id)
      : false;

  const cfg = await getMatchingConfig(idCompany, jobPostId);

  const hardSkillScore = calculateHardSkillsScore(jobSkills, candidateSkills, cfg.weights.hardSkill);
  if (hardSkillScore === 0) {
    console.log("❌ Candidate eliminated: no hard skill match");
    return 0;
  }

  const softSkillScore = calculateSoftSkillsScore(jobDetails.skillAnalysis?.softSkills || [], candidateProfile.softSkills || [], cfg.weights.SoftSkill);
  const experienceScore = calculateExperienceScore(jobSkills, candidateSkills, cfg.weights.experience);
  const salaryScore = calculateSalaryScore(jobDetails, candidateProfile, cfg.exchangeRates || {}, cfg.weights.salary);
  const workModeScore = calculateWorkModeScore(jobDetails, candidateProfile, cfg.weights.workMode);
  const contractScore = calculateContractScore(jobDetails, candidateProfile, cfg.weights.contract);

  const total = hardSkillScore + softSkillScore + experienceScore + salaryScore + workModeScore + contractScore;

  console.log("---------- SCORES DETAIL ----------");
  console.log(`Hard Skills: ${hardSkillScore.toFixed(2)}`);
  console.log(`Soft Skills: ${softSkillScore.toFixed(2)}`);
  console.log(`Experience: ${experienceScore.toFixed(2)}`);
  console.log(`Salary: ${salaryScore.toFixed(2)}`);
  console.log(`Work Mode: ${workModeScore.toFixed(2)}`);
  console.log(`Contract: ${contractScore.toFixed(2)}`);
  console.log(`💯 Total Score: ${total.toFixed(2)}, Unlocked: ${unlocked}`);

  return {
    score: Math.round(total * 10) / 10,
    unlocked,
  };
}

module.exports = {
  calculateMatchScore,
  normalizeSkillName,
  checkIfCandidateUnlocked,
};
