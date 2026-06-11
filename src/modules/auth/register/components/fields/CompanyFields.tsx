import React from "react";
import BusinessIcon  from "@mui/icons-material/Business";
import CategoryIcon  from "@mui/icons-material/Category";
import EmailIcon     from "@mui/icons-material/Email";
import LanguageIcon  from "@mui/icons-material/Language";
import LinkedInIcon  from "@mui/icons-material/LinkedIn";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PeopleIcon    from "@mui/icons-material/People";
import { useTranslation } from "react-i18next";
import type { Control, FieldErrors } from "react-hook-form";
import { FormField } from "@/modules/auth/shared/ui/FormField";
import { validators } from "@/modules/auth/shared/utils/validators";
import { COMPANY_SIZES, INDUSTRIES } from "../../utils";
import type { CompanyFormValues } from "../../types";

interface Props {
  control: Control<CompanyFormValues>;
  errors:  FieldErrors<CompanyFormValues>;
  loading: boolean;
}

const CompanyFields: React.FC<Props> = ({ control, errors, loading }) => {
  const { t } = useTranslation("auth");
  const v = (key: string) => t(`company_form.validation.${key}`);

  return (
    <>
      <FormField
        name="name" control={control} icon={<BusinessIcon />}
        label={t("company_form.company_name")} placeholder="Acme Corp"
        disabled={loading} error={errors.name?.message}
        rules={{ required: v("company_name_required") }}
      />
      <FormField
        name="email" control={control} icon={<EmailIcon />}
        label={t("company_form.work_email")} placeholder="contact@company.com" type="email"
        disabled={loading} error={errors.email?.message}
        rules={{
          required: v("email_required"),
          pattern: { value: /^\S+@\S+\.\S+$/, message: v("email_invalid") },
        }}
      />
      <FormField
        name="industry" control={control} icon={<CategoryIcon />}
        label={t("company_form.industry")} placeholder={t("company_form.select_industry")}
        disabled={loading} error={errors.industry?.message}
        rules={{ required: v("industry_required") }}
        options={INDUSTRIES.map((i) => ({ label: i, value: i }))}
      />
      <FormField
        name="size" control={control} icon={<PeopleIcon />}
        label={t("company_form.company_size")} placeholder={t("company_form.select_size")}
        disabled={loading} error={errors.size?.message}
        rules={{ required: v("size_required") }}
        options={COMPANY_SIZES.map((s) => ({ label: s, value: s }))}
      />
      <FormField
        name="location" control={control} icon={<LocationOnIcon />}
        label={t("company_form.location")} placeholder="e.g. Paris, France"
        disabled={loading} error={errors.location?.message}
        rules={{ required: v("location_required") }}
      />
      <FormField
        name="website" control={control} icon={<LanguageIcon />}
        label={t("company_form.website")} placeholder="https://yourcompany.com"
        disabled={loading} error={errors.website?.message}
        rules={{ validate: validators.url }}
      />
      <FormField
        name="linkedin" control={control} icon={<LinkedInIcon />}
        label={t("company_form.linkedin")} placeholder="https://linkedin.com/company/..."
        disabled={loading} error={errors.linkedin?.message}
        width="full"
        rules={{ validate: validators.linkedinUrl }}
      />
    </>
  );
};

export default CompanyFields;
