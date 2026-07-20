import type { WebinarQuestion } from "../types";

/** Renders a raw stored answer as display text — resolves option key(s) to
 * their English label, joining multiselect's array of keys with a comma.
 * Shared by the Registrants tab's answer list and the Excel export so both
 * read multiselect answers the same way. */
export function formatAnswerDisplay(q: WebinarQuestion, raw: unknown): string {
  if (raw === undefined || raw === null || raw === "") return "";
  if (q.type === "scale") return `${raw}/5`;

  const labelFor = (key: unknown) => {
    const opt = q.options.find((o) => o.key === key);
    return opt ? opt.label_en || opt.label_fr : String(key ?? "");
  };

  if (Array.isArray(raw)) return raw.map(labelFor).join(", ");
  if (q.type === "choice" || q.type === "select" || q.type === "multiselect") return labelFor(raw);
  return String(raw ?? "");
}
