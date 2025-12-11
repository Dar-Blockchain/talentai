const { getMatchingConfig } = require("./matchingConfigService");
const UnlockCandidate = require("../../models/UnlockCandidateModel");

/* ------------------ CONSTANTS & HELPERS ------------------ */
const LEVELS = { Beginner:1, Intermediate:3, Advanced:4, Expert:5, 1:1,2:2,3:3,4:4,5:5 };
const convertLevelToNumber = (level) => LEVELS[level] || 1;

const normalizeSkillName = (name) =>
  name ? name.split(".")[0].trim().replace(/^./, c => c.toUpperCase()) : "";

/* ------------------ HARD SKILLS ------------------ */
function calculateHardSkillsScore(jobSkills, candidateSkills, MAX) {
  if (!jobSkills.length) return 0;

  const totalPct = jobSkills.reduce((sum, s) => sum + (s.percentage || 0), 0) || jobSkills.length;
  const candidateMap = Object.fromEntries(candidateSkills.map(s => [s.name?.toLowerCase(), s]));

  let hardSkillScore = 0;
  jobSkills.forEach(job => {
    const candidate = candidateMap[job.name?.toLowerCase()];
    if (!candidate) return;

    const jobLvl = convertLevelToNumber(job.level);
    const candidateLvl = candidate.Levelconfirmed || convertLevelToNumber(candidate.proficiencyLevel);
    const raw = Math.min((candidateLvl / jobLvl) * 100, 100);
    const weighted = raw * ((job.percentage || 0) / totalPct);
    hardSkillScore += weighted;
  });

  return Math.min((hardSkillScore / 100) * MAX, MAX);
}

/* ------------------ SOFT SKILLS ------------------ */
function calculateSoftSkillsScore(jobSoft, candSoft, MAX) {
  if (!jobSoft.length || !candSoft.length) return 0;
  const candSet = new Set(candSoft.map(s => s.name?.toLowerCase()));
  const matchCount = jobSoft.reduce((count, skill) => candSet.has(skill.name?.toLowerCase()) ? count + 1 : count, 0);
  return (matchCount / jobSoft.length) * MAX;
}

/* ------------------ EXPERIENCE ------------------ */
function calculateExperienceScore(jobSkills, candidateSkills, MAX) {
  const candidateMap = Object.fromEntries(candidateSkills.map(s => [s.name?.toLowerCase(), s]));
  let total = 0, count = 0;

  jobSkills.forEach(job => {
    const cand = candidateMap[job.name?.toLowerCase()];
    if (!cand) return;

    const jobLvl = convertLevelToNumber(job.level);
    const candLvl = cand.Levelconfirmed || convertLevelToNumber(cand.proficiencyLevel);
    total += candLvl >= jobLvl ? 10 : candLvl === jobLvl - 1 ? 5 : 0;
    count++;
  });

  return count ? (total / count) * (MAX / 10) : 0;
}

/* ------------------ SALARY ------------------ */
function calculateSalaryScore(jobDetails, candProf, RATES, MAX, perUSD = true) {
  const job = jobDetails?.salary;
  const cand = candProf?.expectedSalary;

  if (!job?.min || !job?.max || !job.currency || !cand?.min || !cand?.max || !cand.currency) {
    return 0;
  }

  const convert = (amt, cur) => perUSD ? amt * (RATES[cur] || 1) : amt / (RATES[cur] || 1);

  const jobMin = convert(job.min, job.currency);
  const jobMax = convert(job.max, job.currency);
  const candMin = convert(cand.min, cand.currency);
  const candMax = convert(cand.max, cand.currency);

  let score = 0;

  // Candidate salary entirely below job range
  if (candMax < jobMin) {
    score = (candMax / jobMin) * MAX;
  }
  // Candidate salary entirely above job range
  else if (candMin > jobMax) {
    score = (jobMax / candMin) * MAX;
  }
  // Overlap between ranges
  else {
    const overlapMin = Math.max(jobMin, candMin);
    const overlapMax = Math.min(jobMax, candMax);
    score = ((overlapMax - overlapMin) / (jobMax - jobMin)) * MAX;
  }

  return Math.min(score, MAX);
}


/* ------------------ WORK MODE ------------------ */
const calculateWorkModeScore = (job, cand, MAX) =>
  job.location && cand.workModePreference
    ? (job.location.toLowerCase() === cand.workModePreference.toLowerCase() ? MAX : MAX / 2)
    : 0;

/* ------------------ CONTRACT ------------------ */
const calculateContractScore = (job, cand, MAX) =>
  job.employmentType && cand.preferredContractType
    ? (job.employmentType.toLowerCase() === cand.preferredContractType.toLowerCase() ? MAX : 0)
    : 0;

/* ------------------ UNLOCK CHECK ------------------ */
async function checkIfCandidateUnlocked(companyId, candidateId) {
  try {
    const unlocked = await UnlockCandidate.findOne({ idCompany: companyId, idCandidate: candidateId });
    return !!unlocked;
  } catch {
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
  if (!jobSkills?.length || !candidateSkills?.length) return 0;

  const unlocked = idCompany && candidateProfile.userId?._id
    ? await checkIfCandidateUnlocked(idCompany, candidateProfile.userId._id)
    : false;

  const cfg = await getMatchingConfig(idCompany, jobPostId);

  const hardSkillScore = calculateHardSkillsScore(jobSkills, candidateSkills, cfg.weights.hardSkill);
  if (hardSkillScore === 0) return 0;

  const softSkillScore = calculateSoftSkillsScore(jobDetails.skillAnalysis?.softSkills || [], candidateProfile.softSkills || [], cfg.weights.SoftSkill);
  const experienceScore = calculateExperienceScore(jobSkills, candidateSkills, cfg.weights.experience);
  const salaryScore = calculateSalaryScore(jobDetails, candidateProfile, cfg.exchangeRates || {}, cfg.weights.salary);
  const workModeScore = calculateWorkModeScore(jobDetails, candidateProfile, cfg.weights.workMode);
  const contractScore = calculateContractScore(jobDetails, candidateProfile, cfg.weights.contract);

  const total = hardSkillScore + softSkillScore + experienceScore + salaryScore + workModeScore + contractScore;

  return  Math.round(total * 10) / 10 ;
}

module.exports = {
  calculateMatchScore,
  normalizeSkillName,
  checkIfCandidateUnlocked,
};
