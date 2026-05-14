/**
 * Light-only premium mint palette for team chat (Slack / Linear–inspired).
 * Team mint surfaces stay light regardless of app theme.
 */
export const TEAM_MINT_UI = {
  bgMain: "#F8FAFC",
  bgCard: "#FFFFFF",
  primary: "#34D399",
  primaryHover: "#10B981",
  primarySoft: "#ECFDF5",
  textPrimary: "#111827",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
  border: "#E5E7EB",
  shadowSoft: "0 4px 20px rgba(15, 23, 42, 0.05)",
  shadowLift: "0 8px 28px rgba(15, 23, 42, 0.07)",
  radiusOuter: "20px",
  radiusInner: "16px",
  radiusPill: "999px",
  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  ownBubbleGradient: "linear-gradient(135deg, #34D399 0%, #10B981 100%)",
} as const;

/** Thin pill scrollbar for light mint panels (WebKit + Firefox). */
export const TEAM_MINT_SCROLLBAR_SX = {
  scrollbarWidth: "thin" as const,
  scrollbarColor: "rgba(17, 24, 39, 0.22) transparent",
  "&::-webkit-scrollbar": { width: 8 },
  "&::-webkit-scrollbar-track": {
    background: "transparent",
    marginBlock: 8,
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "rgba(17, 24, 39, 0.12)",
    borderRadius: 100,
    border: "2px solid transparent",
    backgroundClip: "content-box",
  },
  "@media (hover: hover)": {
    "&:hover::-webkit-scrollbar-thumb": {
      backgroundColor: "rgba(17, 24, 39, 0.22)",
    },
  },
} as const;
