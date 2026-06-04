import type { SxProps, Theme } from "@mui/material";

export const eligibilityGateSx = {
  jobTitleBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 1,
    bgcolor: "#F8FAFC",
    border: "1px solid #E2E8F0",
    borderRadius: "10px",
    px: 2,
    py: 0.7,
    mb: 2.5,
    mt: 1.5,
  } as SxProps<Theme>,

  jobTitleDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    bgcolor: "#94A3B8",
    flexShrink: 0,
  } as SxProps<Theme>,

  jobTitleText: {
    fontSize: "0.83rem",
    fontWeight: 600,
    color: "#475569",
  } as SxProps<Theme>,

  divider: {
    height: "1px",
    bgcolor: "#F1F5F9",
    mb: 2.5,
  } as SxProps<Theme>,

  limitDesc: {
    fontSize: "0.9rem",
    color: "#475569",
    lineHeight: 1.8,
    mb: 1.5,
  } as SxProps<Theme>,

  limitContact: {
    fontSize: "0.82rem",
    color: "#94A3B8",
    lineHeight: 1.7,
  } as SxProps<Theme>,
} as const;
