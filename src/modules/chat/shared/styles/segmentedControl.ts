export const chatSegmentedControlCn = {
  root: "flex items-center gap-2 p-1 bg-[#F9FAFB] rounded-xl border border-[#EEF0F2] flex-wrap justify-stretch sm:justify-start",
  item: "inline-flex items-center justify-center gap-2 px-3 sm:px-3.5 py-2 rounded-[10px] no-underline text-[#6B7280] border border-transparent transition-colors flex-1 sm:flex-none min-w-0 cursor-pointer bg-transparent hover:bg-white hover:text-[#374151]",
  itemActive: "bg-white border-[#99F6E4] text-[#0F766E] shadow-[0_1px_3px_rgba(15,118,110,0.12)]",
  label: "text-[13px] font-semibold leading-[1.2] whitespace-nowrap",
  badge: "min-w-[18px] h-[18px] px-1.5 rounded-full bg-[#0F766E] text-white text-[10px] font-bold inline-flex items-center justify-center",
} as const;
