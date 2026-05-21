import type { TFunction } from "i18next";

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
  "Entry-level": "experience_entry_level",
  Junior: "experience_junior",
  "Mid-level": "experience_mid_level",
  Senior: "experience_senior",
  Expert: "experience_expert",
};

// Matches "X years", "X+ ans", "X annees experience", etc. in EN and FR
const YEARS_EXPERIENCE_REGEX = /(\d+)\s*(?:\+|plus)?\s*(?:years?|ans?|annees?|annee|experience)/g;

const normalizeKey = (value: string) =>
  value.toLowerCase().replace(/[_-]/g, " ").replace(/\s+/g, " ").trim();

const normalizeSearchText = (value: string) =>
  // NFD decomposes accented chars (é → e + ́); the range strips the combining diacritical marks
  normalizeKey(value.normalize("NFD").replace(/[̀-ͯ]/g, ""));

const EXPERIENCE_VALUES = Object.keys(EXPERIENCE_OPTION_KEY);

// ─── Normalizer factory ───────────────────────────────────────────────────────

function createNormalizer(aliases: Record<string, string>) {
  return (value = ""): string => aliases[normalizeKey(value)] || value;
}

export const normalizeEmploymentType = createNormalizer({
  "full time": "Full-time",
  fulltime: "Full-time",
  "part time": "Part-time",
  parttime: "Part-time",
  internship: "Internship",
});

export const normalizeWorkMode = createNormalizer({
  onsite: "On-site",
  "on site": "On-site",
  remote: "Remote",
  hybrid: "Hybrid",
});

export const normalizeExperienceLevel = createNormalizer({
  "entry level": "Entry-level",
  "entry-level": "Entry-level",
  entry: "Entry-level",
  intern: "Entry-level",
  internship: "Entry-level",
  stage: "Entry-level",
  stagiaire: "Entry-level",
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
});

export function optionLabel(t: TFunction<"posts">, value: string, map: Record<string, string>): string {
  const sub = map[value];
  return sub ? t(`create.post_form.options.${sub}`) : value;
}

export function isKnownExperienceLevel(value = ""): boolean {
  return EXPERIENCE_VALUES.includes(normalizeExperienceLevel(value));
}

export function inferExperienceLevelFromText(text = ""): string {
  const normalized = normalizeSearchText(text);
  if (!normalized) return "";

  const yearsMatches = Array.from(normalized.matchAll(YEARS_EXPERIENCE_REGEX));
  const maxYears = yearsMatches.reduce((max, match) => Math.max(max, Number(match[1]) || 0), 0);

  if (maxYears >= 10) return "Expert";
  if (maxYears >= 5)  return "Senior";
  if (maxYears >= 3)  return "Mid-level";
  if (maxYears > 0)   return "Junior";

  if (/\b(expert|experimente|principal|staff)\b/.test(normalized))    return "Expert";
  if (/\b(senior|confirme|lead)\b/.test(normalized))                  return "Senior";
  if (/\b(mid|middle|intermediate|intermediaire)\b/.test(normalized)) return "Mid-level";
  if (/\b(junior|debutant|entry)\b/.test(normalized))                 return "Junior";

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
