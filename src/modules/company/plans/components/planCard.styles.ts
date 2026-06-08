export const planCardSx = (color: string, highlighted: boolean, isActive: boolean) => ({
  backgroundColor: "#fff",
  borderRadius: "20px",
  border: `2px solid ${highlighted ? color : "#E5E7EB"}`,
  boxShadow: isActive
    ? `0 8px 32px ${color}28`
    : highlighted
      ? `0 12px 40px ${color}22`
      : "0 2px 8px rgba(0,0,0,0.06)",
  display: "flex", flexDirection: "column", height: "100%",
  position: "relative", overflow: "hidden",
  transition: "box-shadow 0.2s, transform 0.2s, border-color 0.2s",
  "&:hover": { boxShadow: `0 16px 48px ${color}28`, transform: "translateY(-3px)", borderColor: color },
} as const);

export const primaryBtnSx = (color: string) => ({
  bgcolor: color,
  "&:hover": { bgcolor: color, filter: "brightness(0.88)" },
  fontWeight: 700, borderRadius: "10px", py: 1.1,
  fontSize: "0.85rem", boxShadow: `0 4px 14px ${color}30`,
  textTransform: "none",
} as const);

export const activeBannerSx = (color: string) => ({
  display: "flex", alignItems: "center", justifyContent: "center", gap: 0.75,
  py: 1.1, borderRadius: "10px",
  bgcolor: `${color}10`, border: `1.5px solid ${color}30`,
} as const);

export const badgeChipSx = (color: string) => ({
  position: "absolute", top: 17, right: 16,
  bgcolor: color, color: "#fff", fontWeight: 700,
  fontSize: "0.68rem", letterSpacing: 0.4, height: 22,
  "& .MuiChip-icon": { color: "#fff" },
} as const);
