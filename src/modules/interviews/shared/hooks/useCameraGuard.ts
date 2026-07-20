import { useEffect, useRef, useState, useCallback } from 'react';

type Notify = (msg: string, type?: 'info' | 'warning' | 'error' | 'success') => void;

export interface UseCameraGuardOptions {
  /** The live camera stream (from useCamera's streamRef), or null when not granted. */
  streamRef: React.RefObject<MediaStream | null>;
  /** Only ticks/enforces while true — i.e. the interview is actually active. */
  active: boolean;
  onTerminate?: () => void;
  showNotification: Notify;
}

export interface UseCameraGuardReturn {
  /** True when a live video track currently exists. */
  cameraLive: boolean;
  /** Number of 30s "camera still off" strikes accumulated (resets once camera returns). */
  strikes: number;
  /** Seconds remaining in the final grace countdown, or null when not in it. */
  graceSecondsLeft: number | null;
}

const STRIKE_INTERVAL_MS = 30_000;
const MAX_STRIKES = 3;
const GRACE_PERIOD_MS = 8_000;

const LOG = '[camera-guard]';

/**
 * Watches the live camera track (not just permission status) while the interview
 * is active. If the track goes away (device disabled, unplugged, revoked) the
 * candidate gets a warning every 30s; after 3 warnings a short grace period
 * counts down, and if the camera still isn't back, the interview auto-ends
 * (via the same end-of-interview path as a manual "End Interview").
 */
export const useCameraGuard = ({
  streamRef,
  active,
  onTerminate,
  showNotification,
}: UseCameraGuardOptions): UseCameraGuardReturn => {
  const [cameraLive, setCameraLive] = useState(false);
  const [strikes, setStrikes] = useState(0);
  const [graceSecondsLeft, setGraceSecondsLeft] = useState<number | null>(null);

  const strikeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const graceTimerRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const terminatedRef  = useRef(false);

  const onTerminateRef = useRef(onTerminate);
  const notifyRef      = useRef(showNotification);
  useEffect(() => { onTerminateRef.current = onTerminate; }, [onTerminate]);
  useEffect(() => { notifyRef.current = showNotification; }, [showNotification]);

  const clearStrikeTimer = useCallback(() => {
    if (strikeTimerRef.current) { clearInterval(strikeTimerRef.current); strikeTimerRef.current = null; }
  }, []);
  const clearGraceTimer = useCallback(() => {
    if (graceTimerRef.current) { clearInterval(graceTimerRef.current); graceTimerRef.current = null; }
  }, []);

  // ── Track the live video track on the current stream ────────────────────────
  useEffect(() => {
    const stream = streamRef.current;
    const track = stream?.getVideoTracks?.()[0];

    const computeLive = () => !!track && track.readyState === 'live' && !track.muted;
    setCameraLive(computeLive());

    if (!track) return;

    const handleChange = () => setCameraLive(computeLive());
    track.addEventListener('ended', handleChange);
    track.addEventListener('mute', handleChange);
    track.addEventListener('unmute', handleChange);

    // Safety-net poll — some browsers don't fire mute/unmute reliably.
    const poll = setInterval(handleChange, 2000);

    return () => {
      track.removeEventListener('ended', handleChange);
      track.removeEventListener('mute', handleChange);
      track.removeEventListener('unmute', handleChange);
      clearInterval(poll);
    };
    // Re-run whenever the stream identity changes (e.g. camera re-granted after reload
    // isn't relevant here since that's a full remount, but active toggling re-attaches).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streamRef.current, active]);

  // ── Strike / grace-period logic ──────────────────────────────────────────────
  useEffect(() => {
    if (!active) {
      clearStrikeTimer();
      clearGraceTimer();
      setStrikes(0);
      setGraceSecondsLeft(null);
      terminatedRef.current = false;
      return;
    }

    if (cameraLive) {
      // Camera is back — cancel everything and reset.
      clearStrikeTimer();
      clearGraceTimer();
      setStrikes(0);
      setGraceSecondsLeft(null);
      return;
    }

    // Camera is off while active — start the 30s strike ticker if not already running.
    if (strikeTimerRef.current || graceTimerRef.current) return;

    strikeTimerRef.current = setInterval(() => {
      setStrikes((prev) => {
        const next = prev + 1;
        console.warn(LOG, `strike ${next}/${MAX_STRIKES}`);
        if (next >= MAX_STRIKES) {
          clearStrikeTimer();
          notifyRef.current(
            "We still can't detect your camera — the interview will end shortly unless it's turned back on.",
            'error',
          );
          // Start the final grace countdown.
          let secondsLeft = Math.round(GRACE_PERIOD_MS / 1000);
          setGraceSecondsLeft(secondsLeft);
          graceTimerRef.current = setInterval(() => {
            secondsLeft -= 1;
            setGraceSecondsLeft(secondsLeft);
            if (secondsLeft <= 0) {
              clearGraceTimer();
              if (!terminatedRef.current) {
                terminatedRef.current = true;
                console.error(LOG, 'grace period expired — ending interview');
                notifyRef.current('Interview ended — camera access was not restored in time.', 'error');
                try { onTerminateRef.current?.(); } catch {}
              }
            }
          }, 1000);
        } else {
          notifyRef.current(
            `Your camera appears to be off (${next}/${MAX_STRIKES}) — please turn it back on to continue.`,
            'warning',
          );
        }
        return next;
      });
    }, STRIKE_INTERVAL_MS);

    return () => { /* cleanup handled by clearStrikeTimer/clearGraceTimer above on next run */ };
  }, [active, cameraLive, clearStrikeTimer, clearGraceTimer]);

  useEffect(() => () => { clearStrikeTimer(); clearGraceTimer(); }, [clearStrikeTimer, clearGraceTimer]);

  return { cameraLive, strikes, graceSecondsLeft };
};
