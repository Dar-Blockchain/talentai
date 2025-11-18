const TODO_TYPES = Object.freeze({
  PROFILE: "Profile",
  SKILL: "Skill",
});

const TASK_TYPES = Object.freeze({
  COURSE: "Course",
  CERTIFICATION: "Certification",
  PROJECT: "Project",
  ARTICLE: "Article",
});

const TASK_PRIORITIES = Object.freeze({
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
});

module.exports = {
  TODO_TYPES,
  TASK_TYPES,
  TASK_PRIORITIES,
};
