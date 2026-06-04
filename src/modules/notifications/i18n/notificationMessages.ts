import i18n from '@/i18n/config';

const NS = 'modules/notifications/notifications';

/** Translate a notification message key using the current i18n language. */
const nt = (key: string, params?: Record<string, string | number>): string =>
  i18n.t(key, { ns: NS, ...params });

export const notifMessages = {
  welcome: () =>
    nt('welcome'),

  skillTestPassed: (skillName: string, score: number) =>
    nt('skillTestPassed', { skillName, score }),

  skillLevelUp: (skillName: string, newLevel: string) =>
    nt('skillLevelUp', { skillName, newLevel }),

  skillTestCompleted: (skillName: string) =>
    nt('skillTestCompleted', { skillName }),

  candidateUnlocked: () =>
    nt('candidateUnlocked'),

  jobMatch: (jobTitle?: string) =>
    jobTitle ? nt('jobMatch', { jobTitle }) : nt('jobMatchDefault'),

  interviewCompleted: (interviewLabel: string) =>
    nt('interviewCompleted', { interviewLabel }),
};
