"use client";

import React from "react";
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { Event as EventIcon, Clear as ClearIcon } from "@mui/icons-material";
import dayjs, { Dayjs } from "dayjs";

interface AppDatePickerProps {
  value: string | null;
  onChange: (date: string | null) => void;
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  minDate?: Dayjs;
  maxDate?: Dayjs;
  disablePast?: boolean;
  disableFuture?: boolean;
  size?: "small" | "medium";
  fullWidth?: boolean;
  placeholder?: string;
}

export const AppDatePicker: React.FC<AppDatePickerProps> = ({
  value,
  onChange,
  label,
  error,
  required,
  disabled = false,
  minDate,
  maxDate,
  disablePast,
  disableFuture,
  size = "medium",
  fullWidth = true,
  placeholder = "Select date",
}) => {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);

  const handleChange = (newValue: Dayjs | null) => {
    onChange(newValue ? newValue.toISOString() : null);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, width: fullWidth ? "100%" : "auto" }}>
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

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          open={open}
          onClose={() => setOpen(false)}
          value={value ? dayjs(value) : null}
          onChange={handleChange}
          minDate={minDate}
          maxDate={maxDate}
          disablePast={disablePast}
          disableFuture={disableFuture}
           enableAccessibleFieldDOMStructure={false}
          slots={{
            textField: (params) => (
              <TextField
                {...params}
                placeholder={placeholder}
                disabled={disabled}
                size={size}
                error={!!error}
                helperText={error}
                fullWidth={fullWidth}
                onClick={() => setOpen(true)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    fontSize: 13,
                    height: 38,
                    bgcolor: disabled ? "#F3F4F6" : "#fff",
                    cursor: disabled ? "default" : "pointer",
                    "&:hover fieldset": {
                      borderColor: error ? "#EF4444" : "#D1D5DB",
                    },
                    "&.Mui-focused fieldset": {
                      borderWidth: 2,
                      borderColor: error ? "#EF4444" : "#3B82F6",
                    },
                    "& fieldset": {
                      borderColor: error ? "#EF4444" : "#E5E7EB",
                    },
                  },
                  "& .MuiOutlinedInput-input": {
                    cursor: disabled ? "default" : "pointer",
                  },
                }}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <EventIcon
                        sx={{
                          fontSize: size === "small" ? 18 : 20,
                          color: error ? "#EF4444" : "#6B7280",
                        }}
                      />
                    </InputAdornment>
                  ),
                  endAdornment: value && !disabled ? (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={handleClear} edge="end">
                        <ClearIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                }}
              />
            ),
          }}
          slotProps={{
            popper: {
              sx: {
                "& .MuiPaper-root": {
                  borderRadius: 3,
                  boxShadow: theme.shadows[10],
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  mt: 1,
                },
                "& .MuiPickersDay-root": {
                  borderRadius: 2,
                  "&.Mui-selected": {
                    backgroundColor: theme.palette.primary.main,
                    "&:hover": {
                      backgroundColor: theme.palette.primary.dark,
                    },
                  },
                },
                "& .MuiDayCalendar-weekDayLabel": {
                  fontWeight: 600,
                  color: theme.palette.text.secondary,
                },
              },
            },
          }}
        />
      </LocalizationProvider>
    </Box>
  );
};