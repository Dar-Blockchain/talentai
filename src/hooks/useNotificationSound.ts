/**
 * Hook to manage notification sound settings
 */

import { useState, useEffect, useCallback } from 'react';
import { notificationSound, NotificationType } from '@/utils/notificationSounds';

export const useNotificationSound = () => {
  const [enabled, setEnabledState] = useState(notificationSound.isEnabled());
  const [volume, setVolumeState] = useState(notificationSound.getVolume());

  // Synchronize with localStorage on mount
  useEffect(() => {
    setEnabledState(notificationSound.isEnabled());
    setVolumeState(notificationSound.getVolume());
  }, []);

  /**
   * Enable/disable sounds
   */
  const setEnabled = useCallback((value: boolean) => {
    notificationSound.setEnabled(value);
    setEnabledState(value);
  }, []);

  /**
   * Changes the volume (0-100)
   */
  const setVolume = useCallback((value: number) => {
    const normalizedVolume = value / 100; // Convert 0-100 to 0-1
    notificationSound.setVolume(normalizedVolume);
    setVolumeState(normalizedVolume);
  }, []);

  /**
   * Toggle enable/disable
   */
  const toggle = useCallback(() => {
    const newValue = !enabled;
    setEnabled(newValue);
  }, [enabled, setEnabled]);

  /**
   * Test a sound
   */
  const testSound = useCallback((type: NotificationType) => {
    notificationSound.test(type);
  }, []);

  /**
   * Joue un son de notification
   */
  const play = useCallback((type: NotificationType) => {
    notificationSound.play(type);
  }, []);

  return {
    enabled,
    volume: Math.round(volume * 100), // Retourner 0-100 pour l'UI
    setEnabled,
    setVolume,
    toggle,
    testSound,
    play,
  };
};
