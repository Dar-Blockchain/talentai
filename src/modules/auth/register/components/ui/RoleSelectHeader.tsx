import React from "react";
import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { ACCENT, ACCENT2 } from "@/modules/auth/shared/types";

const RoleSelectHeader: React.FC = () => {
  const { t } = useTranslation("auth");

  return (
    <Box sx={{ mb: 3.5, textAlign: "center" }}>
      <Typography sx={{ fontSize: { xs: "1.5rem", sm: "1.75rem", md: "1.95rem", lg: "2.2rem" }, fontWeight: 800, fontFamily: "Poppins", color: "#0F172A", lineHeight: { xs: 1.15, md: 1.1 }, mb: 0.75, letterSpacing: "-0.03em" }}>
        {t("register.get_started")}
      </Typography>
      <Typography sx={{ fontSize: { xs: "0.875rem", sm: "0.97rem", md: "1.02rem", lg: "1.05rem" }, color: "#6B7280", fontFamily: "Poppins", lineHeight: { xs: 1.58, md: 1.65 }, overflowWrap: "break-word" }}>
        {t("register.how_use_prefix")}{" "}
        <Box component="span" sx={{ fontWeight: 700, background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT2})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          TalentAI
        </Box>
        {t("register.how_use_suffix")}
      </Typography>
    </Box>
  );
};

export default RoleSelectHeader;
