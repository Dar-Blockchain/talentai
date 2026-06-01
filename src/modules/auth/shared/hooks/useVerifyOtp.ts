import { useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import Cookies from "js-cookie";
import type { AppDispatch } from "@/store/store";
import { setConnectedUser } from "@/store/slices/userSlice";
import { authApi } from "../api";
import type { VerifyOtpPayload, VerifyOtpResponse } from "../types";

const TOKEN_KEY      = "api_token";
const ROLE_KEY       = "user_role";
const COOKIE_OPTIONS = { expires: 30, path: "/", sameSite: "strict" } as const;

function persistSession(token: string, role: string): void {
  // Cookie only — no localStorage (XSS risk)
  Cookies.set(TOKEN_KEY, token, COOKIE_OPTIONS);
  Cookies.set(ROLE_KEY,  role,  COOKIE_OPTIONS);
}

export function useVerifyOtp(onSuccess?: (data: VerifyOtpResponse) => void) {
  const dispatch     = useDispatch<AppDispatch>();
  const queryClient  = useQueryClient();

  // Stable ref — changing onSuccess never recreates the mutation object
  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;

  return useMutation({
    mutationFn: (payload: VerifyOtpPayload) => authApi.verifyOtp(payload),

    onSuccess: (data) => {
      persistSession(data.token, data.user.role);

      dispatch(setConnectedUser({
        user:              data.user,
        profile:           data.profile           ?? null,
        planLimits:        data.planLimits         ?? null,
        companyMembership: data.companyMembership  ?? null,
      }));

      // Clear stale cache from any previous session before navigating
      queryClient.clear();

      onSuccessRef.current?.(data);
    },
  });
}
