"use client";

import React from "react";
import { Autocomplete, TextField, Typography, Box, SxProps, Theme } from "@mui/material";

interface AppAutocompleteProps {
  label?: string;
  value?: string | null;
  onChange?: (value: string | null) => void;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  fullWidth?: boolean;
  sx?: SxProps<Theme>;
}

const AppAutocomplete = React.memo<AppAutocompleteProps>(({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  required = false,
  error,
  fullWidth = true,
  sx,
}) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, width: fullWidth ? "100%" : "auto", ...sx }}>
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

      <Autocomplete
        options={options}
        value={value ?? null}
        onChange={(_, v) => onChange?.(v)}
        disabled={disabled}
        fullWidth={fullWidth}
        renderInput={(params) => (
          <TextField
            {...params}
            size="small"
            placeholder={placeholder}
            error={Boolean(error)}
            helperText={error}
            FormHelperTextProps={{ sx: { fontSize: "11px", color: "#EF4444", ml: 0 } }}
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: disabled ? "#F3F4F6" : "#fff",
                borderRadius: 2,
                fontSize: "13px",
                height: 38,
                flexWrap: "nowrap",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: error ? "#EF4444" : "#E5E7EB",
              },
              "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: error ? "#EF4444" : "#D1D5DB",
              },
            }}
          />
        )}
        slotProps={{
          paper: {
            sx: {
              mt: 0.5,
              borderRadius: 2,
              border: "1px solid #E5E7EB",
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
              "& .MuiAutocomplete-option": {
                fontSize: "13px",
                color: "#374151",
                borderRadius: 1.5,
                mx: 0.5,
                my: "2px",
                "&:hover": { bgcolor: "#F0FDFA", color: "#0D9488" },
                '&[aria-selected="true"]': {
                  bgcolor: "#F0FDFA",
                  color: "#0D9488",
                  fontWeight: 600,
                },
              },
            },
          },
        }}
      />
    </Box>
  );
});

export default AppAutocomplete;
