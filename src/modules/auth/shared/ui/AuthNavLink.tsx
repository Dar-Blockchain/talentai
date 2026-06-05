import React from "react";
import { Box, Typography } from "@mui/material";
import Link from "next/link";
import { ACCENT } from "@/modules/auth/shared/types";

interface Props {
  href:        string;
  label:       string;
  dividerText: string;
  /** Use teal accent border (sign-in style) vs neutral border (register style) */
  variant?:    "accent" | "neutral";
}

/**
 * Divider + full-width link button used at the bottom of auth forms.
 * Replaces both SignInLink (register page) and BackToLandingButton (signin page).
 */
const AuthNavLink: React.FC<Props> = ({ href, label, dividerText, variant = "neutral" }) => {
  const isAccent = variant === "accent";

  return (
    <Box sx={{ pt: 0.5 }}>
      {/* Divider row */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: isAccent ? 2 : 1.25 }}>
        <Box sx={{ flex: 1, height: "1px", bgcolor: isAccent ? "#E5E7EB" : "#F1F5F9" }} />
        <Typography sx={{
          fontSize: { xs: "0.6875rem", sm: "0.72rem" },
          color: isAccent ? "#9CA3AF" : "#C4C9D4",
          fontFamily: "Poppins", whiteSpace: "nowrap",
          overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {dividerText}
        </Typography>
        <Box sx={{ flex: 1, height: "1px", bgcolor: isAccent ? "#E5E7EB" : "#F1F5F9" }} />
      </Box>

      {/* Link button */}
      <Link href={href} style={{ textDecoration: "none" }}>
        <Box sx={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: "100%",
          height: isAccent ? { xs: 44, sm: 46, md: 48 } : { xs: 38, sm: 40 },
          borderRadius: isAccent ? "14px" : "10px",
          px: isAccent ? { xs: 1.5, sm: 2 } : undefined,
          border: isAccent ? `1.5px solid ${ACCENT}44` : "1.5px solid #E5E7EB",
          color: isAccent ? ACCENT : "#374151",
          fontFamily: "Poppins", fontWeight: isAccent ? 700 : 600,
          fontSize: isAccent ? { xs: "0.82rem", sm: "0.88rem", md: "0.95rem" } : { xs: "0.83rem", sm: "0.87rem" },
          transition: "all 0.15s",
          "&:hover": isAccent
            ? { bgcolor: `${ACCENT}08`, borderColor: ACCENT }
            : { bgcolor: "#F9FAFB", borderColor: "#D1D5DB" },
        }}>
          {label}
        </Box>
      </Link>
    </Box>
  );
};

export default AuthNavLink;
