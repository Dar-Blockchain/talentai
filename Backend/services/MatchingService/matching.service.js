/* ------------------------------------------------
   CONSTANTS & HELPERS
------------------------------------------------ */
// Toggle verbose logs for debugging (controlled by environment variable)
const VERBOSE = process.env.VERBOSE_MATCHING === 'true' || process.env.NODE_ENV === 'development';

const convertLevelToNumber = (level) => {
  if (level == null) return 1; // null, undefined → default = 1
  const n = Number(level); // convertit "3" → 3
  return Number.isNaN(n) ? 1 : n; // si ce n’est pas un nombre → 1
};

/**
 * Retourne une version normalisée pour affichage (First letter uppercase)
 * Préservée pour compatibilité publique.
 */
const normalizeSkillName = (name) =>
  name
    ? name
        .split(".")[0]
        .trim()
        .replace(/^./, (c) => c.toUpperCase())
    : "";

/**
 * Clef interne utilisée pour lookup/comparaisons (lowercase, trimmed)
 */
const normalizeSkillKey = (name) => (name ? name.split(".")[0].trim().toLowerCase() : "");

/* ------------------------------------------------
   0️⃣ HARD SKILLS (Optimisé)
------------------------------------------------ */
function calculateHardSkillsScore(jobSkills, candidateSkills, MAX, candidateProfile) {
  if (VERBOSE) {
    console.log(`\n--- Hard Skills Calculation ${candidateProfile.firstName} ${candidateProfile.lastName} ---`);
  }

  if (!jobSkills.length) return 0;

  const totalPct = jobSkills.reduce((sum, s) => sum + (s.percentage || 0), 0) || jobSkills.length;

  // build candidate map once with normalized keys
  const candidateMap = Object.fromEntries(candidateSkills.map((s) => [normalizeSkillKey(s.name), s]));

  let hardSkillScore = 0;

  for (const job of jobSkills) {
    const key = normalizeSkillKey(job.name);
    const candidate = candidateMap[key];

    if (!candidate || candidate.Levelconfirmed == null) {
      if (VERBOSE) console.log(`❌ Candidate missing skill: ${job.name}`);
      continue;
    }

    const jobLvl = convertLevelToNumber(job.level);
    const candidateLvl = convertLevelToNumber(candidate.Levelconfirmed);

    if (candidateLvl === 0) {
      if (VERBOSE) console.log(`⚪ Skill ignored (candLvl = 0): ${job.name}`);
      continue;
    }

    const raw = Math.min((candidateLvl / jobLvl) * 100, 100);
    const weighted = raw * ((job.percentage || 0) / totalPct);

    if (VERBOSE)
      console.log(`✅ Matched Skill: ${job.name} | JobLvl: ${jobLvl} | CandLvl: ${candidateLvl} | RawScore: ${raw.toFixed(2)} | WeightedScore: ${weighted.toFixed(2)}`);

    hardSkillScore += weighted;
  }

  const final = Math.min((hardSkillScore / 100) * MAX, MAX);
  if (VERBOSE) console.log(`💯 Hard skill score (${MAX}% max): ${final.toFixed(2)}`);
  return final;
}

/* ------------------------------------------------
   1️⃣ SOFT SKILLS (Optimisé)
------------------------------------------------ */
function calculateSoftSkillsScore(jobSoft, candSoft, MAX, candidateProfile) {
  if (VERBOSE) console.log(`\n--- Soft Skills Calculation ${candidateProfile.firstName} ${candidateProfile.lastName} --- `);
  if (!jobSoft.length || !candSoft.length) return 0;

  const candSet = new Set(candSoft.map((s) => normalizeSkillKey(s.name)));
  let matchCount = 0;

  for (const skill of jobSoft) {
    if (candSet.has(normalizeSkillKey(skill.name))) {
      if (VERBOSE) console.log(`✅ Matched Soft Skill: ${skill.name}`);
      matchCount++;
    } else if (VERBOSE) {
      console.log(`❌ Soft Skill not matched: ${skill.name}`);
    }
  }

  const score = (matchCount / jobSoft.length) * MAX;
  if (VERBOSE) console.log(`💯 Soft skill score (${MAX}% max): ${score.toFixed(2)}`);
  return score;
}

