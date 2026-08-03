export const PLAN_CONFIG: Record<string, { color: string; badge?: string }> = {
  Trial:     { color: "#6B7280" },
  Starter:   { color: "#0D9488" },
  Pro:       { color: "#7C3AED", badge: "Popular" },
  Business:  { color: "#0891B2" },
  Unlimited: { color: "#D97706", badge: "Enterprise" },
};

export const ORDERED_PLANS = ["Trial", "Starter", "Pro", "Business", "Unlimited"];
