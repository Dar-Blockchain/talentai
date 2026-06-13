import { useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store/store";
import { setConnectedUser } from "@/store/slices/userSlice";
import { useAuthContext } from "@/modules/auth/shared/context/AuthContext";
import { notificationApi } from "@/modules/notifications/shared/api";
import { notifMessages } from "@/modules/notifications/shared/i18n";
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
  const { login } = useAuthContext();

  // Stable ref so changing onSuccess never recreates the mutation object.
  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;

  return useMutation({
    mutationFn: (payload: VerifyOtpPayload) => authApi.verifyOtp(payload),

    onSuccess: (data) => {
      // The backend sets the jwt_token cookie directly — no client-side cookie write needed.

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
