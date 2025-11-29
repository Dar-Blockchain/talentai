// services/MatchingService/matchingService.js
// Définir les pondérations max
const MAX_HARD_SKILL_SCORE = 40; // anciennement 60
const MAX_EXPERIENCE_SCORE = 30; // anciennement 10
const MAX_SALARY_SCORE = 15; // anciennement 5
const MAX_WORKMODE_SCORE = 7.5; // anciennement 5
const MAX_CONTRACT_SCORE = 7.5; // anciennement 5

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

const IMPORTANCE_WEIGHT = {
  critical: 1.5,
  high: 1.2,
  medium: 1.0,
  low: 0.8,
};

// Pour la conversion multi-devises
const EXCHANGE_RATES = {
  USD: 1,
  EUR: 1.1, // exemple: 1 EUR = 1.1 USD
  TND: 0.32, // exemple: 1 TND = 0.32 USD
};

function convertLevelToNumber(level) {
  return LEVELS[level] || 1;
}

function normalizeSkillName(name) {
  if (!name) return "";
  const part = name.split(".")[0].trim();
  return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
}

function calculateMatchScore(
  jobSkills,
  candidateSkills,
  jobDetails = {},
  candidateProfile = {}
) {
  console.log("\n=== Matching Candidate ===");
  console.log("Job required skills:", jobSkills.map((s) => s.name));
  console.log("Candidate skills:", candidateSkills.map((s) => s.name));

  if (!jobSkills?.length || !candidateSkills?.length) {
    console.log("❌ No job skills or candidate skills, score = 0");
    return 0;
  }

  let hardSkillScore = 0;
  let experienceScore = 0;
  let salaryScore = 0;
  let workModeScore = 0;
  let contractScore = 0;

  // 1️⃣ Hard Skills
  console.log("\n--- Hard Skills Calculation ---");
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

      const skillScore =
        Math.min((candidateLevel / jobLevel) * 100, 100) * importanceWeight;
      hardSkillScore += skillScore * jobSkill.weight;

      console.log(
        `Matched skill: ${jobSkill.name} | CandidateLevel: ${candidateLevel} | JobLevel: ${jobLevel} | Importance: ${jobSkill.importance} | WeightedScore: ${
          skillScore * jobSkill.weight
        }`
      );
    }
  });

  hardSkillScore = Math.min((hardSkillScore / 100) * MAX_HARD_SKILL_SCORE, MAX_HARD_SKILL_SCORE);
  console.log("Hard skill score (40% max):", hardSkillScore);

  // Élimination si aucun hard skill ne matche
  if (hardSkillScore === 0) {
    console.log("❌ Candidate eliminated: no matching hard skills");
    return 0;
  }

  // 2️⃣ Experience Level basé sur Levelconfirmed de chaque skill
  console.log("\n--- Experience Score Calculation ---");
  let totalExpScore = 0;
  let skillCount = 0;

  normalizedJobSkills.forEach((jobSkill) => {
    const candidateSkill = candidateSkills.find(
      (s) => s.name?.toLowerCase() === jobSkill.name?.toLowerCase()
    );

    if (candidateSkill) {
      const jobLevel = convertLevelToNumber(jobSkill.level);
      const candidateLevel =
        candidateSkill.Levelconfirmed ||
        convertLevelToNumber(candidateSkill.proficiencyLevel);

      let skillExpScore = 0;
      if (candidateLevel >= jobLevel) skillExpScore = 10;
      else if (candidateLevel === jobLevel - 1) skillExpScore = 5;
      else skillExpScore = 0;

      totalExpScore += skillExpScore;
      skillCount++;

      console.log(
        `Experience score for skill ${jobSkill.name}: ${skillExpScore} | CandidateLevel: ${candidateLevel} | JobLevel: ${jobLevel}`
      );
    }
  });

  experienceScore = skillCount > 0 ? (totalExpScore / skillCount) * (MAX_EXPERIENCE_SCORE / 10) : 0;
  console.log("✅ Total Experience Score (30% max):", experienceScore);

  // 3️⃣ Salary Score avec multi-devises et marge commune
  console.log("\n--- Salary Score Calculation ---");
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
      salaryScore = (overlap / jobRange) * MAX_SALARY_SCORE; // 15% max
      console.log(
      `Salary score (${MAX_SALARY_SCORE}% max): ${salaryScore.toFixed(1)} [Candidate: ${candidateSalary.min}-${candidateSalary.max}, Job: ${jobSalary.min}-${jobSalary.max}]`
      );
    } else {
      salaryScore = 0;
      console.log("No salary overlap, SalaryScore = 0");
    }
  }

  // 4️⃣ Work Mode
  console.log("\n--- Work Mode Score ---");
  if (jobDetails.employmentType && candidateProfile.workModePreference) {
    workModeScore =
      jobDetails.location.toLowerCase() ===
      candidateProfile.workModePreference.toLowerCase()
        ? MAX_WORKMODE_SCORE
        : MAX_WORKMODE_SCORE / 2;
  }
  console.log(
    `WorkMode score (${MAX_WORKMODE_SCORE}% max): ${workModeScore} [Candidate: ${candidateProfile.workModePreference}, Job: ${jobDetails.location}]`
  );

  // 5️⃣ Contract Type
  console.log("\n--- Contract Type Score ---");
  if (jobDetails.employmentType && candidateProfile.preferredContractType) {
    contractScore =
      jobDetails.employmentType.toLowerCase() ===
      candidateProfile.preferredContractType.toLowerCase()
        ? MAX_CONTRACT_SCORE
        : 0;
  }
  console.log(
    `Contract score (${MAX_CONTRACT_SCORE}% max): ${contractScore} [Candidate: ${candidateProfile.preferredContractType}, Job: ${jobDetails.employmentType}]`
  );

  // Total Score
  const totalScore =
    hardSkillScore + experienceScore + salaryScore + workModeScore + contractScore;
  console.log("\n✅ Total Match Score:", totalScore.toFixed(1));

  return Math.round(totalScore * 10) / 10;
}

module.exports = { calculateMatchScore, normalizeSkillName };
