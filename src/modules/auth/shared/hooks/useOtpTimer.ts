import { usePersistentCountdown } from "@/hooks/usePersistentCountdown";
import { OTP_TTL } from "../types";

export function useOtpTimer(storageKey: string) {
  return usePersistentCountdown({ ttl: OTP_TTL, storageKey });
}
