import { useEffect } from "react";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { fetchEmployeePermissions } from "@/store/slices/memberSlice";
import type { AppDispatch } from "@/store/store";
import { useOtpFlow } from "@/modules/auth/shared/hooks";
import { resolveRedirectPath } from "@/modules/auth/shared/utils";
import { useSendSigninCode, useVerifySigninOtp } from "../queries";
import { OTP_STORAGE_KEY, SIGNIN_EMAIL_KEY } from "../utils";

export function useSigninOtp() {
  const router    = useRouter();
  const dispatch  = useDispatch<AppDispatch>();
  const returnUrl = router.query.returnUrl as string | undefined;

  const email = typeof window !== "undefined"
    ? (sessionStorage.getItem(SIGNIN_EMAIL_KEY) ?? "")
    : "";

  useEffect(() => {
    if (router.isReady && !email) {
      router.replace(`/signin${returnUrl ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ""}`);
    }
  }, [router.isReady]);

  const sendMutation   = useSendSigninCode();
  const verifyMutation = useVerifySigninOtp((data) => {
    sessionStorage.removeItem(SIGNIN_EMAIL_KEY);
    if (data.user?.role === "Employee" && data.user?._id) {
      dispatch(fetchEmployeePermissions(data.user._id));
    }
    router.replace(resolveRedirectPath(data.user?.role, data.profile?._id, returnUrl));
  });

  const { timer, otp, verifyCode, resendCode, cleanup, verifyLoading } = useOtpFlow({
    storageKey:     OTP_STORAGE_KEY,
    verifyMutation,
    resendMutation: sendMutation,
  });

  useEffect(() => () => cleanup(), []);

  const changeEmail = () => {
    cleanup();
    sessionStorage.removeItem(SIGNIN_EMAIL_KEY);
    router.push(`/signin${returnUrl ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ""}`);
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
