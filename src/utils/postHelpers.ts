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