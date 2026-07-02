import { useEffect, useRef, useCallback } from 'react';

// MediaPipe assets pulled from public CDNs (self-contained, no build step required).
const MEDIAPIPE_WASM_URL =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.20/wasm';
const FACE_LANDMARKER_MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

type Notify = (msg: string, type?: 'info' | 'warning' | 'error' | 'success') => void;

export interface UseIdentityGuardOptions {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  active: boolean;
  onTerminate?: () => void;
  showNotification: Notify;
}

/**
 * Continuous local identity guard for interview sessions.
 * Runs MediaPipe FaceLandmarker in the browser at ~1 fps and reacts to:
 *   - no face for >3 s   -> soft warning ("please stay in view")
 *   - >1 face for >2 s   -> hard warning ("only the candidate should be visible")
 *   - >1 face for >5 s   -> onTerminate() (ends the interview)
 * Warnings are throttled by a 15 s cooldown so we don't spam toasts.
 * All detection is local — no frames are uploaded.
 */
export const useIdentityGuard = ({
  videoRef,
  active,
  onTerminate,
  showNotification,
}: UseIdentityGuardOptions): void => {
  const rafRef = useRef<number | null>(null);
  const landmarkerRef = useRef<any>(null);
  const lastCheckRef = useRef(0);
  const noFaceTicksRef = useRef(0);
  const multiFaceTicksRef = useRef(0);
  const lastWarnRef = useRef({ noFace: 0, multiFace: 0 });
  const terminatedRef = useRef(false);
  const disposedRef = useRef(false);

  const CHECK_INTERVAL_MS = 1000;
  const NO_FACE_WARN_TICKS = 3;
  const MULTI_FACE_WARN_TICKS = 2;
  const MULTI_FACE_TERMINATE_TICKS = 5;
  const WARN_COOLDOWN_MS = 15_000;

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    try { landmarkerRef.current?.close(); } catch {}
    landmarkerRef.current = null;
    disposedRef.current = true;
  }, []);

  useEffect(() => {
    if (!active) return;
    disposedRef.current = false;
    terminatedRef.current = false;
    noFaceTicksRef.current = 0;
    multiFaceTicksRef.current = 0;
    let cancelled = false;

    const handleFaceCount = (count: number) => {
      const now = Date.now();
      if (count === 0) {
        noFaceTicksRef.current += 1;
        multiFaceTicksRef.current = 0;
        if (
          noFaceTicksRef.current >= NO_FACE_WARN_TICKS &&
          now - lastWarnRef.current.noFace > WARN_COOLDOWN_MS
        ) {
          lastWarnRef.current.noFace = now;
          showNotification('Please stay in view of the camera.', 'warning');
        }
      } else if (count > 1) {
        multiFaceTicksRef.current += 1;
        noFaceTicksRef.current = 0;
        if (multiFaceTicksRef.current >= MULTI_FACE_TERMINATE_TICKS && !terminatedRef.current) {
          terminatedRef.current = true;
          showNotification('Another person was detected in view — ending the interview.', 'error');
          try { onTerminate?.(); } catch {}
          return;
        }
        if (
          multiFaceTicksRef.current >= MULTI_FACE_WARN_TICKS &&
          now - lastWarnRef.current.multiFace > WARN_COOLDOWN_MS
        ) {
          lastWarnRef.current.multiFace = now;
          showNotification('Only the interview candidate should be visible in the camera.', 'warning');
        }
      } else {
        noFaceTicksRef.current = 0;
        multiFaceTicksRef.current = 0;
      }
    };

    (async () => {
      try {
        const vision: any = await import('@mediapipe/tasks-vision');
        if (cancelled) return;
        const fileset = await vision.FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_URL);
        if (cancelled) return;
        const landmarker = await vision.FaceLandmarker.createFromOptions(fileset, {
          baseOptions: {
            modelAssetPath: FACE_LANDMARKER_MODEL_URL,
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numFaces: 3,
        });
        if (cancelled) { try { landmarker.close(); } catch {} return; }
        landmarkerRef.current = landmarker;

        const tick = () => {
          if (disposedRef.current || terminatedRef.current) return;
          const now = performance.now();
          if (now - lastCheckRef.current >= CHECK_INTERVAL_MS) {
            lastCheckRef.current = now;
            const video = videoRef.current;
            if (video && video.readyState >= 2 && video.videoWidth > 0) {
              try {
                const result = landmarker.detectForVideo(video, now);
                const faceCount = result?.faceLandmarks?.length || 0;
                handleFaceCount(faceCount);
              } catch {
                // Frame or GL context transient failure — silently skip this tick.
              }
            }
          }
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      } catch (err) {
        // MediaPipe failed to load (network / WASM unsupported). Fail open — don't break the interview.
        console.warn('[identity-guard] failed to initialise, continuing without face check', err);
      }
    })();

    return () => {
      cancelled = true;
      stop();
    };
  }, [active, videoRef, onTerminate, showNotification, stop]);
};
