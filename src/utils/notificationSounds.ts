export type NotificationType = 'success' | 'error' | 'warning' | 'info';

const SOUND_URL = '/sounds/notification.wav';
const STORAGE_KEY = 'notificationSoundSettings';

class NotificationSoundManager {
  private audio:   HTMLAudioElement | null = null;
  private enabled  = true;
  private volume   = 0.5;

  constructor() {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const p     = JSON.parse(raw);
        this.enabled = p.enabled ?? true;
        this.volume  = p.volume  ?? 0.5;
      }
    } catch { /* ignore */ }
  }

  private getAudio(): HTMLAudioElement {
    if (!this.audio) {
      this.audio         = new Audio(SOUND_URL);
      this.audio.volume  = this.volume;
      this.audio.preload = 'auto';
    }
    return this.audio;
  }

  play(_type?: NotificationType): void {
    if (!this.enabled || typeof window === 'undefined') return;
    try {
      const a    = this.getAudio();
      a.volume   = this.volume;
      a.currentTime = 0;
      a.play().catch(() => { /* autoplay blocked — ignore */ });
    } catch { /* ignore */ }
  }

  test(_type?: NotificationType): void {
    const prev   = this.enabled;
    this.enabled = true;
    this.play();
    this.enabled = prev;
  }

  setEnabled(v: boolean): void {
    this.enabled = v;
    this.save();
  }

  setVolume(v: number): void {
    this.volume = Math.max(0, Math.min(1, v));
    if (this.audio) this.audio.volume = this.volume;
    this.save();
  }

  isEnabled(): boolean { return this.enabled; }
  getVolume():  number { return this.volume; }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ enabled: this.enabled, volume: this.volume }));
    } catch { /* ignore */ }
  }
}

export const notificationSound    = new NotificationSoundManager();
export const playNotificationSound = (type?: NotificationType) => notificationSound.play(type);
