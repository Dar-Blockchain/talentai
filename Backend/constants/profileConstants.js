const DEFAULT_SOFT_SKILL_CATEGORIES = {
  COMMUNICATION: "communication",
  ADAPTABILITY: "adaptability",
  COLLABORATION: "collaboration",
};

const SKILL_TYPES = {
  HARD: "hard",
  SOFT: "soft",
};

const SKILL_LEVELS = Object.freeze({
  NO_LEVEL: { experienceLevel: "NoLevel", proficiencyLevel: 0 },
  ENTRY_LEVEL: { experienceLevel: "Entry Level", proficiencyLevel: 1 },
  JUNIOR: { experienceLevel: "Junior", proficiencyLevel: 2 },
  MID_LEVEL: { experienceLevel: "Mid Level", proficiencyLevel: 3 },
  SENIOR: { experienceLevel: "Senior", proficiencyLevel: 4 },
  EXPERT: { experienceLevel: "Expert", proficiencyLevel: 5 },
});

const PROFILE_TYPES = Object.freeze({
  CANDIDATE: "Candidat",
  COMPANY: "Company",
  JURY: "jury",
});

const GENDER_OPTIONS = Object.freeze({
  MALE: "Male",
  FEMALE: "Female",
  OTHER: "Other",
  PREFER_NOT_TO_SAY: "Prefer not to say",
});

const REQUIRED_EXPERIENCE_LEVELS = Object.freeze({
  ENTRY_LEVEL: "Entry Level",
  JUNIOR: "Junior",
  MID_LEVEL: "Mid Level",
  SENIOR: "Senior",
  EXPERT: "Expert",
});

const EMPLOYMENT_TYPES = Object.freeze({
  REMOTE: "Remote",
  HYBRID: "Hybrid",
  ON_SITE: "On-site",
});

module.exports = {
  DEFAULT_SOFT_SKILL_CATEGORIES,
  SKILL_TYPES,
  SKILL_LEVELS,
  PROFILE_TYPES,
  GENDER_OPTIONS,
  REQUIRED_EXPERIENCE_LEVELS,
  EMPLOYMENT_TYPES,
};

