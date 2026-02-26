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
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  error?: string;
  fullWidth?: boolean;
  sx?: SxProps<Theme>;
  type?: string;
  multiline?: boolean; // added
  rows?: number;       // added
}

const AppInput: React.FC<AppInputProps> = ({
  label,
  value,
  onChange,
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
  rows = 3, // default rows for multiline
}) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, ...sx }}>
      {/* {label && (
        <Typography
          sx={{
            fontSize: "13px",
            fontWeight: 600,
            color: "#111827",
          }}
        >
          {label}
          {required && <span style={{ color: "#EF4444" }}> *</span>}
        </Typography>
      )} */}

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
        fullWidth={fullWidth}
        error={Boolean(error)}
        multiline={multiline} // added
        rows={multiline ? rows : undefined} // only apply rows if multiline
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
            height: multiline ? "auto" : 38, // adjust height for multiline
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
};

export default AppInput;