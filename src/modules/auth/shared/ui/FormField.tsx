import React from "react";
import { Controller } from "react-hook-form";
import type { Control, FieldPath, FieldValues, RegisterOptions } from "react-hook-form";
import { Input } from "@/modules/shared/ui/shadcn/input";
import { Label } from "@/modules/shared/ui/shadcn/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/modules/shared/ui/shadcn/select";
import { cn } from "@/lib/utils";
import { emailKeyDownGuard } from "@/lib/validation/email";

interface SelectOption { label: string; value: string; }

interface FormFieldProps<T extends FieldValues> {
  name:           FieldPath<T>;
  control:        Control<T>;
  rules?:         RegisterOptions<T, FieldPath<T>>;
  label:          string;
  placeholder?:   string;
  type?:          string;
  disabled?:      boolean;
  error?:         string;
  icon?:          React.ReactNode;
  /** "half" = 50% on desktop via grid, "full" = always full width */
  width?:         "half" | "full";
  options?:       SelectOption[];
  overrideValue?: string;
}

export function FormField<T extends FieldValues>({
  name, control, rules, label, placeholder, type, disabled, error,
  icon, width = "half", options, overrideValue,
}: FormFieldProps<T>) {
  return (
    <div className={cn(width === "full" && "col-span-full")}>
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field }) => (
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground uppercase tracking-wider font-sans">
              {label}
              {rules?.required && <span className="text-destructive ml-0.5">*</span>}
            </Label>

            {options ? (
              <Select
                value={(overrideValue ?? field.value) ?? ""}
                onValueChange={(v) => field.onChange(v)}
                disabled={disabled}
              >
                <SelectTrigger className={cn(error && "border-destructive focus:ring-destructive/30")}>
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="relative">
                {icon && (
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none flex items-center">
                    {icon}
                  </span>
                )}
                <Input
                  type={type}
                  placeholder={placeholder}
                  disabled={disabled}
                  value={overrideValue ?? field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  onKeyDown={type === "email" ? emailKeyDownGuard : undefined}
                  aria-invalid={!!error}
                  className={cn(
                    "h-10 text-sm font-sans",
                    icon && "pl-9",
                    error && "border-destructive focus-visible:ring-destructive/30",
                  )}
                />
              </div>
            )}

            {error && (
              <p className="text-xs text-destructive font-sans">{error}</p>
            )}
          </div>
        )}
      />
    </div>
  );
}
