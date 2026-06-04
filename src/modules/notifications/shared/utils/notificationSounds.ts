export type NotificationType = 'success' | 'error' | 'warning' | 'info';

const CONFIGS: Record<NotificationType, { notes: [number, number, number][]; type: OscillatorType }> = {
  success: { notes: [[587.33, 0, 0.06], [880, 0.05, 0.08]],    type: 'sine' },
  info:    { notes: [[587.33, 0, 0.06], [880, 0.05, 0.08]],    type: 'sine' },
  warning: { notes: [[523.25, 0, 0.06], [783.99, 0.05, 0.08]], type: 'sine' },
  error:   { notes: [[493.88, 0, 0.06], [369.99, 0.05, 0.08]], type: 'sine' },
};

const STORAGE_KEY = 'notificationSoundSettings';

class NotificationSoundManager {
  private ctx:  AudioContext | null = null;
  private gain: GainNode    | null = null;
  private enabled = true;
  private volume  = 0.3;

  constructor() {
    if (typeof window === 'undefined') return;
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      if (s) { const p = JSON.parse(s); this.enabled = p.enabled ?? true; this.volume = p.volume ?? 0.3; }
    } catch {}
  }

  private init(): boolean {
    if (this.ctx) return true;
    try {
      this.ctx  = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.gain = this.ctx.createGain();
      this.gain.gain.value = this.volume;
      this.gain.connect(this.ctx.destination);
      return true;
    } catch { return false; }
  }

  private save(): void {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ enabled: this.enabled, volume: this.volume })); } catch {}
  }

  private playNote(freq: number, start: number, duration: number, type: OscillatorType): void {
    const ctx = this.ctx!; const gain = this.gain!;
    const t   = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g   = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t + start);
    osc.connect(g); g.connect(gain);
    g.gain.setValueAtTime(0,   t + start);
    g.gain.linearRampToValueAtTime(1,   t + start + 0.005);
    g.gain.linearRampToValueAtTime(0.6, t + start + 0.025);
    g.gain.setValueAtTime(0.6,          t + start + duration - 0.05);
    g.gain.linearRampToValueAtTime(0,   t + start + duration);
    osc.start(t + start); osc.stop(t + start + duration);
  }

  play(type: NotificationType): void {
    if (!this.enabled || !this.init() || !this.ctx || !this.gain) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    try {
      const { notes, type: oscType } = CONFIGS[type];
      this.gain.gain.value = this.volume;
      notes.forEach(([freq, start, dur]) => this.playNote(freq, start, dur, oscType));
    } catch {}
  }

  test(type: NotificationType): void {
    const prev = this.enabled; this.enabled = true;
    this.play(type);
    this.enabled = prev;
  }

  setEnabled(v: boolean): void { this.enabled = v; this.save(); }
  setVolume(v: number):   void { this.volume = Math.max(0, Math.min(1, v)); if (this.gain) this.gain.gain.value = this.volume; this.save(); }
  isEnabled(): boolean { return this.enabled; }
  getVolume(): number  { return this.volume; }
}

export const notificationSound     = new NotificationSoundManager();
export const playNotificationSound = (type: NotificationType) => notificationSound.play(type);
