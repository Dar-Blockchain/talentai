/** Admin dashboard design tokens — aligned with company dashboard teal palette. */
export const ADMIN_ACCENT       = "#0D9488";       // teal-600
export const ADMIN_ACCENT_LIGHT = "#F0FDFA";       // teal-50
export const ADMIN_SIDEBAR_BG   = "#0F172A";       // slate-900
export const ADMIN_SIDEBAR_BORDER     = "#1E293B"; // slate-800
export const ADMIN_SIDEBAR_TEXT_MUTED = "#94A3B8"; // slate-400

/** Neutral icon-chip color */
export const ADMIN_NEUTRAL    = "#0D9488"; // teal — matches company
export const ADMIN_NEUTRAL_BG = "#F0FDFA"; // teal-50

/** Dark banner */
export const ADMIN_DARK_BANNER = "#0F172A";

/** Semantic status colors */
export const ADMIN_SUCCESS = "#059669";
export const ADMIN_WARNING = "#D97706";
export const ADMIN_DANGER  = "#DC2626";

/** Colorful chart palette — matches company dashboard */
export const ADMIN_CHART_COLORS = [
  "#0D9488", "#6366F1", "#F59E0B", "#10B981",
  "#3B82F6", "#EC4899", "#8B5CF6", "#14B8A6",
  "#F97316", "#06B6D4",
];

export const ADMIN_SHADOW_REST  = "0 1px 2px rgba(15, 23, 42, 0.04)";
export const ADMIN_SHADOW_HOVER = "0 8px 24px -4px rgba(15, 23, 42, 0.08), 0 2px 6px rgba(15, 23, 42, 0.04)";
export const ADMIN_RADIUS = "14px";

export const ADMIN_GRADIENTS = {
  indigo:  ["#6366F1", "#8B5CF6"],
  violet:  ["#8B5CF6", "#A78BFA"],
  sky:     ["#0EA5E9", "#38BDF8"],
  emerald: ["#10B981", "#34D399"],
  amber:   ["#F59E0B", "#FCD34D"],
  rose:    ["#F43F5E", "#FB7185"],
} as const;

export type AdminGradientName = keyof typeof ADMIN_GRADIENTS;
