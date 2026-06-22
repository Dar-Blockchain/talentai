import { useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { useForm, useWatch } from "react-hook-form";
import { useToast } from "@/hooks/useToast";
import { extractInvitationEmail } from "@/modules/auth/shared/utils";
import { useLoadingWithNavigation } from "@/modules/auth/shared/hooks/useLoadingWithNavigation";
import { OTP_TTL } from "@/modules/auth/shared/types";
import { useSendSigninCode } from "../queries";
import { OTP_STORAGE_KEY, SIGNIN_EMAIL_KEY } from "../utils";
import type { SigninFormValues } from "../types";

export function useSignin() {
  const router        = useRouter();
  const { showToast } = useToast();
  const returnUrl     = router.query.returnUrl as string | undefined;
  const { loading: navigationLoading, withLoading } = useLoadingWithNavigation();

  const invitationEmail = useMemo(() => extractInvitationEmail(returnUrl), [returnUrl]);

  const form = useForm<SigninFormValues>({
    defaultValues: { email: "", code: "" },
    mode: "onTouched",
  });

  const emailValue = useWatch({ control: form.control, name: "email" });

  useEffect(() => { if (invitationEmail) form.setValue("email", invitationEmail); }, [invitationEmail]);

  const sendMutation = useSendSigninCode();
  // Show loading during both mutation and navigation
  const loading      = sendMutation.isPending || navigationLoading;

  const onSubmit = async (data: SigninFormValues) => {
    const email = data.email.toLowerCase().trim();
    try {
      await withLoading(async () => {
        await sendMutation.mutateAsync({ email });
        // Persist timer expiry so the OTP page restores it via localStorage
        localStorage.setItem(OTP_STORAGE_KEY, (Date.now() + OTP_TTL * 1000).toString());
        sessionStorage.setItem(SIGNIN_EMAIL_KEY, email);
        const dest = `/signin/otp${returnUrl ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ""}`;
        router.push(dest);
      });
    } catch (err: any) {
      if (err?.name !== "AbortError")
        showToast({ message: err?.message ?? "Sign in failed. Please try again.", severity: "error" });
    }
  };

  return { form, loading, emailValue, invitationEmail, onSubmit };
}
