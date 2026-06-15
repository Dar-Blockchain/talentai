import React from "react";
import { useTranslation } from "react-i18next";
import { useCompanyRegister } from "../../hooks";
import CompanyFields from "../fields/CompanyFields";
import AppOtpVerifyStep from "@/modules/shared/ui/AppOtpVerifyStep";
import SubmitButton from "../ui/SubmitButton";
import type { RegisterFormProps } from "../../types";

const CompanyRegisterForm: React.FC<RegisterFormProps> = ({ onStepChange, onEmailChange }) => {
  const { t } = useTranslation("auth");
  const { form, step, loading, resendLoading, savedEmail, otp, timer, sendCode, verifyCode, resendCode } =
    useCompanyRegister({ onStepChange, onEmailChange });

  if (step === 2) return (
    <AppOtpVerifyStep
      savedEmail={savedEmail} otp={otp} timer={timer}
      loading={loading} resendLoading={resendLoading}
      onVerify={verifyCode} onResend={resendCode}
      tPrefix="company_form"
    />
  );

  return (
    <form
      onSubmit={form.handleSubmit(sendCode)}
      className="mb-4 text-left grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5"
    >
      <CompanyFields control={form.control} errors={form.formState.errors} loading={loading} />
      <div className="col-span-full">
        <SubmitButton
          loading={loading}
          label={t("company_form.btn_continue")}
          loadingLabel={t("company_form.btn_sending")}
        />
      </div>
    </form>
  );
};

export default CompanyRegisterForm;
