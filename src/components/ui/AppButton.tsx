"use client";

import React, { ReactNode } from "react";
import { Button, CircularProgress, ButtonProps } from "@mui/material";

/* ----------------------------------
 * Types
 * ---------------------------------- */

type AppButtonSize = "xs" | "small" | "medium" | "large";

export type AppButtonVariant = "contained" | "outlined" | "text" | "primary" | "danger";

interface AppButtonProps extends Omit<ButtonProps, "size" | "variant"> {
  label: string;
  loading?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  size?: AppButtonSize;
  variant?: AppButtonVariant;
}

/* ----------------------------------
 * Size Styles
 * ---------------------------------- */

const sizeStyles: Record<AppButtonSize, object> = {
  xs: { fontSize: "10px", px: 1.25, py: 0.25, borderRadius: 2 },
  small: { fontSize: "12px", px: 1.75, py: 0.5, borderRadius: 3 },
  medium: { fontSize: "13px", px: 2, py: 0.75, borderRadius: 2 },
  large: { fontSize: "14px", px: 2.5, py: 1, borderRadius: 4 },
};

/* ----------------------------------
 * Maps custom variants → MUI variant
 * ---------------------------------- */

const muiVariantMap: Record<AppButtonVariant, "contained" | "outlined" | "text"> = {
  contained: "contained",
  outlined: "outlined",
  text: "text",
  primary: "contained",
  danger: "outlined",
};

/* ----------------------------------
 * Variant Styles
 * ---------------------------------- */

const buildVariantStyles = (variant: AppButtonVariant, isDisabled: boolean): object => {
  const opacity = isDisabled ? 0.7 : 1;

  switch (variant) {
    case "contained":
      return {
        bgcolor: "#0D9488",
        color: "#fff",
        "&:hover": !isDisabled ? { bgcolor: "#0b7a6f" } : {},
        opacity,
      };
    case "outlined":
      return {
        borderColor: "#0D9488",
        color: "#0D9488",
        "&:hover": !isDisabled ? { bgcolor: "#F0FDFA" } : {},
        opacity,
      };
    case "text":
      return {
        color: "#0D9488",
        "&:hover": !isDisabled ? { bgcolor: "#F0FDFA" } : {},
        opacity,
      };
    case "primary":
      return {
        bgcolor: "#8310FF",
        color: "#fff",
        boxShadow: "none",
        "&:hover": !isDisabled ? { bgcolor: "#7209E6", boxShadow: "none" } : {},
        opacity,
      };
    case "danger":
      return {
        borderColor: "#EF4444",
        borderWidth: 1.2,
        color: "#EF4444",
        "&:hover": !isDisabled ? { borderColor: "#EF4444", bgcolor: "#FEF2F2" } : {},
        opacity,
      };
  }
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

  const spinnerColor =
    variant === "contained" || variant === "primary"
      ? "#fff"
      : variant === "danger"
        ? "#EF4444"
        : "#0D9488";

  return (
    <Button
      variant={muiVariantMap[variant]}
      disabled={isDisabled}
      startIcon={
        loading ? (
          <CircularProgress size={size === "xs" ? 12 : 14} sx={{ color: spinnerColor }} />
        ) : (
          startIcon
        )
      }
      endIcon={endIcon}
      sx={{
        textTransform: "none",
        fontWeight: 600,
        lineHeight: 1.2,
        ...sizeStyles[size],
        ...buildVariantStyles(variant, isDisabled),
        ...sx,
      }}
      {...rest}
    >
      {label}
    </Button>
  );
};

export default AppButton;
