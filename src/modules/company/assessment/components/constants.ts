export const TEAL        = "#0D9488";
export const TEAL_BG     = "#F0FDFA";
export const TEAL_BORDER = "#99F6E4";

export const scoreColor = (s: number) =>
  s >= 70 ? "#10B981" : s >= 50 ? "#F59E0B" : "#EF4444";

export const fmtDuration = (ms: number) => {
  if (!ms) return "N/A";
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
};
