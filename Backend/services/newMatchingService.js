// matchingService.js
function normalizeSkillName(name) {
  if (!name) return "";
  const part = name.split(".")[0].trim();
  return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
}

/**
 * Calcule un score de correspondance entre les compétences d’un poste et celles d’un candidat.
 * Chaque compétence vaut jusqu’à 100 points (parfait = 100%, écart max = 0%).
 * La moyenne pondérée finale est renvoyée sur 100.
 */
const calculateSkillMatchScore = (jobSkills, candidateSkills) => {
  if (!Array.isArray(jobSkills) || !Array.isArray(candidateSkills)) return 0;

  let totalScore = 0;
  let skillCount = 0;

  jobSkills.forEach((jobSkill) => {
    const normJobSkill = normalizeSkillName(jobSkill.name);
    const jobLevel = Number(jobSkill.level) || 0;

    const candidateSkill = candidateSkills.find(
      (s) => normalizeSkillName(s.name) === normJobSkill
    );

    if (candidateSkill && candidateSkill.Levelconfirmed != null) {
      const candidateLevel = Number(candidateSkill.Levelconfirmed) || 0;

      // Différence absolue de niveaux
      const diff = Math.abs(jobLevel - candidateLevel);

      // Calcul du score individuel (max 100, min 0)
      // Logique : (5 - diff) / 5 * 100
      const skillScore = Math.max(0, ((5 - diff) / 5) * 100);

      totalScore += skillScore;
      skillCount++;
    }
  });

  if (skillCount === 0) return 0;

  const averageScore = totalScore / skillCount;

  // Arrondir à une décimale
  return Math.round(averageScore * 10) / 10;
};
