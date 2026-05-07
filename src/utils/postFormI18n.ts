import type { TFunction } from "i18next";

/** Redux/API canonical values → `posts.create.post_form.options.*` key suffix */

export const EMPLOYMENT_OPTION_KEY: Record<string, string> = {
  "Full-time": "employment_full_time",
  "Part-time": "employment_part_time",
  Contract: "employment_contract",
  Internship: "employment_internship",
};

export const WORK_MODE_OPTION_KEY: Record<string, string> = {
  "On-site": "work_on_site",
  Remote: "work_remote",
  Hybrid: "work_hybrid",
};

export const EXPERIENCE_OPTION_KEY: Record<string, string> = {
  Junior: "experience_junior",
  "Mid-level": "experience_mid_level",
  Senior: "experience_senior",
  Expert: "experience_expert",
};

const EMPLOYMENT_ALIASES: Record<string, string> = {
  "full time": "Full-time",
  fulltime: "Full-time",
  "part time": "Part-time",
  parttime: "Part-time",
  internship: "Internship",
};

const WORK_MODE_ALIASES: Record<string, string> = {
  onsite: "On-site",
  "on site": "On-site",
  remote: "Remote",
  hybrid: "Hybrid",
};

const EXPERIENCE_ALIASES: Record<string, string> = {
  "entry level": "Junior",
  entry: "Junior",
  junior: "Junior",
  debutant: "Junior",
  "débutant": "Junior",
  "mid level": "Mid-level",
  mid: "Mid-level",
  intermediate: "Mid-level",
  "intermédiaire": "Mid-level",
  intermediaire: "Mid-level",
  senior: "Senior",
  confirme: "Senior",
  "confirmé": "Senior",
  expert: "Expert",
  "experimente": "Expert",
  "expérimenté": "Expert",
};

const normalizeKey = (value: string) =>
  value
    .toLowerCase()
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export function optionLabel(t: TFunction<"posts">, value: string, map: Record<string, string>): string {
  const sub = map[value];
  return sub ? t(`create.post_form.options.${sub}`) : value;
}

export function normalizeEmploymentType(value = ""): string {
  if (!value) return value;
  const normalized = normalizeKey(value);
  return EMPLOYMENT_ALIASES[normalized] || value;
}

export function normalizeWorkMode(value = ""): string {
  if (!value) return value;
  const normalized = normalizeKey(value);
  return WORK_MODE_ALIASES[normalized] || value;
}

export function normalizeExperienceLevel(value = ""): string {
  if (!value) return value;
  const normalized = normalizeKey(value);
  return EXPERIENCE_ALIASES[normalized] || value;
}

export function hardSkillLevelLabel(t: TFunction<"posts">, level: number): string {
  const key = `create.post_form.hard_skill_levels.${level}`;
  const tr = t(key);
  return tr === key ? `Level ${level}` : tr;
}

export function softSkillLevelLabel(t: TFunction<"posts">, level: number): string {
  const key = `create.post_form.soft_skill_levels.${level}`;
  const tr = t(key);
  return tr === key ? `${level}/5` : tr;
}
