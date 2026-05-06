import { useState, useCallback } from 'react';
import { notificationSound, NotificationType } from '@/utils/notificationSounds';

export const useNotificationSound = () => {
  const [enabled, setEnabledState] = useState(() => notificationSound.isEnabled());
  const [volume,  setVolumeState]  = useState(() => Math.round(notificationSound.getVolume() * 100));

  const setEnabled = useCallback((value: boolean) => {
    notificationSound.setEnabled(value);
    setEnabledState(value);
  }, []);

  const setVolume = useCallback((value: number) => {
    notificationSound.setVolume(value / 100);
    setVolumeState(value);
  }, []);

  const toggle    = useCallback(() => setEnabled(!notificationSound.isEnabled()), [setEnabled]);
  const play      = useCallback((type: NotificationType) => notificationSound.play(type), []);
  const testSound = useCallback((type: NotificationType) => notificationSound.test(type), []);

  return { enabled, volume, setEnabled, setVolume, toggle, play, testSound };
};
