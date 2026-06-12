import React from "react";
import { Building2, Tag, Mail, Globe, Link, MapPin, Users } from "lucide-react";
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
        name="name" control={control} icon={<Building2 className="size-4" />}
        label={t("company_form.company_name")} placeholder="Acme Corp"
        disabled={loading} error={errors.name?.message}
        rules={{ required: v("company_name_required") }}
      />
      <FormField
        name="email" control={control} icon={<Mail className="size-4" />}
        label={t("company_form.work_email")} placeholder="contact@company.com" type="email"
        disabled={loading} error={errors.email?.message}
        rules={{
          required: v("email_required"),
          pattern: { value: /^\S+@\S+\.\S+$/, message: v("email_invalid") },
        }}
      />
      <FormField
        name="industry" control={control} icon={<Tag className="size-4" />}
        label={t("company_form.industry")} placeholder={t("company_form.select_industry")}
        disabled={loading} error={errors.industry?.message}
        rules={{ required: v("industry_required") }}
        options={INDUSTRIES.map((i) => ({ label: i, value: i }))}
      />
      <FormField
        name="size" control={control} icon={<Users className="size-4" />}
        label={t("company_form.company_size")} placeholder={t("company_form.select_size")}
        disabled={loading} error={errors.size?.message}
        rules={{ required: v("size_required") }}
        options={COMPANY_SIZES.map((s) => ({ label: s, value: s }))}
      />
      <FormField
        name="location" control={control} icon={<MapPin className="size-4" />}
        label={t("company_form.location")} placeholder="e.g. Paris, France"
        disabled={loading} error={errors.location?.message}
        rules={{ required: v("location_required") }}
      />
      <FormField
        name="website" control={control} icon={<Globe className="size-4" />}
        label={t("company_form.website")} placeholder="https://yourcompany.com"
        disabled={loading} error={errors.website?.message}
        rules={{ validate: validators.url }}
      />
      <FormField
        name="linkedin" control={control} icon={<Link className="size-4" />}
        label={t("company_form.linkedin")} placeholder="https://linkedin.com/company/..."
        disabled={loading} error={errors.linkedin?.message}
        width="full"
        rules={{ validate: validators.linkedinUrl }}
      />
    </>
  );
};

export default CompanyFields;
