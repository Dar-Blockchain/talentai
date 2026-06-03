export { deriveTitleFromContent, formatRelativeTime, mapToNotificationItem } from '../api/notificationApi';
import { notificationApi } from '../api/notificationApi';
import { notifMessages } from '../i18n/notificationMessages';

export const notifySkillTestPassed = (skillName: string, score: number) =>
  notificationApi.createNotification('success', notifMessages.skillTestPassed(skillName, score));

export const notifySkillLevelUp = (skillName: string, newLevel: string) =>
  notificationApi.createNotification('success', notifMessages.skillLevelUp(skillName, newLevel));

export const notifySkillTestCompleted = (skillName: string) =>
  notificationApi.createNotification('info', notifMessages.skillTestCompleted(skillName));

export const notifySuccess = (message: string) => notificationApi.createNotification('success', message);
export const notifyError   = (message: string) => notificationApi.createNotification('error',   message);
export const notifyInfo    = (message: string) => notificationApi.createNotification('info',    message);
export const notifyWarning = (message: string) => notificationApi.createNotification('warning', message);

export const notifyCandidateUnlocked = (candidateIds: string[]) =>
  notificationApi.broadcastNotification(notifMessages.candidateUnlocked(), candidateIds);

export const notifyJobMatch = (candidateIds: string[], jobTitle?: string) =>
  notificationApi.broadcastNotification(notifMessages.jobMatch(jobTitle), candidateIds);
