import { softSkillLevels } from "@/constants/skills";

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

export const getSoftSkillLevelLabel = (value?: number) => {
  const level = softSkillLevels.find(l => l.value === value);
  return level ? level.label : "";
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

export const getHardSkills = (job: any): Skill[] => {
  if (!job) return [];

  // Pipeline jobs
  if (job.creationType === 'pipeline' && Array.isArray(job.post_Steps)) {
    return job.post_Steps
      .filter((step: any) => step.data?.type === 'technical')
      .flatMap((step: any) =>
        (step.data?.config?.skills || []).map((skill: any) => ({
          name: skill.name,
          level: skill.requiredLevel,
          type: 'technical',
          importance: 'Required',
        }))
      );
  }

  // AI / Manual jobs
  return (job.skillAnalysis?.requiredSkills || []).map((skill: any) => ({
    name: skill.name,
    level: skill.level,
    type: 'technical',
    importance: skill.percentage || 0,
  }));
};

export const getSoftSkills = (job: any): Skill[] => {
  if (!job) return [];

  // Pipeline jobs
  if (job.creationType === 'pipeline' && Array.isArray(job.post_Steps)) {
    return job.post_Steps
      .filter((step: any) => step.data?.type === 'soft')
      .flatMap((step: any) =>
        (step.data?.config?.softSkills || []).map((name: string) => ({
          name,
          type: 'soft',
          importance: 'Required',
        }))
      );
  }

  // AI / Manual jobs
  return (job.skillAnalysis?.softSkills || []).map((skill: any) => ({
    name: skill.name,
    level: skill.level,
    type: 'soft',
    importance: skill.percentage || 0,
  }));
};

export const getPostSkills = (job: any): Skill[] => [
  ...getHardSkills(job),
  ...getSoftSkills(job),
];
