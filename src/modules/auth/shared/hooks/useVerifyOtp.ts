import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import Cookies from "js-cookie";
import type { AppDispatch } from "@/store/store";
import { setConnectedUser } from "@/store/slices/userSlice";
import { authApi } from "../api";
import type { VerifyOtpResponse } from "../types";

export function useVerifyOtp(onSuccess?: (data: VerifyOtpResponse) => void) {
  const dispatch = useDispatch<AppDispatch>();

  return useMutation({
    mutationFn: ({ email, otp, location }: { email: string; otp: string; location?: any }) =>
      authApi.verifyOtp(email, otp, location),
    onSuccess: (data) => {
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("api_token", data.token);
        Cookies.set("api_token", data.token, { expires: 30, path: "/", sameSite: "lax" });
      }
      if (data.user?.role) {
        Cookies.set("user_role", data.user.role, { expires: 30, path: "/", sameSite: "lax" });
      }
      if (data.user) {
        dispatch(
          setConnectedUser({
            user:              data.user,
            profile:           data.profile           ?? null,
            planLimits:        data.planLimits        ?? null,
            companyMembership: data.companyMembership ?? null,
          })
        );
      }
      onSuccess?.(data);
    },
  });
}
