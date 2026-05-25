"use client";

import React from "react";
import { Box, Typography, SxProps, Theme } from "@mui/material";

interface AppUserInfoProps {
  name: string;
  subtitle?: string;
  icon?: React.ReactNode;
  iconBgColor?: string;
  sx?: SxProps<Theme>;
}

const AppUserInfo: React.FC<AppUserInfoProps> = ({ name, subtitle, icon, iconBgColor = "#F0FDFA", sx }) => {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, ...sx }}>
      {icon && (
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            bgcolor: iconBgColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      )}
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Typography
          sx={{
            fontSize: 18,
            fontWeight: 700,
            color: "#111827",
            lineHeight: 1.3,
          }}
        >
          {name}
        </Typography>
        {subtitle && (
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 400,
              color: "#9CA3AF",
              lineHeight: 1.4,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default AppUserInfo;
