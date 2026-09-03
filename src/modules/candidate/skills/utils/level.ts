import type { Skill } from "../types/skill.types";

export type LevelKey = "entry" | "junior" | "mid" | "senior" | "expert";

// A skill counts as "tested" only once a completed assessment has been
// recorded. testScore defaults to 0 in the schema, so a genuine 0% result is
// otherwise indistinguishable from "never tested" -- numberTestPassed is the
// reliable signal (see bug-017).
export const wasSkillTested = (skill: Pick<Skill, "numberTestPassed">): boolean =>
  (skill.numberTestPassed ?? 0) > 0;

// Level is derived from the actual test score, never from the separately
// stored levelConfirmed field, which drifts out of sync with testScore
// (see bug-016). Keep the thresholds identical to the ones the interview
// history table and the server-side `level` filter (skill.service.js) use.
export const scoreToLevelKey = (n: number): LevelKey =>
  n >= 80 ? "expert" : n >= 60 ? "senior" : n >= 40 ? "mid" : n >= 20 ? "junior" : "entry";
