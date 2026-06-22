import React from "react";

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
  className?: string;
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
  className = "",
}) => (
  <label className={`flex flex-col gap-1.5 ${fullWidth ? "w-full" : ""} ${className}`}>
    <span className="text-sm text-gray-600">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </span>
    <input
      value={value}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      disabled={disabled}
      placeholder={placeholder}
      className={`rounded-[10px] border px-3 py-2 text-sm outline-none transition-colors disabled:bg-gray-50 disabled:text-gray-500 ${
        error ? "border-red-400 focus:border-red-500" : "border-gray-300 focus:border-teal-600"
      }`}
    />
    {helperText && (
      <span className={`text-xs ${error ? "text-red-500" : "text-gray-400"}`}>{helperText}</span>
    )}
  </label>
);

export default SettingsTextField;
