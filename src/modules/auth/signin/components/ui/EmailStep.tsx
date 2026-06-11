import React from "react";
import { Box, Typography } from "@mui/material";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import { useTranslation } from "react-i18next";
import type { Control, FieldErrors } from "react-hook-form";
import { FormField } from "@/modules/auth/shared/ui/FormField";
import { validators } from "@/modules/auth/shared/utils/validators";
import type { SigninFormValues } from "../../types";

interface Props {
  control:         Control<SigninFormValues>;
  errors:          FieldErrors<SigninFormValues>;
  loading:         boolean;
  invitationEmail: string;
}

const EmailStep: React.FC<Props> = ({ control, errors, loading, invitationEmail }) => {
  const { t } = useTranslation("auth");
  return (
    <Box>
      <FormField
        name="email" control={control} icon={<EmailOutlinedIcon />}
        label={t("signin.email_label")} placeholder="you@company.com" type="email"
        disabled={loading || !!invitationEmail}
        error={invitationEmail ? t("signin.email_prefilled") : errors.email?.message}
        overrideValue={invitationEmail || undefined}
        rules={{ required: t("signin.validation.email_required"), validate: validators.email }}
        width="full"
      />
      <Typography sx={{ fontSize: { xs: "0.68rem", sm: "0.7rem" }, color: "#9CA3AF", fontFamily: "Poppins", mt: 0.5 }}>
        {t("signin.email_hint")}
      </Typography>
    </Box>
  );
};

export default EmailStep;
