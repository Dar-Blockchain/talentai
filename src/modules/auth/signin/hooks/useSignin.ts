import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useForm, useWatch } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useToast } from "@/hooks/useToast";
import { getUserLocation } from "@/utils/api";
import { fetchEmployeePermissions } from "@/store/slices/memberSlice";
import type { AppDispatch } from "@/store/store";
import { useOtpTimer, useOtpInput } from "@/modules/auth/shared/hooks";
import { extractInvitationEmail, resolveRedirectPath, refreshAbort } from "@/modules/auth/shared/utils";
import { OTP_CODE_LENGTH } from "@/modules/auth/shared/types";
import { useSendSigninCode, useVerifySigninOtp } from "../queries";
import { OTP_STORAGE_KEY } from "../utils";
import type { SigninFormValues, SigninStep } from "../types";

export function useSignin() {
  const router        = useRouter();
  const dispatch      = useDispatch<AppDispatch>();
  const { showToast } = useToast();
  const returnUrl     = router.query.returnUrl as string | undefined;

  const invitationEmail = useMemo(() => extractInvitationEmail(returnUrl), [returnUrl]);

  const [step, setStep] = useState<SigninStep>(1);

  const abortRef = useRef<AbortController | null>(null);
  const timer    = useOtpTimer(OTP_STORAGE_KEY);
  const otp      = useOtpInput();

  const form = useForm<SigninFormValues>({
    defaultValues: { email: "", code: "" },
    mode: "onTouched",
  });

  // useWatch instead of form.watch — avoids re-subscribing on every render
  const emailValue = useWatch({ control: form.control, name: "email" });

  useEffect(() => { if (invitationEmail) form.setValue("email", invitationEmail); }, [invitationEmail]);
  useEffect(() => () => { timer.clear(); abortRef.current?.abort(); }, []);

  const sendMutation   = useSendSigninCode();
  const verifyMutation = useVerifySigninOtp(async (data) => {
    if (data.user?.role === "Employee" && data.user?._id) {
      await dispatch(fetchEmployeePermissions(data.user._id));
    }
    router.replace(resolveRedirectPath(data.user?.role, data.profile?._id, returnUrl));
  });

  const loading = sendMutation.isPending || verifyMutation.isPending;

  const sendCode = async (email: string) => {
    const signal = refreshAbort(abortRef);
    try {
      await sendMutation.mutateAsync({ email: email.toLowerCase().trim(), signal });
      timer.start();
      setStep(2);
    } catch (err: any) {
      if (err?.name !== "AbortError")
        showToast({ message: err?.message ?? "Sign in failed. Please try again.", severity: "error" });
    }
  };

  const verifyCode = async () => {
    const { email } = form.getValues();
    const code      = otp.otpCode.join("");
    if (code.length < OTP_CODE_LENGTH) return;

    const signal = refreshAbort(abortRef);
    try {
      timer.clear();
      const location = await getUserLocation();
      await verifyMutation.mutateAsync({ email: email.toLowerCase().trim(), otp: code, location, signal });
    } catch (err: any) {
      if (err?.name !== "AbortError")
        showToast({ message: err?.message ?? "The code you entered didn't match.", severity: "error" });
    }
  };

  const onSubmit = (data: SigninFormValues) => {
    if (step === 1) sendCode(data.email);
    else verifyCode();
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
