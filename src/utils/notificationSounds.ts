/**
 * Notification Sound Utility
 * Gère la lecture des sons pour différents types de notifications
 * Version améliorée avec sons multi-tons professionnels
 */

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

// Configuration des sons par type de notification
interface SoundConfig {
  notes: { freq: number; startTime: number; duration: number }[];
  type?: OscillatorType;
}

const SOUND_CONFIGS: Record<NotificationType, SoundConfig> = {
  // Success: Facebook-style notification - short distinctive pop
  success: {
    notes: [
      { freq: 587.33, startTime: 0, duration: 0.06 },      // D5
      { freq: 880.00, startTime: 0.05, duration: 0.08 },   // A5
    ],
    type: 'sine',
  },

  // Error: Slightly lower pitched alert
  error: {
    notes: [
      { freq: 493.88, startTime: 0, duration: 0.06 },      // B4
      { freq: 369.99, startTime: 0.05, duration: 0.08 },   // F#4
    ],
    type: 'sine',
  },

  // Warning: Medium pitched notification
  warning: {
    notes: [
      { freq: 523.25, startTime: 0, duration: 0.06 },      // C5
      { freq: 783.99, startTime: 0.05, duration: 0.08 },   // G5
    ],
    type: 'sine',
  },

  // Info: Facebook-style notification - short distinctive pop (same as success)
  info: {
    notes: [
      { freq: 587.33, startTime: 0, duration: 0.06 },      // D5
      { freq: 880.00, startTime: 0.05, duration: 0.08 },   // A5
    ],
    type: 'sine',
  },
};

class NotificationSoundManager {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;
  private volume: number = 0.3; // Volume par défaut (0-1)
  private masterGain: GainNode | null = null;

  constructor() {
    // Charger les préférences depuis localStorage
    this.loadSettings();
  }

  /**
   * Initialise l'AudioContext (nécessaire pour certains navigateurs)
   */
  private initAudioContext(): void {
    if (!this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.masterGain = this.audioContext.createGain();
        this.masterGain.connect(this.audioContext.destination);
        this.masterGain.gain.value = this.volume;
      } catch (e) {
        console.warn('Web Audio API non supportée:', e);
      }
    }
  }

  /**
   * Charge les paramètres depuis localStorage
   */
  private loadSettings(): void {
    try {
      // Check if localStorage is available (client-side only)
      if (typeof window === 'undefined') return;

      const settings = localStorage.getItem('notificationSoundSettings');
      if (settings) {
        const parsed = JSON.parse(settings);
        this.enabled = parsed.enabled ?? true;
        this.volume = parsed.volume ?? 0.3;
      }
    } catch (e) {
      console.warn('Erreur lors du chargement des paramètres audio:', e);
    }
  }

  /**
   * Sauvegarde les paramètres dans localStorage
   */
  private saveSettings(): void {
    try {
      // Check if localStorage is available (client-side only)
      if (typeof window === 'undefined') return;

      localStorage.setItem('notificationSoundSettings', JSON.stringify({
        enabled: this.enabled,
        volume: this.volume,
      }));
    } catch (e) {
      console.warn('Erreur lors de la sauvegarde des paramètres audio:', e);
    }
  }

  /**
   * Crée un oscillateur avec envelope ADSR
   */
  private createNote(
    freq: number,
    startTime: number,
    duration: number,
    type: OscillatorType = 'sine'
  ): void {
    if (!this.audioContext || !this.masterGain) return;

    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    // Connecter: oscillator -> gain -> masterGain -> destination
    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);

    // Configuration de l'oscillateur
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, now + startTime);

    // Envelope ADSR pour un son court et percutant (style Facebook)
    const attack = 0.005;  // Attack très rapide pour un son "pop"
    const decay = 0.02;    // Decay court
    const sustain = 0.6;   // Sustain modéré
    const release = 0.05;  // Release rapide

    const peakTime = now + startTime + attack;
    const sustainTime = now + startTime + attack + decay;
    const endTime = now + startTime + duration;

    gainNode.gain.setValueAtTime(0, now + startTime);
    gainNode.gain.linearRampToValueAtTime(1, peakTime); // Attack
    gainNode.gain.linearRampToValueAtTime(sustain, sustainTime); // Decay to Sustain
    gainNode.gain.setValueAtTime(sustain, endTime - release); // Hold Sustain
    gainNode.gain.linearRampToValueAtTime(0, endTime); // Release

    // Démarrer et arrêter
    oscillator.start(now + startTime);
    oscillator.stop(endTime);
  }

  /**
   * Joue un son pour le type de notification donné
   */
  public play(type: NotificationType): void {
    if (!this.enabled) return;

    this.initAudioContext();
    if (!this.audioContext || !this.masterGain) return;

    const config = SOUND_CONFIGS[type];

    try {
      // Mettre à jour le volume master
      this.masterGain.gain.value = this.volume;

      // Jouer chaque note de la mélodie
      config.notes.forEach(note => {
        this.createNote(
          note.freq,
          note.startTime,
          note.duration,
          config.type
        );
      });
    } catch (e) {
      console.warn('Erreur lors de la lecture du son:', e);
    }
  }

  /**
   * Active/désactive les sons
   */
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.saveSettings();
  }

  /**
   * Obtient l'état actuel (activé/désactivé)
   */
  public isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Définit le volume (0-1)
   */
  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.masterGain) {
      this.masterGain.gain.value = this.volume;
    }
    this.saveSettings();
  }

  /**
   * Obtient le volume actuel (0-1)
   */
  public getVolume(): number {
    return this.volume;
  }

  /**
   * Test un son (pour prévisualisation)
   */
  public test(type: NotificationType): void {
    const wasEnabled = this.enabled;
    this.enabled = true;
    this.play(type);
    this.enabled = wasEnabled;
  }
}

// Instance singleton
export const notificationSound = new NotificationSoundManager();

/**
 * Hook-like function pour jouer un son de notification
 */
export const playNotificationSound = (type: NotificationType) => {
  notificationSound.play(type);
};
