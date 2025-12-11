const UnlockCandidate = require("../../models/UnlockCandidateModel");

/* ------------------------------------------------
   CONSTANTS & HELPERS
------------------------------------------------ */
const convertLevelToNumber = (level) => {
  if (level == null) return 1; // null, undefined → default = 1
  const n = Number(level); // convertit "3" → 3
  return Number.isNaN(n) ? 1 : n; // si ce n’est pas un nombre → 1
};

const normalizeSkillName = (name) =>
  name
    ? name
        .split(".")[0]
        .trim()
        .replace(/^./, (c) => c.toUpperCase())
    : "";

/* ------------------------------------------------
   0️⃣ HARD SKILLS (Optimisé — importance ignorée)
------------------------------------------------ */
function calculateHardSkillsScore(
  jobSkills,
  candidateSkills,
  MAX,
  candidateProfile
) {
  console.log(
    `\n--- Hard Skills Calculation ${candidateProfile.firstName} ${candidateProfile.lastName} (Updated: candLvl=0 OR null → skill ignored) ---`
  );

  if (!jobSkills.length) return 0;

  const totalPct =
    jobSkills.reduce((sum, s) => sum + (s.percentage || 0), 0) ||
    jobSkills.length;
  const candidateMap = Object.fromEntries(
    candidateSkills.map((s) => [s.name?.toLowerCase(), s])
  );

  let hardSkillScore = 0;

  for (const job of jobSkills) {
    const candidate = candidateMap[job.name?.toLowerCase()];

    // 🆕 Nouvelle règle : skill non trouvée → skill absente
    if (!candidate || candidate.Levelconfirmed == null) {
      console.log(
        `❌ Candidate does NOT have skill: ${job.name} (not found OR Levelconfirmed=null)`
      );
      continue;
    }

    const jobLvl = convertLevelToNumber(job.level);
    const candidateLvl = convertLevelToNumber(candidate.Levelconfirmed);

    // 🆕 Nouvelle règle : candLvl === 0 → skill absente
    if (candidate.Levelconfirmed === 0 || candidateLvl === 0) {
      console.log(`⚪ Skill ignored (candLvl = 0): ${job.name}`);
      continue;
    }

    const raw = Math.min((candidateLvl / jobLvl) * 100, 100);
    const weighted = raw * ((job.percentage || 0) / totalPct);

    console.log(
      `✅ Matched Skill: ${
        job.name
      } | JobLvl: ${jobLvl} | CandLvl: ${candidateLvl} | RawScore: ${raw.toFixed(
        2
      )} | WeightedScore: ${weighted.toFixed(2)}`
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
function calculateSoftSkillsScore(jobSoft, candSoft, MAX, candidateProfile) {
  console.log(
    `\n--- Soft Skills Calculation ${candidateProfile.firstName} ${candidateProfile.lastName}  --- `
  );
  if (!jobSoft.length || !candSoft.length) return 0;

  const candSet = new Set(candSoft.map((s) => s.name?.toLowerCase()));
  let matchCount = 0;

  jobSoft.forEach((skill) => {
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
function calculateExperienceScore(
  jobSkills,
  candidateSkills,
  MAX,
  candidateProfile
) {
  console.log(
    `\n--- Experience Score Calculation ${candidateProfile.firstName} ${candidateProfile.lastName}  --- `
  );
  const candidateMap = Object.fromEntries(
    candidateSkills.map((s) => [s.name?.toLowerCase(), s])
  );

  let total = 0;
  let count = 0;

  jobSkills.forEach((job) => {
    const cand = candidateMap[job.name?.toLowerCase()];
    if (!cand) {
      console.log(`❌ No candidate experience for skill: ${job.name}`);
      return;
    }

    const jobLvl = convertLevelToNumber(job.level);
    const candLvl = convertLevelToNumber(cand.Levelconfirmed);
    const score = candLvl >= jobLvl ? 10 : candLvl === jobLvl - 1 ? 5 : 0;

    console.log(
      `💡 Experience for ${job.name}: JobLvl=${jobLvl}, CandLvl=${candLvl}, Score=${score}`
    );
    total += score;
    count++;
  });

  const finalScore = count ? (total / count) * (MAX / 10) : 0;
  console.log(
    `💯 Total Experience Score (${MAX}% max): ${finalScore.toFixed(2)}`
  );
  return finalScore;
}

/* ------------------------------------------------
   3️⃣ SALARY (Optimisé)
------------------------------------------------ */
function calculateSalaryScore(jobDetails, candProf, RATES, MAX, perUSD = true) {
  console.log(
    `\n--- Salary Score Calculation ${candProf.firstName} ${candProf.lastName}  --- `
  );
  const job = jobDetails?.salary;
  const cand = candProf?.expectedSalary;

  if (
    !job?.min ||
    !job?.max ||
    !job.currency ||
    !cand?.min ||
    !cand?.max ||
    !cand.currency
  ) {
    console.log("❌ Salary info missing, skipping salary score.");
    return 0;
  }

  const convert = (amt, cur) =>
    perUSD ? amt * (RATES[cur] || 1) : amt / (RATES[cur] || 1);
  const jobMin = convert(job.min, job.currency);
  const jobMax = convert(job.max, job.currency);
  const candMin = convert(cand.min, cand.currency);
  const candMax = convert(cand.max, cand.currency);

  console.log(
    `💡 Job Salary: ${jobMin.toFixed(2)}-${jobMax.toFixed(
      2
    )}, Cand Salary: ${candMin.toFixed(2)}-${candMax.toFixed(2)}`
  );

  // Calcul de score partiel si pas de chevauchement
  let score = 0;
  if (candMax < jobMin) {
    // Salaire candidat < job → score décroissant
    score = (candMax / jobMin) * MAX;
    console.log("⚠️ Candidate salary below job range → Partial score applied");
  } else if (candMin > jobMax) {
    // Salaire candidat > job → score décroissant
    score = (jobMax / candMin) * MAX;
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
  const score =
    job.location.toLowerCase() === cand.workModePreference.toLowerCase()
      ? MAX
      : MAX / 2;
  console.log(
    `💡 WorkMode: Job=${job.location}, Cand=${cand.workModePreference}, Score=${score}`
  );
  return score;
};

/* ------------------------------------------------
   5️⃣ CONTRACT
------------------------------------------------ */
const calculateContractScore = (job, cand, MAX) => {
  if (!job.employmentType || !cand.preferredContractType) return 0;
  const score =
    job.employmentType.toLowerCase() ===
    cand.preferredContractType.toLowerCase()
      ? MAX
      : 0;
  console.log(
    `💡 Contract: Job=${job.employmentType}, Cand=${cand.preferredContractType}, Score=${score}`
  );
  return score;
};

/* ------------------------------------------------
   🚀 MAIN FUNCTION (Optimisée)
------------------------------------------------ */
async function calculateMatchScore(
  jobSkills,
  candidateSkills,
  jobDetails = {},
  candidateProfile = {},
  idCompany,
  matchingConfig,
  unlockedSet
) {
  console.log("\n========== MATCHING START ==========");
  console.log(candidateProfile.firstName + " " + candidateProfile.lastName);
  console.log(`Job Skills: ${jobSkills.map((s) => s.name).join(", ")}`);
  console.log(
    `Candidate Skills: ${candidateSkills.map((s) => s.name).join(", ")}`
  );

  if (!jobSkills?.length || !candidateSkills?.length) {
    console.log("❌ Missing skills → Score = 0");
    return 0;
  }

  // ✅ lookup dans Set au lieu de requête MongoDB
  const unlocked = candidateProfile.userId?._id
    ? unlockedSet.has(String(candidateProfile.userId._id))
    : false;

  const cfg = matchingConfig;
  const { hardSkill, SoftSkill, experience, salary, workMode, contract } = cfg.weights;

  const hardSkillScore = calculateHardSkillsScore(
    jobSkills,
    candidateSkills,
    hardSkill,
    candidateProfile
  );
  if (hardSkillScore === 0) {
    console.log("❌ Candidate eliminated: no hard skill match");
    return 0;
  }

  const softSkillScore = calculateSoftSkillsScore(
    jobDetails.skillAnalysis?.softSkills || [],
    candidateProfile.softSkills || [],
    SoftSkill,
    candidateProfile
  );
  const experienceScore = calculateExperienceScore(
    jobSkills,
    candidateSkills,
    experience,
    candidateProfile
  );
  const salaryScore = calculateSalaryScore(
    jobDetails,
    candidateProfile,
    cfg.exchangeRates || {},
    salary
  );
  const workModeScore = calculateWorkModeScore(
    jobDetails,
    candidateProfile,
    workMode
  );
  const contractScore = calculateContractScore(
    jobDetails,
    candidateProfile,
    contract
  );

  const total =
    hardSkillScore +
    softSkillScore +
    experienceScore +
    salaryScore +
    workModeScore +
    contractScore;

  console.log("---------- SCORES DETAIL ----------");
  console.log(
    `Hard Skills ${candidateProfile.firstName} ${
      candidateProfile.lastName
    } : ${hardSkillScore.toFixed(2)}`
  );
  console.log(
    `Soft Skills ${candidateProfile.firstName} ${
      candidateProfile.lastName
    } : ${softSkillScore.toFixed(2)}`
  );
  console.log(
    `Experience ${candidateProfile.firstName} ${
      candidateProfile.lastName
    } : ${experienceScore.toFixed(2)}`
  );
  console.log(
    `Salary ${candidateProfile.firstName} ${
      candidateProfile.lastName
    } : ${salaryScore.toFixed(2)}`
  );
  console.log(
    `Work Mode ${candidateProfile.firstName} ${
      candidateProfile.lastName
    } : ${workModeScore.toFixed(2)}`
  );
  console.log(
    `Contract ${candidateProfile.firstName} ${
      candidateProfile.lastName
    } : ${contractScore.toFixed(2)}`
  );
  console.log(
    `💯 Total Score ${candidateProfile.firstName} ${
      candidateProfile.lastName
    } : ${total.toFixed(2)}, Unlocked: ${unlocked}`
  );

  return {
    score: Math.round(total * 10) / 10,
    unlocked,
  };
}

module.exports = {
  calculateMatchScore,
  normalizeSkillName,
};
