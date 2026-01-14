export type StepInfo = {
  title: string;
  subtitle?: string;
};

// Steps labels
export const candidateSteps = [
  "Welcome",
  "Personal Information",
  "Skills",
  "Review",
];

export const companySteps = [
  "Welcome",
  "Company Information",
  "Skills Stack",
  "Review",
];

// Steps info for UI titles/subtitles
export const candidateStepsInfo: StepInfo[] = [
  { title: "Welcome to" },
  { title: "Personal Information" },
  { title: "Let’s deep dive into your Skill" },
  { title: "Review Your Information" },
];

export const companyStepsInfo: StepInfo[] = [
  { title: "Welcome to" },
  { title: "Tell us about your company" },
  {
    title: "What roles are you hiring for?",
    subtitle: "Select positions and their tech stack requirements.",
  },
  { title: "You're almost done!" },
];
