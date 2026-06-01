import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/modules/auth/shared/api";
import { useVerifyOtp } from "@/modules/auth/shared/hooks";
import type { VerifyOtpResponse } from "@/modules/auth/shared/types";

export const useRegisterMutation = () =>
  useMutation({
    mutationFn: (payload: FormData | Record<string, any>) => authApi.register(payload),
  });

export const useVerifyRegisterOtp = (onSuccess?: (data: VerifyOtpResponse) => void) =>
  useVerifyOtp(onSuccess);

export const useResendRegisterOtp = () =>
  useMutation({
    mutationFn: (email: string) => authApi.resendOtp(email),
  });
