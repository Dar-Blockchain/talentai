function normalizeSkillName(name) {
  if (!name) return "";
  const part = name.split(".")[0].trim();
  return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
}

const calculateSkillMatchScore = (
  jobSkills,
  candidateSkills,
  SkillPrincipalCoeff = 1.5,  // Poids des skills principaux
  SkillSecCoeff = 1           // Poids des skills secondaires
) => {
  let totalScore = 0;
  let totalPossibleScore = 0;

  jobSkills.forEach(jobSkill => {
    const candidateSkill = candidateSkills.find(
      s => s.name.toLowerCase() === jobSkill.name.toLowerCase()
    );

    // Détermine le coefficient à utiliser
    const coeff = jobSkill.isPrimary ? SkillPrincipalCoeff : SkillSecCoeff;

    // Chaque skill contribue au score total pondéré
    totalPossibleScore += 100 * coeff;

    if (candidateSkill) {
      const jobLevel = convertLevelToNumber(jobSkill.level);
      const candidateLevel = convertLevelToNumber(candidateSkill.proficiencyLevel);

      // Calcul du score de correspondance (0–100)
      const skillScore = (candidateLevel / jobLevel) * 100;
      totalScore += Math.min(skillScore, 100) * coeff;
    }
  });

  // Calcule le pourcentage global de correspondance
  return Math.round((totalScore / totalPossibleScore) * 1000) / 10; // arrondi à 1 décimale
};