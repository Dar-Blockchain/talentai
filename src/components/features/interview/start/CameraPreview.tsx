import { useEffect, useRef, useState } from 'react';
import { Box, Typography, CircularProgress, Button } from '@mui/material';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import { CameraStatus, InterviewStatus } from '@/types/interview';

const BAR_COUNT = 28;

interface CameraPreviewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  cameraStatus: CameraStatus;
  cameraError: string | null;
  isConnecting: boolean;
  interviewStatus: InterviewStatus;
  audioContextRef?: React.MutableRefObject<AudioContext | null>;
  attachStream?: () => void;
}

const CameraPreview: React.FC<CameraPreviewProps> = ({
  videoRef,
  cameraStatus,
  cameraError,
  isConnecting,
  interviewStatus,
  audioContextRef,
  attachStream,
}) => {
  const isActive = interviewStatus === 'active';

  useEffect(() => {
    attachStream?.();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [bars, setBars] = useState<number[]>(Array(BAR_COUNT).fill(3));
  const animFrameRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    if (!audioContextRef?.current || !isActive || analyserRef.current) return;
    const ctx = audioContextRef.current;
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 64;
    analyserRef.current = analyser;
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      ctx.createMediaStreamSource(stream).connect(analyser);
    }).catch(() => {});
    return () => { analyserRef.current = null; };
  }, [audioContextRef, isActive]);

  useEffect(() => {
    if (!isActive) { setBars(Array(BAR_COUNT).fill(3)); return; }
    let frame = 0;
    const tick = () => {
      if (analyserRef.current) {
        const data = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(data);
        const binSize = Math.max(1, Math.floor(data.length / BAR_COUNT));
        setBars(Array.from({ length: BAR_COUNT }, (_, i) => {
          const slice = data.slice(i * binSize, (i + 1) * binSize);
          const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
          return Math.max(3, Math.round((avg / 255) * 40));
        }));
      } else {
        frame++;
        const t = frame / 10;
        setBars(Array.from({ length: BAR_COUNT }, (_, i) => {
          const h = 3 + Math.abs(Math.sin(t + i * 0.4) * 18 + Math.sin(t * 1.4 + i * 0.9) * 10);
          return Math.round(h);
        }));
      }
      animFrameRef.current = requestAnimationFrame(tick);
    };
    animFrameRef.current = requestAnimationFrame(tick);
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, [isActive]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 0 }}>

      {/* ── Video area ── */}
      <Box sx={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16/9',
        bgcolor: '#1a1040',
        borderRadius: '14px',
        overflow: 'hidden',
        flexShrink: 0,
        border: '1px solid #e8e2f5',
      }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            position: 'absolute', top: 0, left: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            transform: 'scaleX(-1)',
            display: cameraStatus === 'granted' ? 'block' : 'none',
          }}
        />

        {/* No-camera placeholder */}
        {cameraStatus !== 'granted' && (
          <Box sx={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 2,
            background: 'linear-gradient(135deg,#1a1040,#2d1b69)',
          }}>
            {cameraStatus === 'requesting' ? (
              <>
                <CircularProgress size={32} sx={{ color: '#8310FF' }} />
                <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontFamily: 'Poppins' }}>
                  Requesting camera access…
                </Typography>
              </>
            ) : (
              <>
                <Box sx={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.07)',
                  border: '1.5px solid rgba(255,255,255,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <VideocamOffIcon sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 28 }} />
                </Box>
                <Typography sx={{
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: '0.82rem',
                  fontFamily: 'Poppins',
                  textAlign: 'center',
                  px: 3,
                }}>
                  {cameraStatus === 'denied' ? 'Camera access denied' : cameraError || 'Camera unavailable'}
                </Typography>
                {(cameraStatus === 'denied' || cameraStatus === 'error') && (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => window.location.reload()}
                    sx={{
                      fontFamily: 'Poppins', fontSize: '0.75rem', textTransform: 'none',
                      color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                      '&:hover': { borderColor: '#8310FF', color: '#c084fc' },
                    }}
                  >
                    Retry
                  </Button>
                )}
              </>
            )}
          </Box>
        )}

        {/* Connecting badge */}
        {isConnecting && cameraStatus === 'granted' && (
          <Box sx={{
            position: 'absolute', top: 12, right: 12,
            display: 'flex', alignItems: 'center', gap: 0.75,
            bgcolor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)',
            px: 1.5, py: 0.5, borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.12)',
          }}>
            <CircularProgress size={11} sx={{ color: '#8310FF' }} />
            <Typography sx={{ fontSize: '0.68rem', fontFamily: 'Poppins', color: '#fff', fontWeight: 700 }}>
              Connecting…
            </Typography>
          </Box>
        )}

        {/* REC badge */}
        {isActive && cameraStatus === 'granted' && (
          <Box sx={{
            position: 'absolute', top: 12, left: 12,
            display: 'flex', alignItems: 'center', gap: 0.6,
            bgcolor: 'rgba(239,68,68,0.85)', backdropFilter: 'blur(4px)',
            px: 1.25, py: 0.4, borderRadius: '6px',
          }}>
            <Box sx={{
              width: 6, height: 6, borderRadius: '50%', bgcolor: '#fff',
              animation: 'recPulse 1.2s infinite',
              '@keyframes recPulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.25 } },
            }} />
            <Typography sx={{ color: '#fff', fontSize: '0.65rem', fontWeight: 800, fontFamily: 'Poppins', letterSpacing: '0.1em' }}>
              REC
            </Typography>
          </Box>
        )}
      </Box>

      {/* ── Waveform bar ── */}
      <Box sx={{ mt: 2.5, px: 0.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {/* Mic label row */}
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={0.75}>
            <Box sx={{
              width: 26, height: 26, borderRadius: '7px',
              bgcolor: '#f3f4f6',
              border: '1px solid #e5e7eb',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {isActive
                ? <MicIcon sx={{ fontSize: 14, color: '#374151' }} />
                : <MicOffIcon sx={{ fontSize: 14, color: '#9ca3af' }} />
              }
            </Box>
            <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.75rem', color: '#374151' }}>
              Microphone
            </Typography>
          </Box>
          <Box sx={{
            px: 1, py: 0.3, borderRadius: '20px',
            bgcolor: isActive ? 'rgba(34,197,94,0.08)' : '#f3f4f6',
            border: `1px solid ${isActive ? 'rgba(34,197,94,0.2)' : '#e5e7eb'}`,
          }}>
            <Typography sx={{
              fontFamily: 'Poppins', fontSize: '0.62rem', fontWeight: 700,
              color: isActive ? '#16a34a' : '#9ca3af',
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>
              {isActive ? 'Active' : 'Inactive'}
            </Typography>
          </Box>
        </Box>

        {/* Waveform */}
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: '2px',
          height: 40, borderRadius: '10px', px: 1.5,
          bgcolor: '#f9fafb',
          border: '1px solid #e5e7eb',
        }}>
          {bars.map((h, i) => (
            <Box key={i} sx={{
              flex: 1,
              height: `${h}px`,
              borderRadius: '3px',
              background: isActive ? '#374151' : '#d1d5db',
              transition: 'height 0.05s ease',
              minWidth: 0,
            }} />
          ))}
        </Box>

        <Typography sx={{
          fontFamily: 'Poppins', fontSize: '0.7rem',
          color: '#9ca3af',
          textAlign: 'center', lineHeight: 1.4,
        }}>
          {isActive
            ? 'Speak clearly — your voice is being captured'
            : cameraStatus === 'granted'
            ? 'Start the interview to enable recording'
            : 'Allow camera & microphone access to begin'}
        </Typography>
      </Box>
    </Box>
  );
};

export default CameraPreview;
