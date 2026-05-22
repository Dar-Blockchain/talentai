import React from "react";
import { useTranslation } from "react-i18next";
import { Alert, Box, IconButton, Tooltip, Typography } from "@mui/material";
import ContentCopyOutlined from "@mui/icons-material/ContentCopyOutlined";

type Props = {
  newKey: string;
  copied: boolean;
  onCopy: (key: string) => void;
  onDismiss: () => void;
};

const NewKeyBanner: React.FC<Props> = ({ newKey, copied, onCopy, onDismiss }) => {
  const { t } = useTranslation("dashboard");

  return (
    <Alert
      severity="success"
      onClose={onDismiss}
      sx={{ mb: 2.5, borderRadius: "10px", fontSize: "0.82rem", "& .MuiAlert-message": { width: "100%" } }}
      action={
        <Tooltip title={copied ? t("pages.settings.api_keys.copied") : t("pages.settings.api_keys.copy")}>
          <IconButton size="small" onClick={() => onCopy(newKey)}>
            <ContentCopyOutlined sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      }
    >
      <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, mb: 0.5 }}>
        {t("pages.settings.api_keys.banner_title")}
      </Typography>
      <Box sx={{ fontFamily: "monospace", fontSize: "0.8rem", bgcolor: "#F0FDF4", px: 1.5, py: 0.75, borderRadius: "6px", wordBreak: "break-all" }}>
        {newKey}
      </Box>
    </Alert>
  );
};

export default NewKeyBanner;
