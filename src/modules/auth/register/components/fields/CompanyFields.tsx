import React from "react";
import { Box } from "@mui/material";
import BusinessIcon from "@mui/icons-material/Business";
import PeopleIcon from "@mui/icons-material/People";
import CategoryIcon from "@mui/icons-material/Category";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import LanguageIcon from "@mui/icons-material/Language";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import EmailIcon from "@mui/icons-material/Email";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { Control, FieldErrors } from "react-hook-form";
import AppInput from "@/modules/shared/ui/AppInput";
import AppSelect from "@/modules/shared/ui/AppSelect";
import { COMPANY_SIZES, INDUSTRIES } from "../../utils";
import type { CompanyFormValues } from "../../types";

const half = { flex: "1 1 100%", minWidth: 0, "@media (min-width:1025px)": { flex: "1 1 calc(50% - 12px)" } };
const full = { flex: "1 1 100%" };

interface Props {
  control: Control<CompanyFormValues>;
  errors: FieldErrors<CompanyFormValues>;
  loading: boolean;
}

const CompanyFields: React.FC<Props> = ({ control, errors, loading }) => {
  const { t } = useTranslation("auth");

  return (
    <>
      <Box sx={half}>
        <Controller name="name" control={control}
          rules={{ required: t("company_form.validation.company_name_required") }}
          render={({ field }) => (
            <AppInput
              label={t("company_form.company_name")}
              placeholder="Acme Corp"
              required
              disabled={loading}
              error={errors.name?.message}
              startIcon={<BusinessIcon sx={{ fontSize: 18, color: "#9CA3AF" }} />}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
      </Box>

      <Box sx={half}>
        <Controller name="email" control={control}
          rules={{
            required: t("company_form.validation.email_required"),
            pattern: { value: /^\S+@\S+\.\S+$/, message: t("company_form.validation.email_invalid") },
          }}
          render={({ field }) => (
            <AppInput
              label={t("company_form.work_email")}
              placeholder="contact@company.com"
              type="email"
              required
              disabled={loading}
              error={errors.email?.message}
              startIcon={<EmailIcon sx={{ fontSize: 18, color: "#9CA3AF" }} />}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
      </Box>

      <Box sx={half}>
        <Controller name="industry" control={control}
          rules={{ required: t("company_form.validation.industry_required") }}
          render={({ field }) => (
            <AppSelect
              label={t("company_form.industry")}
              required
              disabled={loading}
              error={errors.industry?.message}
              placeholder={t("company_form.select_industry")}
              options={INDUSTRIES.map((i) => ({ label: i, value: i }))}
              value={field.value ?? ""}
              onChange={(v) => field.onChange(v)}
            />
          )}
        />
      </Box>

      <Box sx={half}>
        <Controller name="size" control={control}
          rules={{ required: t("company_form.validation.size_required") }}
          render={({ field }) => (
            <AppSelect
              label={t("company_form.company_size")}
              required
              disabled={loading}
              error={errors.size?.message}
              placeholder={t("company_form.select_size")}
              options={COMPANY_SIZES.map((s) => ({ label: s, value: s }))}
              value={field.value ?? ""}
              onChange={(v) => field.onChange(v)}
            />
          )}
        />
      </Box>

      <Box sx={half}>
        <Controller name="location" control={control}
          rules={{ required: t("company_form.validation.location_required") }}
          render={({ field }) => (
            <AppInput
              label={t("company_form.location")}
              placeholder="e.g. Paris, France"
              required
              disabled={loading}
              error={errors.location?.message}
              startIcon={<LocationOnIcon sx={{ fontSize: 18, color: "#9CA3AF" }} />}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
      </Box>

      <Box sx={half}>
        <Controller name="website" control={control}
          rules={{
            validate: (v) => {
              if (!v) return true;
              try {
                const u = new URL(v);
                if (!["http:", "https:"].includes(u.protocol)) return t("company_form.validation.url_protocol");
                if (!u.hostname.includes(".")) return t("company_form.validation.url_domain");
                return true;
              } catch { return t("company_form.validation.url_invalid"); }
            },
          }}
          render={({ field }) => (
            <AppInput
              label={t("company_form.website")}
              placeholder="https://yourcompany.com"
              disabled={loading}
              error={errors.website?.message}
              startIcon={<LanguageIcon sx={{ fontSize: 18, color: "#9CA3AF" }} />}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
      </Box>

      <Box sx={full}>
        <Controller name="linkedin" control={control}
          rules={{
            validate: (v) => {
              if (!v) return true;
              try {
                const u = new URL(v);
                if (!["http:", "https:"].includes(u.protocol)) return t("company_form.validation.linkedin_protocol");
                if (!u.hostname.replace("www.", "").startsWith("linkedin.com")) return t("company_form.validation.linkedin_domain");
                if (!u.pathname.startsWith("/company/")) return t("company_form.validation.linkedin_path");
                return true;
              } catch { return t("company_form.validation.linkedin_protocol"); }
            },
          }}
          render={({ field }) => (
            <AppInput
              label={t("company_form.linkedin")}
              placeholder="https://linkedin.com/company/..."
              disabled={loading}
              error={errors.linkedin?.message}
              startIcon={<LinkedInIcon sx={{ fontSize: 18, color: "#9CA3AF" }} />}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
      </Box>
    </>
  );
};

export default CompanyFields;
