export { ACCENT, ACCENT_DARK } from "@/modules/company/constants";

// Plans intentionally share one accent color (see ACCENT) instead of a hue
// per tier — only `badge` differs, to keep the pricing grid calm and let the
// accent color mean one consistent thing: "this is the one to notice".
export const PLAN_CONFIG: Record<string, { badge?: string }> = {
  Trial:     {},
  Starter:   {},
  Pro:       { badge: "Popular" },
  Business:  {},
  Unlimited: { badge: "Enterprise" },
};

export const ORDERED_PLANS = ["Trial", "Starter", "Pro", "Business", "Unlimited"];
