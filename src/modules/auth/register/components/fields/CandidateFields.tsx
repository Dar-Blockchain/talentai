import React from "react";
import { Mail, User, Phone } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Control, FieldErrors } from "react-hook-form";
import { FormField } from "@/modules/auth/shared/ui/FormField";
import { validators } from "@/modules/auth/shared/utils/validators";
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
        name="firstName" control={control} icon={<User className="size-4" />}
        label={t("candidate_form.first_name")} placeholder="John"
        disabled={loading} error={errors.firstName?.message}
        rules={{ required: v("first_name_required") }}
      />
      <FormField
        name="lastName" control={control} icon={<User className="size-4" />}
        label={t("candidate_form.last_name")} placeholder="Doe"
        disabled={loading} error={errors.lastName?.message}
        rules={{ required: v("last_name_required") }}
      />
      <FormField
        name="email" control={control} icon={<Mail className="size-4" />}
        label={t("candidate_form.email")} placeholder="john@example.com" type="email"
        disabled={loading || !!invitationEmail}
        error={invitationEmail ? t("candidate_form.email_prefilled") : errors.email?.message}
        overrideValue={invitationEmail || undefined}
        rules={{
          required: v("email_required"),
          validate: validators.email,
        }}
      />
      <FormField
        name="phone" control={control} icon={<Phone className="size-4" />}
        label={t("candidate_form.phone")} placeholder="+1 234 567 890"
        disabled={loading} error={errors.phone?.message}
        rules={{
          required: v("phone_required"),
          validate: validators.phone,
        }}
      />
    </>
  );
};

export default CandidateFields;
