import { useEffect, useLayoutEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { RootState, AppDispatch, store } from "@/store/store";
import { emitToast } from "@/utils/toastEmitter";
import { playNotificationSound } from "@/modules/chat/shared";
import { getIncomingMessageFlags } from "@/modules/chat/shared/unread/incoming";
import { normalizeResolvedPath } from "@/modules/chat/shared/unread/paths";
import {
  addCandidateMessage,
  removeCandidateConversation,
  removeCandidateMessage,
  upsertCandidateMessage,
} from "@/modules/chat/candidate-chat/store/candidateChatSlice";
import { candidateChatKeys } from "@/modules/chat/candidate-chat/queries/keys";
import { useCandidateConversationsQuery } from "@/modules/chat/candidate-chat/queries/useCandidateChatQueries";
import {
  connectCandidateChatSocket,
  disconnectCandidateChatSocket,
  joinCandidateConversationRoom,
  leaveCandidateConversationRoom,
} from "@/modules/chat/candidate-chat/realtime/candidateChatSocket";
import { normalizeCandidateSocketMessage } from "@/modules/chat/candidate-chat/realtime/normalizeSocketMessage";
import { toChatShellMessage } from "@/modules/chat/candidate-chat/utils/mappers";
import type { CandidateMessage } from "@/modules/chat/candidate-chat/types";

const isCandidateChatUser = (role?: string | null) =>
  role === "Company" || role === "Candidate";

export const useCandidateChatRealtime = () => {
  const dispatch = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { t } = useTranslation("modules/candidates/candidateChat");
  const currentUser = useSelector((state: RootState) => state.user.connectedUser.user);
  const currentUserId = currentUser?._id;
  const enabled = isCandidateChatUser(currentUser?.role);

  // All values that change between renders live in a ref so socket handlers
  // always read the latest value without the effect being torn down and re-registered.
  const latestRef = useRef({
    t,
    pathname: normalizeResolvedPath(router.asPath),
    role: currentUser?.role ?? null,
    currentUserId,
    dispatch,
    queryClient,
  });

  // useLayoutEffect keeps the ref in sync before any paint so handlers never
  // close over a stale value even on the same render cycle.
  useLayoutEffect(() => {
    latestRef.current = {
      t,
      pathname: normalizeResolvedPath(router.asPath),
      role: currentUser?.role ?? null,
      currentUserId,
      dispatch,
      queryClient,
    };
  });

  useCandidateConversationsQuery(undefined, { enabled: enabled && !!currentUserId });

  useEffect(() => {
    if (!enabled || !currentUserId) {
      disconnectCandidateChatSocket();
      return;
    }

    const socket = connectCandidateChatSocket(String(currentUserId));
    if (!socket) return;

    const handleIncomingMessage = (payload: unknown) => {
      // Always read from ref — never from stale closure
      const { currentUserId: uid, pathname, role, dispatch: d, queryClient: qc, t: translate } = latestRef.current;
      if (!uid) return;

      const normalized = normalizeCandidateSocketMessage(payload as Parameters<typeof normalizeCandidateSocketMessage>[0]);
      const msgId = String(normalized._id || "");
      if (
        msgId
        && store.getState().candidateChat.messages.some((m) => String(m._id) === msgId)
      ) {
        return;
      }

      const senderId = String(normalized.sender._id);
      const isIncoming = senderId !== String(uid);
      if (normalized.deliveryBlocked && isIncoming) return;

      // For own messages: if there is already a pending (optimistic) temp in Redux,
      // the send mutation's onSuccess will handle the temp→confirmed transition via
      // confirmCandidatePendingMessage. Processing the socket echo here would add
      // a second confirmed bubble alongside the temp — causing a double-bubble flash.
      // Skip unless there is no pending temp (e.g., another tab sent the message).
      if (!isIncoming) {
        const hasPendingFromSelf = store.getState().candidateChat.messages.some(
          (m) => m.pending && String(m.sender._id) === senderId,
        );
        if (hasPendingFromSelf) return;
      }

      const openConversationId = store.getState().candidateChat.currentConversation?._id || null;
      const conversationId = String(normalized.conversationId || "");
      const { viewerIsViewingConversation, shouldNotify } = getIncomingMessageFlags({
        module: "candidate",
        pathname,
        role,
        openConversationId,
        currentUserId: String(uid),
        message: normalized,
        conversationId,
      });

      d(addCandidateMessage({
        message: normalized,
        viewerUserId: String(uid),
        viewerIsViewingConversation,
      }));

      // addCandidateMessage only appends to Redux when the conversation is the one
      // currently open (applyIncomingMessage's isActiveConversation gate). For a
      // backgrounded conversation, patch its messages query cache directly too —
      // otherwise the staleTime: Infinity cache never learns about this message,
      // and reopening the conversation later re-renders the stale cached list
      // (missing this message) instead of refetching from the server.
      qc.setQueriesData(
        { queryKey: candidateChatKeys.messages(conversationId) },
        (old) => {
          if (!Array.isArray(old)) return old;
          if (old.some((m) => String(m._id) === msgId)) return old;
          return [...old, normalized].sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          );
        },
      );

      // addCandidateMessage already updates conversations (lastMessage preview, sort order,
      // unreadCount) and messages in Redux. Only invalidate unreadCount to sync the server total.
      qc.invalidateQueries({ queryKey: candidateChatKeys.unreadCount() });

      if (!shouldNotify) return;

      playNotificationSound();
      const preview = normalized.text?.trim();
      emitToast({
        severity: "info",
        message: preview
          ? translate("realtime.new_message", {
              preview: preview.length > 80 ? `${preview.slice(0, 80)}...` : preview,
            })
          : translate("realtime.new_message_fallback"),
      });
    };

    const handleMessageDeleted = (payload: {
      messageId?: string;
      conversationId?: string;
    }) => {
      const { dispatch: d, queryClient: qc } = latestRef.current;
      if (!payload?.messageId) return;
      const cid = payload.conversationId ? String(payload.conversationId) : "";
      if (cid) {
        qc.setQueriesData(
          { queryKey: candidateChatKeys.messages(cid) },
          (old) => {
            if (!Array.isArray(old)) return old;
            return old.filter((m) => String(m._id) !== String(payload.messageId));
          },
        );
      }
      d(removeCandidateMessage(String(payload.messageId)));
    };

    const handleMessageUpdated = (payload: {
      message?: CandidateMessage;
      conversationId?: string;
    }) => {
      const { dispatch: d, queryClient: qc } = latestRef.current;
      if (!payload?.message?._id) return;
      const merged: CandidateMessage = {
        ...payload.message,
        conversationId: payload.message.conversationId ?? payload.conversationId,
      };
      const mapped = toChatShellMessage(merged);
      const cid = merged.conversationId ? String(merged.conversationId) : "";
      if (cid) {
        qc.setQueriesData({ queryKey: candidateChatKeys.messages(cid) }, (old) => {
          if (!Array.isArray(old)) return old;
          const id = String(mapped._id);
          const idx = old.findIndex((m) => String(m._id) === id);
          if (idx < 0) return old;
          const next = [...old];
          next[idx] = mapped;
          return next;
        });
      }
      d(upsertCandidateMessage(mapped));
    };

    const handleConversationDeleted = ({ conversationId }: { conversationId: string }) => {
      const { dispatch: d, queryClient: qc } = latestRef.current;
      const isActive = store.getState().candidateChat.currentConversation?._id === conversationId;

      if (isActive) {
        // Don't nuke the conversation while the user is viewing it — the backend may
        // emit conversation_deleted when all messages are cleared, not just on true deletion.
        // Clear the message cache and let the next conversations fetch reconcile the truth.
        qc.setQueriesData(
          { queryKey: candidateChatKeys.messages(conversationId) },
          () => [],
        );
        qc.invalidateQueries({ queryKey: [...candidateChatKeys.all, "conversations"] });
      } else {
        d(removeCandidateConversation(conversationId));
        qc.setQueriesData(
          { queryKey: [...candidateChatKeys.all, "conversations"] },
          (old) => {
            if (!Array.isArray(old)) return old;
            return old.filter((c: any) => String(c._id) !== String(conversationId));
          },
        );
      }
      qc.invalidateQueries({ queryKey: candidateChatKeys.unreadCount() });
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
  // Only re-register listeners when the user identity or enabled flag changes.
  // All other values (t, queryClient, dispatch, router) are read from latestRef.
  }, [currentUserId, enabled]);

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
