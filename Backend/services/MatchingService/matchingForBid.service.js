const { getMatchingConfig } = require("./matchingConfig.service");
const UnlockCandidate = require("../../models/UnlockCandidate.model");

/* ------------------ CONSTANTS & HELPERS ------------------ */
// Toggle verbose logs for debugging (false in production)
const VERBOSE = false;

const LEVELS = { Beginner:1, Intermediate:3, Advanced:4, Expert:5, 1:1,2:2,3:3,4:4,5:5 };
const convertLevelToNumber = (level) => LEVELS[level] || 1;

const normalizeSkillName = (name) =>
  name ? name.split(".")[0].trim().replace(/^./, c => c.toUpperCase()) : "";

const normalizeSkillKey = (name) =>
  name ? name.split(".")[0].trim().toLowerCase() : "";

/* ------------------ HARD SKILLS ------------------ */
function calculateHardSkillsScore(jobSkills, candidateSkills, MAX) {
  if (VERBOSE) console.log("\n--- Hard Skills Calculation ---");
  if (!jobSkills.length) return 0;

  const totalPct =
    jobSkills.reduce((sum, s) => sum + (s.percentage || 0), 0) || jobSkills.length;

  const candidateMap = Object.fromEntries(
    candidateSkills.map(s => [normalizeSkillKey(s.name), s])
  );

  let hardSkillScore = 0;

  for (const job of jobSkills) {
    const candidate = candidateMap[normalizeSkillKey(job.name)];
    if (!candidate) {
      if (VERBOSE) console.log(`❌ Missing skill: ${job.name}`);
      continue;
    }

    const jobLvl = convertLevelToNumber(job.level);
    const candLvl =
      candidate.Levelconfirmed ??
      convertLevelToNumber(candidate.proficiencyLevel);

    const raw = Math.min((candLvl / jobLvl) * 100, 100);
    const weighted = raw * ((job.percentage || 0) / totalPct);

    if (VERBOSE)
      console.log(
        `✅ ${job.name} | JobLvl=${jobLvl} | CandLvl=${candLvl} | Weighted=${weighted.toFixed(2)}`
      );

    hardSkillScore += weighted;
  }

  const final = Math.min((hardSkillScore / 100) * MAX, MAX);
  if (VERBOSE) console.log(`💯 Hard skills score (${MAX}% max): ${final.toFixed(2)}`);
  return final;
}

/* ------------------ SOFT SKILLS ------------------ */
function calculateSoftSkillsScore(jobSoft, candSoft, MAX) {
  if (VERBOSE) console.log("\n--- Soft Skills Calculation ---");
  if (!jobSoft.length || !candSoft.length) return 0;

  const candSet = new Set(candSoft.map(s => normalizeSkillKey(s.name)));
  let matchCount = 0;

  for (const skill of jobSoft) {
    if (candSet.has(normalizeSkillKey(skill.name))) {
      matchCount++;
      if (VERBOSE) console.log(`✅ Soft skill matched: ${skill.name}`);
    } else if (VERBOSE) {
      console.log(`❌ Soft skill missing: ${skill.name}`);
    }
  }

  const score = (matchCount / jobSoft.length) * MAX;
  if (VERBOSE) console.log(`💯 Soft skills score (${MAX}% max): ${score.toFixed(2)}`);
  return score;
}

/* ------------------ EXPERIENCE ------------------ */
function calculateExperienceScore(jobSkills, candidateSkills, MAX) {
  if (VERBOSE) console.log("\n--- Experience Calculation ---");

  const candidateMap = Object.fromEntries(
    candidateSkills.map(s => [normalizeSkillKey(s.name), s])
  );

  let total = 0;
  let count = 0;

  for (const job of jobSkills) {
    const cand = candidateMap[normalizeSkillKey(job.name)];
    if (!cand) {
      if (VERBOSE) console.log(`❌ No experience for: ${job.name}`);
      continue;
    }

    const jobLvl = convertLevelToNumber(job.level);
    const candLvl =
      cand.Levelconfirmed ??
      convertLevelToNumber(cand.proficiencyLevel);

    const score = candLvl >= jobLvl ? 10 : candLvl === jobLvl - 1 ? 5 : 0;
    if (VERBOSE)
      console.log(
        `💡 ${job.name} | JobLvl=${jobLvl} | CandLvl=${candLvl} | Score=${score}`
      );

    total += score;
    count++;
  }

  const final = count ? (total / count) * (MAX / 10) : 0;
  if (VERBOSE) console.log(`💯 Experience score (${MAX}% max): ${final.toFixed(2)}`);
  return final;
}

