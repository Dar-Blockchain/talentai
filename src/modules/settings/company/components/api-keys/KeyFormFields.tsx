import React from "react";
import { useTranslation } from "react-i18next";
import { Controller, useWatch, type Control, type FieldErrors } from "react-hook-form";
import AppInput  from "@/modules/shared/ui/AppInput";
import AppSelect from "@/modules/shared/ui/AppSelect";
import { FieldLabel } from "@/modules/settings/shared/components";
import { AVAILABLE_SCOPES } from "@/modules/settings/shared/constants";

import { type KeyFormState } from "../../schemas/apiKeySchema";
import { datePickerInputClass } from "./styles";

// ─── Scope chips (read-only) ──────────────────────────────────────────────────

export const ScopeChips = () => (
  <div className="flex flex-wrap gap-1.5">
    {AVAILABLE_SCOPES.map((s) => (
      <span
        key={s}
        className="inline-flex h-[26px] items-center px-2.5 rounded-full text-[0.72rem] font-semibold pointer-events-none bg-teal-600/10 text-teal-600 border border-teal-200"
      >
        {s}
      </span>
    ))}
  </div>
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
    <div className="px-6 pt-5">
      <div className="flex flex-col gap-5">{fields}</div>
    </div>
    <hr className="border-gray-200 mt-5" />
    <div className="flex justify-end gap-2 px-6 py-4">{children}</div>
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

      <div>
        <FieldLabel text={t("pages.settings.api_keys.fields.scopes")} />
        <ScopeChips />
      </div>

      <div className="grid grid-cols-2 gap-4">
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

        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-700">
            {t("pages.settings.api_keys.fields.expires_at")}
            <span className="text-red-500 ml-0.5">*</span>
          </span>
          <Controller name="expiresAt" control={control} render={({ field }) => (
            <input
              type="date"
              value={field.value || ""}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => field.onChange(e.target.value)}
              className={datePickerInputClass}
            />
          )} />
          {errors.expiresAt && (
            <span className="text-[11px] text-red-500">{errors.expiresAt.message}</span>
          )}
        </div>
      </div>

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
