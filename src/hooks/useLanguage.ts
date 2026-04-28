import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { setCookie } from 'cookies-next';
import { LANGUAGE_COOKIE, RTL_LANGUAGES, SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/i18n/config';

export interface LanguageOption {
  code:  SupportedLanguage;
  label: string;
  flag:  string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  // Add more here: { code: 'ar', label: 'العربية', flag: '🇸🇦' }
];

export function useLanguage() {
  const { i18n } = useTranslation();

  const currentLang = (
    SUPPORTED_LANGUAGES.includes(i18n.language as SupportedLanguage)
      ? i18n.language
      : 'en'
  ) as SupportedLanguage;

  const isRTL = RTL_LANGUAGES.includes(currentLang);

  const changeLanguage = useCallback(
    async (lang: SupportedLanguage) => {
      await i18n.changeLanguage(lang);

      // Persist in cookie (works with cookies-next SSR-compat signature)
      setCookie(LANGUAGE_COOKIE, lang, { path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 });

      // Apply RTL direction to <html> — MUI reads this automatically
      document.documentElement.dir  = RTL_LANGUAGES.includes(lang) ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;
    },
    [i18n],
  );

  return { currentLang, isRTL, changeLanguage, languages: LANGUAGE_OPTIONS };
}
