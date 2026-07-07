import React from "react";
import { useTranslation } from "react-i18next";
import { Box, Typography } from "@mui/material";
import { Rocket as PublishOutlined } from "lucide-react";
import { Button } from "@/modules/shared/ui/shadcn/button";

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
        <PublishOutlined size={14} color="#D97706" className="shrink-0" />
        <Typography sx={{ fontSize: "11.5px", color: "#92400E", lineHeight: 1.3 }}>
          <strong>{t("card.draft_banner.hidden")}</strong> — {t("card.draft_banner.action")}
        </Typography>
      </Box>
      <Button size="xs" variant="warning" className="shrink-0 shadow-none">
        {t("card.draft_banner.btn")}
      </Button>
    </Box>
  );
};

export default CardDraftBanner;
