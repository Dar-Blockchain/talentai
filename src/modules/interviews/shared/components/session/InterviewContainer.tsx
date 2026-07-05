import React, { useState, useMemo } from 'react';
import { Play, Mic, RefreshCw, Video, ArrowLeft, CheckCircle, Circle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { type InterviewStatus, type ConnectionStatus, type CameraStatus, type AgentState } from '../../types/interview';

interface InterviewContainerProps {
  interviewStatus: InterviewStatus;
  isHydrated: boolean;
  connectionStatus: ConnectionStatus;
  cameraStatus: CameraStatus;
  agentState: AgentState;
  currentTranscript?: string;
  resultsReady: boolean;
  noBorder?: boolean;
  onStartInterview: () => void;
  onBack?: () => void;
  /** Overrides the default "Back to post details" label (e.g. "Back to campaign" for campaign interviews). */
  backLabel?: string;
  jobTitle?: string;
  companyName?: string;
  dashboardPath?: string;
  reportPath?: string;
}

const InterviewContainer: React.FC<InterviewContainerProps> = ({
  interviewStatus,
  isHydrated,
  connectionStatus,
  cameraStatus,
  agentState,
  currentTranscript,
  resultsReady,
  noBorder = false,
  onStartInterview,
  onBack,
  backLabel,
  jobTitle,
  companyName,
  dashboardPath: _dashboardPath,
  reportPath: _reportPath,
}) => {
  const { t } = useTranslation('interview');
  const [waitDots] = useState('');

  const allReady = isHydrated && connectionStatus === 'connected' && cameraStatus === 'granted';

  const checks = useMemo(() => [
    { label: t('container.check_camera'),  ok: cameraStatus === 'granted' },
    { label: t('container.check_system'),  ok: connectionStatus === 'connected' },
    { label: t('container.check_loaded'),  ok: isHydrated },
  ], [cameraStatus, connectionStatus, isHydrated, t]);

  return (
    <div
      className="overflow-hidden flex flex-col"
      style={{
        background:   noBorder ? 'transparent' : '#fff',
        borderRadius: noBorder ? 0 : '16px',
        border:       noBorder ? 'none' : '1px solid rgba(106,211,156,0.18)',
        boxShadow:    noBorder ? 'none' : '0 2px 16px rgba(16,69,63,0.06)',
        height:       noBorder ? 'auto' : '100%',
      }}
    >
      {interviewStatus === 'active' && <AgentHeader agentState={agentState} />}

      <div
        className="flex-1 flex flex-col p-4 md:p-5"
        style={{ justifyContent: interviewStatus === 'active' ? 'flex-start' : 'center' }}
      >
        {interviewStatus === 'idle' && (
          <ReadinessChecklist
            checks={checks}
            allReady={allReady}
            cameraStatus={cameraStatus}
            onStartInterview={onStartInterview}
            onBack={onBack}
            backLabel={backLabel}
            jobTitle={jobTitle}
            companyName={companyName}
          />
        )}

        {interviewStatus === 'connecting' && (
          <div className="flex flex-col items-center text-center py-4 gap-0">
            <img
              src="/gif/loading.gif"
              alt="Connecting…"
              className="w-24 h-24 object-contain mb-4"
              draggable={false}
            />
            <p className="font-sans font-bold text-base text-[#0d1117] tracking-tight mb-1">
              {t('container.starting_title')}
            </p>
            <p className="font-sans text-[0.74rem] text-[#6b7280] leading-relaxed max-w-[210px]">
              {t('container.starting_subtitle')}
            </p>
          </div>
        )}

        {interviewStatus === 'active' && agentState !== 'thinking' && agentState !== 'processing' && (
          <LiveTranscript currentTranscript={currentTranscript} />
        )}
        {interviewStatus === 'ended' && !resultsReady && (
          <AnalyzingSpinner waitDots={waitDots} />
        )}
      </div>
    </div>
  );
};

export default InterviewContainer;

// ─── Sub-components ─────────────────────────────────────────────────────────

const AgentHeader: React.FC<{ agentState: AgentState }> = ({ agentState }) => {
  const { t } = useTranslation('interview');
  const isProcessing = agentState === 'thinking' || agentState === 'processing';
  const isFinishing  = agentState === 'finishing';

  const bgColor = isFinishing
    ? 'linear-gradient(90deg, rgba(99,102,241,0.07) 0%, rgba(139,92,246,0.04) 100%)'
    : isProcessing
    ? 'linear-gradient(90deg, rgba(251,191,36,0.07) 0%, rgba(245,158,11,0.04) 100%)'
    : 'linear-gradient(90deg, rgba(106,211,156,0.07) 0%, rgba(16,69,63,0.04) 100%)';
  const borderColor = isFinishing ? 'rgba(99,102,241,0.2)' : isProcessing ? 'rgba(245,158,11,0.18)' : 'rgba(106,211,156,0.18)';
  const dotColor    = isFinishing ? '#818cf8' : isProcessing ? '#f59e0b' : '#22c55e';
  const iconColor   = isFinishing ? '#818cf8' : '#f59e0b';

  const title    = isFinishing  ? 'Interview complete'
                 : agentState === 'thinking'   ? t('container.thinking')
                 : agentState === 'processing' ? t('container.processing')
                 : t('container.recording');
  const subtitle = isFinishing  ? 'Preparing your results…'
                 : isProcessing ? t('container.wait')
                 : t('container.listening');

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 border-b" style={{ background: bgColor, borderColor }}>
      <div
        className="w-2 h-2 rounded-full shrink-0"
        style={{ background: dotColor, animation: 'iv-status-pulse 1.8s ease-in-out infinite' }}
      />
      <div className="flex-1 min-w-0">
        <p className="font-sans font-bold text-[0.8rem] text-[#111827] leading-tight">{title}</p>
        <p className="font-sans text-[0.63rem] text-[#9ca3af] mt-0.5">{subtitle}</p>
      </div>
      {(isProcessing || isFinishing)
        ? <RefreshCw size={15} color={iconColor} className="shrink-0 animate-spin" />
        : <Mic size={15} color="#6AD39C" className="shrink-0" />
      }
    </div>
  );
};

