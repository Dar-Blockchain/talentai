import React from 'react';

interface InterviewLoadingScreenProps {
  title?:    string;
  subtitle?: string;
}

const InterviewLoadingScreen: React.FC<InterviewLoadingScreenProps> = ({
  title    = 'Loading interview',
  subtitle = 'Please wait a moment…',
}) => (
  <div className="flex-1 flex items-center justify-center flex-col gap-0 px-4 min-h-[60vh]">
    {/* eslint-disable-next-line @next/next/no-img-element -- animated GIF must not be re-encoded/optimized by next/image */}
    <img
      src="/gif/loading.gif"
      alt="Loading…"
      className="w-24 h-24 object-contain mb-4"
      draggable={false}
    />
    <p className="font-sans font-bold text-base text-[#0d1117] tracking-tight mb-1 text-center">
      {title}
    </p>
    <p className="font-sans text-[0.74rem] text-[#6b7280] leading-relaxed text-center max-w-[240px]">
      {subtitle}
    </p>
  </div>
);

export default InterviewLoadingScreen;
