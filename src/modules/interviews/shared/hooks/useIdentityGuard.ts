import { useEffect, useRef, useState, useCallback } from 'react';

// MediaPipe FaceLandmarker — used only for FACE COUNT (multi-face detection).
const MEDIAPIPE_WASM_URL =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.20/wasm';
const FACE_LANDMARKER_MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

// @vladmandic/face-api — used for IDENTITY (128-dim face descriptor + L2 compare).
const FACEAPI_MODEL_URL =
  'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.15/model';

const LOG = '[identity-guard]';

type Notify = (msg: string, type?: 'info' | 'warning' | 'error' | 'success') => void;

export type IdentityGuardStatus =
  | 'idle'
  | 'loading-wasm'
  | 'loading-model'
  | 'waiting-video'
  | 'watching'
  | 'terminated'
  | 'failed';

export interface UseIdentityGuardOptions {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  active: boolean;
  onTerminate?: () => void;
  showNotification: Notify;
}

export interface UseIdentityGuardReturn {
  status: IdentityGuardStatus;
  faceCount: number;
  lastError: string | null;
  /** True once a reference face descriptor has been captured for the candidate. */
  enrolled: boolean;
  /** Most recent L2 distance between live face and reference (null before first check). */
  identityDistance: number | null;
  /** Number of enrollment samples captured so far. */
  enrollmentProgress: number;
  /** Total enrollment samples required before the reference is locked. */
  enrollmentTarget: number;
}

/**
 * Local identity guard for interview sessions.
 *   - MediaPipe FaceLandmarker (~1 fps): fires no-face and multi-face warnings.
 *   - face-api.js FaceRecognitionNet (~1 check / 2.5 s): silently enrols the
 *     first stable single-face frame as the reference, then verifies each
 *     subsequent frame belongs to the same person (L2 < 0.6). Consistent
 *     mismatches warn, then terminate the interview.
 * All detection is local — no frames or biometrics leave the browser.
 */
