import { Box, Typography } from "@mui/material";
import AutoAwesomeOutlined from "@mui/icons-material/AutoAwesomeOutlined";
import { useTranslation } from "react-i18next";
import SectionCard from "@/components/ui/SectionCard";
import { INDIGO } from "./styles";

const PreviewHeader = () => {
  const { t } = useTranslation("posts");
  return (
    <SectionCard sx={{ borderLeft: `4px solid ${INDIGO}` }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: "#EEF2FF", border: "1px solid #C7D2FE", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <AutoAwesomeOutlined sx={{ fontSize: 20, color: INDIGO }} />
        </Box>
        <Box>
          <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>{t("create.preview.header_title")}</Typography>
          <Typography sx={{ fontSize: "12px", color: "#6B7280" }}>{t("create.preview.header_subtitle")}</Typography>
        </Box>
      </Box>
    </SectionCard>
  );
};

export default PreviewHeader;
