import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/modules/auth/shared/api";
import { useVerifyOtp } from "@/modules/auth/shared/hooks";
import type { VerifyOtpResponse } from "@/modules/auth/shared/types";

export const useSendSigninCode = () =>
  useMutation({
    mutationFn: ({ email, signal }: { email: string; signal?: AbortSignal }) =>
      authApi.signin(email, signal),
  });

export const useVerifySigninOtp = (onSuccess?: (data: VerifyOtpResponse) => void) =>
  useVerifyOtp(onSuccess);
