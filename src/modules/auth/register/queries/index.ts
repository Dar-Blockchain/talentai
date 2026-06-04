import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/modules/auth/shared/api";
import { useVerifyOtp } from "@/modules/auth/shared/hooks";
import type { VerifyOtpResponse } from "@/modules/auth/shared/types";

export const useRegisterMutation = () =>
  useMutation({
    mutationFn: ({ payload, signal }: { payload: FormData | Record<string, unknown>; signal?: AbortSignal }) =>
      authApi.register(payload, signal),
  });

export const useVerifyRegisterOtp = (onSuccess?: (data: VerifyOtpResponse) => void) =>
  useVerifyOtp(onSuccess, { sendWelcome: true });

export const useResendRegisterOtp = () =>
  useMutation({
    mutationFn: ({ email, signal }: { email: string; signal?: AbortSignal }) =>
      authApi.resendOtp(email, signal),
  });
