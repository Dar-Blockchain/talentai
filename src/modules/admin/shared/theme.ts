/** Admin dashboard design tokens — minimal/Linear-Vercel style.
 *  Color is reserved for exactly three places: the sidebar's active nav
 *  item, primary action buttons, and semantic status badges. Everything
 *  else (icon chips, card headers, charts, table heads) is neutral slate.
 *  Visual weight comes from soft shadows and generous spacing instead of
 *  hard borders or color. */
export const ADMIN_ACCENT = "#4F46E5";       // indigo-600 — ONLY for primary buttons + active sidebar item
export const ADMIN_ACCENT_LIGHT = "#EEF2FF"; // indigo-50
export const ADMIN_SIDEBAR_BG = "#0F172A";   // slate-900
export const ADMIN_SIDEBAR_BORDER = "#1E293B"; // slate-800
export const ADMIN_SIDEBAR_TEXT_MUTED = "#94A3B8"; // slate-400

/** Neutral icon-chip color — used for icon chips on cards/headers (no accent tint). */
export const ADMIN_NEUTRAL = "#475569"; // slate-600
export const ADMIN_NEUTRAL_BG = "#F8FAFC"; // slate-50, lighter than before — softer chip fill

/** Dark banner — dialog hero headers (matches sidebar dark, not a washed-out gray). */
export const ADMIN_DARK_BANNER = "#0F172A"; // slate-900

/** Semantic status colors — the only colors that should appear besides neutral gray/black/white. */
export const ADMIN_SUCCESS = "#059669"; // emerald-600
export const ADMIN_WARNING = "#D97706"; // amber-600
export const ADMIN_DANGER  = "#DC2626"; // red-600

/** Monochrome chart palette — grayscale only. */
export const ADMIN_CHART_COLORS = [
  "#1E293B", "#475569", "#64748B", "#94A3B8", "#CBD5E1",
  "#0F172A", "#334155", "#71839B", "#A8B4C2", "#E2E8F0",
];

/** Soft elevation shadows — replace hard 1px borders as the primary way
 *  cards separate from the page background. Subtle by design: visible on
 *  hover/focus, barely-there at rest. */
export const ADMIN_SHADOW_REST = "0 1px 2px rgba(15, 23, 42, 0.04)";
export const ADMIN_SHADOW_HOVER = "0 8px 24px -4px rgba(15, 23, 42, 0.08), 0 2px 6px rgba(15, 23, 42, 0.04)";
export const ADMIN_RADIUS = "14px"; // shared corner radius for cards/dialogs/inputs

/**
 * Legacy gradient API — kept so existing call sites compile, but every name
 * now resolves to a flat neutral slate color (no gradient, no accent tint).
 */
export const ADMIN_GRADIENTS = {
  indigo:  ["#475569", "#475569"],
  violet:  ["#475569", "#475569"],
  sky:     ["#475569", "#475569"],
  emerald: ["#475569", "#475569"],
  amber:   ["#475569", "#475569"],
  rose:    ["#475569", "#475569"],
} as const;

export type AdminGradientName = keyof typeof ADMIN_GRADIENTS;

/**
 * Returns a flat neutral slate color, expressed as a same-color "gradient"
 * so it remains valid wherever it's assigned to backgroundImage. Visually
 * indistinguishable from a flat fill — no diagonal blend.
 */
export const adminGradientCss = (_name: AdminGradientName = "indigo", _deg = 135) => {
  return `linear-gradient(${_deg}deg, ${ADMIN_NEUTRAL}, ${ADMIN_NEUTRAL})`;
};

/** Single neutral "cycle" — every slot is the same flat slate, kept only so repeated-card call sites still type-check. */
export const ADMIN_GRADIENT_CYCLE: AdminGradientName[] = ["indigo"];

/** Soft ambient shadow, kept for call-site compatibility. */
export const adminGlowShadow = (_name: AdminGradientName = "indigo") => {
  return ADMIN_SHADOW_REST;
};
