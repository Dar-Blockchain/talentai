/**
 * LoadingOverlay — centred spinner for async loading states.
 *
 * Usage:
 *   if (loading) return <LoadingOverlay />;
 *   if (loading) return <LoadingOverlay height={400} message="Loading campaigns…" />;
 */

import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

export interface LoadingOverlayProps {
  /** Container height (default "100%") */
  height?: string | number;
  /** Optional message below the spinner */
  message?: string;
  /** Spinner colour (default teal) */
  color?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  height = "100%",
  message,
  color = "#0D9488",
}) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height,
      minHeight: 160,
      gap: 2,
    }}
  >
    <CircularProgress sx={{ color }} size={36} />
    {message && (
      <Typography sx={{ fontSize: "0.875rem", color: "#6b7280" }}>{message}</Typography>
    )}
  </Box>
);

export default LoadingOverlay;
