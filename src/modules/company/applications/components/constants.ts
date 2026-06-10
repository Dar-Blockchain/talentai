export const TEAL        = "#0D9488";
export const TEAL_BG     = "#F0FDFA";
export const TEAL_BORDER = "#99F6E4";
export const PURPLE      = "#8310FF";

export const AVATAR_COLORS = [TEAL, "#3B82F6", "#8B5CF6", "#F59E0B", "#EC4899"];

export const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  applied:             { bg: "#EFF6FF", color: "#2563EB" },
  visited:             { bg: "#EFF6FF", color: "#2563EB" },
  pending:             { bg: "#FFFBEB", color: "#D97706" },
  shortlisted:         { bg: "#F0FDF4", color: "#16A34A" },
  accepted:            { bg: TEAL_BG,   color: TEAL },
  rejected:            { bg: "#FEF2F2", color: "#DC2626" },
  withdrawn:           { bg: "#F3F4F6", color: "#6B7280" },
  interview_completed: { bg: TEAL_BG,   color: TEAL },
};

export const scoreColor = (s: number) =>
  s >= 70 ? "#059669" : s >= 50 ? "#D97706" : "#DC2626";

export const scoreBg = (s: number) =>
  s >= 70 ? "#F0FDF4" : s >= 50 ? "#FFFBEB" : "#FEF2F2";

export const fmtDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "—";

export const fmtDuration = (ms: number) => {
  if (!ms) return "—";
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

export const getInitials = (name: string) =>
  name.split(" ").filter(Boolean).map((n) => n[0]).join("").toUpperCase().slice(0, 2);
