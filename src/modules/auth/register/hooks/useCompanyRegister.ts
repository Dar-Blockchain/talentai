import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useToast } from "@/hooks/useToast";
import { getUserLocation } from "@/utils/api";
import { useOtpTimer, useOtpInput } from "@/modules/auth/shared/hooks";
import { OTP_CODE_LENGTH } from "@/modules/auth/shared/types";
import { refreshAbort } from "@/modules/auth/shared/utils";
import { useRegisterMutation, useVerifyRegisterOtp } from "../queries";
import { COMPANY_EXPIRY_KEY } from "../utils";
import type { CompanyFormValues, RegisterFormProps, RegisterStep } from "../types";

export function useCompanyRegister({ onStepChange, onEmailChange }: RegisterFormProps) {
  const router        = useRouter();
  const { showToast } = useToast();

  const [step,       setStep]       = useState<RegisterStep>(1);
  const [savedEmail, setSavedEmail] = useState("");

  const abortRef = useRef<AbortController | null>(null);
  const timer    = useOtpTimer(COMPANY_EXPIRY_KEY);
  const otp      = useOtpInput();

  const registerMutation = useRegisterMutation();
  const verifyMutation   = useVerifyRegisterOtp((_data) => {
    router.replace("/company/dashboard");
  });

  const loading = registerMutation.isPending || verifyMutation.isPending;

  useEffect(() => () => { abortRef.current?.abort(); }, []);

  const sendCode = async (values: CompanyFormValues) => {
    const signal = refreshAbort(abortRef);
    try {
      await registerMutation.mutateAsync({
        payload: {
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
        },
        signal,
      });

      const email = values.email.toLowerCase().trim();
      setSavedEmail(email);
      onEmailChange?.(email);
      timer.start();
      setStep(2);
      onStepChange?.(2);
    } catch (err: any) {
      if (err?.name !== "AbortError")
        showToast({ message: err?.message ?? "Failed to send verification code.", severity: "error" });
    }
  };

  const verifyCode = async () => {
    const code = otp.otpCode.join("");
    if (code.length < OTP_CODE_LENGTH) return;

    const signal = refreshAbort(abortRef);
    try {
      timer.clear();
      const location = await getUserLocation();
      await verifyMutation.mutateAsync({ email: savedEmail, otp: code, location, signal });
    } catch (err: any) {
      if (err?.name !== "AbortError")
        showToast({ message: err?.message ?? "Invalid code. Please try again.", severity: "error" });
    }
  };

  return { step, loading, savedEmail, otp, timer, sendCode, verifyCode };
}
