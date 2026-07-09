export const companyChatCn = {
  workspace: "flex flex-col gap-3 flex-1 min-h-0 h-full max-h-full overflow-hidden",
  /** Tighter stack under dashboard (team chat aligned with employee messages). */
  workspaceTeamDense: "gap-2",
  hubHeader: "rounded-[18px] border border-[#E8EAED] bg-white px-3 sm:px-5 py-3 sm:py-4 flex items-stretch md:items-center justify-between gap-4 flex-wrap shadow-[0_8px_24px_rgba(15,23,42,0.04)]",
  /** Team channel hub card — matches dense `ChatModulePageFrame` header spacing. */
  hubHeaderTeamDense: "px-3 sm:px-3.5 gap-2.5 shadow-[0_2px_12px_rgba(15,23,42,0.04)]",
  hubTitleTeamDense: "text-[1.125rem] sm:text-[1.3125rem] font-extrabold tracking-[-0.02em] leading-[1.2] text-[#0F172A]",
  teamTitleIconWrap: "shrink-0 w-9 h-9 rounded-[10px] flex items-center justify-center text-[#0D9488] bg-[rgba(13,148,136,0.1)] border border-[rgba(13,148,136,0.22)] shadow-[0_1px_2px_rgba(15,118,110,0.08)]",
  hubIntro: "flex-[1_1_220px] min-w-0",
  hubTitle: "text-[1.1rem] sm:text-[1.25rem] font-bold text-[#111827] leading-[1.2]",
  hubSubtitle: "text-[13px] text-[#6B7280] mt-1 max-w-[560px]",
  hubNavWrap: "flex-[1_1_100%] md:flex-[0_1_auto] flex justify-stretch md:justify-end",
  content: "flex-1 min-w-0 min-h-0 flex flex-col",
  toolbar: "flex items-center justify-between gap-3 px-4 py-2.5 border-b border-[#F3F4F6] bg-[#FCFCFD] flex-wrap",
} as const;
