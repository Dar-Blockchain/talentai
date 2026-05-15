import i18n, { type InitOptions } from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// ── EN ──────────────────────────────────────────────
import enCommon     from '../../public/locales/en/shared/common.json';
import enAuth       from '../../public/locales/en/shared/auth.json';
import enDashboard  from '../../public/locales/en/shared/dashboard.json';
import enDashboardCandidate from '../../public/locales/en/modules/candidates/candidate.json';
import enPosts      from '../../public/locales/en/modules/company/posts.json';
import enCampaign   from '../../public/locales/en/modules/campaigns/campaign.json';
import enInterview  from '../../public/locales/en/shared/interview.json';
import enHome       from '../../public/locales/en/shared/home.json';
import enLegal      from '../../public/locales/en/shared/legal.json';
import enEmployees  from '../../public/locales/en/modules/employees/employees.json';
import enDepartments from '../../public/locales/en/modules/departments/departments.json';
import enSubscription from '../../public/locales/en/modules/company/subscription.json';
import enInterviewHr from '../../public/locales/en/modules/interview/interview.json';
import enInterviewResults from '../../public/locales/en/modules/interview/results.json';
import enInterviewApply from '../../public/locales/en/modules/interview/apply.json';
import enChat from '../../public/locales/en/shared/chat.json';
import enTeamChat from '../../public/locales/en/modules/company/teamChat.json';
import enCandidateChat from '../../public/locales/en/modules/candidates/candidateChat.json';
import enCompanyChat from '../../public/locales/en/modules/company/companyChat.json';

// ── FR ──────────────────────────────────────────────
import frCommon     from '../../public/locales/fr/shared/common.json';
import frAuth       from '../../public/locales/fr/shared/auth.json';
import frDashboard  from '../../public/locales/fr/shared/dashboard.json';
import frDashboardCandidate from '../../public/locales/fr/modules/candidates/candidate.json';
import frPosts      from '../../public/locales/fr/modules/company/posts.json';
import frCampaign   from '../../public/locales/fr/modules/campaigns/campaign.json';
import frInterview  from '../../public/locales/fr/shared/interview.json';
import frHome       from '../../public/locales/fr/shared/home.json';
import frLegal      from '../../public/locales/fr/shared/legal.json';
import frEmployees  from '../../public/locales/fr/modules/employees/employees.json';
import frDepartments from '../../public/locales/fr/modules/departments/departments.json';
import frSubscription from '../../public/locales/fr/modules/company/subscription.json';
import frInterviewHr from '../../public/locales/fr/modules/interview/interview.json';
import frInterviewResults from '../../public/locales/fr/modules/interview/results.json';
import frInterviewApply from '../../public/locales/fr/modules/interview/apply.json';
import frChat from '../../public/locales/fr/shared/chat.json';
import frTeamChat from '../../public/locales/fr/modules/company/teamChat.json';
import frCandidateChat from '../../public/locales/fr/modules/candidates/candidateChat.json';
import frCompanyChat from '../../public/locales/fr/modules/company/companyChat.json';

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

const options: InitOptions = {
  resources: {
    en: {
      common:    enCommon,
      auth:      enAuth,
      dashboard: mergeDashboardPageBundles(enDashboard, enEmployees, enDepartments, enCampaign, enSubscription, enDashboardCandidate),
      posts:     enPosts,
      interview: enInterview,
      home:      enHome,
      legal:     enLegal,
      'modules/interview/hr':      enInterviewHr,
      'modules/interview/results': enInterviewResults,
      'modules/interview/apply':   enInterviewApply,
      'shared/chat':               enChat,
      'modules/company/teamChat': enTeamChat,
      'modules/candidates/candidateChat': enCandidateChat,
      'modules/company/companyChat': enCompanyChat,
    },
    fr: {
      common:    frCommon,
      auth:      frAuth,
      dashboard: mergeDashboardPageBundles(frDashboard, frEmployees, frDepartments, frCampaign, frSubscription, frDashboardCandidate),
      posts:     frPosts,
      interview: frInterview,
      home:      frHome,
      legal:     frLegal,
      'modules/interview/hr':      frInterviewHr,
      'modules/interview/results': frInterviewResults,
      'modules/interview/apply':   frInterviewApply,
      'shared/chat':               frChat,
      'modules/company/teamChat': frTeamChat,
      'modules/candidates/candidateChat': frCandidateChat,
      'modules/company/companyChat': frCompanyChat,
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
    /** Map fr-FR / en-US → fr / en — resources are only registered under two-letter codes */
    convertDetectedLanguage: (lng: string) => {
      const base = lng.split("-")[0]?.toLowerCase();
      if (base === "fr" || base === "en") return base;
      return lng;
    },
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const langBundles = (options.resources as any)?.[lng] ?? {};
    Object.keys(langBundles).forEach((ns) => {
      i18n.addResourceBundle(lng, ns, langBundles[ns], true, true);
    });
  });
}

export default i18n;
