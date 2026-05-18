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
  upsertCandidateMessage,
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
import { toChatShellMessage } from "@/modules/candidate-chat/utils/mappers";
import type { CandidateMessage } from "@/modules/candidate-chat/types";

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

    const socket = connectCandidateChatSocket(String(currentUserId));
    if (!socket) return;

    const handleIncomingMessage = (payload: unknown) => {
      const normalized = normalizeCandidateSocketMessage(payload as Parameters<typeof normalizeCandidateSocketMessage>[0]);
      const msgId = String(normalized._id || "");
      if (
        msgId
        && store.getState().candidateChat.messages.some((m) => String(m._id) === msgId)
      ) {
        return;
      }

      const senderId = String(normalized.sender._id);
      const isIncoming = senderId !== String(currentUserId);
      if (normalized.deliveryBlocked && isIncoming) return;

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

      dispatch(addCandidateMessage({
        message: normalized,
        viewerUserId: String(currentUserId),
        viewerIsViewingConversation,
      }));

      // addCandidateMessage already updates conversations (lastMessage preview, sort order,
      // unreadCount) and messages in Redux. Only invalidate unreadCount to sync the server total.
      queryClient.invalidateQueries({ queryKey: candidateChatKeys.unreadCount() });

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
    };

    const handleMessageDeleted = (payload: {
      messageId?: string;
      conversationId?: string;
    }) => {
      if (!payload?.messageId) return;
      const cid = payload.conversationId ? String(payload.conversationId) : "";
      if (cid) {
        queryClient.setQueriesData(
          { queryKey: candidateChatKeys.messages(cid) },
          (old) => {
            if (!Array.isArray(old)) return old;
            return old.filter((m) => String(m._id) !== String(payload.messageId));
          },
        );
      }
      dispatch(removeCandidateMessage(String(payload.messageId)));
    };

    const handleMessageUpdated = (payload: {
      message?: CandidateMessage;
      conversationId?: string;
    }) => {
      if (!payload?.message?._id) return;
      const merged: CandidateMessage = {
        ...payload.message,
        conversationId: payload.message.conversationId ?? payload.conversationId,
      };
      const mapped = toChatShellMessage(merged);
      const cid = merged.conversationId ? String(merged.conversationId) : "";
      if (cid) {
        queryClient.setQueriesData({ queryKey: candidateChatKeys.messages(cid) }, (old) => {
          if (!Array.isArray(old)) return old;
          const id = String(mapped._id);
          const idx = old.findIndex((m) => String(m._id) === id);
          if (idx < 0) return old;
          const next = [...old];
          next[idx] = mapped;
          return next;
        });
      }
      dispatch(upsertCandidateMessage(mapped));
    };

    const handleConversationDeleted = ({ conversationId }: { conversationId: string }) => {
      dispatch(removeCandidateConversation(conversationId));
      queryClient.setQueriesData(
        { queryKey: [...candidateChatKeys.all, "conversations"] },
        (old) => {
          if (!Array.isArray(old)) return old;
          return old.filter((c: any) => String(c._id) !== String(conversationId));
        },
      );
      queryClient.invalidateQueries({ queryKey: candidateChatKeys.unreadCount() });
    };

    socket.on("new_message", handleIncomingMessage);
    socket.on("message_notification", handleIncomingMessage);
    socket.on("message_deleted", handleMessageDeleted);
    socket.on("message_updated", handleMessageUpdated);
    socket.on("conversation_deleted", handleConversationDeleted);

    return () => {
      socket.off("new_message", handleIncomingMessage);
      socket.off("message_notification", handleIncomingMessage);
      socket.off("message_deleted", handleMessageDeleted);
      socket.off("message_updated", handleMessageUpdated);
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

    const uid = String(currentUser._id);
    connectCandidateChatSocket(uid);
    const joinRoom = () => {
      if (conversationId) joinCandidateConversationRoom(conversationId);
    };

    joinRoom();
    const socket = connectCandidateChatSocket(uid);
    socket?.on("connect", joinRoom);

    return () => {
      socket?.off("connect", joinRoom);
      if (conversationId) leaveCandidateConversationRoom(conversationId);
    };
  }, [conversationId, currentUser?._id, enabled]);
};
