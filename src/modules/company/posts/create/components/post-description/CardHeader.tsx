import { Box, Typography } from "@mui/material";
import { Sparkles as AutoAwesomeOutlined } from "lucide-react";
import { useTranslation } from "react-i18next";
import { TEAL, TEAL_BG, TEAL_BORDER } from "./styles";

const CardHeader = () => {
  const { t } = useTranslation("posts");
  return (
    <Box sx={{ bgcolor: TEAL_BG, borderBottom: `1px solid ${TEAL_BORDER}`, px: 2.5, py: 1.75, display: "flex", alignItems: "center", gap: 1.5 }}>
      <Box sx={{ width: 34, height: 34, borderRadius: "9px", bgcolor: TEAL, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <AutoAwesomeOutlined size={17} color="#fff" />
      </Box>
      <Box>
        <Typography sx={{ fontSize: "13.5px", fontWeight: 700, color: "#111827", lineHeight: 1.25 }}>
          {t("create.form.header_title")}
        </Typography>
        <Typography sx={{ fontSize: "11.5px", color: "#6B7280", lineHeight: 1.3 }}>
          {t("create.form.header_subtitle")}
        </Typography>
      </Box>
    </Box>
  );
};

export default CardHeader;
