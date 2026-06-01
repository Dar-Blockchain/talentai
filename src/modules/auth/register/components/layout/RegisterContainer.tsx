import React from "react";
import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import Image from "next/image";
import NextLink from "next/link";
import { useTranslation } from "react-i18next";
import { ACCENT } from "@/modules/auth/shared/types";
import { BrandLeftPanel } from "@/modules/auth/shared";

const RegisterContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useTranslation("auth");
  const theme = useTheme();
  const isSplitDesktop    = useMediaQuery("(min-width:1025px)", { noSsr: true });
  const isWideSplit        = useMediaQuery(theme.breakpoints.up("lg"), { noSsr: true });

  return (
    <Box sx={{ minHeight: "100dvh", display: "flex", flexDirection: isSplitDesktop ? "row" : "column", overflowX: "hidden" }}>

      <BrandLeftPanel tKey="register_panel" flex={isWideSplit ? "0 0 50%" : "0 0 45%"} />

      {/* Right panel */}
      <Box sx={{ flex: 1, overflowY: "auto", background: "#F7F8FA", position: "relative" }}>
        <Box sx={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 80% 40% at 50% 100%, rgba(13,148,136,0.05) 0%, transparent 60%)" }} />

        <Box sx={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", px: { xs: 2, sm: 3, md: 4, lg: 5 }, py: { xs: 3, sm: 4 }, position: "relative", zIndex: 1 }}>

          {/* Mobile logo */}
          {!isSplitDesktop && (
            <Box sx={{ display: "flex", justifyContent: "center", flexShrink: 0, pt: { xs: 1.5, sm: 2 }, mb: { xs: 1.25, sm: 1.75 } }}>
              <NextLink href="/" style={{ textDecoration: "none" }}>
                <Image src="/images/home/logo.svg" alt="TalentAI" width={140} height={38} style={{ objectFit: "contain" }} />
              </NextLink>
            </Box>
          )}

          <Box sx={{ width: "100%", maxWidth: { xs: 480, sm: 560, md: 600, lg: 640 }, flexShrink: 0 }}>
            {/* Card */}
            <Box sx={{ bgcolor: "#fff", borderRadius: { xs: "18px", md: "20px" }, boxShadow: "0 0 0 1px rgba(0,0,0,0.06), 0 4px 6px -1px rgba(0,0,0,0.04), 0 12px 40px -4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
              <Box sx={{ height: 2, bgcolor: ACCENT }} />
              <Box sx={{ minHeight: "50dvh", display: "flex", flexDirection: "column", justifyContent: "center", px: { xs: 3, sm: 4, md: 4.5 }, pt: { xs: 3, sm: 3.5 }, pb: { xs: 3, sm: 3.5 } }}>
                {children}
              </Box>
            </Box>

            {/* Footer */}
            <Typography sx={{ mt: { xs: 1.5, sm: 2 }, fontSize: { xs: "10.25px", sm: "10.875px", md: "11.5px" }, color: "#9CA3AF", fontFamily: "Poppins", textAlign: "center", lineHeight: 1.75, px: { xs: 0.5, md: 0 }, overflowWrap: "break-word" }}>
              {t("register_panel.footer_prefix")}{" "}
              <NextLink href="/terms" style={{ color: ACCENT, textDecoration: "none", fontWeight: 600 }}>{t("register_panel.terms")}</NextLink>
              {" "}{t("register_panel.footer_and")}{" "}
              <NextLink href="/privacy" style={{ color: ACCENT, textDecoration: "none", fontWeight: 600 }}>{t("register_panel.privacy")}</NextLink>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default RegisterContainer;
