/**
 * Hook pour gérer les paramètres des sons de notification
 */

import { useState, useEffect, useCallback } from 'react';
import { notificationSound, NotificationType } from '@/utils/notificationSounds';

export const useNotificationSound = () => {
  const [enabled, setEnabledState] = useState(notificationSound.isEnabled());
  const [volume, setVolumeState] = useState(notificationSound.getVolume());

  // Synchroniser avec localStorage au montage
  useEffect(() => {
    setEnabledState(notificationSound.isEnabled());
    setVolumeState(notificationSound.getVolume());
  }, []);

  /**
   * Active/désactive les sons
   */
  const setEnabled = useCallback((value: boolean) => {
    notificationSound.setEnabled(value);
    setEnabledState(value);
  }, []);

  /**
   * Modifie le volume (0-100)
   */
  const setVolume = useCallback((value: number) => {
    const normalizedVolume = value / 100; // Convertir 0-100 en 0-1
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
   * Teste un son
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