const ReadinessChecklist: React.FC<{
  checks: { label: string; ok: boolean }[];
  allReady: boolean;
  cameraStatus: CameraStatus;
  onStartInterview: () => void;
  onBack?: () => void;
  backLabel?: string;
  jobTitle?: string;
  companyName?: string;
}> = ({ checks, allReady, cameraStatus, onStartInterview, onBack, backLabel, jobTitle, companyName }) => {
  const { t } = useTranslation('interview');

  return (
    <div className="flex flex-col h-full gap-0">
      {(jobTitle || companyName) && (
        <div className="mb-4 pb-4 border-b border-[#f0f1f3]">
          <p className="font-sans font-bold text-[0.95rem] text-[#111827] mb-0.5 leading-snug">{jobTitle}</p>
          {companyName && <p className="font-sans text-[0.72rem] text-[#9ca3af]">{companyName} · AI Interview</p>}
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 mb-5">
        {checks.map(({ label, ok }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-1 py-3 px-1 rounded-[12px] text-center border"
            style={{ background: ok ? 'rgba(34,197,94,0.05)' : '#f9fafb', borderColor: ok ? 'rgba(34,197,94,0.18)' : '#f0f1f3' }}
          >
            {ok ? <CheckCircle size={20} color="#22c55e" /> : <Circle size={20} color="#d1d5db" />}
            <span className="font-sans text-[0.6rem] font-semibold leading-tight" style={{ color: ok ? '#374151' : '#b0b7c3' }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      <p className="font-sans font-bold text-base text-[#111827] mb-1">{t('container.ready_title')}</p>
      <p className="font-sans text-[0.75rem] text-[#6b7280] leading-relaxed mb-2">{t('container.ready_subtitle')}</p>
      <p className="font-sans text-[0.7rem] text-[#b0b7c3] leading-relaxed mb-5">{t('container.ready_description')}</p>

      <div className="mt-auto flex flex-col gap-2">
        {cameraStatus !== 'granted' && cameraStatus !== 'requesting' && (
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-[10px] bg-[rgba(245,158,11,0.05)] border border-[rgba(245,158,11,0.18)]">
            <Video size={14} color="#f59e0b" className="shrink-0" />
            <p className="font-sans text-[0.72rem] text-[#d97706]">{t('container.camera_warning')}</p>
          </div>
        )}

        <button
          onClick={onStartInterview}
          disabled={!allReady}
          className="w-full flex items-center justify-center gap-2 font-sans font-bold text-[0.88rem] py-3 rounded-[14px] transition-all cursor-pointer disabled:cursor-not-allowed"
          style={{
            background: allReady ? 'linear-gradient(135deg, #6AD39C 0%, #10b981 100%)' : '#f3f4f6',
            color:      allReady ? '#fff' : '#9ca3af',
            boxShadow:  allReady ? '0 4px 16px rgba(106,211,156,0.35)' : 'none',
          }}
        >
          <Play size={16} />
          {t('start.btn_start')}
        </button>

        {onBack && (
          <button
            onClick={onBack}
            className="w-full flex items-center justify-center gap-1.5 font-sans font-semibold text-[0.78rem] text-[#9ca3af] py-2 rounded-[12px] hover:text-[#6b7280] hover:bg-[#f9fafb] transition-colors cursor-pointer"
          >
            <ArrowLeft size={15} />
            {backLabel ?? t('container.back_to_post')}
          </button>
        )}
      </div>
    </div>
  );
};

const LiveTranscript: React.FC<{ currentTranscript?: string }> = ({ currentTranscript }) => {
  const { t } = useTranslation('interview');

  return (
    <div className="py-2">
      <div
        id="transcript-scroll"
        className="max-h-[140px] overflow-y-auto mb-2 pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[rgba(106,211,156,0.2)] [&::-webkit-scrollbar-thumb]:rounded-full"
        ref={(el: HTMLDivElement | null) => { if (el) el.scrollTop = el.scrollHeight; }}
      >
        <p
          className="font-sans text-[0.78rem] leading-relaxed min-h-[60px]"
          style={{ color: currentTranscript ? '#374151' : '#9ca3af', fontStyle: currentTranscript ? 'normal' : 'italic' }}
        >
          {currentTranscript || t('container.speech_placeholder')}
        </p>
      </div>
    </div>
  );
};

const AnalyzingSpinner: React.FC<{ waitDots: string }> = ({ waitDots }) => {
  const { t } = useTranslation('interview');

  return (
    <div className="flex flex-col items-center text-center py-4 gap-0">
      <img
        src="/gif/loading.gif"
        alt="Analyzing…"
        className="w-24 h-24 object-contain mb-4"
        draggable={false}
      />

      <p className="font-sans font-bold text-base text-[#0d1117] tracking-tight mb-1">
        {t('container.analyzing_title')}{waitDots}
      </p>
      <p className="font-sans text-[0.74rem] text-[#6b7280] leading-relaxed max-w-[210px] mb-5">
        {t('container.analyzing_subtitle')}
      </p>

      <div className="w-full flex flex-col gap-2">
        {[
          { label: 'Reviewing your answers', delay: '0s' },
          { label: 'Scoring each response',  delay: '0.3s' },
          { label: 'Building your report',   delay: '0.6s' },
        ].map(({ label, delay }) => (
          <div key={label} className="flex items-center gap-3 px-3 py-2 rounded-[10px] bg-[#f9fafb] border border-[#f0f1f3]">
            <div
              className="w-1.5 h-1.5 rounded-full bg-[#6AD39C] shrink-0"
              style={{ animation: `iv-step-dot 1.4s ease-in-out ${delay} infinite` }}
            />
            <p className="font-sans text-[0.7rem] text-[#4b5563] leading-none">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

