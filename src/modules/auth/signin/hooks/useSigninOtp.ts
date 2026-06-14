import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useOtpFlow } from "@/modules/auth/shared/hooks";
import { resolveRedirectPath } from "@/modules/auth/shared/utils";
import { useSendSigninCode, useVerifySigninOtp } from "../queries";
import { OTP_STORAGE_KEY, SIGNIN_EMAIL_KEY } from "../utils";
import { OTP_CODE_LENGTH } from "@/modules/auth/shared/types";

export function useSigninOtp() {
  const router    = useRouter();
  const returnUrl = router.query.returnUrl as string | undefined;

  // Read email from sessionStorage exactly once (lazy init).
  // It was written by useSignin before navigation and won't change during the
  // OTP page's lifecycle. Reading via useState avoids a sessionStorage call on
  // every render (timer ticks, loading state changes, digit entries).
  const [email] = useState(() =>
    typeof window !== "undefined" ? (sessionStorage.getItem(SIGNIN_EMAIL_KEY) ?? "") : "",
  );

  // Redirect back to signin if there's no email (direct navigation / refresh
  // after sessionStorage was cleared).
  useEffect(() => {
    if (router.isReady && !email) {
      router.replace(
        `/signin${returnUrl ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ""}`,
      );
    }
  }, [router.isReady]); // eslint-disable-line react-hooks/exhaustive-deps

  const sendMutation = useSendSigninCode();
  // fetchEmployeePermissions is dispatched inside useVerifyOtp's onSuccess —
  // before login() and before navigation — giving it the maximum head start.
  const verifyMutation = useVerifySigninOtp((data) => {
    sessionStorage.removeItem(SIGNIN_EMAIL_KEY);
    router.replace(resolveRedirectPath(data.user?.role, data.profile?._id, returnUrl));
  });

  const { timer, otp, verifyCode, resendCode, cleanup, verifyLoading } = useOtpFlow({
    storageKey:     OTP_STORAGE_KEY,
    verifyMutation,
    resendMutation: sendMutation,
  });

  // Auto-submit when all 6 digits are filled. This is the standard OTP UX
  // (Google, Apple, WhatsApp) — no explicit button tap required. The verify
  // call internally checks code length, so false positives are impossible.
  const isOtpComplete = otp.otpCode.length === OTP_CODE_LENGTH &&
                        otp.otpCode.every(d => d !== "");
  useEffect(() => {
    if (!isOtpComplete || verifyLoading || timer.isExpired) return;
    verifyCode(email);
  }, [isOtpComplete]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => cleanup(), []); // eslint-disable-line react-hooks/exhaustive-deps

  const changeEmail = () => {
    cleanup();
    sessionStorage.removeItem(SIGNIN_EMAIL_KEY);
    router.push(
      `/signin${returnUrl ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ""}`,
    );
  };

  return {
    email,
    otp,
    timer,
    loading:       verifyLoading,
    resendLoading: sendMutation.isPending,
    onVerify:      () => verifyCode(email),
    onResend:      () => resendCode(email),
    changeEmail,
  };
}
