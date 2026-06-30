import { useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store/store";
import { setConnectedUser } from "@/store/slices/userSlice";
import { useAuthActions } from "@/modules/auth/shared/context/AuthContext";
import { notificationApi } from "@/modules/notifications/shared/api";
import { notifMessages } from "@/modules/notifications/shared/i18n";
import { saveToken } from "../utils/token";
import { authApi } from "../api";
import type { VerifyOtpPayload, VerifyOtpResponse } from "../types";

interface UseVerifyOtpOptions {
  sendWelcome?: boolean;
}

export function useVerifyOtp(
  onSuccess?: (data: VerifyOtpResponse) => void,
  options?: UseVerifyOtpOptions,
) {
  const dispatch = useDispatch<AppDispatch>();
  // useAuthActions() subscribes to the stable context — never re-renders when
  // isAuthenticated / isLoggingOut change. login() is a stable useCallback ref.
  const { login } = useAuthActions();

  // Stable ref so changing onSuccess never recreates the mutation object.
  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;

  return useMutation({
    mutationFn: (payload: VerifyOtpPayload) => authApi.verifyOtp(payload),

    onSuccess: (data) => {
      // Sets the JS-readable auth_present indicator cookie.
      // The actual JWT was delivered server-side as an httpOnly cookie.
      saveToken();

      dispatch(setConnectedUser({
        user:              data.user,
        profile:           data.profile           ?? null,
        planLimits:        data.planLimits         ?? null,
        companyMembership: data.companyMembership  ?? null,
      }));

      login();

      if (options?.sendWelcome) {
        notificationApi.createNotification("success", notifMessages.welcome()).catch(() => {});
      }

      onSuccessRef.current?.(data);
    },
  });
}
