"use client";

import React from "react";
import {
  Box,
  TextField,
  InputAdornment,
  Typography,
  SxProps,
  Theme,
} from "@mui/material";

interface AppInputProps {
  label?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  error?: string;
  fullWidth?: boolean;
  sx?: SxProps<Theme>;
  type?: string;
  multiline?: boolean;
  rows?: number;
}

const AppInput = React.memo<AppInputProps>(({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  disabled = false,
  required = false,
  startIcon,
  endIcon,
  error,
  fullWidth = true,
  sx,
  type = "text",
  multiline = false,
  rows = 3,
}) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, ...sx }}>
      {label && (
        <Typography
          sx={{
            fontSize: 12,
            fontWeight: 600,
            color: "#374151",
            letterSpacing: 0.3,
            textTransform: "uppercase",
          }}
          variant="subtitle2"
        >
          {label}
          {required && <span style={{ color: "#EF4444", marginLeft: 2 }}>*</span>}
        </Typography>
      )}

      <TextField
        variant="outlined"
        size="small"
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        fullWidth={fullWidth}
        error={Boolean(error)}
        multiline={multiline}
        rows={multiline ? rows : undefined}
        InputProps={{
          startAdornment: startIcon ? (
            <InputAdornment position="start">{startIcon}</InputAdornment>
          ) : undefined,
          endAdornment: endIcon ? (
            <InputAdornment position="end">{endIcon}</InputAdornment>
          ) : undefined,
          sx: {
            bgcolor: disabled ? "#F3F4F6" : "#fff",
            borderRadius: 2,
            fontSize: "13px",
            height: multiline ? "auto" : 38,
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: error ? "#EF4444" : "#E5E7EB",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: error ? "#EF4444" : "#D1D5DB",
            },
          },
        }}
      />
      {error && (
        <Typography sx={{ fontSize: "11px", color: "#EF4444" }}>{error}</Typography>
      )}
    </Box>
  );
});

export default AppInput;
