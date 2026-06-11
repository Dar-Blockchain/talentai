import React from "react";
import { Box } from "@mui/material";
import ArrowForwardOutlined from "@mui/icons-material/ArrowForwardOutlined";
import { useTranslation } from "react-i18next";
import { ACCENT } from "@/modules/auth/shared/types";
import { AuthPageHeader, AccentSpan } from "@/modules/auth/shared/ui/AuthPageHeader";

interface Props {
  isOtpStep:       boolean;
  hasReturnUrl:    boolean;
  title:           string;
  subtitle:        string;
  registeredEmail: string;
  onBack:          () => void;
}

const FormHeader: React.FC<Props> = ({ isOtpStep, hasReturnUrl, title, subtitle, registeredEmail, onBack }) => {
  const { t } = useTranslation("auth");
  return (
    <AuthPageHeader
      mb={3}
      title={isOtpStep ? t("register.check_inbox") : title}
      subtitle={
        isOtpStep
          ? <>{t("register.otp_sent_prefix")} <AccentSpan>{registeredEmail || t("register.otp_sent_accent")}</AccentSpan></>
          : subtitle
      }
      above={!isOtpStep && !hasReturnUrl ? (
        <Box onClick={onBack} sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, mb: 1, cursor: "pointer", color: "#9CA3AF", fontFamily: "Poppins", fontSize: { xs: "0.72rem", sm: "0.76rem", md: "0.8rem" }, fontWeight: 500, "&:hover": { color: ACCENT }, transition: "color 0.2s" }}>
          <ArrowForwardOutlined sx={{ fontSize: { xs: 14, md: 15 }, transform: "rotate(180deg)", flexShrink: 0 }} />
          {t("register.change_role")}
        </Box>
      ) : undefined}
    />
  );
};

export default FormHeader;
