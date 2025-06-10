module.exports.calculateSkillMatchScore = (jobSkills, candidateSkills) => { 
  let totalScore = 0;
  const maxPossibleScore = jobSkills.length * 100; // 100% par compétence

  jobSkills.forEach((jobSkill) => {
    const candidateSkill = candidateSkills.find(
      (s) =>
        s.name.trim().toLowerCase() === jobSkill.name.trim().toLowerCase()
    );

    if (candidateSkill) {
      console.log("---------------");
      // Utiliser Levelconfirmed au lieu de proficiencyLevel
      const jobLevel = jobSkill.level;
      const candidateLevel = candidateSkill.Levelconfirmed;

      let skillScore = 0; // Initialiser skillScore à 0

      if (jobLevel <= candidateLevel) {
        // Calculer la différence de niveau
        const levelDifference = candidateLevel - jobLevel;

        // Appliquer des ajustements en fonction de la différence de niveau
        if (levelDifference === 0) {
          skillScore = 100; // 100% si les niveaux sont égaux
        } else if (levelDifference === 1) {
          skillScore = 70; // 70% si différence de 1 niveau
        } else if (levelDifference === 2) {
          skillScore = 50; // 50% si différence de 2 niveaux
        } else if (levelDifference === 3) {
          skillScore = 30; // 30% si différence de 3 niveaux
        } else if (levelDifference === 4) {
          skillScore = 10; // 10% si différence de 4 niveaux
        } else {
          skillScore = 0; // Aucune correspondance si différence supérieure à 4 niveaux
        }
      } else {
        console.log(`Missing levels for ${jobSkill.name}`);
      }

      console.log("skillScore", skillScore);

      // Limiter le score à 100% par compétence
      totalScore += Math.min(skillScore, 100);
    }
  });

  // Calcul du pourcentage global de correspondance
  const matchPercentage = Math.round((totalScore / maxPossibleScore) * 1000) / 10; // Arrondir à 1 décimale
  console.log("Total Score:", totalScore, "Max Possible Score:", maxPossibleScore);
  return matchPercentage;
};
