import { useEffect } from "react";
import { useRouter } from "next/router";
import { useOtpFlow } from "@/modules/auth/shared/hooks";
import { useLoadingWithNavigation } from "@/modules/auth/shared/hooks/useLoadingWithNavigation";
import { OTP_CODE_LENGTH } from "@/modules/auth/shared/types";
import { useVerifyRegisterOtp, useResendRegisterOtp } from "../queries";

interface UseRegisterOtpParams {
  email:         string;
  storageKey:    string;
  redirectPath:  string;
  onChangeEmail: () => void;
}

export function useRegisterOtp({ email, storageKey, redirectPath, onChangeEmail }: UseRegisterOtpParams) {
  const router = useRouter();
  const { loading: navigationLoading, withLoading } = useLoadingWithNavigation();

  const verifyMutation = useVerifyRegisterOtp(() => {
    router.replace(redirectPath);
  });
  const resendMutation = useResendRegisterOtp();

  const { timer, otp, verifyCode: originalVerifyCode, resendCode, abort, cleanup, verifyLoading } = useOtpFlow({
    storageKey,
    verifyMutation,
    resendMutation,
  });

  const verifyCode = async () => {
    await withLoading(async () => {
      await originalVerifyCode(email);
    });
  };

  const loading = verifyLoading || navigationLoading;

  const isOtpComplete = otp.otpCode.length === OTP_CODE_LENGTH && otp.otpCode.every(d => d !== "");
  useEffect(() => {
    if (!isOtpComplete || loading || timer.isExpired) return;
    verifyCode();
  }, [isOtpComplete]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => abort(), []); // eslint-disable-line react-hooks/exhaustive-deps

  const changeEmail = () => {
    cleanup();
    onChangeEmail();
  };

  return {
    email,
    otp,
    timer,
    loading,
    resendLoading: resendMutation.isPending,
    onVerify:      verifyCode,
    onResend:      () => resendCode(email),
    changeEmail,
  };
}
