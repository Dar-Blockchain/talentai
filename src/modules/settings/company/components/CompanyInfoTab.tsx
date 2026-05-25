import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Box, Divider, Typography } from "@mui/material";
import { Controller, Control } from "react-hook-form";
import { COMPANY_SIZES } from "@/modules/settings/shared/constants";
import { getAllCountryNames } from "@/utils/countryMappings";
import AppInput from "@/modules/shared/ui/AppInput";
import AppSelect from "@/modules/shared/ui/AppSelect";
import AppAutocomplete from "@/modules/shared/ui/AppAutocomplete";
import { UserProfile } from "@/types/profile";
import { CompanyProfileFormValues } from "../schemas/companyProfileSchema";

interface Props {
  profile: UserProfile;
  isEditing: boolean;
  control: Control<CompanyProfileFormValues>;
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

const CompanyInfoTab: React.FC<Props> = ({ profile, isEditing, control }) => {
  const { t } = useTranslation("dashboard");
  const countries = useMemo(() => getAllCountryNames(), []);

  const sizeOptions = useMemo(
    () => COMPANY_SIZES.map((s) => ({ label: `${s} ${t("pages.settings.employees_suffix")}`, value: s })),
    [t]
  );

  const industryOptions = useMemo(
    () => ["Technology", "Finance", "Healthcare", "Education", "Other"].map((v) => ({ label: v, value: v })),
    []
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
          {/* Email — read-only, not managed by RHF */}
          <AppInput
            label={t("pages.settings.company_info.email_label")}
            value={profile.email || ""}
            disabled
            sx={{ gridColumn: "1 / -1" }}
          />

          {/* Company Name */}
          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <AppInput
                label={t("pages.settings.company_info.name_label")}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                disabled={!isEditing}
                placeholder={t("pages.settings.company_info.name_placeholder")}
                error={fieldState.error?.message || ""}
                sx={{ gridColumn: "1 / -1" }}
              />
            )}
          />

          {/* Industry */}
          <Controller
            name="industry"
            control={control}
            render={({ field, fieldState }) => (
              <AppSelect
                label={t("pages.settings.company_info.industry_label")}
                value={field.value}
                onChange={(val) => field.onChange(val)}
                options={industryOptions}
                disabled={!isEditing}
                placeholder={t("pages.settings.company_info.industry_placeholder")}
                error={fieldState.error?.message || ""}
                sx={{ gridColumn: { xs: "1 / -1", sm: "auto" } }}
              />
            )}
          />

          {/* Company Size */}
          <Controller
            name="size"
            control={control}
            render={({ field, fieldState }) => (
              <AppSelect
                label={t("pages.settings.company_info.size_label")}
                value={field.value}
                onChange={(val) => field.onChange(val)}
                options={sizeOptions}
                disabled={!isEditing}
                error={fieldState.error?.message || ""}
                columns={3}
                sx={{ gridColumn: { xs: "1 / -1", sm: "auto" } }}
              />
            )}
          />
        </Box>
      </Box>

      <Divider sx={{ borderColor: "#E5E7EB" }} />

      {/* ── Contact & Presence ── */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        <SectionHeader
          title="Contact & Presence"
          subtitle="Location, social links, and work preferences"
        />

        {/* Location */}
        <Controller
          name="location"
          control={control}
          render={({ field, fieldState }) => (
            <AppAutocomplete
              label={t("pages.settings.contact.country_label")}
              value={field.value || null}
              onChange={(v) => field.onChange(v ?? "")}
              options={countries}
              placeholder={t("pages.settings.contact.country_placeholder")}
              disabled={!isEditing}
              error={fieldState.error?.message || ""}
            />
          )}
        />

        {/* LinkedIn & Website */}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5 }}>
          <Controller
            name="linkedin"
            control={control}
            render={({ field, fieldState }) => (
              <AppInput
                label={t("pages.settings.contact.linkedin_label")}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                disabled={!isEditing}
                placeholder="https://linkedin.com/company/yourcompany"
                type="url"
                error={fieldState.error?.message || ""}
                sx={{ gridColumn: "1 / -1" }}
              />
            )}
          />

          <Controller
            name="website"
            control={control}
            render={({ field, fieldState }) => (
              <AppInput
                label={t("pages.settings.contact.website_label")}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                disabled={!isEditing}
                placeholder="https://yourcompany.com"
                type="url"
                error={fieldState.error?.message || ""}
                sx={{ gridColumn: "1 / -1" }}
              />
            )}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default CompanyInfoTab;
