export const PURPLE = "#8310FF";

export const ROLE_STYLES: Record<string, { color: string; bg: string }> = {
  RH:         { color: "#16A34A", bg: "#F0FDF4" },
  TechLead:   { color: "#0891B2", bg: "#ECFEFF" },
  Supervisor: { color: "#D97706", bg: "#FFFBEB" },
  Manager:    { color: PURPLE,    bg: "#F5F3FF" },
  Owner:      { color: "#DC2626", bg: "#FEF2F2" },
};

export const STATUS_STYLES: Record<string, { color: string; bg: string; dot: string; label: string }> = {
  active:   { color: "#16A34A", bg: "#DCFCE7", dot: "#22C55E", label: "Active"   },
  pending:  { color: "#D97706", bg: "#FEF9C3", dot: "#F59E0B", label: "Pending"  },
  inactive: { color: "#6B7280", bg: "#F3F4F6", dot: "#D1D5DB", label: "Inactive" },
};

export const AVATAR_PALETTES = [
  { from: "#A78BFA", to: "#6D28D9" },
  { from: "#34D399", to: "#059669" },
  { from: "#38BDF8", to: "#0284C7" },
  { from: "#F87171", to: "#DC2626" },
  { from: "#FCD34D", to: "#B45309" },
];

export function pickPalette(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_PALETTES[Math.abs(h) % AVATAR_PALETTES.length];
}

export const fmtDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";
