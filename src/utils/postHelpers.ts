export interface Skill {
  name: string;
  level?: number;
  type: 'technical' | 'soft';
  importance?: string;
}
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

export const validatePipelineNodes = (nodes: any[]) => {
  const configuredNodes = nodes.filter(
    node => node.data?.config?.configured
  );

  const unconfiguredNodes = nodes.filter(
    node => !node.data?.config?.configured
  );

  return {
    isValid: unconfiguredNodes.length === 0,
    configuredNodes,
    unconfiguredNodes,
  };
};

  export const formatSalary = (salary: any) => {
    return `${salary.currency} ${salary.min.toLocaleString()} - ${
      salary.currency
    } ${salary.max.toLocaleString()}`;
  };

export const getPostSkills = (job: any): Skill[] => {
  if (!job) return [];

  // For pipeline jobs
  if (job.creationType === 'pipeline' && job.post_Steps && Array.isArray(job.post_Steps)) {
    const skills: Skill[] = [];

    job.post_Steps.forEach((step: any) => {
      // Technical skills
      if (step.data?.type === 'technical' && step.data?.config?.skills && Array.isArray(step.data.config.skills)) {
        step.data.config.skills.forEach((skill: any) => {
          skills.push({
            name: skill.name,
            level: skill.requiredLevel,
            type: 'technical',
            importance: 'Required',
          });
        });
      }

      // Soft skills
      if (step.data?.type === 'soft' && step.data?.config?.softSkills && Array.isArray(step.data.config.softSkills)) {
        step.data.config.softSkills.forEach((softSkill: string) => {
          skills.push({
            name: softSkill,
            type: 'soft',
            importance: 'Required',
          });
        });
      }
    });

    return skills;
  }

  // For AI/manual jobs
  const technicalSkills = (job.skillAnalysis?.requiredSkills || []).map((skill: any) => ({
    name: skill.name,
    level: skill.level,
    type: 'technical' as const,
    importance: skill.percentage || 0,
  }));

  const softSkills = (job.skillAnalysis?.softSkills || []).map((skill: any) => ({
    name: skill.name,
    type: 'soft' as const,
    level: skill.level,
    importance: skill.percentage || 0,
  }));

  return [...technicalSkills, ...softSkills];
};
