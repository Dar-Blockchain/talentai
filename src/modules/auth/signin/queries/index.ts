import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/modules/auth/shared/api";
import { useVerifyOtp } from "@/modules/auth/shared/hooks";
import type { VerifyOtpResponse } from "@/modules/auth/shared/types";

export const useSendSigninCode = () =>
  useMutation({
    mutationFn: (email: string) => authApi.signin(email),
  });

export const useVerifySigninOtp = (onSuccess?: (data: VerifyOtpResponse) => void) =>
  useVerifyOtp(onSuccess);
