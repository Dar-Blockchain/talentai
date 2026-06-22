import i18n, { type InitOptions } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getToken } from '@/modules/auth/shared/utils/token';

// ─── Lazy namespace loading ───────────────────────────────────────────────
type Lang = 'en' | 'fr';
type Loader = () => Promise<{ default: Record<string, unknown> }>;

const NAMESPACE_LOADERS: Record<string, Record<Lang, Loader>> = {
  common: {
    en: () => import('../../public/locales/en/shared/common.json'),
    fr: () => import('../../public/locales/fr/shared/common.json'),
  },
  auth: {
    en: () => import('../../public/locales/en/shared/auth.json'),
    fr: () => import('../../public/locales/fr/shared/auth.json'),
  },
  posts: {
    en: () => import('../../public/locales/en/modules/company/posts.json'),
    fr: () => import('../../public/locales/fr/modules/company/posts.json'),
  },
  interview: {
    en: () => import('../../public/locales/en/shared/interview.json'),
    fr: () => import('../../public/locales/fr/shared/interview.json'),
  },
  home: {
    en: () => import('../../public/locales/en/shared/home.json'),
    fr: () => import('../../public/locales/fr/shared/home.json'),
  },
  legal: {
    en: () => import('../../public/locales/en/shared/legal.json'),
    fr: () => import('../../public/locales/fr/shared/legal.json'),
  },
  'modules/interview/interview': {
    en: () => import('../../public/locales/en/modules/interview/interview.json'),
    fr: () => import('../../public/locales/fr/modules/interview/interview.json'),
  },
  'modules/interview/results': {
    en: () => import('../../public/locales/en/modules/interview/results.json'),
    fr: () => import('../../public/locales/fr/modules/interview/results.json'),
  },
  'modules/interview/apply': {
    en: () => import('../../public/locales/en/modules/interview/apply.json'),
    fr: () => import('../../public/locales/fr/modules/interview/apply.json'),
  },
  'modules/interview/skill-interview': {
    en: () => import('../../public/locales/en/modules/interview/skill-interview.json'),
    fr: () => import('../../public/locales/fr/modules/interview/skill-interview.json'),
  },
  'modules/interview/campaign-interview': {
    en: () => import('../../public/locales/en/modules/interview/campaign-interview.json'),
    fr: () => import('../../public/locales/fr/modules/interview/campaign-interview.json'),
  },
  'shared/chat': {
    en: () => import('../../public/locales/en/shared/chat.json'),
    fr: () => import('../../public/locales/fr/shared/chat.json'),
  },
  'modules/company/teamChat': {
    en: () => import('../../public/locales/en/modules/company/teamChat.json'),
    fr: () => import('../../public/locales/fr/modules/company/teamChat.json'),
  },
  'modules/candidates/candidateChat': {
    en: () => import('../../public/locales/en/modules/candidates/candidateChat.json'),
    fr: () => import('../../public/locales/fr/modules/candidates/candidateChat.json'),
  },
  'modules/company/companyChat': {
    en: () => import('../../public/locales/en/modules/company/companyChat.json'),
    fr: () => import('../../public/locales/fr/modules/company/companyChat.json'),
  },
  'modules/notifications/notifications': {
    en: () => import('../../public/locales/en/modules/notifications/notifications.json'),
    fr: () => import('../../public/locales/fr/modules/notifications/notifications.json'),
  },
};

// `dashboard` is a merge of 6 source files — loaded and combined as a single namespace fetch.
const DASHBOARD_PART_LOADERS: Record<Lang, Loader>[] = [
  { en: () => import('../../public/locales/en/shared/dashboard.json'),               fr: () => import('../../public/locales/fr/shared/dashboard.json') } as Record<Lang, Loader>,
  { en: () => import('../../public/locales/en/modules/employees/employees.json'),     fr: () => import('../../public/locales/fr/modules/employees/employees.json') } as Record<Lang, Loader>,
  { en: () => import('../../public/locales/en/modules/departments/departments.json'), fr: () => import('../../public/locales/fr/modules/departments/departments.json') } as Record<Lang, Loader>,
  { en: () => import('../../public/locales/en/modules/campaigns/campaign.json'),      fr: () => import('../../public/locales/fr/modules/campaigns/campaign.json') } as Record<Lang, Loader>,
  { en: () => import('../../public/locales/en/modules/company/subscription.json'),    fr: () => import('../../public/locales/fr/modules/company/subscription.json') } as Record<Lang, Loader>,
  { en: () => import('../../public/locales/en/modules/candidates/candidate.json'),    fr: () => import('../../public/locales/fr/modules/candidates/candidate.json') } as Record<Lang, Loader>,
];

