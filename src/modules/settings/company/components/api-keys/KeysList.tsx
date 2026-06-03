import React from "react";
import { useTranslation } from "react-i18next";
import { Box, CircularProgress, Typography } from "@mui/material";
import KeyOutlined from "@mui/icons-material/KeyOutlined";
import type { ApiKey } from "@/modules/settings/company/types";
import { TEAL } from "@/modules/settings/shared/constants";
import KeyCard from "./KeyCard";

type Props = {
  apiKeys: ApiKey[];
  loading: boolean;
  onEdit:       (key: ApiKey) => void;
  onDelete:     (key: ApiKey) => void;
  onToggle:     (id: string, isActive: boolean) => void;
  onRegenerate: (id: string) => void;
};

const KeysList: React.FC<Props> = ({ apiKeys, loading, onEdit, onDelete, onToggle, onRegenerate }) => {
  const { t } = useTranslation("dashboard");

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress size={28} sx={{ color: TEAL }} />
      </Box>
    );
  }

  if (apiKeys.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 8, color: "#9CA3AF" }}>
        <KeyOutlined sx={{ fontSize: 40, mb: 1, opacity: 0.4 }} />
        <Typography sx={{ fontSize: "0.88rem" }}>{t("pages.settings.api_keys.no_keys")}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      {apiKeys.map((k) => (
        <KeyCard
          key={k.id}
          apiKey={k}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggle={onToggle}
          onRegenerate={onRegenerate}
        />
      ))}
    </Box>
  );
};

export default KeysList;
