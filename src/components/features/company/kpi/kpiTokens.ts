export const T      = "#0D9488";
export const T_DARK = "#0A7B6E";
export const T_BG   = "#F0FDFA";
export const T_BRD  = "#CCFBF1";
export const NAVY   = "#0F172A";
export const NAVY2  = "#1E293B";
export const GRAY   = "#64748B";
export const GRAY2  = "#94A3B8";
export const LGRAY  = "#F8FAFC";
export const BORDER = "#E2E8F0";
export const WHITE  = "#FFFFFF";

export const ChartTooltip = {
  contentStyle: {
    fontFamily: "Poppins",
    fontSize: 12,
    borderRadius: 10,
    border: `1px solid ${BORDER}`,
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
  },
};

export const coverageColor = (c: number, d: number) => {
  if (c < 0.7 || d < 14) return "#EF4444";
  if (c < 1.0) return "#F59E0B";
  return "#10B981";
};

export const coverageLabel = (c: number, d: number) => {
  if (c < 0.7 || d < 14) return "alerte";
  if (c < 1.0) return "moyen";
  return "ok";
};

export const passRate = (a: number, b: number) =>
  b === 0 ? "—" : `${Math.round((a / b) * 100)}%`;
