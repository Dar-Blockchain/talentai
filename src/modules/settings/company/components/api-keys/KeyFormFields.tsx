import React from "react";
import { useTranslation } from "react-i18next";
import { Controller, useWatch, type Control, type FieldErrors } from "react-hook-form";
import { Box, Chip, Divider, DialogContent, DialogActions, Typography } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { type Dayjs } from "dayjs";
import AppInput  from "@/modules/shared/ui/AppInput";
import AppSelect from "@/modules/shared/ui/AppSelect";
import { FieldLabel } from "@/modules/settings/shared/components";
import { TEAL, TEAL_BORDER, AVAILABLE_SCOPES } from "@/modules/settings/shared/constants";

import { type KeyFormState } from "../../schemas/apiKeySchema";
import { datePickerInputSx } from "./styles";

// ─── Scope chips (read-only) ──────────────────────────────────────────────────

export const ScopeChips = () => (
  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
    {AVAILABLE_SCOPES.map((s) => (
      <Chip key={s} label={s} size="small"
        sx={{ height: 26, fontSize: "0.72rem", fontWeight: 600, bgcolor: "rgba(13,148,136,0.1)", color: TEAL, border: `1px solid ${TEAL_BORDER}`, cursor: "default", pointerEvents: "none" }}
      />
    ))}
  </Box>
);

// ─── Dialog layout wrapper ────────────────────────────────────────────────────

export const DialogForm = ({
  fields,
  children,
}: {
  fields: React.ReactNode;
  children: React.ReactNode;
}) => (
  <>
    <DialogContent sx={{ pt: 2.5 }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>{fields}</Box>
    </DialogContent>
    <Divider />
    <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>{children}</DialogActions>
  </>
);

// ─── Shared form fields ───────────────────────────────────────────────────────

export const KeyFormFields = ({
  control,
  errors,
}: {
  control: Control<KeyFormState>;
  errors: FieldErrors<KeyFormState>;
}) => {
  const { t } = useTranslation("dashboard");
  const ipMode = useWatch({ control, name: "ipMode" });

  const ipModeOptions = [
    { label: t("pages.settings.api_keys.fields.ip_all"),    value: "all"    },
    { label: t("pages.settings.api_keys.fields.ip_custom"), value: "custom" },
  ];

  return (
    <>
      <Controller name="name" control={control} render={({ field }) => (
        <AppInput
          label={t("pages.settings.api_keys.fields.key_name")}
          {...field}
          placeholder={t("pages.settings.api_keys.fields.key_name_placeholder")}
          error={errors.name?.message}
          required
        />
      )} />

      <Controller name="serviceName" control={control} render={({ field }) => (
        <AppInput
          label={t("pages.settings.api_keys.fields.service_name")}
          {...field}
          value={field.value ?? ""}
          placeholder={t("pages.settings.api_keys.fields.service_placeholder")}
        />
      )} />

      <Box>
        <FieldLabel text={t("pages.settings.api_keys.fields.scopes")} />
        <ScopeChips />
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
        <Controller name="rateLimit" control={control} render={({ field }) => (
          <AppInput
            label={t("pages.settings.api_keys.fields.rate_limit")}
            value={field.value > 0 ? String(field.value) : ""}
            placeholder="e.g. 100"
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "");
              field.onChange(digits ? Number(digits) : 0);
            }}
            error={errors.rateLimit?.message}
            required
          />
        )} />

        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          <Typography variant="subtitle2" sx={{ fontSize: 12, fontWeight: 600, color: "#374151", letterSpacing: 0.3, textTransform: "uppercase" }}>
            {t("pages.settings.api_keys.fields.expires_at")}
            <span style={{ color: "#EF4444", marginLeft: 2 }}>*</span>
          </Typography>
          <Controller name="expiresAt" control={control} render={({ field }) => (
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                value={field.value ? dayjs(field.value) : null}
                onChange={(v: Dayjs | null) => field.onChange(v ? v.format("YYYY-MM-DD") : "")}
                disablePast
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small",
                    InputProps: {
                      sx: {
                        ...datePickerInputSx,
                        "& .MuiInputAdornment-root .MuiIconButton-root": {
                          color: TEAL,
                          padding: "4px",
                          "&:hover": { bgcolor: "rgba(13,148,136,0.08)", borderRadius: "6px" },
                        },
                      },
                    },
                  },
                  popper: {
                    sx: {
                      "& .MuiPaper-root": { borderRadius: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" },
                      "& .MuiPickersDay-root.Mui-selected": { bgcolor: TEAL },
                      "& .MuiPickersDay-root:not(.Mui-selected):hover": { bgcolor: "rgba(13,148,136,0.08)" },
                    },
                  },
                }}
              />
            </LocalizationProvider>
          )} />
          {errors.expiresAt && (
            <Typography sx={{ fontSize: "11px", color: "#EF4444" }}>{errors.expiresAt.message}</Typography>
          )}
        </Box>
      </Box>

      <Controller name="ipMode" control={control} render={({ field }) => (
        <AppSelect
          label={t("pages.settings.api_keys.fields.ip_whitelist")}
          value={field.value}
          onChange={(v) => field.onChange(v)}
          options={ipModeOptions}
        />
      )} />

      {ipMode === "custom" && (
        <Controller name="ipList" control={control} render={({ field }) => (
          <AppInput
            label=""
            {...field}
            multiline
            rows={2}
            placeholder={t("pages.settings.api_keys.fields.ip_placeholder")}
          />
        )} />
      )}
    </>
  );
};
