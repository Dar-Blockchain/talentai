import i18n, { type InitOptions } from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// ── EN ──────────────────────────────────────────────
import enCommon from '../../public/locales/en/shared/common.json';
import enAuth from '../../public/locales/en/shared/auth.json';
import enInterview from '../../public/locales/en/shared/interview.json';
import enHome from '../../public/locales/en/shared/home.json';
import enPosts from '../../public/locales/en/modules/company/posts.json';

import enCompanyShell from '../../public/locales/en/modules/company/shell.json';
import enEmployeeShell from '../../public/locales/en/modules/employee/shell.json';
import enEmployeeDashboard from '../../public/locales/en/modules/employee/dashboard.json';
import enPagesCommon from '../../public/locales/en/modules/company/pages-common.json';
import enApplications from '../../public/locales/en/modules/company/applications.json';
import enSettings from '../../public/locales/en/modules/company/settings.json';
import enEmployees from '../../public/locales/en/modules/employees/employees.json';
import enDepartments from '../../public/locales/en/modules/departments/departments.json';
import enCampaign from '../../public/locales/en/modules/campaigns/campaign.json';
import enSubscription from '../../public/locales/en/modules/company/subscription.json';

// ── FR ──────────────────────────────────────────────
import frCommon from '../../public/locales/fr/shared/common.json';
import frAuth from '../../public/locales/fr/shared/auth.json';
import frInterview from '../../public/locales/fr/shared/interview.json';
import frHome from '../../public/locales/fr/shared/home.json';
import frPosts from '../../public/locales/fr/modules/company/posts.json';

import frCompanyShell from '../../public/locales/fr/modules/company/shell.json';
import frEmployeeShell from '../../public/locales/fr/modules/employee/shell.json';
import frEmployeeDashboard from '../../public/locales/fr/modules/employee/dashboard.json';
import frPagesCommon from '../../public/locales/fr/modules/company/pages-common.json';
import frApplications from '../../public/locales/fr/modules/company/applications.json';
import frSettings from '../../public/locales/fr/modules/company/settings.json';
import frEmployees from '../../public/locales/fr/modules/employees/employees.json';
import frDepartments from '../../public/locales/fr/modules/departments/departments.json';
import frCampaign from '../../public/locales/fr/modules/campaigns/campaign.json';
import frSubscription from '../../public/locales/fr/modules/company/subscription.json';

export const SUPPORTED_LANGUAGES = ['en', 'fr'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_COOKIE = 'talentai_lang';

export const NAMESPACES = ['common', 'auth', 'dashboard', 'posts', 'interview', 'home'] as const;
export type Namespace = (typeof NAMESPACES)[number];

// RTL languages — extend this list when Arabic is added: ['ar']
export const RTL_LANGUAGES: SupportedLanguage[] = [];

/** Company + employee shell, nested `pages.*` for compose; page slices merged in `mergeDashboardPageBundles`. */
function buildDashboardBase<
  CS extends Record<string, unknown>,
  ES extends Record<string, unknown>,
  ED extends Record<string, unknown>,
  PC extends Record<string, unknown>,
  A extends Record<string, unknown>,
  S extends Record<string, unknown>,
>(companyShell: CS, employeeShell: ES, employeeDashboard: ED, pagesCommon: PC, applications: A, settings: S) {
  return {
    ...companyShell,
    ...employeeShell,
    ...employeeDashboard,
    pages: {
      common: pagesCommon,
      applications,
      settings,
    },
  };
}

/**
 * Per-locale JSON under `public/locales/{lng}/modules/**` merges into `dashboard.pages`.
 * e.g. `employees.json` → `pages.employees`, `departments.json` → `pages.departments`,
 * `campaign.json` → `pages.campaigns`, `subscription.json` → `pages.subscription`.
 */
function mergeDashboardPageBundles<D extends { pages: Record<string, unknown> }>(
  dashboard: D,
  employees: Record<string, unknown>,
  departments: Record<string, unknown>,
  campaigns: Record<string, unknown>,
  subscription: Record<string, unknown>,
): D {
  return {
    ...dashboard,
    pages: {
      ...dashboard.pages,
      employees,
      departments,
      campaigns,
      subscription,
    },
  };
}

const enDashboard = mergeDashboardPageBundles(
  buildDashboardBase(
    enCompanyShell,
    enEmployeeShell,
    enEmployeeDashboard,
    enPagesCommon,
    enApplications,
    enSettings,
  ),
  enEmployees,
  enDepartments,
  enCampaign,
  enSubscription,
);

const frDashboard = mergeDashboardPageBundles(
  buildDashboardBase(
    frCompanyShell,
    frEmployeeShell,
    frEmployeeDashboard,
    frPagesCommon,
    frApplications,
    frSettings,
  ),
  frEmployees,
  frDepartments,
  frCampaign,
  frSubscription,
);

const options: InitOptions = {
  resources: {
    en: {
      common: enCommon,
      auth: enAuth,
      dashboard: enDashboard,
      posts: enPosts,
      interview: enInterview,
      home: enHome,
    },
    fr: {
      common: frCommon,
      auth: frAuth,
      dashboard: frDashboard,
      posts: frPosts,
      interview: frInterview,
      home: frHome,
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
      const base = lng.split('-')[0]?.toLowerCase();
      if (base === 'fr' || base === 'en') return base;
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
    NAMESPACES.forEach((ns) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const bundle = (options.resources as any)?.[lng]?.[ns];
      if (bundle) i18n.addResourceBundle(lng, ns, bundle, true, true);
    });
  });
}

export default i18n;
