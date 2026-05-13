import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { RootState, AppDispatch, store } from "@/store/store";
import { emitToast } from "@/utils/toastEmitter";
import { playNotificationSound } from "@/modules/shared/chat";
import { getIncomingMessageFlags } from "@/modules/shared/chat/unread/incoming";
import { normalizeResolvedPath } from "@/modules/shared/chat/unread/paths";
import {
  addCandidateMessage,
  removeCandidateConversation,
  removeCandidateMessage,
} from "@/modules/candidate-chat/store/candidateChatSlice";
import { candidateChatKeys } from "@/modules/candidate-chat/queries/keys";
import { useCandidateConversationsQuery } from "@/modules/candidate-chat/queries/useCandidateChatQueries";
import {
  connectCandidateChatSocket,
  disconnectCandidateChatSocket,
  joinCandidateConversationRoom,
  leaveCandidateConversationRoom,
} from "@/modules/candidate-chat/realtime/candidateChatSocket";
import { normalizeCandidateSocketMessage } from "@/modules/candidate-chat/realtime/normalizeSocketMessage";

const isCandidateChatUser = (role?: string | null) =>
  role === "Company" || role === "Candidate";

export const useCandidateChatRealtime = () => {
  const dispatch = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { t } = useTranslation("modules/candidates/candidateChat");
  const currentUser = useSelector((state: RootState) => state.user.connectedUser.user);
  const routeContextRef = useRef({
    pathname: normalizeResolvedPath(router.asPath),
    role: currentUser?.role ?? null,
  });
  const currentUserId = currentUser?._id;
  const enabled = isCandidateChatUser(currentUser?.role);

  useEffect(() => {
    routeContextRef.current = {
      pathname: normalizeResolvedPath(router.asPath),
      role: currentUser?.role ?? null,
    };
  }, [currentUser?.role, router.asPath]);

  useCandidateConversationsQuery(undefined, { enabled: enabled && !!currentUserId });

  useEffect(() => {
    if (!enabled || !currentUserId) {
      disconnectCandidateChatSocket();
      return;
    }

    const socket = connectCandidateChatSocket(currentUserId);
    if (!socket) return;

    const handleIncomingMessage = (payload: unknown) => {
      const normalized = normalizeCandidateSocketMessage(payload as Parameters<typeof normalizeCandidateSocketMessage>[0]);
      const senderId = String(normalized.sender._id);
      const isIncoming = senderId !== String(currentUserId);
      const openConversationId = store.getState().candidateChat.currentConversation?._id || null;
      const conversationId = String(normalized.conversationId || "");
      const { viewerIsViewingConversation, shouldNotify } = getIncomingMessageFlags({
        module: "candidate",
        pathname: routeContextRef.current.pathname,
        role: routeContextRef.current.role,
        openConversationId,
        currentUserId: String(currentUserId),
        message: normalized,
        conversationId,
      });
      const alreadyVisible = store.getState().candidateChat.messages.some(
        (message) => String(message._id) === String(normalized._id),
      );

      if (!isIncoming && alreadyVisible) return;

      dispatch(addCandidateMessage({
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
          ? t("realtime.new_message", {
              preview: preview.length > 80 ? `${preview.slice(0, 80)}...` : preview,
            })
          : t("realtime.new_message_fallback"),
      });

      queryClient.invalidateQueries({ queryKey: candidateChatKeys.unreadCount() });
      queryClient.invalidateQueries({ queryKey: candidateChatKeys.conversations() });
    };

    const handleMessageDeleted = ({ messageId }: { messageId: string }) => {
      dispatch(removeCandidateMessage(messageId));
    };

    const handleConversationDeleted = ({ conversationId }: { conversationId: string }) => {
      dispatch(removeCandidateConversation(conversationId));
      queryClient.invalidateQueries({ queryKey: candidateChatKeys.conversations() });
      queryClient.invalidateQueries({ queryKey: candidateChatKeys.unreadCount() });
    };

    socket.on("new_message", handleIncomingMessage);
    socket.on("message_notification", handleIncomingMessage);
    socket.on("message_deleted", handleMessageDeleted);
    socket.on("conversation_deleted", handleConversationDeleted);

    return () => {
      socket.off("new_message", handleIncomingMessage);
      socket.off("message_notification", handleIncomingMessage);
      socket.off("message_deleted", handleMessageDeleted);
      socket.off("conversation_deleted", handleConversationDeleted);
    };
  }, [currentUserId, dispatch, enabled, queryClient, t]);

  useEffect(() => () => {
    if (!enabled) disconnectCandidateChatSocket();
  }, [enabled]);
};

export const useCandidateChatConversationRoom = (conversationId: string | null) => {
  const currentUser = useSelector((state: RootState) => state.user.connectedUser.user);
  const enabled = isCandidateChatUser(currentUser?.role);

  useEffect(() => {
    if (!enabled || !currentUser?._id || !conversationId) return;

    connectCandidateChatSocket(currentUser._id);
    const joinRoom = () => {
      if (conversationId) joinCandidateConversationRoom(conversationId);
    };

    joinRoom();
    const socket = connectCandidateChatSocket(currentUser._id);
    socket?.on("connect", joinRoom);

    return () => {
      socket?.off("connect", joinRoom);
      if (conversationId) leaveCandidateConversationRoom(conversationId);
    };
  }, [conversationId, currentUser?._id, enabled]);
};
