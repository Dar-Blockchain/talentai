import React from 'react';
import { Sparkles, Timer, ArrowRight, Bot } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { type InterviewMessage } from '../../types/interview';
import { type AgentState } from '../../types/interview';

interface QuestionPanelProps {
  currentMessage: InterviewMessage;
  isInReadingTime: boolean;
  readingTimeLeft: number;
  questionHighlight: boolean;
  questionNumber?: number;
  questionAnswerElapsed?: number;
  questionAnswerRemaining?: number;
  agentState?: AgentState;
}

const QuestionPanel: React.FC<QuestionPanelProps> = ({
  currentMessage,
  isInReadingTime,
  readingTimeLeft,
  questionHighlight,
  questionNumber,
  questionAnswerElapsed = 0,
  questionAnswerRemaining = 0,
  agentState,
}) => {
  const { t } = useTranslation('interview');
  const isGreeting    = currentMessage.type === 'greeting';
  const secondsLeft   = Math.ceil(readingTimeLeft / 1000);
  const progressPct   = Math.max(0, Math.min(100, (readingTimeLeft / 10000) * 100));
  const remainingSec  = Math.ceil(questionAnswerRemaining / 1000);
  const answerPct     = Math.max(0, Math.min(100, (questionAnswerElapsed / 180000) * 100));
  const isAnswering   = !isInReadingTime && questionAnswerElapsed > 0;
  const isNearLimit   = remainingSec <= 30 && isAnswering;
  const isCritical    = remainingSec <= 10 && isAnswering;
  const isLoadingNext = agentState === 'thinking' && !isInReadingTime;

  const fmtSec = (s: number) => {
    const m   = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  const state = isCritical ? 'critical' : isNearLimit ? 'warning' : isInReadingTime ? 'reading' : 'normal';

  const colors = {
    critical: { accent: '#dc2626', bg: 'rgba(220,38,38,0.06)', border: 'rgba(220,38,38,0.2)',  badge: 'rgba(220,38,38,0.08)',  text: '#dc2626', bar: 'linear-gradient(90deg,#fca5a5,#dc2626)' },
    warning:  { accent: '#f97316', bg: 'rgba(249,115,22,0.05)', border: 'rgba(249,115,22,0.2)',  badge: 'rgba(249,115,22,0.08)',  text: '#f97316', bar: 'linear-gradient(90deg,#fdba74,#f97316)' },
    reading:  { accent: '#f59e0b', bg: 'rgba(245,158,11,0.04)', border: 'rgba(245,158,11,0.22)', badge: 'rgba(245,158,11,0.08)',  text: '#d97706', bar: 'linear-gradient(90deg,#fde68a,#f59e0b)' },
    normal:   { accent: '#6AD39C', bg: '#ffffff',               border: 'rgba(106,211,156,0.22)', badge: 'rgba(106,211,156,0.1)', text: '#10453F', bar: 'linear-gradient(90deg,#6AD39C,#10453F)' },
  }[state];

  const labelText = isGreeting
    ? t('question.label_greeting', 'AI Interviewer')
    : questionNumber
      ? t('question.label_numbered', { number: questionNumber })
      : t('question.label');

  return (
    <div
      className="relative overflow-hidden rounded-[18px] border mb-3 transition-all duration-300"
      style={{
        background:  colors.bg,
        borderColor: colors.border,
        boxShadow:   questionHighlight
          ? `0 8px 32px rgba(106,211,156,0.15), 0 0 0 1px ${colors.border}`
          : `0 2px 12px rgba(16,69,63,0.06)`,
        transform:   questionHighlight ? 'translateY(-1px)' : 'none',
        animation:   isCritical ? 'iv-critical-pulse 1.1s ease-in-out infinite' : undefined,
      }}
    >
      <div className="px-5 pt-4 pb-4">

        {/* Top row: label badge + timer */}
        <div className="flex items-center justify-between mb-3">

          {/* Label badge */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{ background: colors.badge, border: `1px solid ${colors.border}` }}
          >
            <div
              className="flex items-center justify-center rounded-full"
              style={{ width: 16, height: 16, background: colors.accent }}
            >
              {isGreeting
                ? <Bot size={9} color="#fff" />
                : <Sparkles size={9} color="#fff" />}
            </div>
            <span
              className="font-sans font-bold text-[0.62rem] tracking-widest uppercase"
              style={{ color: colors.text }}
            >
              {labelText}
            </span>
            {isGreeting && (
              <span className="font-sans text-[0.6rem] text-[#94a3b8]">· Olga</span>
            )}
          </div>

          {/* Reading time badge */}
          {isInReadingTime && (
            <div
              className="flex items-center gap-1 px-2 py-1 rounded-full"
              style={{ background: colors.badge, border: `1px solid ${colors.border}` }}
            >
              <span className="font-sans text-[0.5rem] font-semibold text-[#d97706] uppercase tracking-wide">Read in</span>
              <span className="font-sans font-extrabold text-[0.95rem] leading-none text-[#d97706]">{secondsLeft}</span>
              <span className="font-sans text-[0.5rem] text-[#d97706] opacity-70">s</span>
            </div>
          )}
        </div>

        {/* Question text */}
        <p
          className="font-[Inter,sans-serif] text-[1.05rem] md:text-[1.1rem] font-semibold leading-[1.8] text-[#0f172a] tracking-[-0.01em] wrap-break-word transition-opacity duration-300"
          style={{ opacity: isLoadingNext ? 0.25 : 1 }}
        >
          {currentMessage.content || t('question.getting_next')}
        </p>

        {!isGreeting && currentMessage.reasoning && !isLoadingNext && (
          <p className="font-[Inter,sans-serif] text-[0.7rem] text-[#94a3b8] italic mt-2.5 pl-3 border-l-2 border-[rgba(106,211,156,0.3)] leading-relaxed">
            {currentMessage.reasoning}
          </p>
        )}

        {/* Countdown bar */}
        {!isGreeting && isAnswering && !isLoadingNext && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Timer size={11} style={{ color: colors.text, animation: isCritical ? 'iv-timer-pulse 0.8s ease-in-out infinite' : undefined }} />
                <span className="font-sans font-medium text-[0.6rem] uppercase tracking-[0.06em]" style={{ color: colors.text }}>
                  {isCritical ? 'Time almost up!' : isNearLimit ? 'Wrap up soon' : 'Time remaining'}
                </span>
              </div>
              <span className="font-sans font-extrabold text-[0.88rem] tabular-nums" style={{ color: colors.text }}>
                {fmtSec(remainingSec)}
              </span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.05)' }}>
              <div
                className="h-full rounded-full transition-[width] duration-500 ease-linear"
                style={{ width: `${100 - answerPct}%`, background: colors.bar }}
              />
            </div>
          </div>
        )}

        {/* Reading time progress bar */}
        {isInReadingTime && (
          <div className="mt-4">
            <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.05)' }}>
              <div
                className="h-full rounded-full transition-[width] duration-100 ease-linear"
                style={{ width: `${progressPct}%`, background: colors.bar }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Loading overlay */}
      {isLoadingNext && (
        <div
          className="absolute inset-0 flex items-center justify-center rounded-[18px] bg-white/90 backdrop-blur-xs"
          style={{ animation: 'iv-fade-in 0.25s ease' }}
        >
          <div
            className="flex items-center gap-3 px-5 py-2.5 rounded-[12px] border"
            style={{ background: '#fff', borderColor: 'rgba(106,211,156,0.3)', boxShadow: '0 4px 20px rgba(106,211,156,0.1)' }}
          >
            <div className="flex gap-1 items-end" style={{ height: 14 }}>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 rounded-full bg-[#6AD39C]"
                  style={{ height: '100%', animation: `iv-bounce-dot 1.2s ease-in-out ${i * 0.2}s infinite` }}
                />
              ))}
            </div>
            <span className="font-sans font-semibold text-[0.78rem] text-[#10453F]">Preparing next question</span>
            <ArrowRight size={13} color="#6AD39C" />
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionPanel;
