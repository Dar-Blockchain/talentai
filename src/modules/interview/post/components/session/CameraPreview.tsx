import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, CircularProgress, Button } from '@mui/material';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import { useTranslation } from 'react-i18next';
import { type CameraStatus, type InterviewStatus } from '../../types/interview';

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
  const { t } = useTranslation('interview');
  const isActive = interviewStatus === 'active';

  useEffect(() => { attachStream?.(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [bars, setBars] = useState<number[]>(Array(BAR_COUNT).fill(3));
  const animFrameRef = useRef<number | null>(null);
  const analyserRef  = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    if (!audioContextRef?.current || !isActive || analyserRef.current) return;
    const ctx      = audioContextRef.current;
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 64;
    analyserRef.current = analyser;
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => { ctx.createMediaStreamSource(stream).connect(analyser); })
      .catch(() => {});
    return () => { analyserRef.current = null; };
  }, [audioContextRef, isActive]);

  useEffect(() => {
    if (!isActive) { setBars(Array(BAR_COUNT).fill(3)); return; }
    let frame = 0;
    const tick = () => {
      if (analyserRef.current) {
        const data    = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(data);
        const binSize = Math.max(1, Math.floor(data.length / BAR_COUNT));
        setBars(Array.from({ length: BAR_COUNT }, (_, i) => {
          const slice = data.slice(i * binSize, (i + 1) * binSize);
          const avg   = slice.reduce((a, b) => a + b, 0) / slice.length;
          return Math.max(3, Math.round((avg / 255) * 40));
        }));
      } else {
        frame++;
        const time = frame / 10;
        setBars(Array.from({ length: BAR_COUNT }, (_, i) => {
          const h = 3 + Math.abs(Math.sin(time + i * 0.4) * 18 + Math.sin(time * 1.4 + i * 0.9) * 10);
          return Math.round(h);
        }));
      }
      animFrameRef.current = requestAnimationFrame(tick);
    };
    animFrameRef.current = requestAnimationFrame(tick);
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, [isActive]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0, height: '100%' }}>

      {/* ── Video frame ─────────────────────────────────────────────────────── */}
      <Box sx={{
        position: 'relative', width: '100%', flex: 1, minHeight: 0,
        bgcolor: '#091918', borderRadius: '16px', overflow: 'hidden',
        border: '1.5px solid rgba(106,211,156,0.45)',
        boxShadow: '0 0 0 3px rgba(106,211,156,0.08), 0 8px 32px rgba(0,0,0,0.18)',
      }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', display: cameraStatus === 'granted' ? 'block' : 'none' }}
        />

        {/* ── Empty / error state ──────────────────────────────────────────── */}
        {cameraStatus !== 'granted' && (
          <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1.75, background: 'radial-gradient(ellipse at 50% 40%, #0f2e28 0%, #091918 100%)' }}>
            {cameraStatus === 'requesting' ? (
              <>
                <CircularProgress size={30} thickness={3} sx={{ color: '#6AD39C', opacity: 0.85 }} />
                <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem', fontFamily: 'Poppins', letterSpacing: '0.02em' }}>{t('camera.requesting')}</Typography>
              </>
            ) : (
              <>
                <Box sx={{ width: 52, height: 52, borderRadius: '14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <VideocamOffIcon sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 22 }} />
                </Box>
                <Typography sx={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem', fontFamily: 'Poppins', textAlign: 'center', px: 4, lineHeight: 1.6 }}>
                  {cameraStatus === 'denied' ? t('camera.denied') : cameraError || t('camera.unavailable')}
                </Typography>
                {(cameraStatus === 'denied' || cameraStatus === 'error') && (
                  <Button size="small" variant="outlined" onClick={() => window.location.reload()} sx={{ fontFamily: 'Poppins', fontSize: '0.7rem', textTransform: 'none', color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.12)', borderRadius: '8px', px: 2, '&:hover': { borderColor: '#6AD39C', color: '#6AD39C', bgcolor: 'rgba(106,211,156,0.05)' } }}>
                    {t('camera.retry')}
                  </Button>
                )}
              </>
            )}
          </Box>
        )}

        {/* ── Overlays — always shown when camera is granted ────────────────── */}
        {cameraStatus === 'granted' && (<>

          {/* Corner brackets — same in both states */}
          {([
            ['top',    'left',  '3px 0 0 0'],
            ['top',    'right', '0 3px 0 0'],
            ['bottom', 'left',  '0 0 0 3px'],
            ['bottom', 'right', '0 0 3px 0'],
          ] as const).map(([v, h, br]) => (
            <Box key={`${v}${h}`} sx={{
              position: 'absolute', [v]: 12, [h]: 12, width: 16, height: 16,
              borderTop:    v === 'top'    ? '1.5px solid rgba(106,211,156,0.6)' : 'none',
              borderBottom: v === 'bottom' ? '1.5px solid rgba(106,211,156,0.6)' : 'none',
              borderLeft:   h === 'left'   ? '1.5px solid rgba(106,211,156,0.6)' : 'none',
              borderRight:  h === 'right'  ? '1.5px solid rgba(106,211,156,0.6)' : 'none',
              borderRadius: br,
            }} />
          ))}

          {/* Top-left badge: REC when active, PREVIEW when lobby */}
          {!isConnecting && (
            isActive ? (
              <Box sx={{ position: 'absolute', top: 10, left: 10, display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: 'rgba(0,0,0,0.52)', backdropFilter: 'blur(12px)', px: 0.875, py: 0.375, borderRadius: '6px', border: '1px solid rgba(255,255,255,0.07)' }}>
                <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: '#ef4444', flexShrink: 0, animation: 'recBlink 1.4s ease-in-out infinite', '@keyframes recBlink': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.15 } } }} />
                <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.54rem', color: 'rgba(255,255,255,0.8)', letterSpacing: '0.12em' }}>REC</Typography>
              </Box>
            ) : (
              <Box sx={{ position: 'absolute', top: 10, left: 10, display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: 'rgba(0,0,0,0.52)', backdropFilter: 'blur(12px)', px: 0.875, py: 0.375, borderRadius: '6px', border: '1px solid rgba(255,255,255,0.07)' }}>
                <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: '#6AD39C', flexShrink: 0 }} />
                <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.54rem', color: 'rgba(255,255,255,0.8)', letterSpacing: '0.12em' }}>PREVIEW</Typography>
              </Box>
            )
          )}

          {/* Top-right badge: connecting spinner > waveform when active > mic-off when lobby */}
          {isConnecting ? (
            <Box sx={{ position: 'absolute', top: 10, right: 10, display: 'flex', alignItems: 'center', gap: 0.75, bgcolor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(16px)', px: 1.25, py: 0.625, borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <CircularProgress size={9} sx={{ color: '#6AD39C' }} />
              <Typography sx={{ fontSize: '0.6rem', fontFamily: 'Poppins', color: 'rgba(255,255,255,0.75)', fontWeight: 600, letterSpacing: '0.06em' }}>{t('camera.connecting')}</Typography>
            </Box>
          ) : isActive ? (
            /* ── Active: glowing pill with live waveform ─────────────────── */
            <Box sx={{
              position: 'absolute', top: 10, right: 10,
              display: 'flex', alignItems: 'center', gap: 0.875,
              bgcolor: 'rgba(10,40,35,0.78)', backdropFilter: 'blur(16px)',
              px: 1.125, py: 0.625, borderRadius: '20px',
              border: '1px solid rgba(106,211,156,0.4)',
              boxShadow: '0 0 14px rgba(106,211,156,0.22), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}>
              {/* Pulsing ring dot */}
              <Box sx={{ position: 'relative', width: 8, height: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box sx={{ position: 'absolute', width: 8, height: 8, borderRadius: '50%', bgcolor: 'rgba(106,211,156,0.25)', animation: 'micRing 1.4s ease-out infinite', '@keyframes micRing': { '0%': { transform: 'scale(1)', opacity: 0.8 }, '100%': { transform: 'scale(2.4)', opacity: 0 } } }} />
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#6AD39C', flexShrink: 0 }} />
              </Box>
              {/* Gradient bars */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '1.5px', height: 18, width: 44 }}>
                {bars.map((h, i) => (
                  <Box key={i} sx={{
                    flex: 1, minWidth: 0,
                    height: `${Math.min(h * 0.45, 18)}px`,
                    borderRadius: '2px',
                    background: `linear-gradient(to top, #10b981, #6AD39C)`,
                    opacity: 0.85 + (Math.min(h * 0.45, 18) / 18) * 0.15,
                    transition: 'height 0.07s ease',
                  }} />
                ))}
              </Box>
            </Box>
          ) : (
            /* ── Lobby: muted pill ────────────────────────────────────────── */
            <Box sx={{
              position: 'absolute', top: 10, right: 10,
              display: 'flex', alignItems: 'center', gap: 0.75,
              bgcolor: 'rgba(0,0,0,0.48)', backdropFilter: 'blur(12px)',
              px: 1.125, py: 0.625, borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.07)',
            }}>
              <MicOffIcon sx={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
              <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: '1.5px', height: 14, width: 36 }}>
                {[3, 5, 4, 6, 4, 5, 3, 5, 6, 4, 5, 3].map((h, i) => (
                  <Box key={i} sx={{ flex: 1, minWidth: 0, height: `${h}px`, borderRadius: '1.5px', background: 'rgba(255,255,255,0.12)' }} />
                ))}
              </Box>
            </Box>
          )}
        </>)}
      </Box>
    </Box>
  );
};

export default CameraPreview;
