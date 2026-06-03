import { Box, CircularProgress, Typography } from "@mui/material";
import AutoAwesomeOutlined from "@mui/icons-material/AutoAwesomeOutlined";
import { useTranslation } from "react-i18next";
import SectionCard from "@/components/ui/SectionCard";
import { TEAL, TEAL_BG, TEAL_BORDER } from "./styles";

export const LoadingState = () => {
  const { t } = useTranslation("posts");
  return (
    <SectionCard sx={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
      <CircularProgress sx={{ color: TEAL }} size={40} />
      <Typography sx={{ fontSize: "14px", color: "#6B7280" }}>{t("create.preview.loading")}</Typography>
    </SectionCard>
  );
};

export const EmptyState = () => {
  const { t } = useTranslation("posts");
  return (
    <SectionCard sx={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
      <Box sx={{ width: 72, height: 72, borderRadius: "50%", bgcolor: TEAL_BG, border: `1px solid ${TEAL_BORDER}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <AutoAwesomeOutlined sx={{ fontSize: 32, color: TEAL }} />
      </Box>
      <Box sx={{ textAlign: "center" }}>
        <Typography sx={{ fontSize: "15px", fontWeight: 600, color: "#111827" }}>{t("create.preview.empty_title")}</Typography>
        <Typography sx={{ fontSize: "13px", color: "#6B7280", mt: 0.5 }}>{t("create.preview.empty_subtitle")}</Typography>
      </Box>
    </SectionCard>
  );
};
