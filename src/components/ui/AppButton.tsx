"use client";

import React, { ReactNode } from "react";
import { Button, CircularProgress, ButtonProps } from "@mui/material";

/* ----------------------------------
 * Types
 * ---------------------------------- */

type AppButtonSize = "xs" | "small" | "medium" | "large";

interface AppButtonProps extends Omit<ButtonProps, "size"> {
  label: string;
  loading?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  size?: AppButtonSize;
}

/* ----------------------------------
 * Size Styles
 * ---------------------------------- */

const sizeStyles: Record<AppButtonSize, any> = {
  xs: {
    fontSize: "10px",
    px: 1.25,
    py: 0.25,
    borderRadius: 4,
  },
  small: {
    fontSize: "12px",
    px: 1.75,
    py: 0.5,
    borderRadius: 5,
  },
  medium: {
    fontSize: "13px",
    px: 2,
    py: 0.75,
    borderRadius: 5,
  },
  large: {
    fontSize: "14px",
    px: 2.5,
    py: 1,
    borderRadius: 6,
  },
};

/* ----------------------------------
 * AppButton Component
 * ---------------------------------- */

const AppButton: React.FC<AppButtonProps> = ({
  label,
  loading = false,
  disabled = false,
  startIcon,
  endIcon,
  variant = "contained",
  size = "medium",
  sx,
  ...rest
}) => {
  const isDisabled = disabled || loading;

  const baseStyles = {
    textTransform: "none",
    fontWeight: 600,
    lineHeight: 1.2,
  };

  const variantStyles =
    variant === "contained"
      ? {
          bgcolor: "#0D9488",
          color: "#fff",
          "&:hover": !isDisabled ? { bgcolor: "#0b7a6f" } : {},
          opacity: isDisabled ? 0.7 : 1,
        }
      : variant === "outlined"
      ? {
          borderColor: "#0D9488",
          color: "#0D9488",
          "&:hover": !isDisabled ? { bgcolor: "#F0FDFA" } : {},
          opacity: isDisabled ? 0.7 : 1,
        }
      : {};

  return (
    <Button
      variant={variant}
      disabled={isDisabled}
      startIcon={
        loading ? (
          <CircularProgress
            size={size === "xs" ? 12 : 14}
            sx={{ color: variant === "contained" ? "#fff" : "#0D9488" }}
          />
        ) : (
          startIcon
        )
      }
      endIcon={endIcon}
      sx={{
        ...baseStyles,
        ...sizeStyles[size], // ✅ xs support
        ...variantStyles,
        ...sx,
      }}
      {...rest}
    >
      {label}
    </Button>
  );
};

export default AppButton;