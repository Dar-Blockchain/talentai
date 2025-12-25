import { AppDispatch } from '@/store/store';
import { broadcastSystemNotification as broadcastThunk } from '@/store/slices/notificationSlice';

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

// ==================== BROADCAST NOTIFICATIONS ====================

/**
 * Broadcast a system notification to multiple recipients using Redux thunk
 * @param dispatch - Redux dispatch function
 * @param content - The notification message
 * @param recipientIds - Array of user IDs to receive the notification
 * @returns Promise with the broadcast result
 */
export const broadcastSystemNotification = async (
  dispatch: AppDispatch,
  content: string,
  recipientIds: string[]
): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    console.log('📢 [BroadcastHelper] Broadcasting to:', recipientIds.length, 'recipients');
    await dispatch(broadcastThunk({ content, recipientIds })).unwrap();
    return { success: true, message: 'Broadcast sent successfully' };
  } catch (error: any) {
    console.error('❌ [BroadcastHelper] Error broadcasting notification:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Notify candidates when their profile is unlocked by a company
 * @param dispatch - Redux dispatch function
 * @param candidateIds - Array of candidate user IDs
 */
export const notifyCandidateUnlocked = async (dispatch: AppDispatch, candidateIds: string[]) => {
  return broadcastSystemNotification(
    dispatch,
    "Great news! A company has unlocked your profile and is interested in your qualifications. Check your dashboard for more details! 🎉",
    candidateIds
  );
};
