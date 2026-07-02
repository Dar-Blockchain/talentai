import { useState, useCallback } from 'react';

interface NotificationState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
}

/**
 * Custom hook for managing notifications/snackbar
 */
export const useNotification = () => {
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    severity: 'info',
  });

  const showNotification = useCallback(
    (message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'info') => {
      setNotification({
        open: true,
        message,
        severity,
      });
    },
    []
  );

  const hideNotification = useCallback(() => {
    setNotification((prev) => ({
      ...prev,
      open: false,
    }));
  }, []);

  return {
    notification,
    showNotification,
    hideNotification,
  };
};
