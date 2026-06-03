import React from "react";
import { Box, Typography } from "@mui/material";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import { useTranslation } from "react-i18next";
import { Controller } from "react-hook-form";
import type { Control, FieldErrors } from "react-hook-form";
import AppInput from "@/modules/shared/ui/AppInput";
import type { SigninFormValues } from "../../types";

interface Props {
  control: Control<SigninFormValues>;
  errors: FieldErrors<SigninFormValues>;
  loading: boolean;
  invitationEmail: string;
}

const EmailStep: React.FC<Props> = ({ control, errors, loading, invitationEmail }) => {
  const { t } = useTranslation("auth");

  return (
    <Box>
      <Controller
        name="email"
        control={control}
        rules={{
          required: t("signin.validation.email_required"),
          pattern: { value: /^\S+@\S+\.\S+$/, message: t("signin.validation.email_invalid") },
        }}
        render={({ field }) => (
          <AppInput
            label={t("signin.email_label")}
            placeholder="you@company.com"
            type="email"
            disabled={loading || !!invitationEmail}
            error={invitationEmail ? t("signin.email_prefilled") : errors.email?.message}
            startIcon={<EmailOutlinedIcon sx={{ fontSize: 17, color: "#9CA3AF" }} />}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />
      <Typography sx={{ fontSize: { xs: "0.68rem", sm: "0.7rem" }, color: "#9CA3AF", fontFamily: "Poppins", mt: 0.5 }}>
        {t("signin.email_hint")}
      </Typography>
    </Box>
  );
};

export default EmailStep;
