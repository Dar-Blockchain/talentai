// services/MatchingService/matchingService.js

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
  console.log("\n--- Matching Candidate ---");
  console.log(
    "Job required skills:",
    jobSkills.map((s) => s.name)
  );
  console.log(
    "Candidate skills:",
    candidateSkills.map((s) => s.name)
  );

  if (!jobSkills?.length || !candidateSkills?.length) return 0;

  let hardSkillScore = 0;
  let experienceScore = 0;
  let salaryScore = 0;
  let workModeScore = 0;
  let contractScore = 0;

  // 1️⃣ Hard Skills
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
        `Matched skill: ${
          jobSkill.name
        }, CandidateLevel: ${candidateLevel}, JobLevel: ${jobLevel}, WeightedScore: ${
          skillScore * jobSkill.weight
        }`
      );
    }
  });
  hardSkillScore = Math.min((hardSkillScore / 100) * 60, 60);
  console.log("Hard skill score (60% max):", hardSkillScore);

  // Après le calcul du hardSkillScore
  if (hardSkillScore === 0) {
    console.log("❌ Candidate eliminated: no matching hard skills");
    return 0; // On considère 0 comme éliminé
  }

  // ✅ Suggested Skills supprimés

  // 2️⃣ Experience Level basé sur Levelconfirmed de chaque skill
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
        `Experience score for skill ${jobSkill.name}: ${skillExpScore} [CandidateLevel: ${candidateLevel}, JobLevel: ${jobLevel}]`
      );
    }
  });

  experienceScore = skillCount > 0 ? totalExpScore / skillCount : 0;
  console.log("✅ Total Experience Score (10% max):", experienceScore);

  // 3️⃣ Salary
  // 4️⃣ Salary Score basé sur la marge commune
// 3️⃣ Salary
// Gestion des 3 devises et score basé sur la marge commune
const exchangeRates = {
  USD: 1,
  EUR: 1.1, // 1 EUR = 1.1 USD (exemple, à ajuster selon les taux réels)
  TND: 0.32, // 1 TND = 0.32 USD
};

const jobSalary = jobDetails.salary || {};
const candidateSalary = candidateProfile.expectedSalary || {};
salaryScore = 0;

if (
  jobSalary.min != null &&
  jobSalary.max != null &&
  candidateSalary.min != null &&
  candidateSalary.max != null
) {
  // Conversion en USD pour comparaison
  const jobMinUSD = jobSalary.min * (exchangeRates[jobSalary.currency] || 1);
  const jobMaxUSD = jobSalary.max * (exchangeRates[jobSalary.currency] || 1);
  const candidateMinUSD =
    candidateSalary.min * (exchangeRates[candidateSalary.currency] || 1);
  const candidateMaxUSD =
    candidateSalary.max * (exchangeRates[candidateSalary.currency] || 1);

  const overlapMin = Math.max(candidateMinUSD, jobMinUSD);
  const overlapMax = Math.min(candidateMaxUSD, jobMaxUSD);

  if (overlapMax > overlapMin) {
    const overlap = overlapMax - overlapMin;
    const jobRange = jobMaxUSD - jobMinUSD;
    salaryScore = (overlap / jobRange) * 5; // 5% max
  } else {
    salaryScore = 0;
  }
}

console.log(
  `Salary score (5% max): ${salaryScore.toFixed(1)} [Candidate: ${candidateSalary.min}-${candidateSalary.max} ${candidateSalary.currency}, Job: ${jobSalary.min}-${jobSalary.max} ${jobSalary.currency}]`
);

  // 4️⃣ Work Mode
  if (jobDetails.employmentType && candidateProfile.workModePreference) {
    workModeScore =
      jobDetails.location.toLowerCase() ===
      candidateProfile.workModePreference.toLowerCase()
        ? 5
        : 2.5;
  }
  console.log(
    `WorkMode score (5% max): ${workModeScore} [Candidate: ${candidateProfile.workModePreference}, Job: ${jobDetails.location}]`
  );

  // 5️⃣ Contract Type
  if (jobDetails.employmentType && candidateProfile.preferredContractType) {
    contractScore =
      jobDetails.employmentType.toLowerCase() ===
      candidateProfile.preferredContractType.toLowerCase()
        ? 5
        : 0;
  }
  console.log(
    `Contract score (5% max): ${contractScore} [Candidate: ${candidateProfile.preferredContractType}, Job: ${jobDetails.employmentType}]`
  );

  const totalScore =
    hardSkillScore +
    experienceScore +
    salaryScore +
    workModeScore +
    contractScore;
  console.log("✅ Total Match Score:", totalScore.toFixed(1));

  return Math.round(totalScore * 10) / 10;
}

module.exports = { calculateMatchScore, normalizeSkillName };
