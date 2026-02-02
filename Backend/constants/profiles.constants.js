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


module.exports = { DEFAULT_SOFT_SKILL_CATEGORIES, SKILL_TYPES, SKILL_LEVELS };
