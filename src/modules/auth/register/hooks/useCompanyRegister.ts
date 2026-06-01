import { useState } from "react";
import { useRouter } from "next/router";
import { useToast } from "@/hooks/useToast";
import { getUserLocation } from "@/utils/api";
import { useOtpTimer, useOtpInput } from "@/modules/auth/shared/hooks";
import { OTP_CODE_LENGTH } from "@/modules/auth/shared/types";
import { useRegisterMutation, useVerifyRegisterOtp } from "../queries";
import { COMPANY_EXPIRY_KEY } from "../utils";
import type { CompanyFormValues, RegisterFormProps, RegisterStep } from "../types";

export function useCompanyRegister({ onStepChange, onEmailChange }: RegisterFormProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const [step,       setStep]       = useState<RegisterStep>(1);
  const [savedEmail, setSavedEmail] = useState("");

  const timer = useOtpTimer(COMPANY_EXPIRY_KEY);
  const otp   = useOtpInput();

  const registerMutation = useRegisterMutation();
  const verifyMutation   = useVerifyRegisterOtp((_data) => {
    router.replace("/company/dashboard");
  });

  const loading = registerMutation.isPending || verifyMutation.isPending;

  const sendCode = async (values: CompanyFormValues) => {
    try {
      await registerMutation.mutateAsync({
        email:          values.email.toLowerCase().trim(),
        roleType:       "Company",
        name:           values.name,
        companyDetails: {
          industry: values.industry,
          size:     values.size,
          location: values.location,
          website:  values.website,
          linkedin: values.linkedin,
        },
      });
      const email = values.email.toLowerCase().trim();
      setSavedEmail(email);
      onEmailChange?.(email);
      timer.start();
      setStep(2);
      onStepChange?.(2);
    } catch (err: any) {
      showToast({ message: err?.message || "Failed to send verification code.", severity: "error" });
    }
  };

  const verifyCode = async () => {
    const code = otp.otpCode.join("");
    if (code.length < OTP_CODE_LENGTH) return;
    try {
      timer.clear();
      const location = await getUserLocation();
      await verifyMutation.mutateAsync({ email: savedEmail, otp: code, location });
    } catch {
      showToast({ message: "Invalid code. Please try again.", severity: "error" });
    }
  };

  return {
    step, loading,
    savedEmail, otp, timer,
    sendCode, verifyCode,
  };
}
