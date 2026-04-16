import React from "react";
import { Box, Typography } from "@mui/material";

export interface EmptyStateProps {
  /** Icon element rendered in the circle */
  icon: React.ReactNode;
  title: string;
  description?: string;
  /** Optional action button / link */
  action?: React.ReactNode;
  /** Controls overall height. Defaults to "auto". */
  minHeight?: string | number;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  minHeight = 260,
}) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight,
      py: 6,
      px: 3,
      textAlign: "center",
      gap: 2,
    }}
  >
    {/* Icon circle */}
    <Box
      sx={{
        width: 72,
        height: 72,
        borderRadius: "50%",
        backgroundColor: "#f3f4f6",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#9ca3af",
        "& svg": { fontSize: 36 },
      }}
    >
      {icon}
    </Box>

    <Box>
      <Typography
        sx={{ fontWeight: 700, fontSize: "1.0625rem", color: "#374151", mb: 0.5 }}
      >
        {title}
      </Typography>
      {description && (
        <Typography sx={{ fontSize: "0.875rem", color: "#9ca3af", maxWidth: 340 }}>
          {description}
        </Typography>
      )}
    </Box>

    {action && <Box>{action}</Box>}
  </Box>
);

export default EmptyState;