/* ------------------------------------------------
   2️⃣ EXPERIENCE (Optimisé)
------------------------------------------------ */
function calculateExperienceScore(jobSkills, candidateSkills, MAX, candidateProfile) {
  if (VERBOSE) console.log(`\n--- Experience Score Calculation ${candidateProfile.firstName} ${candidateProfile.lastName} --- `);

  const candidateMap = Object.fromEntries(candidateSkills.map((s) => [normalizeSkillKey(s.name), s]));

  let total = 0;
  let count = 0;

  for (const job of jobSkills) {
    const cand = candidateMap[normalizeSkillKey(job.name)];
    if (!cand) {
      if (VERBOSE) console.log(`❌ No candidate experience for skill: ${job.name}`);
      continue;
    }

    const jobLvl = convertLevelToNumber(job.level);
    const candLvl = convertLevelToNumber(cand.Levelconfirmed);
    const score = candLvl >= jobLvl ? 10 : candLvl === jobLvl - 1 ? 5 : 0;

    if (VERBOSE) console.log(`💡 Experience for ${job.name}: JobLvl=${jobLvl}, CandLvl=${candLvl}, Score=${score}`);
    total += score;
    count++;
  }

  const finalScore = count ? (total / count) * (MAX / 10) : 0;
  if (VERBOSE) console.log(`💯 Total Experience Score (${MAX}% max): ${finalScore.toFixed(2)}`);
  return finalScore;
}

/* ------------------------------------------------
   3️⃣ SALARY (Optimisé)
------------------------------------------------ */
function calculateSalaryScore(jobDetails, candProf, RATES, MAX, perUSD = true) {
  if (VERBOSE) console.log(`\n--- Salary Score Calculation ${candProf.firstName} ${candProf.lastName} --- `);
  const job = jobDetails?.salary;
  const cand = candProf?.expectedSalary;

  if (!job?.min || !job?.max || !job.currency || !cand?.min || !cand?.max || !cand.currency) {
    if (VERBOSE) console.log("❌ Salary info missing, skipping salary score.");
    return 0;
  }

  const convert = (amt, cur) => (perUSD ? amt * (RATES[cur] || 1) : amt / (RATES[cur] || 1));
  const jobMin = convert(job.min, job.currency);
  const jobMax = convert(job.max, job.currency);
  const candMin = convert(cand.min, cand.currency);
  const candMax = convert(cand.max, cand.currency);

  if (VERBOSE) console.log(`💡 Job Salary: ${jobMin.toFixed(2)}-${jobMax.toFixed(2)}, Cand Salary: ${candMin.toFixed(2)}-${candMax.toFixed(2)}`);

  // Calcul de score partiel si pas de chevauchement
  let score = 0;
  if (candMax < jobMin) {
    score = (candMax / jobMin) * MAX;
    if (VERBOSE) console.log("⚠️ Candidate salary below job range → Partial score applied");
  } else if (candMin > jobMax) {
    score = (jobMax / candMin) * MAX;
    if (VERBOSE) console.log("⚠️ Candidate salary above job range → Partial score applied");
  } else {
    const overlapMin = Math.max(jobMin, candMin);
    const overlapMax = Math.min(jobMax, candMax);
    score = ((overlapMax - overlapMin) / (jobMax - jobMin)) * MAX;
    if (VERBOSE) console.log("✅ Salary overlap → Normal score");
  }

  score = Math.min(score, MAX);
  if (VERBOSE) console.log(`💯 Salary score (${MAX}% max): ${score.toFixed(2)}`);
  return score;
}

/* ------------------------------------------------
   4️⃣ WORK MODE
------------------------------------------------ */
const calculateWorkModeScore = (job, cand, MAX) => {
  if (!job.workMode || !cand.workModePreference) return 0;
  const score = job.workMode.toLowerCase() === cand.workModePreference.toLowerCase() ? MAX : MAX / 2;
  if (VERBOSE) console.log(`💡 WorkMode: Job=${job.workMode}, Cand=${cand.workModePreference}, Score=${score}`);
  return score;
};

/* ------------------------------------------------
   5️⃣ CONTRACT
------------------------------------------------ */
const calculateContractScore = (job, cand, MAX) => {
  if (!job.employmentType || !cand.preferredContractType) return 0;
  const score = job.employmentType.toLowerCase() === cand.preferredContractType.toLowerCase() ? MAX : 0;
  if (VERBOSE) console.log(`💡 Contract: Job=${job.employmentType}, Cand=${cand.preferredContractType}, Score=${score}`);
  return score;
};

