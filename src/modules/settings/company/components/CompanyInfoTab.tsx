import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Box, Typography, Divider } from "@mui/material";
import { COMPANY_SIZES, EXPERIENCE_LEVELS, EMPLOYMENT_TYPES } from "@/modules/settings/shared/constants";
import { COMPANY_INFO_FIELDS, COMPANY_SELECT_FIELDS, EXP_LEVEL_KEYS, CONTACT_INPUT_FIELDS, CONTACT_SELECT_FIELDS, EMP_TYPE_KEYS } from "../data/companyInfoData";
import { getAllCountryNames } from "@/utils/countryMappings";
import AppInput from "@/modules/shared/ui/AppInput";
import AppSelect from "@/modules/shared/ui/AppSelect";
import AppAutocomplete from "@/modules/shared/ui/AppAutocomplete";
import { UserProfile } from "@/types/profile";

interface Props {
  profile: UserProfile;
  isEditing: boolean;
  fieldErrors: Record<string, string>;
  onInputChange: (key: keyof UserProfile, value: string) => void;
}

const SectionHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <Box
    sx={{
      px: 2,
      py: 1.5,
      bgcolor: "#F9FAFB",
      border: "1px solid #E5E7EB",
      borderRadius: 2,
      borderLeft: "3px solid #0D9488",
    }}
  >
    <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: "#111827" }}>{title}</Typography>
    <Typography sx={{ fontSize: "0.78rem", color: "#9CA3AF", mt: 0.25 }}>{subtitle}</Typography>
  </Box>
);

const SubTitle = ({ label }: { label: string }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
    <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.8, whiteSpace: "nowrap" }}>
      {label}
    </Typography>
    <Divider sx={{ flex: 1, borderColor: "#E5E7EB" }} />
  </Box>
);

const CompanyInfoTab: React.FC<Props> = ({ profile, isEditing, fieldErrors, onInputChange }) => {
  const { t } = useTranslation("dashboard");
  const countries = useMemo(() => getAllCountryNames(), []);

  const selectOptions = useMemo(
    () => [
      ...COMPANY_SELECT_FIELDS.map((field) => ({
        key: field.key,
        options: field.getOptions(t, COMPANY_SIZES, EXPERIENCE_LEVELS, EXP_LEVEL_KEYS),
      })),
      ...CONTACT_SELECT_FIELDS.map((field) => ({
        key: field.key,
        options: field.getOptions(t),
      })),
    ],
    [t]
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, display: "flex", flexDirection: "column", gap: 3 }}>

      {/* ── Company Information ── */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        <SectionHeader
          title={t("pages.settings.company_info.title")}
          subtitle={t("pages.settings.company_info.subtitle")}
        />
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5 }}>
          {COMPANY_INFO_FIELDS.map((field) => (
            <AppInput
              key={field.key}
              label={t(field.labelKey)}
              value={field.key === "name" ? (profile.name || profile.companyName || "") : (profile[field.key] as string) || ""}
              onChange={(e) => {
                if (field.onChange) {
                  field.onChange(e.target.value, onInputChange);
                } else {
                  onInputChange(field.key, e.target.value);
                }
              }}
              disabled={field.disabled || !isEditing}
              required={field.required}
              placeholder={field.placeholderKey ? t(field.placeholderKey) : ""}
              error={fieldErrors[field.key] || (field.key === "name" ? fieldErrors.companyName : "") || ""}
              sx={{ gridColumn: field.gridColumn }}
            />
          ))}
          {COMPANY_SELECT_FIELDS.map((field) => (
            <AppSelect
              key={field.key}
              label={t(field.labelKey)}
              value={field.getValue(profile)}
              onChange={(val) => field.onChange(val as string, onInputChange)}
              options={selectOptions.find((o) => o.key === field.key)?.options ?? []}
              disabled={!isEditing}
              error={fieldErrors[field.key] || ""}
              columns={field.columns}
              sx={{ gridColumn: field.gridColumn }}
            />
          ))}
        </Box>
      </Box>

      <Divider sx={{ borderColor: "#E5E7EB" }} />

      {/* ── Contact & Presence ── */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        <SectionHeader
          title="Contact & Presence"
          subtitle="Location, social links, and work preferences"
        />

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <AppAutocomplete
            label={t("pages.settings.contact.country_label")}
            value={profile.location || null}
            onChange={(v) => { onInputChange("location", v ?? ""); onInputChange("country", v ?? ""); }}
            options={countries}
            placeholder={t("pages.settings.contact.country_placeholder")}
            disabled={!isEditing}
            error={fieldErrors.location || ""}
          />
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5 }}>
            {CONTACT_SELECT_FIELDS.map((field) => (
              <AppSelect
                key={field.key}
                label={t(field.labelKey)}
                value={field.getValue(profile)}
                onChange={(val) => field.onChange(val as string, onInputChange)}
                options={selectOptions.find((o) => o.key === field.key)?.options ?? []}
                disabled={!isEditing}
                error={fieldErrors[field.key] || ""}
                sx={{ gridColumn: field.gridColumn }}
              />
            ))}
          </Box>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5 }}>
            {CONTACT_INPUT_FIELDS.map((field) => (
              <AppInput
                key={field.key}
                label={t(field.labelKey)}
                value={(profile[field.key] as string) || ""}
                onChange={(e) => onInputChange(field.key, e.target.value)}
                disabled={!isEditing}
                placeholder={field.placeholder}
                type={field.type}
                error={fieldErrors[field.key] || ""}
                sx={{ gridColumn: field.gridColumn }}
              />
            ))}
          </Box>
        </Box>

      </Box>
    </Box>
  );
};

export default CompanyInfoTab;
