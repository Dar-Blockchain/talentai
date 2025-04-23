export type SectionType = 'header' | 'text' | 'skills' | 'languages' | 'education' | 'experience' | 'projects' | 'custom';

interface BaseSection {
  id: string;
  type: SectionType;
  title: string;
  isVisible?: boolean;
}

export interface HeaderSection extends BaseSection {
  type: 'header';
  fullName: string;
  title: string;
  email: string;
  phone?: string;
  location?: string;
  links?: { label: string; url: string }[];
}

export interface TextSection extends BaseSection {
  type: 'text';
  content: string;
}

export interface SkillsSection extends BaseSection {
  type: 'skills';
  skills: { name: string; level?: number }[];
  showLevels?: boolean;
}

export interface LanguagesSection extends BaseSection {
  type: 'languages';
  languages: { name: string; level: string }[];
}

export interface EducationSection extends BaseSection {
  type: 'education';
  entries: {
    id: string;
    institution: string;
    degree: string;
    field?: string;
    startDate: string;
    endDate?: string;
    location?: string;
    gpa?: string;
    description?: string;
  }[];
}

export interface ExperienceSection extends BaseSection {
  type: 'experience';
  entries: {
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate?: string;
    location?: string;
    description?: string;
    achievements?: string[];
  }[];
}

export interface ProjectsSection extends BaseSection {
  type: 'projects';
  entries: {
    id: string;
    name: string;
    role?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
    technologies?: string[];
    url?: string;
  }[];
}

export interface CustomSection extends BaseSection {
  type: 'custom';
  content: string;
} 