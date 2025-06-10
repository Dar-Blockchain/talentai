module.exports.calculateSkillMatchScore = (jobSkills, candidateSkills) => {
  let totalScore = 0;
  const maxPossibleScore = jobSkills.length * 100; // 100% per skill

  //console.log("jobSkills",jobSkills)

  jobSkills.forEach((jobSkill) => {
    const candidateSkill = candidateSkills.find(
      (s) =>
        s.name.trim().toLowerCase() === jobSkill.name.trim().toLowerCase()
    );

    if (candidateSkill) {
      // Ajout d'un log pour vérifier les valeurs des compétences
      //console.log("Job Skill:", jobSkill.level);
     // console.log("Candidate Skill:", candidateSkill);

      // Utiliser Levelconfirmed au lieu de proficiencyLevel
      const jobLevel = jobSkill.level;
      const candidateLevel = candidateSkill.Levelconfirmed; // Utiliser Levelconfirmed
      console.log("Job Skill:", jobLevel);
      console.log("candidateLevel:", candidateLevel);
      // Si les niveaux sont définis, calculer le score pour cette compétence
      if (jobLevel <= candidateLevel) {
        const skillScore = (candidateLevel / jobLevel) * 100;
        totalScore += Math.min(skillScore, 100); // Limiter à 100% par compétence
      } else {
        //console.log(`Missing levels for ${jobSkill.name}`);
      }
    }
  });

  // Calcul du pourcentage global de correspondance
  const matchPercentage = Math.round((totalScore / maxPossibleScore) * 1000) / 10; // Arrondir à 1 décimale
  console.log("Total Score:", totalScore, "Max Possible Score:", maxPossibleScore);
  return matchPercentage;
};
