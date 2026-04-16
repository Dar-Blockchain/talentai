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
  sx?: object;
}

const AppSelect: React.FC<AppSelectProps> = ({
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
          
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: error ? "#EF4444" : "#D1D5DB",
            borderRadius: 2,
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: error ? "#EF4444" : "#D1D5DB",
            borderRadius: 2,
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: error ? "#EF4444" : "#D1D5DB",
            boxShadow: `0 0 0 4px ${alpha(error ? "#EF4444" : "#0D9488", 0.1)}`,
            borderRadius: 2,
          },
          "& .MuiSelect-icon": {
            color: "#9CA3AF",
            borderRadius: 2,
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
        >
          {!multiple && (
            <MenuItem value="">
              <span style={{ color: "#9CA3AF" }}>{placeholder}</span>
            </MenuItem>
          )}
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {error && (
        <FormHelperText sx={{ color: "#EF4444", fontSize: 11, ml: 0.5 }}>
          {error}
        </FormHelperText>
      )}
    </Box>
  );
};

export default AppSelect;