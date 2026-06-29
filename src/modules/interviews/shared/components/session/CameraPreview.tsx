import React, { useEffect, useRef, useState } from 'react';
import { VideoOff, MicOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { type CameraStatus, type InterviewStatus } from '../../types/interview';

const BAR_COUNT = 5;
const BAR_MAX = 22;
const SPEAK_THRESHOLD = 7;

interface CameraPreviewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  cameraStatus: CameraStatus;
  cameraError: string | null;
  isConnecting: boolean;
  interviewStatus: InterviewStatus;
  audioContextRef?: React.MutableRefObject<AudioContext | null>;
  audioStreamRef?: React.MutableRefObject<MediaStream | null>;
  attachStream?: () => void;
}

const CameraPreview: React.FC<CameraPreviewProps> = ({
  videoRef,
  cameraStatus,
  cameraError,
  isConnecting,
  interviewStatus,
  audioContextRef,
  audioStreamRef,
  attachStream,
}) => {
  const { t } = useTranslation('interview');
  const isActive = interviewStatus === 'active';

  useEffect(() => {
    attachStream?.();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [bars, setBars] = useState<number[]>(Array(BAR_COUNT).fill(3));
  const animFrameRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const avgHeight = bars.reduce((a, b) => a + b, 0) / BAR_COUNT;
  const isSpeaking = isActive && avgHeight > SPEAK_THRESHOLD;

  useEffect(() => {
    if (!audioContextRef?.current || !isActive || analyserRef.current) return;
    const ctx = audioContextRef.current;
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 64;
    analyserRef.current = analyser;
    const stream = audioStreamRef?.current;
    if (stream) {
      ctx.createMediaStreamSource(stream).connect(analyser);
    }
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
        setBars(
          Array.from({ length: BAR_COUNT }, (_, i) => {
            const slice = data.slice(i * binSize, (i + 1) * binSize);
            const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
            return Math.max(3, Math.round((avg / 255) * BAR_MAX));
          }),
        );
      } else {
        frame++;
        const time = frame / 12;
        setBars(
          Array.from({ length: BAR_COUNT }, (_, i) => {
            const h = 3 + Math.abs(Math.sin(time + i * 0.85) * 10 + Math.sin(time * 1.6 + i * 0.55) * 6);
            return Math.round(h);
          }),
        );
      }
      animFrameRef.current = requestAnimationFrame(tick);
    };
    animFrameRef.current = requestAnimationFrame(tick);
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, [isActive]);

  return (
    <div className="flex flex-col gap-0 h-full">
      {/* Video frame */}
      <div
        className="relative w-full flex-1 min-h-0 bg-[#091918] rounded-[16px] overflow-hidden border-[1.5px] border-[rgba(106,211,156,0.45)] shadow-[0_0_0_3px_rgba(106,211,156,0.08),0_8px_32px_rgba(0,0,0,0.18)]"
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            objectFit: 'cover', transform: 'scaleX(-1)',
            display: cameraStatus === 'granted' ? 'block' : 'none',
          }}
        />

        {/* Empty / error state */}
        {cameraStatus !== 'granted' && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-4"
            style={{ background: 'radial-gradient(ellipse at 50% 40%, #0f2e28 0%, #091918 100%)' }}
          >
            {cameraStatus === 'requesting' ? (
              <>
                <div className="w-7 h-7 rounded-full border-2 border-[#6AD39C] border-t-transparent animate-spin opacity-85" />
                <p className="text-white/45 text-[0.75rem] font-sans tracking-[0.02em]">
                  {t('camera.requesting')}
                </p>
              </>
            ) : (
              <>
                <div className="w-[52px] h-[52px] rounded-[14px] bg-white/[0.04] border border-white/[0.09] flex items-center justify-center">
                  <VideoOff size={22} color="rgba(255,255,255,0.3)" />
                </div>
                <p className="text-white/35 text-[0.75rem] font-sans text-center px-8 leading-relaxed">
                  {cameraStatus === 'denied'
                    ? t('camera.denied')
                    : cameraError || t('camera.unavailable')}
                </p>
                {(cameraStatus === 'denied' || cameraStatus === 'error') && (
                  <button
                    onClick={() => window.location.reload()}
                    className="font-sans text-[0.7rem] text-white/50 border border-white/[0.12] rounded-[8px] px-4 py-1 hover:border-[#6AD39C] hover:text-[#6AD39C] hover:bg-[rgba(106,211,156,0.05)] transition-colors cursor-pointer"
                  >
                    {t('camera.retry')}
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* Overlays when camera is granted */}
        {cameraStatus === 'granted' && (
          <>
            {/* Corner brackets */}
            {(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const).map((pos) => {
              const [v, h] = pos.split('-') as ['top' | 'bottom', 'left' | 'right'];
              return (
                <div
                  key={pos}
                  className="absolute w-4 h-4"
                  style={{
                    [v]: 12, [h]: 12,
                    borderTop:    v === 'top'    ? '1.5px solid rgba(106,211,156,0.6)' : 'none',
                    borderBottom: v === 'bottom' ? '1.5px solid rgba(106,211,156,0.6)' : 'none',
                    borderLeft:   h === 'left'   ? '1.5px solid rgba(106,211,156,0.6)' : 'none',
                    borderRight:  h === 'right'  ? '1.5px solid rgba(106,211,156,0.6)' : 'none',
                    borderRadius: `${v === 'top' ? 3 : 0}px ${h === 'right' && v === 'top' ? 3 : 0}px ${v === 'bottom' ? 3 : 0}px ${h === 'left' && v === 'bottom' ? 3 : 0}px`,
                  }}
                />
              );
            })}

            {/* PREVIEW badge */}
            {!isConnecting && !isActive && (
              <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-black/52 backdrop-blur-[12px] px-2 py-1 rounded-[6px] border border-white/[0.07]">
                <div className="w-1 h-1 rounded-full bg-[#6AD39C] shrink-0" />
                <span className="font-sans font-bold text-[0.54rem] text-white/80 tracking-[0.12em]">PREVIEW</span>
              </div>
            )}

            {/* Top-right: connecting / signal bars / muted */}
            {isConnecting ? (
              <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 bg-black/60 backdrop-blur-[16px] px-3 py-1.5 rounded-[20px] border border-white/10">
                <div className="w-2 h-2 rounded-full border border-[#6AD39C] border-t-transparent animate-spin" />
                <span className="font-sans font-semibold text-[0.6rem] text-white/75 tracking-[0.06em]">
                  {t('camera.connecting')}
                </span>
              </div>
            ) : isActive ? (
              <div
                className="absolute top-2.5 right-2.5 flex items-center bg-[rgba(5,18,14,0.75)] backdrop-blur-[20px] px-2.5 py-1.5 rounded-[10px] border transition-[border-color,box-shadow] duration-200"
                style={{
                  borderColor: isSpeaking ? 'rgba(106,211,156,0.4)' : 'rgba(255,255,255,0.08)',
                  boxShadow: isSpeaking
                    ? '0 0 14px rgba(106,211,156,0.22), inset 0 1px 0 rgba(255,255,255,0.06)'
                    : 'inset 0 1px 0 rgba(255,255,255,0.04)',
                }}
              >
                <div className="flex items-end gap-[3px]" style={{ height: BAR_MAX }}>
                  {bars.map((h, i) => {
                    const barH = Math.min(h, BAR_MAX);
                    const pct = barH / BAR_MAX;
                    return (
                      <div
                        key={i}
                        className="w-1 rounded-[3px_3px_2px_2px] transition-[height,background] duration-[60ms,180ms]"
                        style={{
                          height: `${barH}px`,
                          background: isSpeaking
                            ? `linear-gradient(to top, #059669 0%, #10b981 50%, rgba(106,211,156,${0.7 + pct * 0.3}) 100%)`
                            : `rgba(255,255,255,${0.15 + pct * 0.25})`,
                          boxShadow: isSpeaking && pct > 0.55
                            ? `0 0 8px rgba(106,211,156,${(pct - 0.55) * 0.7})`
                            : 'none',
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="absolute top-2.5 right-2.5 flex items-center bg-black/48 backdrop-blur-[12px] p-1.5 rounded-[8px] border border-white/[0.07]">
                <MicOff size={12} color="rgba(255,255,255,0.28)" />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CameraPreview;
