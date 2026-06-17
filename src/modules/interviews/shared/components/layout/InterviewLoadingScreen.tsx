import React from 'react';

interface InterviewLoadingScreenProps {
  title?: string;
  subtitle?: string;
}

const InterviewLoadingScreen: React.FC<InterviewLoadingScreenProps> = ({
  title    = 'Loading interview',
  subtitle = 'Please wait a moment…',
}) => (
  <div className="flex-1 flex items-center justify-center flex-col gap-0 px-4 min-h-[60vh]">
    {/* Dual counter-rotating arcs */}
    <div className="relative w-[72px] h-[72px] mb-6 shrink-0">
      <div className="absolute inset-0 rounded-full border-2 border-[rgba(106,211,156,0.12)]" />
      <div
        className="absolute inset-0 rounded-full border-[2.5px] border-transparent"
        style={{
          borderTopColor: '#6AD39C',
          borderRightColor: 'rgba(106,211,156,0.25)',
          animation: 'iv-spin 1s linear infinite',
        }}
      />
      <div
        className="absolute inset-3 rounded-full border-2 border-transparent"
        style={{
          borderTopColor: 'rgba(106,211,156,0.45)',
          animation: 'iv-spin-rev 1.6s linear infinite',
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="w-2.5 h-2.5 rounded-full bg-[#6AD39C]"
          style={{ animation: 'iv-pulse-dot 1.4s ease-in-out infinite' }}
        />
      </div>
    </div>

    <p className="font-sans font-bold text-base text-[#0d1117] tracking-tight mb-1 text-center">
      {title}
    </p>
    <p className="font-sans text-[0.74rem] text-[#6b7280] leading-relaxed text-center max-w-[240px] mb-6">
      {subtitle}
    </p>

    <div className="flex gap-3">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-[#6AD39C]"
          style={{ animation: `iv-dot 1.2s ease-in-out ${i * 0.2}s infinite` }}
        />
      ))}
    </div>
  </div>
);

export default InterviewLoadingScreen;
