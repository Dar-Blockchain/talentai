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

const EXPERIENCE_VALUES = ["Junior", "Mid-level", "Senior", "Expert"];

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

const normalizeSearchText = (value: string) =>
  normalizeKey(
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
  );

export function isKnownExperienceLevel(value = ""): boolean {
  return EXPERIENCE_VALUES.includes(normalizeExperienceLevel(value));
}

export function inferExperienceLevelFromText(text = ""): string {
  const normalized = normalizeSearchText(text);
  if (!normalized) return "";

  const yearsMatches = Array.from(normalized.matchAll(/(\d+)\s*(?:\+|plus)?\s*(?:years?|ans?|annees?|annee|experience)/g));
  const maxYears = yearsMatches.reduce((max, match) => Math.max(max, Number(match[1]) || 0), 0);

  if (maxYears >= 10) return "Expert";
  if (maxYears >= 5) return "Senior";
  if (maxYears >= 3) return "Mid-level";
  if (maxYears > 0) return "Junior";

  if (/\b(expert|experimente|principal|staff)\b/.test(normalized)) return "Expert";
  if (/\b(senior|confirme|lead)\b/.test(normalized)) return "Senior";
  if (/\b(mid|middle|intermediate|intermediaire)\b/.test(normalized)) return "Mid-level";
  if (/\b(junior|debutant|entry)\b/.test(normalized)) return "Junior";

  return "";
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
