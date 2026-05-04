import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { setCookie } from 'cookies-next';
import { LANGUAGE_COOKIE, RTL_LANGUAGES, SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/i18n/config';
import { SUPPORTED_LANGS } from '@/constants/languages';

export interface LanguageOption {
  code:  SupportedLanguage;
  label: string;
  flag:  string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = SUPPORTED_LANGS.map((l) => ({
  code:  l.code as SupportedLanguage,
  label: l.label,
  flag:  l.flag,
}));

/** localStorage key written only when the user explicitly picks a language via the header switcher */
export const MANUAL_LANG_KEY = 'talentai_lang_manual';

/** Normalize any DB/legacy language string to a supported language code */
export function normalizeLangCode(raw?: string | null): SupportedLanguage | null {
  if (!raw) return null;
  const l = raw.toLowerCase().trim();
  if (l === 'fr' || l === 'french' || l === 'français' || l === 'francais') return 'fr';
  if (l === 'en' || l === 'english') return 'en';
  return null;
}

export function useLanguage() {
  const { i18n } = useTranslation();

  const raw = i18n.language ?? 'en';
  const base = raw.split('-')[0]?.toLowerCase();
  const currentLang = (
    base === 'fr' || base === 'en'
      ? base
      : SUPPORTED_LANGUAGES.includes(raw as SupportedLanguage)
        ? (raw as SupportedLanguage)
        : 'en'
  ) as SupportedLanguage;

  const isRTL = RTL_LANGUAGES.includes(currentLang);

  const changeLanguage = useCallback(
    async (lang: SupportedLanguage) => {
      await i18n.changeLanguage(lang);

      // Persist in cookie (works with cookies-next SSR-compat signature)
      setCookie(LANGUAGE_COOKIE, lang, { path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 });

      // Mark that this was a manual user choice — DB sync will not override this
      if (typeof window !== 'undefined') {
        localStorage.setItem(MANUAL_LANG_KEY, lang);
      }

      // Apply RTL direction to <html> — MUI reads this automatically
      document.documentElement.dir  = RTL_LANGUAGES.includes(lang) ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;
    },
    [i18n],
  );

  return { currentLang, isRTL, changeLanguage, languages: LANGUAGE_OPTIONS };
}
