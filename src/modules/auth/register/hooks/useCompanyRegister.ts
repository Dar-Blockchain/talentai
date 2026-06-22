import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { useToast } from "@/hooks/useToast";
import { useOtpFlow, useLoadingWithNavigation } from "@/modules/auth/shared/hooks";
import { refreshAbort } from "@/modules/auth/shared/utils";
import { useRegisterMutation, useVerifyRegisterOtp, useResendRegisterOtp } from "../queries";
import { COMPANY_EXPIRY_KEY } from "../utils";
import type { CompanyFormValues, RegisterFormProps, RegisterStep } from "../types";
import { useLanguage } from "@/hooks/useLanguage";

export function useCompanyRegister({ onStepChange, onEmailChange }: RegisterFormProps) {
  const router        = useRouter();
  const { showToast } = useToast();
  const { loading: navigationLoading, withLoading } = useLoadingWithNavigation();
  const { currentLang } = useLanguage();

  const [step,       setStep]       = useState<RegisterStep>(1);
  const [savedEmail, setSavedEmail] = useState("");

  const abortRef = useRef<AbortController | null>(null);

  // Form lives here — hook owns all company register state
  const form = useForm<CompanyFormValues>({
    mode: "onTouched",
    defaultValues: { name: "", email: "", industry: "", size: "", location: "", website: "", linkedin: "" },
  });

  const registerMutation = useRegisterMutation();
  const verifyMutation   = useVerifyRegisterOtp((_data) => {
    router.replace("/company/dashboard");
  });

  const resendMutation = useResendRegisterOtp();

  const { timer, otp, verifyCode: originalVerifyCode, resendCode, abort, cleanup, verifyLoading, resendLoading } = useOtpFlow({
    storageKey:    COMPANY_EXPIRY_KEY,
    verifyMutation,
    resendMutation,
  });

  // Wrap verifyCode to show loading during navigation
  const verifyCode = async (emailArg: string) => {
    await withLoading(async () => {
      await originalVerifyCode(emailArg);
    });
  };

  const loading = registerMutation.isPending || verifyLoading || navigationLoading;

  useEffect(() => () => { abort(); abortRef.current?.abort(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const sendCode = async (values: CompanyFormValues) => {
    const signal = refreshAbort(abortRef);
    try {
      await registerMutation.mutateAsync({
        payload: {
          email:          values.email.toLowerCase().trim(),
          roleType:       "Company",
          language:       currentLang,
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

  return {
    form,
    step, loading, resendLoading, savedEmail, otp, timer,
    sendCode,
    verifyCode: () => verifyCode(savedEmail),
    resendCode: () => resendCode(savedEmail),
  };
}
