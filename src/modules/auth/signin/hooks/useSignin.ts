import { useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { useForm, useWatch } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useToast } from "@/hooks/useToast";
import { fetchEmployeePermissions } from "@/store/slices/memberSlice";
import type { AppDispatch } from "@/store/store";
import { useOtpFlow } from "@/modules/auth/shared/hooks";
import { extractInvitationEmail, resolveRedirectPath } from "@/modules/auth/shared/utils";
import { useSendSigninCode, useVerifySigninOtp } from "../queries";
import { OTP_STORAGE_KEY } from "../utils";
import type { SigninFormValues, SigninStep } from "../types";
import { useState } from "react";

export function useSignin() {
  const router        = useRouter();
  const dispatch      = useDispatch<AppDispatch>();
  const { showToast } = useToast();
  const returnUrl     = router.query.returnUrl as string | undefined;

  const invitationEmail = useMemo(() => extractInvitationEmail(returnUrl), [returnUrl]);

  const [step, setStep] = useState<SigninStep>(1);

  const form = useForm<SigninFormValues>({
    defaultValues: { email: "", code: "" },
    mode: "onTouched",
  });

  const emailValue = useWatch({ control: form.control, name: "email" });

  useEffect(() => { if (invitationEmail) form.setValue("email", invitationEmail); }, [invitationEmail]);

  const sendMutation   = useSendSigninCode();
  const verifyMutation = useVerifySigninOtp(async (data) => {
    if (data.user?.role === "Employee" && data.user?._id) {
      await dispatch(fetchEmployeePermissions(data.user._id));
    }
    router.replace(resolveRedirectPath(data.user?.role, data.profile?._id, returnUrl));
  });

  const { timer, otp, verifyCode, cleanup, verifyLoading } = useOtpFlow({
    storageKey:    OTP_STORAGE_KEY,
    verifyMutation,
  });

  const loading = sendMutation.isPending || verifyLoading;

  useEffect(() => () => cleanup(), []);

  const sendCode = async (email: string) => {
    try {
      await sendMutation.mutateAsync({ email: email.toLowerCase().trim() });
      timer.start();
      setStep(2);
    } catch (err: any) {
      if (err?.name !== "AbortError")
        showToast({ message: err?.message ?? "Sign in failed. Please try again.", severity: "error" });
    }
  };

  const onSubmit = (data: SigninFormValues) => {
    const email = data.email.toLowerCase().trim();
    if (step === 1) sendCode(email);
    else verifyCode(email);
  };

  const resendCode = () => {
    otp.reset();
    sendCode(form.getValues("email"));
  };

  const changeEmail = () => {
    timer.clear();
    otp.reset();
    setStep(1);
  };

  return {
    form, step, loading,
    emailValue, otp, invitationEmail, timer,
    onSubmit, resendCode, changeEmail,
  };
}
