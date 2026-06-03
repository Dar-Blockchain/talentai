import React from "react";
import { Box, Typography } from "@mui/material";
import ArrowForwardOutlined from "@mui/icons-material/ArrowForwardOutlined";
import { useTranslation } from "react-i18next";
import { ACCENT } from "@/modules/auth/shared/types";

interface Props {
  isOtpStep: boolean;
  hasReturnUrl: boolean;
  title: string;
  subtitle: string;
  registeredEmail: string;
  onBack: () => void;
}

const FormHeader: React.FC<Props> = ({ isOtpStep, hasReturnUrl, title, subtitle, registeredEmail, onBack }) => {
  const { t } = useTranslation("auth");

  return (
    <Box sx={{ mb: 3, textAlign: "center" }}>
      {!isOtpStep && !hasReturnUrl && (
        <Box onClick={onBack} sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, mb: 1, cursor: "pointer", color: "#9CA3AF", fontFamily: "Poppins", fontSize: { xs: "0.72rem", sm: "0.76rem", md: "0.8rem" }, fontWeight: 500, "&:hover": { color: ACCENT }, transition: "color 0.2s" }}>
          <ArrowForwardOutlined sx={{ fontSize: { xs: 14, md: 15 }, transform: "rotate(180deg)", flexShrink: 0 }} />
          {t("register.change_role")}
        </Box>
      )}
      <Typography sx={{ fontSize: { xs: "1.2rem", sm: "1.4rem", md: "1.55rem", lg: "1.7rem" }, fontWeight: 800, fontFamily: "Poppins", color: "#0F172A", lineHeight: { xs: 1.18, md: 1.15 }, mb: 0.4, letterSpacing: "-0.025em", overflowWrap: "break-word" }}>
        {isOtpStep ? t("register.check_inbox") : title}
      </Typography>
      <Typography sx={{ fontSize: { xs: "0.75rem", sm: "0.82rem", md: "0.87rem", lg: "0.9rem" }, color: "#6B7280", fontFamily: "Poppins", lineHeight: { xs: 1.5, md: 1.55 }, overflowWrap: "break-word" }}>
        {isOtpStep
          ? <>{t("register.otp_sent_prefix")} <Box component="span" sx={{ color: ACCENT, fontWeight: 600 }}>{registeredEmail || t("register.otp_sent_accent")}</Box></>
          : subtitle}
      </Typography>
    </Box>
  );
};

export default FormHeader;
