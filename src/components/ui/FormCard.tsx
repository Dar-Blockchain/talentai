"use client";

import React from "react";
import {
  Box,
  Typography,
  Card,
  CardHeader,
  CardContent,
  alpha,
  useTheme,
} from "@mui/material";

const FormCard = ({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) => {
  const theme = useTheme();

  return (
    <Card
      elevation={0}
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      <CardHeader
        avatar={
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              color: theme.palette.primary.main,
            }}
          >
            {icon}
          </Box>
        }
        title={
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
        }
        subheader={
          subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )
        }
        sx={{ p: 2, pb: 0 }}
      />
      <CardContent sx={{ p: 2, pt: 2 }}>{children}</CardContent>
    </Card>
  );
};

export default FormCard;
