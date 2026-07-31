import React, { useState } from 'react';
import { Send, Activity, SkipForward, MicOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { type InterviewStatus, type AgentState } from '../../types/interview';

interface AgentStatusPanelProps {
  interviewStatus: InterviewStatus;
  agentState: AgentState;
  isVoiceActive?: boolean;
  currentTranscript?: string;
  canSubmit?: boolean;
  /** False when the camera doesn't currently have a live feed. */
  cameraLive?: boolean;
  /** True when a ready answer is being held because the camera is off. */
  cameraBlockedSubmit?: boolean;
  isInReadingTime?: boolean;
  readingTimeLeft?: number;
  onSubmitAnswer: () => void;
  onSkipQuestion: () => void;
}

const AgentStatusPanel: React.FC<AgentStatusPanelProps> = ({
  interviewStatus,
  agentState,
  isVoiceActive,
  canSubmit = false,
  cameraLive = true,
  cameraBlockedSubmit = false,
  isInReadingTime = false,
  readingTimeLeft = 0,
  onSubmitAnswer,
  onSkipQuestion,
}) => {
  const { t } = useTranslation('interview');
  const [skipHovered,   setSkipHovered]   = useState(false);
  const [submitHovered, setSubmitHovered] = useState(false);

  if (interviewStatus !== 'active') return null;

  const secondsLeft  = Math.ceil(readingTimeLeft / 1000);
  const progressPct  = Math.max(0, Math.min(100, (readingTimeLeft / 10000) * 100));
  const isProcessing = agentState === 'thinking' || agentState === 'processing' || agentState === 'finishing';
  // When AI is processing, ignore voice activity — button must stay frozen until question arrives
  const isSpeaking      = !isProcessing && !!isVoiceActive;
  const blockedByCamera = !isProcessing && (!cameraLive || cameraBlockedSubmit);
  const isDisabled      = isProcessing || isSpeaking || !canSubmit || blockedByCamera;

  const submitBg = isProcessing
    ? '#f3f4f6'
    : isDisabled
      ? isSpeaking
        ? 'linear-gradient(135deg, rgba(106,211,156,0.1), rgba(34,197,94,0.07))'
        : '#f3f4f6'
      : 'linear-gradient(135deg, #6AD39C 0%, #10b981 100%)';
  const submitColor  = isProcessing ? '#9ca3af' : isDisabled ? (isSpeaking ? '#10453F' : '#9ca3af') : '#fff';
  const submitShadow = isProcessing ? 'none' : isDisabled
    ? isSpeaking ? '0 0 0 1.5px rgba(106,211,156,0.3)' : 'none'
    : '0 4px 16px rgba(106,211,156,0.32)';

  return (
    <div className="p-2 md:p-2.5 flex flex-col gap-1.5">

      {/* Reading-time card */}
      {isInReadingTime ? (
        <div className="rounded-[14px] border border-[rgba(245,158,11,0.18)] bg-[rgba(255,251,235,0.8)] overflow-hidden p-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-[9px] bg-[rgba(245,158,11,0.12)] flex items-center justify-center shrink-0">
                <MicOff size={15} color="#d97706" />
              </div>
              <div>
                <p className="font-sans font-bold text-[0.72rem] text-[#92400e] leading-tight">Reading time</p>
                <p className="font-sans text-[0.6rem] text-[#b45309] opacity-80 leading-snug">Mic opens automatically</p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-baseline gap-0.5 justify-end">
                <span className="font-sans font-extrabold text-[2rem] leading-none text-[#d97706]">{secondsLeft}</span>
                <span className="font-sans font-semibold text-[0.7rem] text-[#d97706] opacity-65 mb-0.5">s</span>
              </div>
            </div>
          </div>
          <div className="h-1 rounded-full bg-[rgba(245,158,11,0.15)] overflow-hidden">
            <div
              className="h-full rounded-full transition-[width] duration-100 ease-linear"
              style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg, #fde68a, #f59e0b)' }}
            />
          </div>
        </div>
      ) : (
        /* Submit button */
        <button
          onClick={onSubmitAnswer}
          disabled={isDisabled}
          onMouseEnter={() => setSubmitHovered(true)}
          onMouseLeave={() => setSubmitHovered(false)}
          className="w-full flex items-center justify-center gap-2 font-sans font-bold text-[0.8rem] py-2.5 rounded-[12px] transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
          style={{
            background: submitBg,
            color:      submitColor,
            boxShadow:  !isDisabled && submitHovered
              ? '0 6px 20px rgba(106,211,156,0.5)'
              : submitShadow,
            transform:  !isDisabled && submitHovered ? 'translateY(-1px)' : 'none',
            filter:     !isDisabled && submitHovered ? 'brightness(1.08)' : 'none',
          }}
        >
          {!isProcessing && isSpeaking && (
            <Activity
              size={17}
              color="#22c55e"
              style={{ animation: 'iv-mic-pulse 0.5s ease-in-out infinite alternate' }}
            />
          )}
          {!isDisabled && !isSpeaking && <Send size={14} />}
          {isProcessing
            ? t('agent.processing')
            : blockedByCamera
            ? t('agent.camera_required', { defaultValue: 'Turn on your camera to submit' })
            : (isSpeaking || !canSubmit)
            ? t('agent.listening')
            : t('agent.submit')}
        </button>
      )}

      {/* Skip button */}
      <button
        onClick={onSkipQuestion}
        disabled={isProcessing || isInReadingTime}
        onMouseEnter={() => setSkipHovered(true)}
        onMouseLeave={() => setSkipHovered(false)}
        className="w-full flex items-center justify-center gap-2 font-sans font-semibold text-[0.78rem] py-2.5 rounded-md border transition-all duration-150 cursor-pointer disabled:cursor-not-allowed active:scale-[0.97]"
        style={{
          color:       (isProcessing || isInReadingTime) ? '#d1d5db'
                     : skipHovered                       ? '#10453F'
                     :                                     '#4b5563',
          borderColor: (isProcessing || isInReadingTime) ? 'rgba(209,213,219,0.3)'
                     : skipHovered                       ? 'rgba(106,211,156,0.7)'
                     :                                     'rgba(156,163,175,0.6)',
          background:  (isProcessing || isInReadingTime) ? 'rgba(243,244,246,0.4)'
                     : skipHovered                       ? 'rgba(106,211,156,0.08)'
                     :                                     'rgba(248,249,250,0.8)',
          boxShadow:   (!isProcessing && !isInReadingTime)
                     ? skipHovered
                       ? '0 2px 10px rgba(106,211,156,0.2)'
                       : '0 1px 3px rgba(0,0,0,0.04)'
                     : 'none',
          transform:   (!isProcessing && !isInReadingTime && skipHovered) ? 'translateY(-1px)' : 'none',
        }}
      >
        <SkipForward
          size={14}
          style={{ transform: skipHovered && !(isProcessing || isInReadingTime) ? 'translateX(2px)' : 'translateX(0)', transition: 'transform 0.15s' }}
        />
        {t('agent.skip_question', { defaultValue: 'Skip question' })}
      </button>
    </div>
  );
};

export default AgentStatusPanel;
