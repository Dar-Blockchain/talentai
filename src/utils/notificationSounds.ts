/**
 * Notification Sound Utility
 * Manages playing sounds for different notification types
 * Enhanced version with multi-tone professional sounds
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
  private volume: number = 0.3; // Default volume (0-1)
  private masterGain: GainNode | null = null;

  constructor() {
    // Load preferences from localStorage
    this.loadSettings();
  }

  /**
   * Initializes the AudioContext (necessary for certain browsers)
   */
  private initAudioContext(): void {
    if (!this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.masterGain = this.audioContext.createGain();
        this.masterGain.connect(this.audioContext.destination);
        this.masterGain.gain.value = this.volume;
      } catch (e) {
        console.warn('Web Audio API not supported:', e);
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
      console.warn('Error loading audio settings:', e);
    }
  }

  /**
   * Saves parameters to localStorage
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
      console.warn('Error saving audio settings:', e);
    }
  }

  /**
   * Creates an oscillator with ADSR envelope
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

    // Connect: oscillator -> gain -> masterGain -> destination
    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);

    // Oscillator configuration
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, now + startTime);

    // ADSR envelope for short, punchy sound (Facebook style)
    const attack = 0.005;  // Very fast attack for a 'pop' sound
    const decay = 0.02;    // Short decay
    const sustain = 0.6;   // Moderate sustain
    const release = 0.05;  // Fast release

    const peakTime = now + startTime + attack;
    const sustainTime = now + startTime + attack + decay;
    const endTime = now + startTime + duration;

    gainNode.gain.setValueAtTime(0, now + startTime);
    gainNode.gain.linearRampToValueAtTime(1, peakTime); // Attack
    gainNode.gain.linearRampToValueAtTime(sustain, sustainTime); // Decay to Sustain
    gainNode.gain.setValueAtTime(sustain, endTime - release); // Hold Sustain
    gainNode.gain.linearRampToValueAtTime(0, endTime); // Release

    // Start and stop
    oscillator.start(now + startTime);
    oscillator.stop(endTime);
  }

  /**
   * Plays a sound for the given notification type
   */
  public play(type: NotificationType): void {
    if (!this.enabled) return;

    this.initAudioContext();
    if (!this.audioContext || !this.masterGain) return;

    const config = SOUND_CONFIGS[type];

    try {
      // Update master volume
      this.masterGain.gain.value = this.volume;

      // Play each note of the melody
      config.notes.forEach(note => {
        this.createNote(
          note.freq,
          note.startTime,
          note.duration,
          config.type
        );
      });
    } catch (e) {
      console.warn('Error playing sound:', e);
    }
  }

  /**
   * Enable/disable sounds
   */
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.saveSettings();
  }

  /**
   * Gets the current state (enabled/disabled)
   */
  public isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Sets the volume (0-1)
   */
  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.masterGain) {
      this.masterGain.gain.value = this.volume;
    }
    this.saveSettings();
  }

  /**
   * Gets the current volume (0-1)
   */
  public getVolume(): number {
    return this.volume;
  }

  /**
   * Test a sound (for preview)
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
