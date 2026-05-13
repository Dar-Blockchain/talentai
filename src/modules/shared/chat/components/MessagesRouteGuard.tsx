import React from "react";
import { Box, CircularProgress } from "@mui/material";
import { useMessagesRouteAccess } from "@/modules/shared/chat/hooks/useMessagesRouteAccess";
import type { MessagesRouteSurface } from "@/modules/shared/chat/constants/messagesRouteAccess";

interface MessagesRouteGuardProps {
  surface: MessagesRouteSurface;
  children: React.ReactNode;
}

const MessagesRouteGuard: React.FC<MessagesRouteGuardProps> = ({ surface, children }) => {
  const { checking } = useMessagesRouteAccess(surface);

  if (checking) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 240 }}>
        <CircularProgress sx={{ color: "#0D9488" }} />
      </Box>
    );
  }

  return <>{children}</>;
};

export default MessagesRouteGuard;
