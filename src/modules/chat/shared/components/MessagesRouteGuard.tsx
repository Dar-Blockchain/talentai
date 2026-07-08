import React from "react";
import { Spinner } from "@/modules/shared/ui/shadcn/spinner";
import { useMessagesRouteAccess } from "@/modules/chat/shared/hooks/useMessagesRouteAccess";
import type { MessagesRouteSurface } from "@/modules/chat/shared/constants/messagesRouteAccess";

interface MessagesRouteGuardProps {
  surface: MessagesRouteSurface;
  children: React.ReactNode;
}

const MessagesRouteGuard: React.FC<MessagesRouteGuardProps> = ({ surface, children }) => {
  const { checking } = useMessagesRouteAccess(surface);

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-[240px]">
        <Spinner style={{ color: "#0D9488" }} />
      </div>
    );
  }

  return <>{children}</>;
};

export default MessagesRouteGuard;
