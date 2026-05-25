import { useEffect } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import {
  isRoleAllowedOnMessagesSurface,
  type MessagesRouteSurface,
} from "@/modules/chat/shared/constants/messagesRouteAccess";

export const useMessagesRouteAccess = (surface: MessagesRouteSurface) => {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user.connectedUser.user);
  const loading = useSelector((state: RootState) => state.user.connectedUser.loading);
  const role = user?.role ?? null;
  const allowed = isRoleAllowedOnMessagesSurface(role, surface);
  /** Only block on `loading` while we still have no user (initial auth/profile fetch). If `user` exists, background updates (e.g. `updateProfile` for language) must not swap the whole page for a spinner. */
  const checking = !router.isReady || (!user && loading) || !user || !allowed;

  useEffect(() => {
    if (!router.isReady || loading) return;

    if (!user) {
      router.replace("/signin");
      return;
    }

    if (!isRoleAllowedOnMessagesSurface(role, surface)) {
      router.replace("/unauthorized");
    }
  }, [loading, role, router, router.isReady, surface, user]);

  return { checking, role, allowed };
};
