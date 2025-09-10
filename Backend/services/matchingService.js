function normalizeSkillName(name) {
  if (!name) return "";
  const part = name.split(".")[0].trim();
  return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
}

module.exports.calculateSkillMatchScore = (jobSkills, candidateSkills) => {
  let totalScore = 0;
  const maxPossibleScore = jobSkills.length * 100; // 100% par compétence

  jobSkills.forEach((jobSkill) => {
    const normJobSkill = normalizeSkillName(jobSkill.name);

    const candidateSkill = candidateSkills.find(
      (s) => normalizeSkillName(s.name) === normJobSkill
    );

    if (candidateSkill) {
      // Utiliser Levelconfirmed au lieu de proficiencyLevel
      const jobLevel = jobSkill.level;
      const candidateLevel = candidateSkill.Levelconfirmed;

      let skillScore = 0; // Initialiser skillScore à 0

      if (jobLevel <= candidateLevel) {
        // Calculer la différence de niveau
        const levelDifference = candidateLevel - jobLevel;

        // Appliquer des ajustements en fonction de la différence de niveau
        if (levelDifference === 0) {
          skillScore = 100;
        } else if (levelDifference === 1) {
          skillScore = 70;
        } else if (levelDifference === 2) {
          skillScore = 50;
        } else if (levelDifference === 3) {
          skillScore = 30;
        } else if (levelDifference === 4) {
          skillScore = 10;
        } else {
          skillScore = 0;
        }
      } else {
      //  console.log(`Missing levels for ${normJobSkill}`);
      }

      totalScore += Math.min(skillScore, 100);
    }
  });

  const matchPercentage =
    Math.round((totalScore / maxPossibleScore) * 1000) / 10;
  return matchPercentage;
};
