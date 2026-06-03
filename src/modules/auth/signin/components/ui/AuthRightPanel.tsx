import React from "react";
import { Box, Typography } from "@mui/material";
import NextLink from "next/link";
import { useTranslation } from "react-i18next";
import { ACCENT } from "@/modules/auth/shared/types";

const AuthRightPanel: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useTranslation("auth");

  return (
    <Box sx={{ flex: 1, overflowY: "auto", scrollBehavior: "smooth", background: "#F7F8FA", position: "relative" }}>
      {/* Radial accent */}
      <Box sx={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 80% 40% at 50% 100%, rgba(13,148,136,0.05) 0%, transparent 60%)" }} />

      <Box sx={{ minHeight: "100dvh", boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", px: { xs: 2, sm: 4, md: 4.5, lg: 5 }, py: { xs: 2, sm: 2.5, md: 2.5, lg: 3 }, position: "relative", zIndex: 1 }}>
        <Box sx={{ width: "100%", maxWidth: { xs: 360, sm: 400, md: 420 } }}>

          {/* Card */}
          <Box sx={{ bgcolor: "#fff", borderRadius: { xs: "16px", md: "18px" }, boxShadow: "0 0 0 1px rgba(0,0,0,0.06), 0 4px 6px -1px rgba(0,0,0,0.04), 0 12px 40px -4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
            <Box sx={{ height: 2, bgcolor: ACCENT }} />
            <Box sx={{ minHeight: "50dvh", display: "flex", flexDirection: "column", justifyContent: "center", px: { xs: 2.5, sm: 3 }, pt: { xs: 2.5, sm: 2.75 }, pb: { xs: 2.5, sm: 2.75 } }}>
              {children}
            </Box>
          </Box>

          {/* Footer */}
          <Typography sx={{ mt: 1.25, px: { xs: 0.5, md: 0.75 }, fontSize: "11px", color: "#9CA3AF", fontFamily: "Poppins", textAlign: "center", lineHeight: 1.55 }}>
            {t("signin_panel.footer_prefix")}{" "}
            <NextLink href="/terms" style={{ color: ACCENT, textDecoration: "none", fontWeight: 600 }}>{t("signin_panel.terms")}</NextLink>
            {" "}{t("signin_panel.footer_and")}{" "}
            <NextLink href="/privacy" style={{ color: ACCENT, textDecoration: "none", fontWeight: 600 }}>{t("signin_panel.privacy")}</NextLink>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default AuthRightPanel;
