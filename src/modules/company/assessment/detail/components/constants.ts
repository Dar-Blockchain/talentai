export const TEAL        = "#0D9488";
export const TEAL_BG     = "#F0FDFA";
export const TEAL_BORDER = "#99F6E4";

export const scoreColor = (s: number) =>
  s >= 70 ? "#10B981" : s >= 50 ? "#F59E0B" : "#EF4444";

export const fmtDuration = (ms?: number) => {
  if (!ms) return "—";
  const m = Math.floor(ms / 60000);
  return m > 0 ? `${m}m` : `${Math.floor(ms / 1000)}s`;
};

export const fmtDate = (d: string) => {
  try {
    return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  } catch { return "—"; }
};


export function scoreStyle(s: number): { color: string; bg: string; label: string } {
  if (s >= 70) return { color: "#10B981", bg: "#F0FDF4", label: "Excellent" };
  if (s >= 50) return { color: "#D97706", bg: "#FFFBEB", label: "Satisfactory" };
  return { color: "#EF4444", bg: "#FEF2F2", label: "Needs Work" };
}

export function verdictStyle(r?: string): { color: string; bg: string; label: string; border: string } {
  if (r === 'strong_hire') return { color: '#059669', bg: '#ECFDF5', label: 'Strong Hire', border: '#6EE7B7' };
  if (r === 'hire')        return { color: '#10B981', bg: '#F0FDF4', label: 'Hire',         border: '#A7F3D0' };
  if (r === 'maybe')       return { color: '#D97706', bg: '#FFFBEB', label: 'Consider',     border: '#FDE68A' };
  if (r === 'no_hire')     return { color: '#EF4444', bg: '#FEF2F2', label: 'Pass',          border: '#FECACA' };
  return { color: '', bg: '', label: '', border: '' };
}
