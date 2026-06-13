import { useRef, useEffect } from "react";
import { useToast } from "@/hooks/useToast";
import { getUserLocation } from "@/utils/api";
import { refreshAbort } from "@/modules/auth/shared/utils";
import { OTP_CODE_LENGTH } from "@/modules/auth/shared/types";
import { useOtpTimer } from "./useOtpTimer";
import { useOtpInput } from "./useOtpInput";

interface UseOtpFlowOptions {
  storageKey: string;
  resendMutation?: { mutateAsync: (args: { email: string; signal?: AbortSignal }) => Promise<any>; isPending: boolean } | null;
  verifyMutation: { mutateAsync: (args: { email: string; otp: string; location?: any; signal?: AbortSignal }) => Promise<any>; isPending: boolean };
}

/**
 * Shared OTP verification + resend logic used by signin, candidate register,
 * and company register. Eliminates the duplicated verifyCode / resendCode
 * implementations across all three hooks.
 */
export function useOtpFlow({ storageKey, verifyMutation, resendMutation }: UseOtpFlowOptions) {
  const { showToast } = useToast();
  const abortRef      = useRef<AbortController | null>(null);
  const locationRef   = useRef<Awaited<ReturnType<typeof getUserLocation>> | undefined>(undefined);
  const timer         = useOtpTimer(storageKey);
  const otp           = useOtpInput();

  // Pre-fetch location in the background so it's ready before the user clicks verify.
  useEffect(() => {
    getUserLocation()
      .then(loc  => { locationRef.current = loc;  })
      .catch(()  => { locationRef.current = null; });
  }, []);

  const verifyCode = async (email: string) => {
    const code = otp.otpCode.join("");
    if (code.length < OTP_CODE_LENGTH) return;

    const signal = refreshAbort(abortRef);
    try {
      // Use cached location; if still pending, wait with a 1.5 s hard cap.
      const location = locationRef.current !== undefined
        ? locationRef.current
        : await Promise.race([
            getUserLocation(),
            new Promise<null>(resolve => setTimeout(() => resolve(null), 1500)),
          ]);
      await verifyMutation.mutateAsync({ email, otp: code, location, signal });
      timer.clear();
    } catch (err: any) {
      if (err?.name !== "AbortError")
        showToast({ message: err?.message ?? "Invalid code. Please try again.", severity: "error" });
    }
  };

  const resendCode = async (email: string) => {
    if (!resendMutation) return;
    const signal = refreshAbort(abortRef);
    try {
      await resendMutation.mutateAsync({ email, signal });
      timer.clear();
      timer.start();
      otp.reset();
      showToast({ message: "A new verification code has been sent to your email.", severity: "success" });
    } catch (err: any) {
      if (err?.name !== "AbortError")
        showToast({ message: err?.message ?? "Failed to resend code.", severity: "error" });
    }
  };

  const cleanup = () => {
    timer.clear();
    abortRef.current?.abort();
  };

  return {
    timer,
    otp,
    verifyCode,
    resendCode,
    cleanup,
    verifyLoading:  verifyMutation.isPending,
    resendLoading:  resendMutation?.isPending ?? false,
  };
}
