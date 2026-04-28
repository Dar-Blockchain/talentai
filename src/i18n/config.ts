import i18n, { type InitOptions } from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// ── EN ──────────────────────────────────────────────
import enCommon    from '../../public/locales/en/common.json';
import enAuth      from '../../public/locales/en/auth.json';
import enDashboard from '../../public/locales/en/dashboard.json';
import enCampaign  from '../../public/locales/en/campaign.json';
import enInterview from '../../public/locales/en/interview.json';
import enHome      from '../../public/locales/en/home.json';

// ── FR ──────────────────────────────────────────────
import frCommon    from '../../public/locales/fr/common.json';
import frAuth      from '../../public/locales/fr/auth.json';
import frDashboard from '../../public/locales/fr/dashboard.json';
import frCampaign  from '../../public/locales/fr/campaign.json';
import frInterview from '../../public/locales/fr/interview.json';
import frHome      from '../../public/locales/fr/home.json';

export const SUPPORTED_LANGUAGES = ['en', 'fr'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_COOKIE = 'talentai_lang';

export const NAMESPACES = ['common', 'auth', 'dashboard', 'campaign', 'interview', 'home'] as const;
export type Namespace = (typeof NAMESPACES)[number];

// RTL languages — extend this list when Arabic is added: ['ar']
export const RTL_LANGUAGES: SupportedLanguage[] = [];

const options: InitOptions = {
  resources: {
    en: {
      common:    enCommon,
      auth:      enAuth,
      dashboard: enDashboard,
      campaign:  enCampaign,
      interview: enInterview,
      home:      enHome,
    },
    fr: {
      common:    frCommon,
      auth:      frAuth,
      dashboard: frDashboard,
      campaign:  frCampaign,
      interview: frInterview,
      home:      frHome,
    },
  },

  fallbackLng: 'en',
  supportedLngs: [...SUPPORTED_LANGUAGES],
  defaultNS: 'common',
  ns: [...NAMESPACES],

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  detection: {
    order: ['cookie', 'localStorage', 'navigator'],
    caches: ['cookie', 'localStorage'],
    cookieName: LANGUAGE_COOKIE,
    cookieOptions: { path: '/', sameSite: 'lax' },
    lookupLocalStorage: LANGUAGE_COOKIE,
  } as any,

  interpolation: {
    escapeValue: false,
  },

  react: {
    useSuspense: false,
  },
};

if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init(options);
} else {
  // Re-sync all bundles so JSON changes survive HMR without a full restart
  SUPPORTED_LANGUAGES.forEach((lng) => {
    NAMESPACES.forEach((ns) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const bundle = (options.resources as any)?.[lng]?.[ns];
      if (bundle) i18n.addResourceBundle(lng, ns, bundle, true, true);
    });
  });
}

export default i18n;
