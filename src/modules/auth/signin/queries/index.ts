import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/modules/auth/shared/api";
import { useVerifyOtp } from "@/modules/auth/shared/hooks";
import type { VerifyOtpResponse } from "@/modules/auth/shared/types";

export const useSendSigninCode = () =>
  useMutation({
    mutationFn: ({ email, lang, signal }: { email: string; lang?: string; signal?: AbortSignal }) =>
      authApi.signin(email, lang, signal),
  });

export const useVerifySigninOtp = (onSuccess?: (data: VerifyOtpResponse) => void) =>
  useVerifyOtp(onSuccess);