/* ------------------------------------------------
   🚀 MAIN FUNCTION (Optimisée)
------------------------------------------------ */
async function calculateMatchScore(jobSkills, candidateSkills, jobDetails = {}, candidateProfile = {}, idCompany, matchingConfig = {}, unlockedSet = new Set()) {
  if (VERBOSE) console.log("\n========== MATCHING START ==========");
  if (VERBOSE) console.log(candidateProfile.firstName + " " + candidateProfile.lastName);

  if (!jobSkills?.length || !candidateSkills?.length) {
    if (VERBOSE) console.log("❌ Missing skills → Score = 0");
    return 0;
  }

  // lookup unlock state from Set (fast)
  const unlocked = candidateProfile.userId?._id ? unlockedSet.has(String(candidateProfile.userId._id)) : false;

  const cfg = matchingConfig || {};
  const weights = (cfg && cfg.weights) || {};
  const { hardSkill = 50, SoftSkill = 10, experience = 10, salary = 10, workMode = 10, contract = 10 } = weights;

  console.log(`\n📊 [MATCHING ENGINE] - Calculating match score for: ${candidateProfile.firstName} ${candidateProfile.lastName}`);
  console.log(`\n🎯 COMPONENT WEIGHTS CONFIGURATION:`);
  console.log(`   Hard Skills Weight .... ${hardSkill}%`);
  console.log(`   Soft Skills Weight .... ${SoftSkill}%`);
  console.log(`   Experience Weight ..... ${experience}%`);
  console.log(`   Salary Weight ......... ${salary}%`);
  console.log(`   Work Mode Weight ...... ${workMode}%`);
  console.log(`   Contract Weight ....... ${contract}%`);
  console.log(`   TOTAL ................ ${hardSkill + SoftSkill + experience + salary + workMode + contract}%`);

  const hardSkillScore = calculateHardSkillsScore(jobSkills, candidateSkills, hardSkill, candidateProfile);
  if (hardSkillScore === 0) {
    console.log(`❌ [ELIMINATION] Candidate eliminated: no hard skill match - cannot proceed`);
    return 0;
  }

  const softSkillScore = calculateSoftSkillsScore(jobDetails.skillAnalysis?.softSkills || [], candidateProfile.softSkills || [], SoftSkill, candidateProfile);
  const experienceScore = calculateExperienceScore(jobSkills, candidateSkills, experience, candidateProfile);
  const salaryScore = calculateSalaryScore(jobDetails, candidateProfile, cfg.exchangeRates || {}, salary);
  const workModeScore = calculateWorkModeScore(jobDetails, candidateProfile, workMode);
  const contractScore = calculateContractScore(jobDetails, candidateProfile, contract);

  const total = hardSkillScore + softSkillScore + experienceScore + salaryScore + workModeScore + contractScore;

  console.log(`\n📋 [SCORING BREAKDOWN]:`);
  console.log(`   Hard Skills Score .... ${hardSkillScore.toFixed(2)} / ${hardSkill}%`);
  console.log(`   Soft Skills Score .... ${softSkillScore.toFixed(2)} / ${SoftSkill}%`);
  console.log(`   Experience Score .... ${experienceScore.toFixed(2)} / ${experience}%`);
  console.log(`   Salary Score ........ ${salaryScore.toFixed(2)} / ${salary}%`);
  console.log(`   Work Mode Score .... ${workModeScore.toFixed(2)} / ${workMode}%`);
  console.log(`   Contract Score ..... ${contractScore.toFixed(2)} / ${contract}%`);
  console.log(`   ─────────────────────────────────────────`);
  console.log(`   💯 TOTAL SCORE ...... ${total.toFixed(2)} / 100`);

  if (VERBOSE) {
    console.log("---------- DETAILED VERBOSE SCORES ----------");
    console.log(`Hard Skills ${candidateProfile.firstName} ${candidateProfile.lastName} : ${hardSkillScore.toFixed(2)}`);
    console.log(`Soft Skills ${candidateProfile.firstName} ${candidateProfile.lastName} : ${softSkillScore.toFixed(2)}`);
    console.log(`Experience ${candidateProfile.firstName} ${candidateProfile.lastName} : ${experienceScore.toFixed(2)}`);
    console.log(`Salary ${candidateProfile.firstName} ${candidateProfile.lastName} : ${salaryScore.toFixed(2)}`);
    console.log(`Work Mode ${candidateProfile.firstName} ${candidateProfile.lastName} : ${workModeScore.toFixed(2)}`);
    console.log(`Contract ${candidateProfile.firstName} ${candidateProfile.lastName} : ${contractScore.toFixed(2)}`);
    console.log(`💯 Total Score ${candidateProfile.firstName} ${candidateProfile.lastName} : ${total.toFixed(2)}, Unlocked: ${unlocked}`);
  }

  return {
    score: Math.round(total * 10) / 10,
    unlocked,
  };
}

module.exports = {
  calculateMatchScore,
  normalizeSkillName,
};
