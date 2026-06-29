export interface LangMeta {
  code:         string;
  flag:         string;
  label:        string;
  englishLabel: string;
}

export const SUPPORTED_LANGS: LangMeta[] = [
  { code: "en", flag: "us", label: "English",  englishLabel: "English" },
  { code: "fr", flag: "fr", label: "Français", englishLabel: "French"  },
];

export const LANG_META: Record<string, LangMeta> =
  Object.fromEntries(SUPPORTED_LANGS.map((l) => [l.code, l]));
