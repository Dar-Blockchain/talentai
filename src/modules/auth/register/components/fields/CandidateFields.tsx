import React from "react";
import { Box } from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { Control, FieldErrors } from "react-hook-form";
import AppInput from "@/modules/shared/ui/AppInput";
import type { CandidateFormValues } from "../../types";

const half = { flex: "1 1 100%", minWidth: 0, "@media (min-width:1025px)": { flex: "1 1 calc(50% - 12px)" } };

interface Props {
  control: Control<CandidateFormValues>;
  errors: FieldErrors<CandidateFormValues>;
  loading: boolean;
  invitationEmail: string;
}

const CandidateFields: React.FC<Props> = ({ control, errors, loading, invitationEmail }) => {
  const { t } = useTranslation("auth");

  return (
    <>
      <Box sx={half}>
        <Controller name="firstName" control={control}
          rules={{ required: t("candidate_form.validation.first_name_required") }}
          render={({ field }) => (
            <AppInput
              label={t("candidate_form.first_name")}
              placeholder="John"
              required
              disabled={loading}
              error={errors.firstName?.message}
              startIcon={<PersonIcon sx={{ fontSize: 18, color: "#9CA3AF" }} />}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
      </Box>

      <Box sx={half}>
        <Controller name="lastName" control={control}
          rules={{ required: t("candidate_form.validation.last_name_required") }}
          render={({ field }) => (
            <AppInput
              label={t("candidate_form.last_name")}
              placeholder="Doe"
              required
              disabled={loading}
              error={errors.lastName?.message}
              startIcon={<PersonIcon sx={{ fontSize: 18, color: "#9CA3AF" }} />}
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
            required: t("candidate_form.validation.email_required"),
            pattern: { value: /^\S+@\S+\.\S+$/, message: t("candidate_form.validation.email_invalid") },
          }}
          render={({ field }) => (
            <AppInput
              label={t("candidate_form.email")}
              placeholder="john@example.com"
              type="email"
              required
              disabled={loading || !!invitationEmail}
              error={invitationEmail ? t("candidate_form.email_prefilled") : errors.email?.message}
              startIcon={<EmailIcon sx={{ fontSize: 18, color: "#9CA3AF" }} />}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
      </Box>

      <Box sx={half}>
        <Controller name="phone" control={control}
          rules={{
            required: t("candidate_form.validation.phone_required"),
            validate: (v) => /^\+?[1-9]\d{6,14}$/.test(v.replace(/[\s\-().]/g, "")) || t("candidate_form.validation.phone_invalid"),
          }}
          render={({ field }) => (
            <AppInput
              label={t("candidate_form.phone")}
              placeholder="+1 234 567 890"
              required
              disabled={loading}
              error={errors.phone?.message}
              startIcon={<PhoneIcon sx={{ fontSize: 18, color: "#9CA3AF" }} />}
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

export default CandidateFields;
