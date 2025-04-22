export type BaseSection = {
    id: string
    x: number
    y: number
    width: number
    height: number
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
  }
  
  // ✅ Skills / Competence
  export type SkillsSection = BaseSection & {
    type: 'skills'
    skills: string[]
  }
  
  // 🌍 Languages
  export type LanguagesSection = BaseSection & {
    type: 'languages'
    languages: {
      name: string
      level: string
    }[]
  }
  
  // 🎓 Education
  export type EducationSection = BaseSection & {
    type: 'education'
    institution: string
    degree: string
    startDate: string
    endDate: string
    description: string
  }
  
  // 🎯 Header (Name + Title)
  export type HeaderSection = BaseSection & {
    type: 'header'
    name: string
    jobTitle: string
  }
  
  // 🛠 Projects
  export type ProjectsSection = BaseSection & {
    type: 'projects'
    projects: {
      name: string
      description: string
    }[]
  }
  
  // 🧩 Custom
  export type CustomSection = BaseSection & {
    type: 'custom'
    content: string
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
  