/* ------------------ SALARY ------------------ */
function calculateSalaryScore(jobDetails, candProf, RATES, MAX, perUSD = true) {
  if (VERBOSE) console.log("\n--- Salary Calculation ---");

  const job = jobDetails?.salary;
  const cand = candProf?.expectedSalary;

  if (!job?.min || !job?.max || !job.currency || !cand?.min || !cand?.max || !cand.currency) {
    if (VERBOSE) console.log("❌ Missing salary info");
    return 0;
  }

  const convert = (amt, cur) =>
    perUSD ? amt * (RATES[cur] || 1) : amt / (RATES[cur] || 1);

  const jobMin = convert(job.min, job.currency);
  const jobMax = convert(job.max, job.currency);
  const candMin = convert(cand.min, cand.currency);
  const candMax = convert(cand.max, cand.currency);

  if (VERBOSE)
    console.log(
      `💡 Job: ${jobMin}-${jobMax} | Candidate: ${candMin}-${candMax}`
    );

  let score = 0;

  if (candMax < jobMin) {
    score = (candMax / jobMin) * MAX;
    if (VERBOSE) console.log("⚠️ Salary below range");
  } else if (candMin > jobMax) {
    score = (jobMax / candMin) * MAX;
    if (VERBOSE) console.log("⚠️ Salary above range");
  } else {
    const overlapMin = Math.max(jobMin, candMin);
    const overlapMax = Math.min(jobMax, candMax);
    score = ((overlapMax - overlapMin) / (jobMax - jobMin)) * MAX;
    if (VERBOSE) console.log("✅ Salary overlap");
  }

  score = Math.min(score, MAX);
  if (VERBOSE) console.log(`💯 Salary score (${MAX}% max): ${score.toFixed(2)}`);
  return score;
}

/* ------------------ WORK MODE ------------------ */
const calculateWorkModeScore = (job, cand, MAX) => {
  if (!job.location || !cand.workModePreference) return 0;
  const score =
    job.location.toLowerCase() === cand.workModePreference.toLowerCase()
      ? MAX
      : MAX / 2;

  if (VERBOSE)
    console.log(
      `💡 Work mode | Job=${job.location} | Cand=${cand.workModePreference} | Score=${score}`
    );

  return score;
};

/* ------------------ CONTRACT ------------------ */
const calculateContractScore = (job, cand, MAX) => {
  if (!job.employmentType || !cand.preferredContractType) return 0;
  const score =
    job.employmentType.toLowerCase() ===
    cand.preferredContractType.toLowerCase()
      ? MAX
      : 0;

  if (VERBOSE)
    console.log(
      `💡 Contract | Job=${job.employmentType} | Cand=${cand.preferredContractType} | Score=${score}`
    );

  return score;
};

/* ------------------ UNLOCK CHECK ------------------ */
async function checkIfCandidateUnlocked(companyId, candidateId) {
  try {
    const unlocked = await UnlockCandidate.findOne({
      idCompany: companyId,
      idCandidate: candidateId,
    });
    if (VERBOSE)
      console.log(`🔓 Candidate unlocked: ${!!unlocked}`);
    return !!unlocked;
  } catch {
    if (VERBOSE) console.log("❌ Unlock check failed");
    return false;
  }
}

/* ------------------ MAIN FUNCTION ------------------ */
async function calculateMatchScore(
  jobSkills,
  candidateSkills,
  jobDetails = {},
  candidateProfile = {},
  idCompany,
  jobPostId
) {
  if (VERBOSE) console.log("\n========== MATCHING START ==========");

  if (!jobSkills?.length || !candidateSkills?.length) {
    if (VERBOSE) console.log("❌ Missing skills → score = 0");
    return 0;
  }

  const unlocked =
    idCompany && candidateProfile.userId?._id
      ? await checkIfCandidateUnlocked(idCompany, candidateProfile.userId._id)
      : false;

  const cfg = await getMatchingConfig(idCompany, jobPostId);
  const w = cfg.weights;

  const hardSkillScore = calculateHardSkillsScore(jobSkills, candidateSkills, w.hardSkill);
  if (hardSkillScore === 0) {
    if (VERBOSE) console.log("❌ Eliminated: no hard skill match");
    return 0;
  }

  const softSkillScore = calculateSoftSkillsScore(
    jobDetails.skillAnalysis?.softSkills || [],
    candidateProfile.softSkills || [],
    w.SoftSkill
  );

  const experienceScore = calculateExperienceScore(jobSkills, candidateSkills, w.experience);
  const salaryScore = calculateSalaryScore(jobDetails, candidateProfile, cfg.exchangeRates || {}, w.salary);
  const workModeScore = calculateWorkModeScore(jobDetails, candidateProfile, w.workMode);
  const contractScore = calculateContractScore(jobDetails, candidateProfile, w.contract);

  const total =
    hardSkillScore +
    softSkillScore +
    experienceScore +
    salaryScore +
    workModeScore +
    contractScore;

  if (VERBOSE) {
    console.log("---------- SCORES ----------");
    console.log(`Hard Skills : ${hardSkillScore.toFixed(2)}`);
    console.log(`Soft Skills : ${softSkillScore.toFixed(2)}`);
    console.log(`Experience  : ${experienceScore.toFixed(2)}`);
    console.log(`Salary      : ${salaryScore.toFixed(2)}`);
    console.log(`Work Mode   : ${workModeScore.toFixed(2)}`);
    console.log(`Contract    : ${contractScore.toFixed(2)}`);
    console.log(`💯 TOTAL    : ${total.toFixed(2)} | Unlocked: ${unlocked}`);
  }

  return Math.round(total * 10) / 10;
}

module.exports = {
  calculateMatchScore,
  normalizeSkillName,
  checkIfCandidateUnlocked,
};
