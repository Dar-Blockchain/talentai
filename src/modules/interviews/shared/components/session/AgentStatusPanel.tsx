import React from 'react';
import { Send, Activity, SkipForward, MicOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { type InterviewStatus, type AgentState } from '../../types/interview';

interface AgentStatusPanelProps {
  interviewStatus: InterviewStatus;
  agentState: AgentState;
  isVoiceActive?: boolean;
  currentTranscript?: string;
  canSubmit?: boolean;
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
  isInReadingTime = false,
  readingTimeLeft = 0,
  onSubmitAnswer,
  onSkipQuestion,
}) => {
  const { t } = useTranslation('interview');
  if (interviewStatus !== 'active') return null;

  const secondsLeft  = Math.ceil(readingTimeLeft / 1000);
  const progressPct  = Math.max(0, Math.min(100, (readingTimeLeft / 10000) * 100));
  const isProcessing = agentState === 'thinking' || agentState === 'processing' || agentState === 'finishing';
  // When AI is processing, ignore voice activity — button must stay frozen until question arrives
  const isSpeaking   = !isProcessing && !!isVoiceActive;
  const isDisabled   = isProcessing || isSpeaking || !canSubmit;

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
          className="w-full flex items-center justify-center gap-2 font-sans font-bold text-[0.8rem] py-2.5 rounded-[12px] transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
          style={{ background: submitBg, color: submitColor, boxShadow: submitShadow }}
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
            : (isSpeaking || !canSubmit)
            ? t('agent.listening')
            : t('agent.submit')}
        </button>
      )}

      {/* Skip button */}
      <button
        onClick={onSkipQuestion}
        disabled={isProcessing || isInReadingTime}
        className="w-full flex items-center justify-center gap-1.5 font-sans font-semibold text-[0.72rem] py-1.5 rounded-[10px] border transition-colors cursor-pointer disabled:cursor-not-allowed"
        style={{
          color:       (isProcessing || isInReadingTime) ? '#d1d5db' : '#9ca3af',
          borderColor: (isProcessing || isInReadingTime) ? 'rgba(209,213,219,0.4)' : 'rgba(209,213,219,0.7)',
          background:  'transparent',
        }}
      >
        <SkipForward size={15} />
        {t('agent.skip_question', { defaultValue: 'Skip question' })}
      </button>
    </div>
  );
};

export default AgentStatusPanel;
