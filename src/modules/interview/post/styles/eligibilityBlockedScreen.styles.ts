import type { SxProps, Theme } from "@mui/material";

export const eligibilityBlockedScreenSx = {
  outer: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    px: 2,
    py: { xs: 5, md: 8 },
  } as SxProps<Theme>,

  card: (maxWidth: number): SxProps<Theme> => ({
    width: "100%",
    maxWidth,
    bgcolor: "#fff",
    borderRadius: "24px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)",
    overflow: "hidden",
  }),

  cardInner: {
    p: { xs: 4, md: 5 },
    textAlign: "center",
  } as SxProps<Theme>,

  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: "50%",
    background: "rgba(0,0,0,0.05)",
    border: "2px solid rgba(0,0,0,0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    mx: "auto",
    mb: 2.5,
  } as SxProps<Theme>,

  iconText: {
    fontSize: "2rem",
    lineHeight: 1,
    userSelect: "none",
  } as SxProps<Theme>,

  title: (hasBody: boolean): SxProps<Theme> => ({
    fontFamily: "Poppins",
    fontWeight: 800,
    fontSize: "1.4rem",
    color: "#0F172A",
    lineHeight: 1.25,
    letterSpacing: "-0.01em",
    mb: hasBody ? 1.5 : 0,
  }),

  description: {
    fontFamily: "Poppins",
    fontSize: "0.88rem",
    color: "#475569",
    lineHeight: 1.8,
  } as SxProps<Theme>,

  actionsRow: (hasBody: boolean): SxProps<Theme> => ({
    display: "flex",
    gap: 1.5,
    justifyContent: "center",
    flexWrap: "wrap",
    mt: hasBody ? 3.5 : 2,
  }),

  button: (
    color?: string,
    hoverColor?: string,
    variant?: "contained" | "outlined",
  ): SxProps<Theme> => {
    const isGradient = color?.includes("gradient");
    return {
      fontFamily: "Poppins",
      fontWeight: 700,
      fontSize: "0.9rem",
      textTransform: "none",
      borderRadius: "12px",
      color: "#fff",
      py: 1.3,
      ...(color
        ? isGradient
          ? {
              background: color,
              color: "#fff",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              "&:hover": {
                background: hoverColor ?? color,
                boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
                color: "#fff",
              },
            }
          : {
              bgcolor: color,
              color: "#fff",
              "&:hover": { bgcolor: hoverColor ?? color },
            }
        : variant === "outlined"
          ? {
              borderColor: "#E2E8F0",
              color: "#475569",
              "&:hover": { borderColor: "#CBD5E1", bgcolor: "#F8FAFC" },
            }
          : {}),
    };
  },
} as const;