export const SUPPORTED_LANGUAGES = ['en', 'fr'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_COOKIE = 'talentai_lang';

export const NAMESPACES = ['common', 'auth', 'dashboard', 'posts', 'interview', 'home', 'legal'] as const;
export type Namespace = (typeof NAMESPACES)[number];

// RTL languages — extend this list when Arabic is added: ['ar']
export const RTL_LANGUAGES: SupportedLanguage[] = [];

/**
 * Per-locale JSON under `public/locales/{lng}/modules/` merges into `dashboard.pages`.
 * e.g. `modules/employees/employees.json` → `pages.employees`,
 * `modules/departments/departments.json` → `pages.departments`,
 * `modules/campaigns/campaign.json` → `pages.campaigns`,
 * `modules/company/subscription.json` → `pages.subscription`.
 */
function mergeDashboardPageBundles<D extends { pages: Record<string, unknown> }>(
  dashboard: D,
  employees: Record<string, unknown>,
  departments: Record<string, unknown>,
  campaigns: Record<string, unknown>,
  subscription: Record<string, unknown>,
  candidate: Record<string, unknown>,
): D {
  return {
    ...dashboard,
    candidate,
    pages: {
      ...dashboard.pages,
      employees,
      departments,
      campaigns,
      subscription,
    },
  };
}

/**
 * i18next custom backend: resolves each (language, namespace) pair to its
 * webpack async chunk instead of a bundled JSON literal. `useTranslation(ns)`
 * triggers this the first time a namespace is actually requested, so pages
 * only ever download the translations they use.
 */
const lazyJsonBackend = {
  type: 'backend' as const,
  init() {},
  read(language: string, namespace: string, callback: (err: unknown, data?: unknown) => void) {
    const lng: Lang = language === 'fr' ? 'fr' : 'en';

    if (namespace === 'dashboard') {
      Promise.all(DASHBOARD_PART_LOADERS.map((loaders) => loaders[lng]()))
        .then(([dashboard, employees, departments, campaigns, subscription, candidate]) =>
          callback(
            null,
            mergeDashboardPageBundles(
              dashboard.default as any, employees.default, departments.default,
              campaigns.default, subscription.default, candidate.default,
            ),
          ),
        )
        .catch((err) => callback(err, null));
      return;
    }

    const loader = NAMESPACE_LOADERS[namespace]?.[lng];
    if (!loader) { callback(null, {}); return; }
    loader().then((mod) => callback(null, mod.default)).catch((err) => callback(err, null));
  },
};

/**
 * Synchronously determine the correct starting language before React renders.
 * Priority: persisted Redux user language (auth) → cookie → manual key → 'en'
 * The cookie (talentai_lang, 1-year) is the guest/post-logout source of truth.
 */
function getInitialLanguage(): string {
  if (typeof window === 'undefined') return 'en';

  const hasToken = !!getToken();
  if (!hasToken) return 'en';

  // Try to read from persisted Redux state (fastest — already in localStorage)
  try {
    const raw = localStorage.getItem('persist:root');
    if (raw) {
      const root = JSON.parse(raw);
      if (root.user) {
        const userState = JSON.parse(root.user);
        const lang = userState?.connectedUser?.user?.language;
        if (lang === 'fr' || lang === 'en') return lang;
      }
    }
  } catch { /* ignore parse errors */ }

  // Fall back to manually saved language key
  const manual = localStorage.getItem('talentai_lang_manual');
  if (manual === 'fr' || manual === 'en') return manual;

  return 'en';
}

const PRELOADED_NAMESPACES = ['common', 'dashboard', 'modules/notifications/notifications', 'home'];

const options: InitOptions = {
  lng: getInitialLanguage(),
  fallbackLng: 'en',
  supportedLngs: [...SUPPORTED_LANGUAGES],
  defaultNS: 'common',
  ns: PRELOADED_NAMESPACES,
  partialBundledLanguages: true,

  interpolation: {
    escapeValue: false,
  },

  react: {
    useSuspense: false,
  },
};

if (!i18n.isInitialized) {
  i18n
    .use(lazyJsonBackend)
    .use(initReactI18next)
    .init(options);
} else {
  // Re-fetch already-loaded namespaces so JSON changes survive HMR without a full restart
  i18n.reloadResources();
}

export default i18n;
