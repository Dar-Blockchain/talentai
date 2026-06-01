import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/useToast";
import { getUserLocation } from "@/utils/api";
import { fetchEmployeePermissions } from "@/store/slices/memberSlice";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store/store";
import { useOtpTimer, useOtpInput } from "@/modules/auth/shared/hooks";
import { extractInvitationEmail, resolveRedirectPath } from "@/modules/auth/shared/utils";
import { OTP_CODE_LENGTH } from "@/modules/auth/shared/types";
import { useSendSigninCode, useVerifySigninOtp } from "../queries";
import { OTP_STORAGE_KEY } from "../utils";
import type { SigninFormValues, SigninStep } from "../types";

export function useSignin() {
  const router   = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();
  const returnUrl = router.query.returnUrl as string | undefined;

  const invitationEmail = useMemo(() => extractInvitationEmail(returnUrl), [returnUrl]);

  const [step, setStep] = useState<SigninStep>(1);

  const timer = useOtpTimer(OTP_STORAGE_KEY);
  const otp   = useOtpInput();

  const form = useForm<SigninFormValues>({
    defaultValues: { email: "", code: "" },
    mode: "onTouched",
  });

  const emailValue = form.watch("email");

  useEffect(() => { if (invitationEmail) form.setValue("email", invitationEmail); }, [invitationEmail]);
  useEffect(() => () => { timer.clear(); }, []);

  const sendMutation = useSendSigninCode();
  const verifyMutation = useVerifySigninOtp(async (data) => {
    if (data.user?.role === "Employee" && data.user?._id) {
      await dispatch(fetchEmployeePermissions(data.user._id));
    }
    router.replace(resolveRedirectPath(data.user?.role, data.profile?._id, returnUrl));
  });

  const loading = sendMutation.isPending || verifyMutation.isPending;

  const sendCode = async (email: string) => {
    try {
      await sendMutation.mutateAsync(email.toLowerCase().trim());
      timer.start();
      setStep(2);
    } catch (err: any) {
      showToast({ message: err?.message || "Sign in failed. Please try again.", severity: "error" });
    }
  };

  const verifyCode = async () => {
    const { email } = form.getValues();
    const code = otp.otpCode.join("");
    if (code.length < OTP_CODE_LENGTH) return;
    try {
      timer.clear();
      const location = await getUserLocation();
      await verifyMutation.mutateAsync({ email: email.toLowerCase().trim(), otp: code, location });
    } catch {
      showToast({ message: "The code you entered didn't match. Please check and try again.", severity: "error" });
    }
  };

  const onSubmit = async (data: SigninFormValues) => {
    if (step === 1) await sendCode(data.email);
    else await verifyCode();
  };

  const resendCode = async () => {
    const email = form.getValues("email");
    otp.reset();
    await sendCode(email);
  };

  const changeEmail = () => {
    timer.clear();
    setStep(1);
    otp.reset();
    form.setValue("code", "");
  };

  return {
    form, step, loading,
    emailValue, otp, invitationEmail, timer,
    OTP_CODE_LENGTH,
    onSubmit, resendCode, changeEmail,
  };
}
