import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { RootState, AppDispatch, store } from "@/store/store";
import { emitToast } from "@/utils/toastEmitter";
import { playNotificationSound } from "@/modules/shared/chat";
import { getIncomingMessageFlags } from "@/modules/shared/chat/unread/incoming";
import { normalizeResolvedPath } from "@/modules/shared/chat/unread/paths";
import { addTeamMessage } from "@/modules/team-chat/store/teamChatSlice";
import { teamChatKeys } from "@/modules/team-chat/queries/keys";
import { useTeamConversationsQuery } from "@/modules/team-chat/queries/useTeamChatQueries";
import {
  connectTeamChatSocket,
  disconnectTeamChatSocket,
  joinTeamConversationRoom,
  leaveTeamConversationRoom,
} from "@/modules/team-chat/realtime/teamChatSocket";
import { toChatShellMessage } from "@/modules/team-chat/utils/mappers";

export const useTeamChatRealtime = () => {
  const dispatch = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();
  const router = useRouter();
  const currentUser = useSelector((state: RootState) => state.user.connectedUser.user);
  const routeContextRef = useRef({
    pathname: normalizeResolvedPath(router.asPath),
    role: currentUser?.role ?? null,
  });
  const currentUserId = currentUser?._id;
  const isTeamChatUser = currentUser?.role === "Company" || currentUser?.role === "Employee";

  useEffect(() => {
    routeContextRef.current = {
      pathname: normalizeResolvedPath(router.asPath),
      role: currentUser?.role ?? null,
    };
  }, [currentUser?.role, router.asPath]);

  useTeamConversationsQuery(undefined, { enabled: isTeamChatUser && !!currentUserId });

  useEffect(() => {
    if (!isTeamChatUser || !currentUserId) {
      disconnectTeamChatSocket();
      return;
    }

    const socket = connectTeamChatSocket(currentUserId);
    if (!socket) return;

    const handleIncomingMessage = (payload: { message: any; conversationId: string }) => {
      const normalized = toChatShellMessage({
        ...payload.message,
        conversationId: payload.conversationId || payload.message?.conversationId,
      });
      const senderId = String(normalized.sender._id);
      const isIncoming = senderId !== String(currentUserId);
      const openConversationId = store.getState().teamChat.currentConversation?._id || null;
      const conversationId = String(payload.conversationId || normalized.conversationId || "");
      const { viewerIsViewingConversation, shouldNotify } = getIncomingMessageFlags({
        module: "team",
        pathname: routeContextRef.current.pathname,
        role: routeContextRef.current.role,
        openConversationId,
        currentUserId: String(currentUserId),
        message: normalized,
        conversationId,
      });
      const alreadyVisible = store.getState().teamChat.messages.some(
        (message) => String(message._id) === String(normalized._id),
      );

      if (!isIncoming && alreadyVisible) return;

      dispatch(addTeamMessage({
        message: normalized,
        viewerUserId: String(currentUserId),
        viewerIsViewingConversation,
      }));

      if (!shouldNotify) return;

      playNotificationSound();
      const preview = normalized.text?.trim();
      emitToast({
        severity: "info",
        message: preview
          ? `New team message: ${preview.length > 80 ? `${preview.slice(0, 80)}...` : preview}`
          : "You have a new team message.",
      });

      queryClient.invalidateQueries({ queryKey: teamChatKeys.unreadCount() });
      queryClient.invalidateQueries({ queryKey: teamChatKeys.conversations() });
    };

    socket.on("new_team_message", handleIncomingMessage);

    return () => {
      socket.off("new_team_message", handleIncomingMessage);
    };
  }, [currentUserId, dispatch, isTeamChatUser, queryClient]);

  useEffect(() => () => {
    if (!isTeamChatUser) disconnectTeamChatSocket();
  }, [isTeamChatUser]);
};

export const useTeamChatConversationRoom = (conversationId: string | null) => {
  const currentUser = useSelector((state: RootState) => state.user.connectedUser.user);
  const isTeamChatUser = currentUser?.role === "Company" || currentUser?.role === "Employee";

  useEffect(() => {
    if (!isTeamChatUser || !currentUser?._id || !conversationId) return;

    connectTeamChatSocket(currentUser._id);
    const joinRoom = () => {
      if (conversationId) joinTeamConversationRoom(conversationId);
    };

    joinRoom();
    const socket = connectTeamChatSocket(currentUser._id);
    socket?.on("connect", joinRoom);

    return () => {
      socket?.off("connect", joinRoom);
      if (conversationId) leaveTeamConversationRoom(conversationId);
    };
  }, [conversationId, currentUser?._id, isTeamChatUser]);
};
