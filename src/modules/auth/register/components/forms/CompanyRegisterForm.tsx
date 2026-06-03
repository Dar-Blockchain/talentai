import React from "react";
import { Box } from "@mui/material";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useCompanyRegister } from "../../hooks";
import CompanyFields from "../fields/CompanyFields";
import AppOtpVerifyStep from "@/modules/shared/ui/AppOtpVerifyStep";
import SubmitButton from "../ui/SubmitButton";
import type { CompanyFormValues, RegisterFormProps } from "../../types";

const full = { flex: "1 1 100%" };

const CompanyRegisterForm: React.FC<RegisterFormProps> = ({ onStepChange, onEmailChange }) => {
  const { t } = useTranslation("auth");
  const { step, loading, savedEmail, otp, timer, sendCode, verifyCode } =
    useCompanyRegister({ onStepChange, onEmailChange });

  const { handleSubmit, control, formState: { errors } } = useForm<CompanyFormValues>({
    mode: "onTouched",
    defaultValues: { name: "", email: "", industry: "", size: "", location: "", website: "", linkedin: "" },
  });

  if (step === 2) return (
    <AppOtpVerifyStep
      savedEmail={savedEmail} otp={otp} timer={timer}
      loading={loading}
      onVerify={verifyCode}
      tPrefix="company_form"
    />
  );

  return (
    <Box component="form" onSubmit={handleSubmit(sendCode)}
      sx={{ mb: 2, textAlign: "left", display: "flex", flexWrap: "wrap", gap: { xs: 2.25, sm: 2.75, md: 3 } }}
    >
      <CompanyFields control={control} errors={errors} loading={loading} />

      <Box sx={full}>
        <SubmitButton
          loading={loading}
          label={t("company_form.btn_continue")}
          loadingLabel={t("company_form.btn_sending")}
        />
      </Box>
    </Box>
  );
};

export default CompanyRegisterForm;
