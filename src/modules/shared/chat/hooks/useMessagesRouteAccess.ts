import { useEffect } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import {
  isRoleAllowedOnMessagesSurface,
  type MessagesRouteSurface,
} from "@/modules/shared/chat/constants/messagesRouteAccess";

export const useMessagesRouteAccess = (surface: MessagesRouteSurface) => {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user.connectedUser.user);
  const loading = useSelector((state: RootState) => state.user.connectedUser.loading);
  const role = user?.role ?? null;
  const allowed = isRoleAllowedOnMessagesSurface(role, surface);
  const checking = !router.isReady || loading || !user || !allowed;

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
