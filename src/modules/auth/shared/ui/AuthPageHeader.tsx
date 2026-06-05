import React from "react";
import { Box, Typography } from "@mui/material";
import { ACCENT, ACCENT2 } from "@/modules/auth/shared/types";

interface Props {
  title:       React.ReactNode;
  subtitle?:   React.ReactNode;
  /** Extra content rendered above the title (e.g. back link, logo) */
  above?:      React.ReactNode;
  size?:       "lg" | "md" | "sm";
  mb?:         number;
}

const TITLE_SIZES = {
  lg: { xs: "1.5rem",  sm: "1.75rem", md: "1.95rem", lg: "2.2rem"  },
  md: { xs: "1.2rem",  sm: "1.4rem",  md: "1.55rem", lg: "1.7rem"  },
  sm: { xs: "1.25rem", sm: "1.4rem",  md: "1.5rem"                 },
} as const;

const SUB_SIZES = {
  lg: { xs: "0.875rem", sm: "0.97rem",  md: "1.02rem", lg: "1.05rem" },
  md: { xs: "0.75rem",  sm: "0.82rem",  md: "0.87rem", lg: "0.9rem"  },
  sm: { xs: "0.78rem",  sm: "0.82rem"                                 },
} as const;

/**
 * Shared title + subtitle block used by SignInHeader, RoleSelectHeader, and FormHeader.
 * Covers: centered heading, optional gradient brand name, optional subtitle.
 */
export const AuthPageHeader: React.FC<Props> = ({ title, subtitle, above, size = "md", mb = 3 }) => (
  <Box sx={{ mb, textAlign: "center" }}>
    {above}
    <Typography sx={{
      fontSize: TITLE_SIZES[size], fontWeight: 800, fontFamily: "Poppins",
      color: "#0F172A", lineHeight: { xs: 1.18, md: 1.1 },
      mb: subtitle ? 0.5 : 0, letterSpacing: size === "lg" ? "-0.03em" : "-0.025em",
      overflowWrap: "break-word",
    }}>
      {title}
    </Typography>
    {subtitle && (
      <Typography sx={{
        fontSize: SUB_SIZES[size], color: "#6B7280", fontFamily: "Poppins",
        lineHeight: { xs: 1.5, md: 1.65 }, overflowWrap: "break-word",
      }}>
        {subtitle}
      </Typography>
    )}
  </Box>
);

/** Gradient brand span — "TalentAI" in teal gradient */
export const BrandSpan: React.FC<{ children?: React.ReactNode }> = ({ children = "TalentAI" }) => (
  <Box component="span" sx={{
    fontWeight: 700,
    background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT2})`,
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
  }}>
    {children}
  </Box>
);

/** Accent-coloured inline span */
export const AccentSpan: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box component="span" sx={{ color: ACCENT, fontWeight: 600 }}>{children}</Box>
);
