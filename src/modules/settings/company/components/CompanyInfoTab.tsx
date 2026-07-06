import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Controller, Control } from "react-hook-form";
import { COMPANY_SIZES } from "@/modules/settings/shared/constants";
import { getAllCountryNames } from "@/utils/countryMappings";
import AppInput from "@/modules/shared/ui/AppInput";
import AppSelect from "@/modules/shared/ui/AppSelect";
import AppAutocomplete from "@/modules/shared/ui/AppAutocomplete";
import { CompanyProfileFormValues } from "../schemas/companyProfileSchema";
import { UserProfile } from "../../shared";

interface Props {
  profile: UserProfile;
  isEditing: boolean;
  control: Control<CompanyProfileFormValues>;
}

const SectionHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg border-l-[3px] border-l-teal-600">
    <p className="text-[0.9rem] font-bold text-gray-900">{title}</p>
    <p className="text-[0.78rem] text-gray-400 mt-1">{subtitle}</p>
  </div>
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
    <div className="p-4 md:p-6 flex flex-col gap-6">

      {/* ── Company Information ── */}
      <div className="flex flex-col gap-5">
        <SectionHeader
          title={t("pages.settings.company_info.title")}
          subtitle={t("pages.settings.company_info.subtitle")}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* ── Contact & Presence ── */}
      <div className="flex flex-col gap-5">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
        </div>
      </div>
    </div>
  );
};

export default CompanyInfoTab;
