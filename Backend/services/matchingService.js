const calculateMatchScore = (jobPost, candidateProfile) => {
  let score = 0;

  // 1. Skill Matching (50%)
  const requiredSkills = jobPost.skills.map((s) => s.name.toLowerCase());
  const candidateSkills = candidateProfile.skills.map((s) =>
    s.name.toLowerCase()
  );

  const skillMatches = candidateSkills.filter((skill) =>
    requiredSkills.includes(skill)
  ).length;

  score += (skillMatches / requiredSkills.length) * 50;

  // 2. Experience Level (30%)
  const expMatch =
    Math.min(candidateProfile.experience / jobPost.minExperience, 1) * 30;
  score += expMatch;

  // 3. Education (10%)
  if (
    jobPost.requiredDegree &&
    candidateProfile.education.some(
      (edu) => edu.degree === jobPost.requiredDegree
    )
  ) {
    score += 10;
  }

  // 4. Location (10%)
  if (
    jobPost.locationType === "remote" ||
    candidateProfile.preferredWorkType.includes(jobPost.locationType)
  ) {
    score += 10;
  }

  return Math.round(score * 10) / 10; // Round to 1 decimal
};

const calculateSkillMatchScore = (jobSkills, candidateSkills) => {
  let totalScore = 0;
  const maxPossibleScore = jobSkills.length * 100; // 100% per skill

  jobSkills.forEach((jobSkill) => {
    const candidateSkill = candidateSkills.find(
      (s) => s.name.toLowerCase() === jobSkill.name.toLowerCase()
    );

    if (candidateSkill) {
      // Convert levels to numerical values (e.g., "Expert" = 5, "Beginner" = 1)
      const jobLevel = convertLevelToNumber(jobSkill.level);
      const candidateLevel = convertLevelToNumber(
        candidateSkill.proficiencyLevel
      );

      // Score for this skill (0-100): Higher candidate level = better match
      const skillScore = (candidateLevel / jobLevel) * 100;
      totalScore += Math.min(skillScore, 100); // Cap at 100% per skill
    }
  });

  // Overall match percentage
  return Math.round((totalScore / maxPossibleScore) * 1000) / 10; // Round to 1 decimal
};

// Helper: Convert text levels to numbers (customize as needed)
const convertLevelToNumber = (level) => {
  const levels = {
    Beginner: 1,
    Intermediate: 3,
    Advanced: 4,
    Expert: 5,
  };
  return levels[level] || 1; // Default to Beginner if unknown
};

module.exports = { calculateSkillMatchScore };
