"use client";

import React from "react";
import {
  Box,
  FormControl,
  Select,
  MenuItem,
  Typography,
  FormHelperText,
  SelectChangeEvent,
  alpha,
} from "@mui/material";
import { KeyboardArrowDown } from "@mui/icons-material";

interface AppSelectProps {
  label?: string;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  options: { label: string; value: string }[];
  required?: boolean;
  multiple?: boolean;
  error?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  placeholder?: string;
  size?: "small" | "medium";
  columns?: number;
  sx?: object;
}

const AppSelect = React.memo<AppSelectProps>(({
  label,
  value,
  onChange,
  options,
  required = false,
  multiple = false,
  error,
  disabled = false,
  fullWidth = true,
  placeholder = "Select an option",
  size = "small",
  columns,
  sx,
}) => {
  const handleChange = (event: SelectChangeEvent<any>) => {
    const selectedValue = event.target.value;
    onChange(multiple ? (selectedValue as string[]) : (selectedValue as string));
  };

  const renderValue = (selected: any) => {
    if (multiple) {
      if (!selected || (selected as string[]).length === 0) return <span style={{ color: "#9CA3AF" }}>{placeholder}</span>;
      return (selected as string[]).map((v) => options.find((o) => o.value === v)?.label).filter(Boolean).join(", ");
    } else {
      if (!selected) return <span style={{ color: "#9CA3AF" }}>{placeholder}</span>;
      return options.find((o) => o.value === selected)?.label || selected;
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 0.5,
        width: fullWidth ? "100%" : "auto",
        ...sx,
      }}
    >
      {label && (
        <Typography
          sx={{
            fontSize: size === "small" ? 12 : 13,
            fontWeight: 600,
            color: "#374151",
            letterSpacing: 0.3,
            textTransform: "uppercase",
          }}
        >
          {label}
          {required && <span style={{ color: "#EF4444", marginLeft: 2 }}>*</span>}
        </Typography>
      )}

      <FormControl
        variant="outlined"
        fullWidth={fullWidth}
        error={Boolean(error)}
        disabled={disabled}
        size={size}
        sx={{
          "& .MuiOutlinedInput-root": {
            bgcolor: disabled ? "#F3F4F6" : "#fff",
            borderRadius: 2,
            fontSize: "13px",
            height: 38,
          },
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: error ? "#EF4444" : "#E5E7EB",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: error ? "#EF4444" : "#D1D5DB",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: error ? "#EF4444" : "#D1D5DB",
            boxShadow: `0 0 0 4px ${alpha(error ? "#EF4444" : "#0D9488", 0.1)}`,
          },
          "& .MuiSelect-icon": {
            color: "#9CA3AF",
          },
        }}
      >
        <Select
          value={value}
          onChange={handleChange}
          multiple={multiple}
          displayEmpty
          renderValue={renderValue}
          IconComponent={KeyboardArrowDown}
          MenuProps={{
            PaperProps: {
              sx: {
                mt: 0.5,
                borderRadius: 2,
                border: "1px solid #E5E7EB",
                boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                ...(columns && { minWidth: columns * 120 }),
                "& .MuiList-root": {
                  p: 0.5,
                },
              },
            },
          }}
        >
          {!multiple && (
            <MenuItem
              value=""
              sx={{
                fontSize: "13px",
                color: "#9CA3AF",
                borderRadius: 1.5,
                mx: 0.5,
                "&:hover": { bgcolor: "#F9FAFB" },
              }}
            >
              {placeholder}
            </MenuItem>
          )}
          {columns ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                p: 0.5,
              }}
            >
              {options.map((option) => (
                <MenuItem
                  key={option.value}
                  value={option.value}
                  sx={{
                    fontSize: "13px",
                    color: "#374151",
                    borderRadius: 1.5,
                    justifyContent: "center",
                    border: "1px solid #F3F4F6",
                    m: "2px",
                    "&:hover": { bgcolor: "#F0FDFA", color: "#0D9488", borderColor: "#99F6E4" },
                    "&.Mui-selected": {
                      bgcolor: "#F0FDFA",
                      color: "#0D9488",
                      fontWeight: 600,
                      borderColor: "#99F6E4",
                      "&:hover": { bgcolor: "#CCFBF1" },
                    },
                  }}
                >
                  {option.label}
                </MenuItem>
              ))}
            </Box>
          ) : (
            options.map((option) => (
              <MenuItem
                key={option.value}
                value={option.value}
                sx={{
                  fontSize: "13px",
                  color: "#374151",
                  borderRadius: 1.5,
                  mx: 0.5,
                  borderBottom: "1px solid #F3F4F6",
                  "&:last-child": { borderBottom: "none" },
                  "&:hover": { bgcolor: "#F0FDFA", color: "#0D9488" },
                  "&.Mui-selected": {
                    bgcolor: "#F0FDFA",
                    color: "#0D9488",
                    fontWeight: 600,
                    "&:hover": { bgcolor: "#CCFBF1" },
                  },
                }}
              >
                {option.label}
              </MenuItem>
            ))
          )}
        </Select>
      </FormControl>

      {error && (
        <FormHelperText sx={{ color: "#EF4444", fontSize: 11, ml: 0.5 }}>
          {error}
        </FormHelperText>
      )}
    </Box>
  );
});

export default AppSelect;