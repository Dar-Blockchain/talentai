import { softSkillLevels } from "@/modules/shared/constants/skills";

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

export const formatSalary = (salary: any) => {
  if (!salary) return "";

  const currencyMap: { [key: string]: string } = {
    USD: "$",
    EUR: "€",
    GBP: "£",
  };

  const symbol = currencyMap[salary.currency] || salary.currency;

  return `${symbol}${salary.min.toLocaleString()} - ${symbol}${salary.max.toLocaleString()}`;
};


export const getHardSkills = (job: any): Skill[] => {
  if (!job) return [];

  return (job.skillAnalysis?.requiredSkills || []).map((skill: any) => ({
    name: skill.name,
    level: skill.level,
    type: 'technical',
    importance: skill.percentage || 0,
  }));
};

export const getSoftSkills = (job: any): Skill[] => {
  if (!job) return [];

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
