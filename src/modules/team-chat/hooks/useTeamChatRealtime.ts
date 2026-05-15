import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { RootState, AppDispatch, store } from "@/store/store";
import { emitToast } from "@/utils/toastEmitter";
import { playNotificationSound } from "@/modules/shared/chat";
import { getIncomingMessageFlags } from "@/modules/shared/chat/unread/incoming";
import { normalizeResolvedPath } from "@/modules/shared/chat/unread/paths";
import { addTeamMessage, removeTeamConversation, removeTeamMessage, upsertTeamMessage } from "@/modules/team-chat/store/teamChatSlice";
import { teamChatKeys } from "@/modules/team-chat/queries/keys";
import { useTeamConversationsQuery } from "@/modules/team-chat/queries/useTeamChatQueries";
import {
  connectTeamChatSocket,
  disconnectTeamChatSocket,
  joinTeamConversationRoom,
  leaveTeamConversationRoom,
} from "@/modules/team-chat/realtime/teamChatSocket";
import { toChatShellMessage } from "@/modules/team-chat/utils/mappers";
import type { TeamMessage } from "@/modules/team-chat/types";

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
      const msgId = String(normalized._id || "");
      if (
        msgId
        && store.getState().teamChat.messages.some((m) => String(m._id) === msgId)
      ) {
        return;
      }

      const senderId = String(normalized.sender._id);
      const isIncoming = senderId !== String(currentUserId);
      if (normalized.deliveryBlocked && isIncoming) return;

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

      queryClient.invalidateQueries({ queryKey: teamChatKeys.unreadCount() });
      queryClient.invalidateQueries({ queryKey: teamChatKeys.conversations() });
      if (conversationId) {
        queryClient.invalidateQueries({
          queryKey: teamChatKeys.messages(conversationId),
        });
      }

      if (!shouldNotify) return;

      playNotificationSound();
      const preview = normalized.text?.trim();
      emitToast({
        severity: "info",
        message: preview
          ? `New team message: ${preview.length > 80 ? `${preview.slice(0, 80)}...` : preview}`
          : "You have a new team message.",
      });
    };

    const handleTeamMessageDeleted = async (payload: {
      messageId?: string;
      conversationId?: string;
    }) => {
      if (!payload?.messageId) return;
      const cid = payload.conversationId ? String(payload.conversationId) : "";
      if (cid) {
        await queryClient.cancelQueries({
          queryKey: [...teamChatKeys.all, "messages", cid],
        });
        queryClient.setQueriesData(
          { queryKey: [...teamChatKeys.all, "messages", cid] },
          (old) => {
            if (!Array.isArray(old)) return old;
            return old.filter((m) => String(m._id) !== String(payload.messageId));
          },
        );
      }
      dispatch(removeTeamMessage(String(payload.messageId)));
      await queryClient.invalidateQueries({ queryKey: teamChatKeys.conversations() });
      if (cid) {
        await queryClient.invalidateQueries({
          queryKey: [...teamChatKeys.all, "messages", cid],
        });
      }
      await queryClient.invalidateQueries({ queryKey: teamChatKeys.unreadCount() });
    };

    const handleTeamConversationHidden = (payload: {
      conversationId?: string;
      hiddenBy?: string;
    }) => {
      if (!payload?.conversationId || String(payload.hiddenBy) !== String(currentUserId)) return;
      const id = String(payload.conversationId);
      dispatch(removeTeamConversation(id));
      queryClient.removeQueries({ queryKey: teamChatKeys.messages(id) });
      queryClient.removeQueries({ queryKey: teamChatKeys.conversation(id) });
      queryClient.invalidateQueries({ queryKey: teamChatKeys.conversations() });
      queryClient.invalidateQueries({ queryKey: teamChatKeys.unreadCount() });
    };

    const handleTeamMessageUpdated = async (payload: {
      message?: TeamMessage;
      conversationId?: string;
    }) => {
      if (!payload?.message?._id) return;
      const merged = {
        ...payload.message,
        conversationId: payload.message.conversationId ?? payload.conversationId,
      };
      const mapped = toChatShellMessage(merged);
      const cid = merged.conversationId ? String(merged.conversationId) : "";
      if (cid) {
        await queryClient.cancelQueries({
          queryKey: [...teamChatKeys.all, "messages", cid],
        });
        queryClient.setQueriesData({ queryKey: [...teamChatKeys.all, "messages", cid] }, (old) => {
          if (!Array.isArray(old)) return old;
          const id = String(mapped._id);
          const idx = old.findIndex((m) => String(m._id) === id);
          if (idx < 0) return old;
          const next = [...old];
          next[idx] = mapped;
          return next;
        });
      }
      dispatch(upsertTeamMessage(mapped));
      await queryClient.invalidateQueries({ queryKey: teamChatKeys.conversations() });
      if (cid) {
        await queryClient.invalidateQueries({
          queryKey: [...teamChatKeys.all, "messages", cid],
        });
      }
      await queryClient.invalidateQueries({ queryKey: teamChatKeys.unreadCount() });
    };

    socket.on("new_team_message", handleIncomingMessage);
    socket.on("team_message_deleted", handleTeamMessageDeleted);
    socket.on("team_conversation_hidden", handleTeamConversationHidden);

    socket.on("team_message_updated", handleTeamMessageUpdated);

    return () => {
      socket.off("new_team_message", handleIncomingMessage);
      socket.off("team_message_deleted", handleTeamMessageDeleted);
      socket.off("team_conversation_hidden", handleTeamConversationHidden);
      socket.off("team_message_updated", handleTeamMessageUpdated);
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

    const socket = connectTeamChatSocket(currentUser._id);
    const joinRoom = () => {
      if (conversationId) joinTeamConversationRoom(conversationId);
    };

    joinRoom();
    socket?.on("connect", joinRoom);

    return () => {
      socket?.off("connect", joinRoom);
      if (conversationId) leaveTeamConversationRoom(conversationId);
    };
  }, [conversationId, currentUser?._id, isTeamChatUser]);
};
