export type BaseSection = {
  id: string
  x: number
  y: number
  width: number
  height: number
  content?: string // Add content field to base section type
}

// 📝 Text Block
export type TextSection = BaseSection & {
  type: 'text'
  content: string
}

// 💼 Experience
export type ExperienceSection = BaseSection & {
  type: 'experience'
  title: string
  company: string
  startDate: string
  endDate: string
  description: string
  content?: string // Optional content to store formatted HTML
}

// ✅ Skills / Competence
export type SkillsSection = BaseSection & {
  type: 'skills'
  skills: string[]
  content?: string // Optional content to store formatted HTML
}

// 🌍 Languages
export type LanguagesSection = BaseSection & {
  type: 'languages'
  languages: {
    name: string
    level: string
  }[]
  content?: string // Optional content to store formatted HTML
}

// 🎓 Education
export type EducationSection = BaseSection & {
  type: 'education'
  institution: string
  degree: string
  startDate: string
  endDate: string
  description: string
  content?: string // Optional content to store formatted HTML
}

// 🎯 Header (Name + Title)
export type HeaderSection = BaseSection & {
  type: 'header'
  name: string
  jobTitle: string
  content?: string // Optional content to store formatted HTML
}

// 🛠 Projects
export type ProjectsSection = BaseSection & {
  type: 'projects'
  projects: {
    name: string
    description: string
  }[]
  content?: string // Optional content to store formatted HTML
}

// 🧩 Custom
export type CustomSection = BaseSection & {
  type: 'custom'
  content: string
}

// 🖼️ Image
export type ImageSection = BaseSection & {
  type: 'image'
  src: string
  alt?: string
  isRound?: boolean
  content?: string // Optional content to store formatted HTML
}

// ➖ Line
export type LineSection = BaseSection & {
  type: 'line'
  orientation: 'horizontal' | 'vertical'
  thickness: number
  color: string
  content?: string // Optional content to store formatted HTML
}

export type SectionType =
  | TextSection
  | ExperienceSection
  | SkillsSection
  | LanguagesSection
  | EducationSection
  | HeaderSection
  | ProjectsSection
  | CustomSection
  | ImageSection
  | LineSection