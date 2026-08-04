export const playNotificationSound = (): void => {
  if (typeof window === 'undefined') return;
  try {
    const a       = new Audio('/sounds/notification.wav');
    a.volume      = 0.5;
    a.play().catch(() => { /* autoplay blocked */ });
  } catch { /* ignore */ }
};
