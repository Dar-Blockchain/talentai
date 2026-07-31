import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/useToast";
import { refreshAbort } from "@/modules/auth/shared/utils";
import { OTP_TTL } from "@/modules/auth/shared/types";
import { useRegisterMutation } from "../queries";
import { COMPANY_EXPIRY_KEY } from "../utils";
import type { CompanyFormValues, RegisterFormProps } from "../types";
import { useLanguage } from "@/hooks/useLanguage";

export function useCompanyRegister({ onOtpReady }: RegisterFormProps) {
  const { showToast } = useToast();
  const { currentLang } = useLanguage();

  const abortRef = useRef<AbortController | null>(null);

  const form = useForm<CompanyFormValues>({
    mode: "onTouched",
    defaultValues: { name: "", email: "", industry: "", size: "", location: "", website: "", linkedin: "" },
  });

  const registerMutation = useRegisterMutation();

  const loading = registerMutation.isPending;

  useEffect(() => () => { abortRef.current?.abort(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
      // Write timer expiry so useRegisterOtp can restore it on mount
      localStorage.setItem(COMPANY_EXPIRY_KEY, (Date.now() + OTP_TTL * 1000).toString());
      onOtpReady?.(email);
    } catch (err) {
      const name = err instanceof Error ? err.name : undefined;
      const message = err instanceof Error ? err.message : undefined;
      if (name !== "AbortError")
        showToast({ message: message ?? "Failed to send verification code.", severity: "error" });
    }
  };

  return {
    form,
    loading,
    sendCode,
  };
}
