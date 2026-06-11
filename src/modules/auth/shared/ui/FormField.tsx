import React from "react";
import { Box } from "@mui/material";
import { Controller } from "react-hook-form";
import type { Control, FieldPath, FieldValues, RegisterOptions } from "react-hook-form";
import AppInput from "@/modules/shared/ui/AppInput";
import AppSelect from "@/modules/shared/ui/AppSelect";

const ICON_SX = { fontSize: 18, color: "#9CA3AF" } as const;
const half = { flex: "1 1 100%", minWidth: 0, "@media (min-width:1025px)": { flex: "1 1 calc(50% - 12px)" } };
const full = { flex: "1 1 100%" };

interface SelectOption { label: string; value: string; }

interface FormFieldProps<T extends FieldValues> {
  name:        FieldPath<T>;
  control:     Control<T>;
  rules?:      RegisterOptions<T, FieldPath<T>>;
  label:       string;
  placeholder?: string;
  type?:       string;
  disabled?:   boolean;
  error?:      string;
  icon:        React.ReactElement<any>;
  /** "half" = 50% on desktop, "full" = always 100% */
  width?:      "half" | "full";
  /** Render as a Select instead of Input */
  options?:    SelectOption[];
  /** Override the value shown (e.g. for read-only email prefill) */
  overrideValue?: string;
}

export function FormField<T extends FieldValues>({
  name, control, rules, label, placeholder, type, disabled, error,
  icon, width = "half", options, overrideValue,
}: FormFieldProps<T>) {
  return (
    <Box sx={width === "half" ? half : full}>
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field }) =>
          options ? (
            <AppSelect
              label={label}
              placeholder={placeholder}
              required={!!rules?.required}
              disabled={disabled}
              error={error}
              options={options}
              value={(overrideValue ?? field.value) ?? ""}
              onChange={(v) => field.onChange(v)}
            />
          ) : (
            <AppInput
              label={label}
              placeholder={placeholder}
              type={type}
              required={!!rules?.required}
              disabled={disabled}
              error={error}
              startIcon={React.cloneElement(icon, { sx: ICON_SX })}
              value={overrideValue ?? field.value ?? ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )
        }
      />
    </Box>
  );
}
