import React from "react";
import { TextField, SxProps, Theme } from "@mui/material";
import { fieldSx } from "@/modules/settings/shared/constants";

interface SettingsTextFieldProps {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  placeholder?: string;
  fullWidth?: boolean;
  sx?: SxProps<Theme>;
}

const SettingsTextField: React.FC<SettingsTextFieldProps> = ({
  label,
  value,
  onChange,
  disabled = false,
  required = false,
  error = false,
  helperText = "",
  placeholder,
  fullWidth = true,
  sx,
}) => (
  <TextField
    label={label}
    value={value}
    onChange={onChange ? (e) => onChange(e.target.value) : undefined}
    disabled={disabled}
    fullWidth={fullWidth}
    required={required}
    error={error}
    helperText={helperText}
    placeholder={placeholder}
    sx={{ ...fieldSx, ...sx }}
  />
);

export default SettingsTextField;
