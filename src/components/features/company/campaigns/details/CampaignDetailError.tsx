import React from "react";
import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

interface Props {
  message?: string;
}

const CampaignDetailError: React.FC<Props> = ({ message }) => {
  const { t } = useTranslation("dashboard");
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: 10,
        gap: 1,
      }}
    >
      <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: "#374151" }}>
        {t("pages.campaigns.detail.not_found_title")}
      </Typography>
      {message && (
        <Typography sx={{ fontSize: "0.875rem", color: "#9CA3AF" }}>
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default CampaignDetailError;
