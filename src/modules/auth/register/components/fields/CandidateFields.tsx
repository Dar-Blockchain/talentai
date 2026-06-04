import React from "react";
import EmailIcon    from "@mui/icons-material/Email";
import PersonIcon   from "@mui/icons-material/Person";
import PhoneIcon    from "@mui/icons-material/Phone";
import { useTranslation } from "react-i18next";
import type { Control, FieldErrors } from "react-hook-form";
import { FormField } from "@/modules/auth/shared/ui/FormField";
import type { CandidateFormValues } from "../../types";

interface Props {
  control:         Control<CandidateFormValues>;
  errors:          FieldErrors<CandidateFormValues>;
  loading:         boolean;
  invitationEmail: string;
}

const CandidateFields: React.FC<Props> = ({ control, errors, loading, invitationEmail }) => {
  const { t } = useTranslation("auth");
  const v = (key: string) => t(`candidate_form.validation.${key}`);

  return (
    <>
      <FormField
        name="firstName" control={control} icon={<PersonIcon />}
        label={t("candidate_form.first_name")} placeholder="John"
        disabled={loading} error={errors.firstName?.message}
        rules={{ required: v("first_name_required") }}
      />
      <FormField
        name="lastName" control={control} icon={<PersonIcon />}
        label={t("candidate_form.last_name")} placeholder="Doe"
        disabled={loading} error={errors.lastName?.message}
        rules={{ required: v("last_name_required") }}
      />
      <FormField
        name="email" control={control} icon={<EmailIcon />}
        label={t("candidate_form.email")} placeholder="john@example.com" type="email"
        disabled={loading || !!invitationEmail}
        error={invitationEmail ? t("candidate_form.email_prefilled") : errors.email?.message}
        overrideValue={invitationEmail || undefined}
        rules={{
          required: v("email_required"),
          pattern: { value: /^\S+@\S+\.\S+$/, message: v("email_invalid") },
        }}
      />
      <FormField
        name="phone" control={control} icon={<PhoneIcon />}
        label={t("candidate_form.phone")} placeholder="+1 234 567 890"
        disabled={loading} error={errors.phone?.message}
        rules={{
          required: v("phone_required"),
          validate: (v) => /^\+?[1-9]\d{6,14}$/.test(v.replace(/[\s\-().]/g, "")) || t("candidate_form.validation.phone_invalid"),
        }}
      />
    </>
  );
};

export default CandidateFields;
