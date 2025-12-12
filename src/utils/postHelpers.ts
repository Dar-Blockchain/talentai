export const getJobSkills = (job: any): string[] => {
  if (!job?.skillAnalysis) return [];

  const skills: string[] = [];

  if (job.skillAnalysis.requiredSkills) {
    skills.push(
      ...job.skillAnalysis.requiredSkills.map((skill: any) => skill.name)
    );
  }

  if (job.skillAnalysis.softSkills) {
    skills.push(
      ...job.skillAnalysis.softSkills.map((skill: any) => skill.name)
    );
  }

  return [...new Set(skills)];
};

export const getLevelFromNumber = (level: number): string => {
  const levelMap: { [key: number]: string } = {
    1: "Entry Level",
    2: "Junior",
    3: "Mid Level",
    4: "Senior",
    5: "Expert",
  };
  return levelMap[level] || "Entry Level";
};
