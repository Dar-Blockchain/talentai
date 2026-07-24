/** Picks the value matching `lang`, falling back to the other language if empty. */
export function pickLocalized(lang: "en" | "fr", en?: string | null, fr?: string | null): string {
  if (lang === "fr") return fr || en || "";
  return en || fr || "";
}
