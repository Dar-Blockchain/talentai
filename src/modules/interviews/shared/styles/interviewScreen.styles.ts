/** Shared Tailwind class strings for InterviewScreen layout. */
export const interviewScreenStyles = {
  root:           'iv-root h-dvh flex flex-col overflow-hidden bg-[#f8fdfb]',
  container:      'flex-1 flex flex-col min-h-0 overflow-y-auto md:overflow-y-hidden py-6 md:py-4 px-6 md:px-12 no-scrollbar',
  grid:           'flex-1 min-h-0 md:max-h-[min(500px,calc(100dvh-130px))] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[2fr_1fr] gap-6 md:gap-4 mt-4 md:mt-3',
  lobbyCard:      'bg-white rounded-[20px] border border-[#e8f5f0] shadow-[0_4px_24px_rgba(16,69,63,0.07)] overflow-y-auto no-scrollbar',
  lobbyAccentBar: 'h-1 bg-gradient-to-r from-[#6AD39C] to-[#10453F] shrink-0',
} as const;
