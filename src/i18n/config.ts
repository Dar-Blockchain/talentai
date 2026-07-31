import i18n, { type InitOptions } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getToken } from '@/modules/auth/shared/utils/token';

// ─── Static imports — all bundles available synchronously ─────────────────
import commonEn from '../../public/locales/en/shared/common.json';
import commonFr from '../../public/locales/fr/shared/common.json';
import homeEn from '../../public/locales/en/shared/home.json';
import homeFr from '../../public/locales/fr/shared/home.json';
import authEn from '../../public/locales/en/shared/auth.json';
import authFr from '../../public/locales/fr/shared/auth.json';
import legalEn from '../../public/locales/en/shared/legal.json';
import legalFr from '../../public/locales/fr/shared/legal.json';
import interviewSharedEn from '../../public/locales/en/shared/interview.json';
import interviewSharedFr from '../../public/locales/fr/shared/interview.json';
import chatEn from '../../public/locales/en/shared/chat.json';
import chatFr from '../../public/locales/fr/shared/chat.json';
import postsEn from '../../public/locales/en/modules/company/posts.json';
import postsFr from '../../public/locales/fr/modules/company/posts.json';
import teamChatEn from '../../public/locales/en/modules/company/teamChat.json';
import teamChatFr from '../../public/locales/fr/modules/company/teamChat.json';
import companyChatEn from '../../public/locales/en/modules/company/companyChat.json';
import companyChatFr from '../../public/locales/fr/modules/company/companyChat.json';
import candidateChatEn from '../../public/locales/en/modules/candidates/candidateChat.json';
import candidateChatFr from '../../public/locales/fr/modules/candidates/candidateChat.json';
import notificationsEn from '../../public/locales/en/modules/notifications/notifications.json';
import notificationsFr from '../../public/locales/fr/modules/notifications/notifications.json';
import interviewEn from '../../public/locales/en/modules/interview/interview.json';
import interviewFr from '../../public/locales/fr/modules/interview/interview.json';
import interviewResultsEn from '../../public/locales/en/modules/interview/results.json';
import interviewResultsFr from '../../public/locales/fr/modules/interview/results.json';
import interviewApplyEn from '../../public/locales/en/modules/interview/apply.json';
import interviewApplyFr from '../../public/locales/fr/modules/interview/apply.json';
import skillInterviewEn from '../../public/locales/en/modules/interview/skill-interview.json';
import skillInterviewFr from '../../public/locales/fr/modules/interview/skill-interview.json';
import campaignInterviewEn from '../../public/locales/en/modules/interview/campaign-interview.json';
import campaignInterviewFr from '../../public/locales/fr/modules/interview/campaign-interview.json';
// Dashboard composite parts
import dashboardEn from '../../public/locales/en/shared/dashboard.json';
import dashboardFr from '../../public/locales/fr/shared/dashboard.json';
import employeesEn from '../../public/locales/en/modules/employees/employees.json';
import employeesFr from '../../public/locales/fr/modules/employees/employees.json';
import departmentsEn from '../../public/locales/en/modules/departments/departments.json';
import departmentsFr from '../../public/locales/fr/modules/departments/departments.json';
import campaignEn from '../../public/locales/en/modules/campaigns/campaign.json';
import campaignFr from '../../public/locales/fr/modules/campaigns/campaign.json';
import subscriptionEn from '../../public/locales/en/modules/company/subscription.json';
import subscriptionFr from '../../public/locales/fr/modules/company/subscription.json';
import candidateEn from '../../public/locales/en/modules/candidates/candidate.json';
import candidateFr from '../../public/locales/fr/modules/candidates/candidate.json';
import webinarEn from '../../public/locales/en/modules/webinar/webinar.json';
import webinarFr from '../../public/locales/fr/modules/webinar/webinar.json';

export const SUPPORTED_LANGUAGES = ['en', 'fr'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_COOKIE = 'talentai_lang';

export const NAMESPACES = ['common', 'auth', 'dashboard', 'posts', 'interview', 'home', 'legal', 'webinar'] as const;
export type Namespace = (typeof NAMESPACES)[number];

// RTL languages — extend this list when Arabic is added: ['ar']
export const RTL_LANGUAGES: SupportedLanguage[] = [];

/**
 * Per-locale JSON under `public/locales/{lng}/modules/` merges into `dashboard.pages`.
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
 * Synchronously determine the correct starting language before React renders.
 * Priority: manual key (explicit user choice, always wins) → persisted Redux user language (auth) → 'en'
 */
function getInitialLanguage(): string {
  if (typeof window === 'undefined') return 'en';

  const manual = localStorage.getItem('talentai_lang_manual');
  if (manual === 'fr' || manual === 'en') return manual;

  const hasToken = !!getToken();
  if (!hasToken) return 'en';

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

  return 'en';
}

const resources: InitOptions['resources'] = {
  en: {
    common: commonEn,
    home: homeEn,
    auth: authEn,
    legal: legalEn,
    interview: interviewSharedEn,
    'shared/chat': chatEn,
    posts: postsEn,
    'modules/company/teamChat': teamChatEn,
    'modules/company/companyChat': companyChatEn,
    'modules/candidates/candidateChat': candidateChatEn,
    'modules/notifications/notifications': notificationsEn,
    'modules/interview/interview': interviewEn,
    'modules/interview/results': interviewResultsEn,
    'modules/interview/apply': interviewApplyEn,
    'modules/interview/skill-interview': skillInterviewEn,
    'modules/interview/campaign-interview': campaignInterviewEn,
    webinar: webinarEn,
    dashboard: mergeDashboardPageBundles(
      dashboardEn as unknown as { pages: Record<string, unknown> },
      employeesEn,
      departmentsEn,
      campaignEn,
      subscriptionEn,
      candidateEn,
    ),
  },
  fr: {
    common: commonFr,
    home: homeFr,
    auth: authFr,
    legal: legalFr,
    interview: interviewSharedFr,
    'shared/chat': chatFr,
    posts: postsFr,
    'modules/company/teamChat': teamChatFr,
    'modules/company/companyChat': companyChatFr,
    'modules/candidates/candidateChat': candidateChatFr,
    'modules/notifications/notifications': notificationsFr,
    'modules/interview/interview': interviewFr,
    'modules/interview/results': interviewResultsFr,
    'modules/interview/apply': interviewApplyFr,
    'modules/interview/skill-interview': skillInterviewFr,
    'modules/interview/campaign-interview': campaignInterviewFr,
    webinar: webinarFr,
    dashboard: mergeDashboardPageBundles(
      dashboardFr as unknown as { pages: Record<string, unknown> },
      employeesFr,
      departmentsFr,
      campaignFr,
      subscriptionFr,
      candidateFr,
    ),
  },
};

const options: InitOptions = {
  lng: getInitialLanguage(),
  fallbackLng: 'en',
  supportedLngs: [...SUPPORTED_LANGUAGES],
  defaultNS: 'common',
  resources,

  interpolation: {
    escapeValue: false,
  },

  react: {
    useSuspense: false,
  },
};

if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init(options);
} else {
  // HMR: push updated static-import bundles into the existing i18next store
  (Object.keys(resources) as (keyof typeof resources)[]).forEach((lng) => {
    (Object.entries(resources[lng]) as [string, object][]).forEach(([ns, bundle]) => {
      i18n.addResourceBundle(lng as string, ns, bundle, true, true);
    });
  });
}

export default i18n;
