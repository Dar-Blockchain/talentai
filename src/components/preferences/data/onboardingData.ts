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
  { title: "Let’s deep dive into your Skills" },
  { title: "Review Your Information" },
];

export const companyStepsInfo: StepInfo[] = [
  { title: "Welcome to" },
  { title: "Tell us about your company" },
  {
    title: "Let's find the perfect skills for your team",
    subtitle: "Tell us what you're looking for.",
  },
  { title: "You're almost done!" },
];