export const useIdentityGuard = ({
  videoRef,
  active,
  onTerminate,
  showNotification,
}: UseIdentityGuardOptions): UseIdentityGuardReturn => {
  const rafRef = useRef<number | null>(null);
  const landmarkerRef = useRef<any>(null);
  const lastCheckRef = useRef(0);
  const noFaceTicksRef = useRef(0);
  const multiFaceTicksRef = useRef(0);
  const lastWarnRef = useRef({ noFace: 0, multiFace: 0, identity: 0 });
  const terminatedRef = useRef(false);
  const disposedRef = useRef(false);

  // Identity-check state
  const referenceDescriptorRef = useRef<Float32Array | null>(null);
  const enrollmentSamplesRef = useRef<Float32Array[]>([]);
  const identityMismatchTicksRef = useRef(0);
  const identityCheckInProgressRef = useRef(false);
  const lastIdentityCheckRef = useRef(0);
  const faceapiReadyRef = useRef(false);
  const faceapiRef = useRef<any>(null);

  // Callbacks change identity on every render of the parent — pin them in refs
  // so the init effect isn't torn down and rebuilt on every render.
  const onTerminateRef = useRef(onTerminate);
  const notifyRef = useRef(showNotification);
  useEffect(() => { onTerminateRef.current = onTerminate; }, [onTerminate]);
  useEffect(() => { notifyRef.current = showNotification; }, [showNotification]);

  const [status, setStatus] = useState<IdentityGuardStatus>('idle');
  const [faceCount, setFaceCount] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);
  const [enrolled, setEnrolled] = useState(false);
  const [identityDistance, setIdentityDistance] = useState<number | null>(null);
  const [enrollmentProgress, setEnrollmentProgress] = useState(0);

  const CHECK_INTERVAL_MS = 1000;
  const IDENTITY_CHECK_MS = 2500;
  const NO_FACE_WARN_TICKS = 3;
  const MULTI_FACE_WARN_TICKS = 2;
  const MULTI_FACE_TERMINATE_TICKS = 5;
  const IDENTITY_MISMATCH_THRESHOLD = 0.65;
  const IDENTITY_WARN_TICKS = 2;      // ~5 s of consistent mismatch
  const IDENTITY_TERMINATE_TICKS = 5; // ~12 s of consistent mismatch
  const ENROLLMENT_SAMPLES = 5;       // average N good frames before locking reference
  const ENROLLMENT_MIN_SCORE = 0.55;  // face-api detection confidence gate — matches real-world webcam scores; detector already filters at 0.5
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
    identityMismatchTicksRef.current = 0;
    referenceDescriptorRef.current = null;
    enrollmentSamplesRef.current = [];
    faceapiReadyRef.current = false;
    let cancelled = false;
    let waitingVideoLogged = false;

    console.info(LOG, 'active=true → initialising');

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
          console.warn(LOG, 'no-face warning fired');
          notifyRef.current('Please stay in view of the camera.', 'warning');
        }
      } else if (count > 1) {
        multiFaceTicksRef.current += 1;
        noFaceTicksRef.current = 0;
        console.info(LOG, `multi-face tick ${multiFaceTicksRef.current}/${MULTI_FACE_TERMINATE_TICKS}`);
        if (multiFaceTicksRef.current >= MULTI_FACE_TERMINATE_TICKS && !terminatedRef.current) {
          terminatedRef.current = true;
          setStatus('terminated');
          console.error(LOG, 'multi-face threshold reached → terminating');
          notifyRef.current('Another person was detected in view — ending the interview.', 'error');
          try { onTerminateRef.current?.(); } catch {}
          return;
        }
        if (
          multiFaceTicksRef.current >= MULTI_FACE_WARN_TICKS &&
          now - lastWarnRef.current.multiFace > WARN_COOLDOWN_MS
        ) {
          lastWarnRef.current.multiFace = now;
          console.warn(LOG, 'multi-face warning fired');
          notifyRef.current('Only the interview candidate should be visible in the camera.', 'warning');
        }
      } else {
        noFaceTicksRef.current = 0;
        multiFaceTicksRef.current = 0;
      }
    };

    const runIdentityCheck = async (video: HTMLVideoElement) => {
      if (!faceapiReadyRef.current || !faceapiRef.current) return;
      const faceapi = faceapiRef.current;
      try {
        const detection = await faceapi
          .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 }))
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (!detection?.descriptor) {
          // Silently skip — MediaPipe's count logic already handles no-face.
          return;
        }

        if (!referenceDescriptorRef.current) {
          // Enrolment: require high-confidence detection, then average N samples.
          const score = detection.detection?.score ?? 0;
          if (score < ENROLLMENT_MIN_SCORE) {
            console.info(LOG, `enrollment sample skipped (score ${score.toFixed(2)} < ${ENROLLMENT_MIN_SCORE})`);
            return;
          }

          enrollmentSamplesRef.current.push(detection.descriptor);
          setEnrollmentProgress(enrollmentSamplesRef.current.length);
          console.info(
            LOG,
            `enrollment sample ${enrollmentSamplesRef.current.length}/${ENROLLMENT_SAMPLES} (score ${score.toFixed(2)})`
          );

          if (enrollmentSamplesRef.current.length >= ENROLLMENT_SAMPLES) {
            const dim = enrollmentSamplesRef.current[0].length;
            const avg = new Float32Array(dim);
            for (const d of enrollmentSamplesRef.current) {
              for (let i = 0; i < dim; i++) avg[i] += d[i];
            }
            for (let i = 0; i < dim; i++) avg[i] /= enrollmentSamplesRef.current.length;
            referenceDescriptorRef.current = avg;
            enrollmentSamplesRef.current = [];
            setEnrolled(true);
            console.info(LOG, 'enrollment complete: reference locked (averaged)');
          }
          return;
        }

        const dist: number = faceapi.euclideanDistance(
          referenceDescriptorRef.current,
          detection.descriptor
        );
        setIdentityDistance(dist);
        console.info(LOG, `identity distance: ${dist.toFixed(3)}`);

        if (dist > IDENTITY_MISMATCH_THRESHOLD) {
          identityMismatchTicksRef.current += 1;
          console.warn(LOG, `identity mismatch tick ${identityMismatchTicksRef.current}/${IDENTITY_TERMINATE_TICKS}`);

          if (identityMismatchTicksRef.current >= IDENTITY_TERMINATE_TICKS && !terminatedRef.current) {
            terminatedRef.current = true;
            setStatus('terminated');
            console.error(LOG, 'identity mismatch confirmed → terminating');
            notifyRef.current('Different person detected — ending the interview.', 'error');
            try { onTerminateRef.current?.(); } catch {}
            return;
          }

          const now = Date.now();
          if (
            identityMismatchTicksRef.current >= IDENTITY_WARN_TICKS &&
            now - lastWarnRef.current.identity > WARN_COOLDOWN_MS
          ) {
            lastWarnRef.current.identity = now;
            notifyRef.current('Face check failed — please make sure only you are in front of the camera.', 'warning');
          }
        } else {
          identityMismatchTicksRef.current = 0;
        }
      } catch (err) {
        console.warn(LOG, 'identity check threw — skipping', err);
      }
    };

    (async () => {
      try {
        setStatus('loading-wasm');
        setLastError(null);
        console.info(LOG, 'importing @mediapipe/tasks-vision');
        const vision: any = await import('@mediapipe/tasks-vision');
        if (cancelled) return;
        console.info(LOG, 'resolving WASM fileset');
        const fileset = await vision.FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_URL);
        if (cancelled) return;

        // CPU delegate — widest browser compatibility.
        setStatus('loading-model');
        console.info(LOG, 'creating FaceLandmarker + loading face-api models (parallel)');

        const [landmarker] = await Promise.all([
          vision.FaceLandmarker.createFromOptions(fileset, {
            baseOptions: {
              modelAssetPath: FACE_LANDMARKER_MODEL_URL,
              delegate: 'CPU',
            },
            runningMode: 'VIDEO',
            numFaces: 3,
          }),
          (async () => {
            try {
              const faceapi: any = await import('@vladmandic/face-api');
              await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri(FACEAPI_MODEL_URL),
                faceapi.nets.faceLandmark68Net.loadFromUri(FACEAPI_MODEL_URL),
                faceapi.nets.faceRecognitionNet.loadFromUri(FACEAPI_MODEL_URL),
              ]);
              faceapiRef.current = faceapi;
              faceapiReadyRef.current = true;
              console.info(LOG, 'face-api models loaded');
            } catch (e) {
              // Identity check optional — keep count-based guard alive if this fails.
              console.warn(LOG, 'face-api failed to load — identity check disabled', e);
            }
          })(),
        ]);

        if (cancelled) { try { landmarker.close(); } catch {} return; }
        landmarkerRef.current = landmarker;
        setStatus('waiting-video');
        console.info(LOG, 'landmarker ready — waiting for video element');

        let lastLoggedFaceCount = -1;

        const tick = () => {
          if (disposedRef.current || terminatedRef.current) return;
          const now = performance.now();
          if (now - lastCheckRef.current >= CHECK_INTERVAL_MS) {
            lastCheckRef.current = now;
            const video = videoRef.current;
            if (!video || video.readyState < 2 || video.videoWidth === 0) {
              if (!waitingVideoLogged) {
                console.info(LOG, 'video not ready yet', {
                  hasEl: !!video,
                  readyState: video?.readyState,
                  videoWidth: video?.videoWidth,
                });
                waitingVideoLogged = true;
              }
            } else {
              waitingVideoLogged = false;
              setStatus(prev => (prev === 'watching' ? prev : 'watching'));
              try {
                const result = landmarker.detectForVideo(video, now);
                const count = result?.faceLandmarks?.length || 0;
                if (count !== lastLoggedFaceCount) {
                  console.info(LOG, `face count → ${count}`);
                  lastLoggedFaceCount = count;
                }
                setFaceCount(count);
                handleFaceCount(count);

                // Identity check runs when exactly one face is present and the
                // last check finished. Ambiguous frames (0 or >1) are skipped —
                // they're already handled by handleFaceCount.
                if (
                  count === 1 &&
                  faceapiReadyRef.current &&
                  !identityCheckInProgressRef.current &&
                  now - lastIdentityCheckRef.current >= IDENTITY_CHECK_MS
                ) {
                  identityCheckInProgressRef.current = true;
                  lastIdentityCheckRef.current = now;
                  runIdentityCheck(video).finally(() => {
                    identityCheckInProgressRef.current = false;
                  });
                }
              } catch (err) {
                console.warn(LOG, 'detectForVideo threw — skipping tick', err);
              }
            }
          }
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      } catch (err: any) {
        const msg = err?.message || String(err);
        setStatus('failed');
        setLastError(msg);
        console.error(LOG, 'INIT FAILED — face check disabled', err);
      }
    })();

    return () => {
      cancelled = true;
      stop();
      setStatus('idle');
      setFaceCount(0);
      setEnrolled(false);
      setIdentityDistance(null);
      setEnrollmentProgress(0);
      referenceDescriptorRef.current = null;
      enrollmentSamplesRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return {
    status,
    faceCount,
    lastError,
    enrolled,
    identityDistance,
    enrollmentProgress,
    enrollmentTarget: ENROLLMENT_SAMPLES,
  };
};
