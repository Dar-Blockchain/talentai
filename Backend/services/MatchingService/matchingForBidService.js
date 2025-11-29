const calculateSkillMatchScore = (jobSkills, candidateSkills) => {
  if (!jobSkills?.length || !candidateSkills?.length) return 0;

  // 🧮 Vérifier et normaliser les pourcentages pour s'assurer que la somme = 100
  const totalPercentage = jobSkills.reduce(
    (sum, skill) => sum + (skill.percentage || 0),
    0
  );

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

      // Score (0–100) pour cette compétence
      const skillScore = Math.min((candidateLevel / jobLevel) * 100, 100);

      // Appliquer la pondération
      totalScore += skillScore * jobSkill.weight;
    }
  });

  // Convertir le total en pourcentage global sur 100
  return Math.round(totalScore * 10) / 10; // Ex: 84.6%
};

// Helper: Convert text levels to numbers
const convertLevelToNumber = (level) => {
  const levels = {
    Beginner: 1,
    Intermediate: 3,
    Advanced: 4,
    Expert: 5,
    "1": 1,
    "2": 2,
    "3": 3,
    "4": 4,
    "5": 5,
  };
  return levels[level] || 1;
};

module.exports = { calculateSkillMatchScore };
