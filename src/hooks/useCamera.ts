import { useState, useRef, useEffect, useCallback } from 'react';
import { CameraStatus } from '@/types/interview';

export interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement>;
  cameraStatus: CameraStatus;
  cameraError: string;
  streamRef: React.MutableRefObject<MediaStream | null>;
  attachStream: () => void;
  consentGiven: boolean;
  giveConsent: () => void;
}

export interface UseCameraOptions {
  showNotification: (message: string, severity: 'warning' | 'error') => void;
}

export const useCamera = ({ showNotification }: UseCameraOptions): UseCameraReturn => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>('idle');
  const [cameraError, setCameraError] = useState<string>('');
  const [consentGiven, setConsentGiven] = useState(false);

  const giveConsent = useCallback(() => {
    setConsentGiven(true);
  }, []);

  useEffect(() => {
    if (!consentGiven) return;

    const initializeCamera = async () => {
      try {
        setCameraStatus('requesting');
        setCameraError('');

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false
        });

        streamRef.current = stream;
        setCameraStatus('granted');

        if (videoRef.current) {
          const video = videoRef.current;
          video.srcObject = stream;
          video.muted = true;
          video.play().catch(() => {
            video.onloadedmetadata = () => { video.play().catch(() => {}); };
          });
        }

        console.log('✅ Camera initialized successfully');
      } catch (error) {
        console.error('❌ Camera initialization error:', error);

        if (error instanceof DOMException) {
          if (error.name === 'NotAllowedError') {
            setCameraStatus('denied');
            setCameraError('Camera access was denied');
            showNotification('Please allow camera access to use this feature', 'warning');
          } else if (error.name === 'NotFoundError') {
            setCameraStatus('error');
            setCameraError('No camera found');
            showNotification('No camera device found', 'error');
          } else {
            setCameraStatus('error');
            setCameraError(error.message);
            showNotification('Camera access error: ' + error.message, 'error');
          }
        } else {
          setCameraStatus('error');
          setCameraError('An unknown error occurred');
          showNotification('Camera access error', 'error');
        }
      }
    };

    initializeCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [consentGiven]);

  const attachStream = useCallback(() => {
    if (!streamRef.current || !videoRef.current) return;
    const video = videoRef.current;
    // Don't re-attach if already playing the same stream
    if (video.srcObject === streamRef.current) return;
    video.srcObject = streamRef.current;
    video.muted = true;
    video.play().catch(() => {
      video.onloadedmetadata = () => { video.play().catch(() => {}); };
    });
  }, []);

  return {
    videoRef,
    cameraStatus,
    cameraError,
    streamRef,
    attachStream,
    consentGiven,
    giveConsent,
  };
};
