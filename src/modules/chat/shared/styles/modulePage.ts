/**
 * Messages shell under dashboard scroll (company candidate chat, etc.).
 * Fixed viewport height when the main area scrolls.
 */
export const chatDashboardShellHeightCn =
  "h-[calc(100vh-88px)] sm:h-[calc(100vh-104px)] md:h-[calc(100vh-120px)] max-h-[calc(100vh-88px)] sm:max-h-[calc(100vh-104px)] md:max-h-[calc(100vh-120px)]";

export const chatDashboardShellCn =
  `flex-1 flex flex-col min-h-0 overflow-hidden ${chatDashboardShellHeightCn}`;

/**
 * Team messages under `DashboardLayout fillMainHeight`: fills remaining column below header (no vh gap).
 */
export const chatDashboardShellFlexCn = "flex-1 min-h-0 flex flex-col overflow-hidden w-full";

export const chatModulePageCn = {
  /** Default page height (no fillHeight prop). */
  defaultHeight: "h-[calc(100vh-100px)]",
  /** When parent already clamps height (e.g. company hub shell). */
  rootFill: "h-full max-h-full min-h-0 overflow-hidden",
  /** Dashboard messages: parent does not pass height; use viewport clamp instead of height:100%. */
  rootFillViewport: `min-h-0 overflow-hidden ${chatDashboardShellHeightCn}`,
  headerPaper: "px-5 py-4 rounded-[18px] border border-[#E8EAED] bg-white",
  bodyPaper: "flex-1 min-h-0 rounded-[18px] border border-[#E8EAED] bg-white overflow-hidden flex flex-col",
  title: "text-[1.25rem] font-bold text-[#111827]",
  /** Used with `dense` headers (e.g. team chat). */
  titleDense: "text-[1.125rem] sm:text-[1.3125rem] font-extrabold tracking-[-0.02em] leading-[1.2] text-[#0F172A]",
  subtitle: "text-[13px] text-[#6B7280] mt-0.5",
} as const;
