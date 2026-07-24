import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface FaceAlertOverlayProps {
  /** True while the camera is on but no face is currently visible. */
  active: boolean;
  /** Called once if the countdown reaches zero while still active — ends the interview. */
  onComplete: () => void;
}

const WARN_SECONDS = 30;      // attempts 1–2
const FINAL_SECONDS = 10;     // attempt 3 and beyond — last chance is shorter
const FINAL_ATTEMPT = 3;

/**
 * Full-screen blocking alert shown during an active interview whenever the
 * camera is on but no face is currently visible. Covers the whole interview
 * screen — the candidate can't interact with anything underneath until their
 * face is visible again (mic/submit are also paused elsewhere via the same
 * gate that drives `active` here).
 *
 * Self-contained attempt/countdown logic (no separate hook):
 *   - Occurrences 1–3 each get a countdown (30s for the first two, 10s for
 *     the third). Face comes back before time's up → attempt "used",
 *     interview continues normally. Countdown reaches zero on any of these
 *     → interview completes immediately.
 *   - A 4th occurrence (face missing again after all 3 attempts were
 *     successfully used) ends the interview immediately, with no countdown —
 *     there's no chance left to give.
 * The attempt count lives in a ref that persists across active/inactive
 * toggles for as long as this component stays mounted (i.e. for the whole
 * interview), so it keeps counting across repeated occurrences.
 */
const FaceAlertOverlay: React.FC<FaceAlertOverlayProps> = ({ active, onComplete }) => {
  const { t } = useTranslation('interview');

  const attemptsUsedRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Separate from timerRef: React clears the interval via this effect's own
  // cleanup *before* the next run's `!active` branch executes, so by then
  // timerRef.current would already be null and we could never tell whether
  // a countdown had actually been running. This flag isn't touched by that
  // cleanup, so it reliably answers "was a countdown in progress?".
  const countingRef = useRef(false);
  const completedRef = useRef(false);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [attemptNumber, setAttemptNumber] = useState(1);

  // `onComplete` (the parent's endInterview) gets a new identity on nearly
  // every parent render — pinning it in a ref keeps the interval effect
  // below keyed only on `active`, so it doesn't get torn down and restarted
  // (which would reset the countdown) every time the parent re-renders.
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  const clearTimer = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  useEffect(() => {
    if (completedRef.current) return;

    if (!active) {
      // Face is back (or interview no longer active). If a countdown had
      // genuinely been running, this occurrence was resolved in time —
      // consume an attempt and keep going (even on the 3rd one).
      if (countingRef.current) {
        clearTimer();
        countingRef.current = false;
        attemptsUsedRef.current += 1;
      }
      setSecondsLeft(null);
      return;
    }

    if (countingRef.current) return; // already counting for this occurrence

    // A 4th occurrence — all 3 attempts already used and resolved — gets no
    // countdown at all. There's no chance left to give; end right away.
    if (attemptsUsedRef.current >= FINAL_ATTEMPT) {
      if (!completedRef.current) {
        completedRef.current = true;
        onCompleteRef.current();
      }
      return;
    }

    countingRef.current = true;

    const currentAttempt = attemptsUsedRef.current + 1;
    let left = currentAttempt >= FINAL_ATTEMPT ? FINAL_SECONDS : WARN_SECONDS;
    setAttemptNumber(currentAttempt);
    setSecondsLeft(left);

    timerRef.current = setInterval(() => {
      left -= 1;
      setSecondsLeft(left);
      if (left <= 0) {
        clearTimer();
        countingRef.current = false;
        if (!completedRef.current) {
          completedRef.current = true;
          onCompleteRef.current();
        }
      }
    }, 1000);
  }, [active]);

  useEffect(() => () => clearTimer(), []);

  if (!active || secondsLeft === null) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(9,25,24,0.82)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="w-full max-w-[380px] rounded-2xl bg-white p-6 flex flex-col items-center text-center gap-4"
        style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.35)' }}
      >
        <div className="w-14 h-14 rounded-full bg-[rgba(245,158,11,0.12)] flex items-center justify-center">
          <AlertTriangle size={26} color="#d97706" />
        </div>
        <div>
          <p className="font-sans font-bold text-base text-[#111827] mb-1">
            {t('camera.face_alert_title', { defaultValue: "We can't see your face" })}
          </p>
          <p className="font-sans text-[0.8rem] text-[#6b7280] leading-relaxed">
            {t('camera.face_alert_body', { defaultValue: 'Please face the camera and make sure your face is clearly visible to continue the interview.' })}
          </p>
        </div>

        <span className="font-sans text-[0.68rem] font-bold uppercase tracking-wide text-[#9ca3af]">
          {t('camera.face_alert_attempt', {
            attempt: attemptNumber,
            max: FINAL_ATTEMPT,
            defaultValue: `Attempt ${attemptNumber} of ${FINAL_ATTEMPT}`,
          })}
        </span>

        <div
          className="w-full rounded-xl px-4 py-2.5 flex items-center justify-center gap-2"
          style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}
        >
          <span className="font-sans text-[0.75rem] font-semibold text-[#d97706]">
            {t('camera.face_alert_countdown', { seconds: secondsLeft, defaultValue: `Interview ends in ${secondsLeft}s` })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FaceAlertOverlay;
