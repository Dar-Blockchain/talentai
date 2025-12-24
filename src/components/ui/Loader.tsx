import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

interface LoaderProps {
  title?: string;
  subtitle?: string;
  size?: number;
  thickness?: number;
  color?: string;
  sx?: object;
}

const Loader: React.FC<LoaderProps> = ({
  title,
  subtitle,
  size = 80,
  thickness = 2,
  color = "rgba(41, 210, 145, 1)",
  sx = {},
}) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      {...sx}
    >
      <CircularProgress size={size} thickness={thickness} sx={{ color }} />
      {title && (
        <Typography
          sx={{
            mt: 2,
            fontSize: "16px",
            fontWeight: 500,
            lineHeight: "22px",
            color: "rgba(24, 25, 28, 1)",
          }}
        >
          {title}
        </Typography>
      )}
      {subtitle && (
        <Typography
          sx={{
            mt: 1,
            fontSize: "14px",
            fontWeight: 400,
            lineHeight: "20px",
            color: "rgba(84, 98, 116, 0.8)",
          }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
  );
};

export default Loader;
