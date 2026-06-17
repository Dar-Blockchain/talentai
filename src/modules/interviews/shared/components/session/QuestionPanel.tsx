import React from 'react';
import { Sparkles, Timer, ArrowRight } from 'lucide-react';
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
  const secondsLeft  = Math.ceil(readingTimeLeft / 1000);
  const progressPct  = Math.max(0, Math.min(100, (readingTimeLeft / 10000) * 100));

  const remainingSec = Math.ceil(questionAnswerRemaining / 1000);
  const answerPct    = Math.max(0, Math.min(100, (questionAnswerElapsed / 180000) * 100));
  const isAnswering  = !isInReadingTime && questionAnswerElapsed > 0;
  const isNearLimit  = remainingSec <= 30 && isAnswering;
  const isCritical   = remainingSec <= 10 && isAnswering;

  const isLoadingNext = agentState === 'thinking' && !isInReadingTime;

  const fmtSec = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  const timerColor  = isCritical ? '#dc2626' : isNearLimit ? '#f97316' : '#10453F';
  const timerBg     = isCritical ? 'rgba(220,38,38,0.08)' : isNearLimit ? 'rgba(249,115,22,0.08)' : 'rgba(16,69,63,0.05)';
  const timerBorder = isCritical ? 'rgba(220,38,38,0.35)' : isNearLimit ? 'rgba(249,115,22,0.35)' : 'rgba(106,211,156,0.35)';
  const accentColor = isCritical ? '#dc2626' : isNearLimit ? '#f97316' : '#6AD39C';

  const borderLeft = isInReadingTime ? '4px solid #f59e0b'
    : isLoadingNext ? '4px solid #6AD39C'
    : isNearLimit ? `4px solid ${accentColor}`
    : '4px solid #6AD39C';

  const boxShadow = isCritical
    ? '0 2px 20px rgba(220,38,38,0.12)'
    : isInReadingTime ? '0 2px 20px rgba(245,158,11,0.1)'
    : questionHighlight ? '0 6px 28px rgba(106,211,156,0.2)'
    : '0 2px 14px rgba(16,69,63,0.06)';

  return (
    <div
      className="relative overflow-hidden rounded-[18px] border border-[rgba(106,211,156,0.2)] px-4 md:px-5 py-4 md:py-4.5 mb-3 transition-[transform,box-shadow,border-color] duration-300"
      style={{
        background: questionHighlight ? 'linear-gradient(135deg, #f0fdf8 0%, #fff 100%)' : '#fff',
        borderLeft,
        boxShadow,
        transform: questionHighlight ? 'translateY(-2px)' : 'none',
        animation: isCritical ? 'iv-critical-pulse 1.1s ease-in-out infinite' : undefined,
      }}
    >
      {/* Label row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <div
            className="w-5 h-5 rounded-[6px] flex items-center justify-center shrink-0 transition-[background] duration-300"
            style={{ background: isInReadingTime ? 'linear-gradient(135deg,#fbbf24,#d97706)' : 'linear-gradient(135deg,#6AD39C,#10453F)' }}
          >
            <Sparkles size={11} color="#fff" />
          </div>
          <span
            className="font-sans font-bold text-[0.62rem] tracking-[0.14em] uppercase transition-colors duration-300"
            style={{ color: isInReadingTime ? '#d97706' : '#6AD39C' }}
          >
            {questionNumber ? t('question.label_numbered', { number: questionNumber }) : t('question.label')}
          </span>
        </div>

        {/* Timer badge */}
        {isInReadingTime ? (
          <div className="flex items-center gap-1 px-2 py-1 rounded-[9px] bg-[rgba(245,158,11,0.08)] border-[1.5px] border-[rgba(245,158,11,0.28)]">
            <span className="font-sans font-medium text-[0.5rem] text-[#d97706] tracking-[0.08em] uppercase">Read in</span>
            <span className="font-sans font-extrabold text-base leading-none text-[#d97706]">{secondsLeft}</span>
            <span className="font-sans font-semibold text-[0.52rem] text-[#d97706] opacity-75">s</span>
          </div>
        ) : isAnswering ? (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[10px] border-[1.5px] transition-[background,border-color] duration-300"
            style={{ background: timerBg, borderColor: timerBorder }}
          >
            <Timer
              size={14}
              style={{
                color: accentColor,
                transition: 'color 0.4s',
                animation: isCritical ? 'iv-timer-pulse 0.8s ease-in-out infinite' : undefined,
              }}
            />
            <div>
              <p className="font-sans font-extrabold text-[0.92rem] leading-none transition-colors duration-300" style={{ color: timerColor }}>
                {fmtSec(remainingSec)}
              </p>
              <p className="font-sans font-semibold text-[0.4rem] tracking-[0.08em] uppercase leading-tight mt-0.5 transition-colors duration-300" style={{ color: accentColor }}>
                remaining
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {/* Question text */}
      <p
        className="font-[Inter,sans-serif] font-semibold text-base md:text-[1.08rem] leading-[1.75] text-[#0d1117] tracking-tight break-words transition-opacity duration-300"
        style={{ opacity: isLoadingNext ? 0.4 : 1 }}
      >
        {currentMessage.content || t('question.getting_next')}
      </p>

      {currentMessage.reasoning && !isLoadingNext && (
        <p className="font-[Inter,sans-serif] text-[0.72rem] text-[#6b7280] italic mt-3 pl-3 border-l-2 border-[rgba(106,211,156,0.4)] leading-relaxed tracking-[0.01em]">
          {currentMessage.reasoning}
        </p>
      )}

      {/* "Next question loading" overlay */}
      {isLoadingNext && (
        <div
          className="absolute inset-0 flex items-center justify-center rounded-[18px] bg-white/80 backdrop-blur-[3px]"
          style={{ animation: 'iv-fade-in 0.3s ease' }}
        >
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-[12px] border-[1.5px] border-[rgba(106,211,156,0.4)] shadow-[0_4px_16px_rgba(106,211,156,0.15)]"
            style={{ background: 'linear-gradient(135deg, #f0fdf8, #fff)' }}>
            <div className="flex gap-1 items-center">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-[#6AD39C]"
                  style={{ animation: `iv-bounce-dot 1.2s ease-in-out ${i * 0.2}s infinite` }}
                />
              ))}
            </div>
            <span className="font-sans font-semibold text-[0.8rem] text-[#10453F] tracking-[0.01em]">
              Preparing next question
            </span>
            <ArrowRight size={15} color="#6AD39C" />
          </div>
        </div>
      )}

      {/* Bottom progress bar */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1 transition-opacity duration-300 pointer-events-none"
        style={{
          background: isInReadingTime ? 'rgba(245,158,11,0.1)' : 'rgba(106,211,156,0.1)',
          opacity: isInReadingTime || isAnswering ? 1 : 0,
        }}
      >
        <div
          className="h-full rounded-r-[2px] transition-[width] duration-500 ease-linear"
          style={{
            width: isInReadingTime ? `${progressPct}%` : `${answerPct}%`,
            background: isInReadingTime
              ? 'linear-gradient(90deg,#fde68a,#f59e0b)'
              : isCritical
                ? 'linear-gradient(90deg,#fca5a5,#dc2626)'
                : isNearLimit
                  ? 'linear-gradient(90deg,#fdba74,#f97316)'
                  : 'linear-gradient(90deg,#6AD39C,#10453F)',
          }}
        />
      </div>
    </div>
  );
};

export default QuestionPanel;
