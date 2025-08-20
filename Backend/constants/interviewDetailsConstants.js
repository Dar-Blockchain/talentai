const ANSWER_STATUS = Object.freeze({
  CORRECT: "correct",
  PARTIAL_CORRECT: "partial_correct",
  INCORRECT: "incorrect",
});

const INTERVIEW_TYPES = Object.freeze({
  POST: "post",
  ONBOARDING: "onboarding",
  HR: "hr",
  SKILL: "skill",
  POST_INTERVIEW: "post_interview"
});

module.exports = { ANSWER_STATUS, INTERVIEW_TYPES };
