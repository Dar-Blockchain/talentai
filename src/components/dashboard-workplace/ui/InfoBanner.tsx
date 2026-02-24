/**
 * InfoBanner — inline alert / hint box (info, warning, success, error).
 *
 * Usage:
 *   <InfoBanner type="warning" message="3 employees are below the required skill level." />
 *   <InfoBanner type="info" icon={<LightbulbOutlined />} message="Tip: ..." />
 */

import React from "react";
import { Box, Typography } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import ErrorOutlinedIcon from "@mui/icons-material/ErrorOutlined";

type BannerType = "info" | "warning" | "success" | "error";

const TYPE_CONFIG: Record<
  BannerType,
  { bg: string; border: string; color: string; Icon: React.ElementType }
> = {
  info:    { bg: "#eff6ff", border: "#bfdbfe", color: "#1e40af", Icon: InfoOutlinedIcon },
  warning: { bg: "#fffbeb", border: "#fde68a", color: "#92400e", Icon: WarningAmberOutlinedIcon },
  success: { bg: "#f0fdf4", border: "#bbf7d0", color: "#166534", Icon: CheckCircleOutlinedIcon },
  error:   { bg: "#fef2f2", border: "#fecaca", color: "#991b1b", Icon: ErrorOutlinedIcon },
};

export interface InfoBannerProps {
  type?: BannerType;
  /** Override the default icon */
  icon?: React.ReactNode;
  message: React.ReactNode;
  /** Optional action rendered to the right of the message */
  action?: React.ReactNode;
}

const InfoBanner: React.FC<InfoBannerProps> = ({
  type = "info",
  icon,
  message,
  action,
}) => {
  const { bg, border, color, Icon } = TYPE_CONFIG[type];
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        p: 2,
        borderRadius: 2,
        backgroundColor: bg,
        border: `1px solid ${border}`,
      }}
    >
      <Box sx={{ color, flexShrink: 0, display: "flex", alignItems: "center" }}>
        {icon ?? <Icon sx={{ fontSize: 20 }} />}
      </Box>
      <Typography
        variant="body2"
        sx={{ color, flex: 1, fontWeight: 500, lineHeight: 1.5 }}
      >
        {message}
      </Typography>
      {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
    </Box>
  );
};

export default InfoBanner;
