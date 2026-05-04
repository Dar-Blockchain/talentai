export interface LangMeta {
  code: string;
  flag: string;         // ISO country code for flagcdn.com ("us", "fr")
  label: string;        // Native display name ("English", "Français")
  englishLabel: string; // English name ("English", "French")
}

export const SUPPORTED_LANGS: LangMeta[] = [
  { code: "en", flag: "us", label: "English",  englishLabel: "English" },
  { code: "fr", flag: "fr", label: "Français", englishLabel: "French"  },
];

export const LANG_META: Record<string, LangMeta> =
  Object.fromEntries(SUPPORTED_LANGS.map((l) => [l.code, l]));
