import { useEffect, useRef, useState } from 'react';
import { Box, Typography, CircularProgress, Button } from '@mui/material';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import { CameraStatus, InterviewStatus } from '@/types/interview';

const BAR_COUNT = 24;

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

  // Re-attach stream once on mount (e.g. after the overview step transition)
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
    if (!isActive) {
      setBars(Array(BAR_COUNT).fill(3));
      return;
    }
    let frame = 0;
    const tick = () => {
      if (analyserRef.current) {
        const data = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(data);
        const binSize = Math.max(1, Math.floor(data.length / BAR_COUNT));
        setBars(Array.from({ length: BAR_COUNT }, (_, i) => {
          const slice = data.slice(i * binSize, (i + 1) * binSize);
          const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
          return Math.max(3, Math.round((avg / 255) * 36));
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
    <Box
      sx={{
        borderRadius: '16px',
        overflow: 'hidden',
        bgcolor: 'transparent',
        border: '1px solid #ede9f8',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* ── Header stripe ── */}
      <Box
        sx={{
          bgcolor: '#8310FF',
          px: 2.5,
          py: 1.75,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: isActive ? '#4ade80' : 'rgba(255,255,255,0.4)',
              boxShadow: isActive ? '0 0 0 3px rgba(74,222,128,0.3)' : 'none',
            }}
          />
          <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>
            {isActive ? 'Live Camera' : 'Camera Preview'}
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            bgcolor: 'rgba(255,255,255,0.18)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '20px',
            px: 1.25,
            py: 0.4,
          }}
        >
          {isActive
            ? <MicIcon sx={{ fontSize: 12, color: '#fff' }} />
            : <MicOffIcon sx={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }} />
          }
          <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.68rem', fontWeight: 600, color: isActive ? '#fff' : 'rgba(255,255,255,0.6)' }}>
            {isActive ? 'Mic On' : 'Mic Off'}
          </Typography>
        </Box>
      </Box>

      {/* ── Video area ── */}
      <Box sx={{ position: 'relative', width: '100%', aspectRatio: '21/9', bgcolor: '#1a1a2e', flexShrink: 0, overflow: 'hidden' }}>
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
          <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1.5, bgcolor: '#F9FAFB' }}>
            {cameraStatus === 'requesting' ? (
              <>
                <CircularProgress size={32} sx={{ color: '#374151' }} />
                <Typography sx={{ color: '#6B7280', fontSize: '0.8rem', fontFamily: 'Poppins' }}>
                  Requesting camera access…
                </Typography>
              </>
            ) : (
              <>
                <Box sx={{ width: 60, height: 60, borderRadius: '50%', bgcolor: '#F3F4F6', border: '2px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <VideocamOffIcon sx={{ color: '#9CA3AF', fontSize: 28 }} />
                </Box>
                <Typography sx={{ color: '#6B7280', fontSize: '0.82rem', fontFamily: 'Poppins', fontWeight: 500, textAlign: 'center', px: 3 }}>
                  {cameraStatus === 'denied' ? 'Camera access denied' : cameraError || 'Camera unavailable'}
                </Typography>
                {(cameraStatus === 'denied' || cameraStatus === 'error') && (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => window.location.reload()}
                    sx={{ fontFamily: 'Poppins', fontSize: '0.75rem', textTransform: 'none', color: '#374151', borderColor: '#E5E7EB', borderRadius: '8px' }}
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
          <Box sx={{ position: 'absolute', top: 10, right: 10, display: 'flex', alignItems: 'center', gap: 0.75, bgcolor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', px: 1.5, py: 0.5, borderRadius: '8px', border: '1px solid #E5E7EB' }}>
            <CircularProgress size={11} sx={{ color: '#374151' }} />
            <Typography sx={{ fontSize: '0.68rem', fontFamily: 'Poppins', color: '#374151', fontWeight: 700 }}>Connecting…</Typography>
          </Box>
        )}

        {/* REC badge */}
        {isActive && cameraStatus === 'granted' && (
          <Box sx={{ position: 'absolute', top: 10, left: 10, display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: 'rgba(239,68,68,0.88)', px: 1.25, py: 0.4, borderRadius: '6px' }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#fff', animation: 'recPulse 1.2s infinite', '@keyframes recPulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.3 } } }} />
            <Typography sx={{ color: '#fff', fontSize: '0.66rem', fontWeight: 800, fontFamily: 'Poppins', letterSpacing: '0.08em' }}>REC</Typography>
          </Box>
        )}
      </Box>

      {/* ── Mic / waveform section ── */}
      <Box sx={{ px: 2, pt: 1.5, pb: 2, flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={0.75}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: '8px',
                bgcolor: isActive ? '#F3F4F6' : 'rgba(156,163,175,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isActive
                ? <MicIcon sx={{ fontSize: 15, color: '#374151' }} />
                : <MicOffIcon sx={{ fontSize: 15, color: '#9ca3af' }} />
              }
            </Box>
            <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.78rem', color: '#374151' }}>
              Microphone
            </Typography>
          </Box>
          <Box
            sx={{
              px: 1,
              py: 0.3,
              borderRadius: '20px',
              bgcolor: isActive ? 'rgba(34,197,94,0.1)' : 'rgba(156,163,175,0.1)',
              border: `1px solid ${isActive ? 'rgba(34,197,94,0.25)' : 'rgba(156,163,175,0.2)'}`,
            }}
          >
            <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.65rem', fontWeight: 700, color: isActive ? '#16a34a' : '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {isActive ? 'Active' : 'Inactive'}
            </Typography>
          </Box>
        </Box>

        {/* Waveform bars */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '2.5px',
            height: 36,
            borderRadius: '10px',
            px: 1.5,
            bgcolor: '#F9FAFB',
            border: '1px solid #F3F4F6',
            transition: 'all 0.3s ease',
          }}
        >
          {bars.map((h, i) => (
            <Box
              key={i}
              sx={{
                flex: 1,
                height: `${h}px`,
                borderRadius: '3px',
                bgcolor: isActive ? '#374151' : 'rgba(209,213,219,0.6)',
                transition: 'height 0.05s ease',
                minWidth: 0,
              }}
            />
          ))}
        </Box>

        <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.72rem', color: '#9ca3af', textAlign: 'center', lineHeight: 1.4 }}>
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
