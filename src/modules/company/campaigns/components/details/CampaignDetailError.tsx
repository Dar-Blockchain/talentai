import React, { memo } from "react";
import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

const WRAP_SX = { display: "flex", flexDirection: "column", alignItems: "center", py: 10, gap: 1 } as const;
const TITLE_SX = { fontWeight: 700, fontSize: "1.1rem", color: "#374151" } as const;
const MSG_SX   = { fontSize: "0.875rem", color: "#9CA3AF" } as const;

interface Props {
  message?: string;
}

const CampaignDetailError: React.FC<Props> = memo(({ message }) => {
  const { t } = useTranslation("dashboard");
  return (
    <Box sx={WRAP_SX}>
      <Typography sx={TITLE_SX}>{t("pages.campaigns.detail.not_found_title")}</Typography>
      {message && <Typography sx={MSG_SX}>{message}</Typography>}
    </Box>
  );
});

CampaignDetailError.displayName = "CampaignDetailError";
export default CampaignDetailError;
