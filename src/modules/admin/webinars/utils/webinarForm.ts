import type { Webinar, WebinarFormValues, WebinarQuestionDraft } from "../types";

export const EMPTY_FORM: WebinarFormValues = {
  title_fr: "",
  title_en: "",
  description_fr: "",
  description_en: "",
  about_fr: "",
  about_en: "",
  webinar_link: "",
  target_min: 50,
  target_max: 70,
  date: "",
  start_time: "09:00",
  end_time: "10:00",
  status: "draft",
  lang: "",
  highlights_fr: ["", "", ""],
  highlights_en: ["", "", ""],
  highlights_enabled: true,
  questions: [],
};

// "select" and "multiselect" aren't separate creatable types — the public
// questionnaire renders every options-based question as cards, and
// multi-pick is just a toggle on "choice" (see QuestionEditor).
export const QUESTION_TYPES = ["choice", "scale", "text"] as const;

export const STEPS = [
  { label: "Basics", desc: "Language, date & link" },
  { label: "Content", desc: "Landing page copy" },
  { label: "Questions", desc: "Registration form" },
];

/** Pre-migration webinars only have the single `title`/`description`/`highlights`
 * fields — mirror them into both languages so nothing looks blank on edit. */
export function toFormValues(w: Webinar): WebinarFormValues {
  return {
    title_fr: w.title_fr || w.title || "",
    title_en: w.title_en || w.title || "",
    description_fr: w.description_fr || w.description || "",
    description_en: w.description_en || w.description || "",
    about_fr: w.about_fr ?? "",
    about_en: w.about_en ?? "",
    webinar_link: w.webinar_link ?? "",
    target_min: w.target_min ?? 50,
    target_max: w.target_max ?? 70,
    date: w.date ? w.date.slice(0, 10) : "",
    start_time: w.date ? w.date.slice(11, 16) : "09:00",
    end_time: w.end_date ? w.end_date.slice(11, 16) : "10:00",
    status: w.status,
    lang: w.lang,
    highlights_fr: [...(w.highlights_fr?.length ? w.highlights_fr : w.highlights ?? []), "", "", ""].slice(0, 3),
    highlights_en: [...(w.highlights_en?.length ? w.highlights_en : w.highlights ?? []), "", "", ""].slice(0, 3),
    highlights_enabled: w.highlights_enabled ?? true,
    questions: w.questions.map((q) => ({
      key: q.key,
      label_fr: q.label_fr,
      label_en: q.label_en,
      type: q.type,
      options: q.options,
      required: q.required,
      order: q.order,
    })),
  };
}

export function newQuestion(order: number): WebinarQuestionDraft {
  return {
    key: `q${order}_${Date.now()}`,
    label_fr: "",
    label_en: "",
    type: "text",
    options: [],
    required: true,
    order,
  };
}

// ─── Question validation ─────────────────────────────────────────────────────
// Shared by the form dialog (create/edit) and the quick "Publish" actions on
// the list/detail pages, so a draft can't go live with a broken choice
// question either way.

export type QuestionValidationError = "min_options" | "score_total";

/** Choice/select/multiselect questions need at least 2 options to make sense
 * as a pick-one/pick-many prompt, and their option scores must add up to
 * exactly 100 so downstream scoring can treat them as a percentage split. */
export function getQuestionError(q: WebinarQuestionDraft): QuestionValidationError | null {
  const isChoiceGroup = q.type === "choice" || q.type === "select" || q.type === "multiselect";
  if (!isChoiceGroup) return null;
  if (q.options.length < 2) return "min_options";
  const total = q.options.reduce((sum, o) => sum + (o.score || 0), 0);
  return total === 100 ? null : "score_total";
}

export function findInvalidQuestion(
  questions: WebinarQuestionDraft[],
): { question: WebinarQuestionDraft; reason: QuestionValidationError } | null {
  for (const question of questions) {
    const reason = getQuestionError(question);
    if (reason) return { question, reason };
  }
  return null;
}

export function questionErrorMessage(reason: QuestionValidationError): string {
  return reason === "min_options"
    ? "Choice questions need at least 2 options."
    : "Each choice question's option scores must add up to exactly 100.";
}
