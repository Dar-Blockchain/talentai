import React from "react";
import { useTranslation } from "react-i18next";
import { Box, Typography } from "@mui/material";
import PublishOutlined from "@mui/icons-material/PublishOutlined";
import AppButton from "@/components/ui/AppButton";

interface Props {
  onPublish: (e: React.MouseEvent) => void;
}

const CardDraftBanner: React.FC<Props> = ({ onPublish }) => {
  const { t } = useTranslation("posts");

  return (
    <Box
      onClick={onPublish}
      sx={{ mx: 2.5, mb: 2.5, px: 1.5, py: 1, borderRadius: "8px", border: "1.5px dashed #FCD34D", bgcolor: "#FFFBEB", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, cursor: "pointer", transition: "all 0.15s", "&:hover": { bgcolor: "#FEF3C7", borderColor: "#F59E0B" } }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
        <PublishOutlined sx={{ fontSize: 14, color: "#D97706", flexShrink: 0 }} />
        <Typography sx={{ fontSize: "11.5px", color: "#92400E", lineHeight: 1.3 }}>
          <strong>{t("card.draft_banner.hidden")}</strong> — {t("card.draft_banner.action")}
        </Typography>
      </Box>
      <AppButton
        label={t("card.draft_banner.btn")}
        size="xs"
        variant="contained"
        sx={{ bgcolor: "#D97706", "&:hover": { bgcolor: "#B45309" }, flexShrink: 0, borderRadius: "6px", boxShadow: "none" }}
      />
    </Box>
  );
};

export default CardDraftBanner;
