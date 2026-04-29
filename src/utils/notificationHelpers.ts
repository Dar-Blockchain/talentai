import { AppDispatch } from '@/store/store';
import {
  createNotification,
  broadcastSystemNotification as broadcastThunk,
} from '@/store/slices/notificationSlice';

type NotifType = 'success' | 'info' | 'warning' | 'error';

export const sendNotification = (dispatch: AppDispatch, type: NotifType, content: string) =>
  dispatch(createNotification({ type, content }) as any);

export const notifySuccess = (dispatch: AppDispatch, message: string) => sendNotification(dispatch, 'success', message);
export const notifyError   = (dispatch: AppDispatch, message: string) => sendNotification(dispatch, 'error',   message);
export const notifyInfo    = (dispatch: AppDispatch, message: string) => sendNotification(dispatch, 'info',    message);
export const notifyWarning = (dispatch: AppDispatch, message: string) => sendNotification(dispatch, 'warning', message);

export const notifySkillTestPassed    = (dispatch: AppDispatch, skillName: string, score: number) =>
  sendNotification(dispatch, 'success', `Great job! You scored ${score}% on the ${skillName} test! 🎯`);
export const notifySkillLevelUp       = (dispatch: AppDispatch, skillName: string, newLevel: string) =>
  sendNotification(dispatch, 'success', `🎉 Congratulations! You've achieved ${newLevel} level in ${skillName}! Keep it up! 🌟`);
export const notifySkillTestCompleted = (dispatch: AppDispatch, skillName: string) =>
  sendNotification(dispatch, 'info', `You've completed the ${skillName} test. Keep practicing to improve your score! 💪`);

export const broadcastSystemNotification = async (
  dispatch: AppDispatch,
  content: string,
  recipientIds: string[]
): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    await dispatch(broadcastThunk({ content, recipientIds })).unwrap();
    return { success: true, message: 'Broadcast sent successfully' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const notifyCandidateUnlocked = (dispatch: AppDispatch, candidateIds: string[]) =>
  broadcastSystemNotification(
    dispatch,
    "Great news! A company has unlocked your profile and is interested in your qualifications. Check your dashboard for more details! 🎉",
    candidateIds
  );

export const notifyJobMatch = (dispatch: AppDispatch, candidateIds: string[], jobTitle?: string) =>
  broadcastSystemNotification(
    dispatch,
    `🎯 Great news! Your profile matches ${jobTitle || 'a new job opportunity'}. A company is looking for candidates with your skills. Check it out now!`,
    candidateIds
  );
