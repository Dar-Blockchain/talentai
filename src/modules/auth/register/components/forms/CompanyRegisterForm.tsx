import React from "react";
import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useCompanyRegister } from "../../hooks";
import CompanyFields from "../fields/CompanyFields";
import AppOtpVerifyStep from "@/modules/shared/ui/AppOtpVerifyStep";
import SubmitButton from "../ui/SubmitButton";
import type { RegisterFormProps } from "../../types";

const full = { flex: "1 1 100%" };

const CompanyRegisterForm: React.FC<RegisterFormProps> = ({ onStepChange, onEmailChange }) => {
  const { t } = useTranslation("auth");
  const { form, step, loading, savedEmail, otp, timer, sendCode, verifyCode } =
    useCompanyRegister({ onStepChange, onEmailChange });

  if (step === 2) return (
    <AppOtpVerifyStep
      savedEmail={savedEmail} otp={otp} timer={timer}
      loading={loading}
      onVerify={verifyCode}
      tPrefix="company_form"
    />
  );

  return (
    <Box component="form" onSubmit={form.handleSubmit(sendCode)}
      sx={{ mb: 2, textAlign: "left", display: "flex", flexWrap: "wrap", gap: { xs: 2.25, sm: 2.75, md: 3 } }}
    >
      <CompanyFields control={form.control} errors={form.formState.errors} loading={loading} />
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
