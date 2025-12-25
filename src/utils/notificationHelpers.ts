import { AppDispatch } from '@/store/store';

/**
 * Centralized notification helper functions
 * Import and use these functions in your Redux thunks and components
 */

// Helper to send notification
export const sendNotification = async (
  dispatch: AppDispatch,
  type: 'success' | 'info' | 'warning' | 'error',
  content: string
) => {
  const { createNotification } = await import('@/store/slices/notificationSlice');
  dispatch(createNotification({ type, content }) as any);
};

// ==================== SKILL TEST NOTIFICATIONS ====================

export const notifySkillTestPassed = (dispatch: AppDispatch, skillName: string, score: number) =>
  sendNotification(dispatch, 'success', `Great job! You scored ${score}% on the ${skillName} test! 🎯`);

export const notifySkillLevelUp = (dispatch: AppDispatch, skillName: string, newLevel: string) =>
  sendNotification(dispatch, 'success', `🎉 Congratulations! You've achieved ${newLevel} level in ${skillName}! Keep it up! 🌟`);

export const notifySkillTestCompleted = (dispatch: AppDispatch, skillName: string) =>
  sendNotification(dispatch, 'info', `You've completed the ${skillName} test. Keep practicing to improve your score! 💪`);

// ==================== GENERAL ERROR HANDLERS ====================

export const notifyError = (dispatch: AppDispatch, message: string) =>
  sendNotification(dispatch, 'error', message);

export const notifySuccess = (dispatch: AppDispatch, message: string) =>
  sendNotification(dispatch, 'success', message);

export const notifyInfo = (dispatch: AppDispatch, message: string) =>
  sendNotification(dispatch, 'info', message);

export const notifyWarning = (dispatch: AppDispatch, message: string) =>
  sendNotification(dispatch, 'warning', message);
