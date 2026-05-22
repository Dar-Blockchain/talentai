import { useEffect, useRef, useCallback, useState, useMemo } from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { RootState, AppDispatch } from "@/store/store";
import { useToast } from "@/hooks/useToast";
import { deliveryBlockedToastMessage } from "@/modules/chat/shared";
import {
  clearCandidateCurrentConversation,
  setCandidateCurrentConversation,
  selectCandidateConversations,
  selectCandidateCurrentConversation,
  selectCandidateMessages,
} from "@/modules/chat/candidate-chat/store/candidateChatSlice";
import {
  useCandidateConversationQuery,
  useCandidateConversationsQuery,
  useCandidateMessagesQuery,
  useCandidateUnreadCountQuery,
  useDeleteCandidateConversationMutation,
  useDeleteCandidateMessageMutation,
  useMarkCandidateConversationReadMutation,
  useSendCandidateMessageMutation,
  getCandidateChatMutationError,
} from "@/modules/chat/candidate-chat/queries/useCandidateChatQueries";
import { useCandidateChatConversationRoom } from "@/modules/chat/candidate-chat/hooks/useCandidateChatRealtime";
import { normalizeConversationUnreadCount } from "@/modules/chat/shared/utils/normalizeConversationUnread";
import type { ChatShellConversation } from "@/modules/chat/shared/types/shell";

export interface UseCandidateChatSessionOptions {
  /** Conversation id from the URL; `null` when on the inbox route without a thread. */
  initialConversationId: string | null;
  deleteRedirectRoute: string;
  enableDeletes?: boolean;
  onConversationChange?: (id: string) => void;
}

export const useCandidateChatSession = ({
  initialConversationId,
  deleteRedirectRoute,
  enableDeletes = false,
  onConversationChange,
}: UseCandidateChatSessionOptions) => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { showToast } = useToast();
  const { t } = useTranslation("shared/chat");

  const currentUserId = useSelector((state: RootState) => state.user?.connectedUser?.user?._id);
  const userRole = useSelector((state: RootState) => state.user?.connectedUser?.user?.role);
  const conversations = useSelector(selectCandidateConversations, shallowEqual);
  const conversation = useSelector(selectCandidateCurrentConversation);
  const messages = useSelector(selectCandidateMessages, shallowEqual);

  const [activeConversationId, setActiveConversationId] = useState<string | null>(initialConversationId);

  // Sync active thread when the route param changes (including `null` when leaving a thread).
  useEffect(() => {
    setActiveConversationId(initialConversationId);
  }, [initialConversationId]);

  const activeConversationIdRef = useRef<string | null>(initialConversationId);

  const conversationsQuery = useCandidateConversationsQuery(undefined, { enabled: !!currentUserId });
  useCandidateUnreadCountQuery({ enabled: !!currentUserId });
  const conversationQuery = useCandidateConversationQuery(activeConversationId, { enabled: !!currentUserId });
  const messagesQuery = useCandidateMessagesQuery(activeConversationId, undefined, { enabled: !!currentUserId });
  const markReadMutation = useMarkCandidateConversationReadMutation();
  const sendMessageMutation = useSendCandidateMessageMutation();
  const deleteMessageMutation = useDeleteCandidateMessageMutation();
  const deleteConversationMutation = useDeleteCandidateConversationMutation();

  useCandidateChatConversationRoom(activeConversationId);

  const loading = conversationsQuery.isLoading
    || (conversationQuery.isLoading && !conversation)
    || (messagesQuery.isLoading && messages.length === 0);
  const sending = sendMessageMutation.isPending;

  // While the conversations list is still loading/empty but a specific
  // conversation is already loaded (e.g. direct URL access before the list
  // query resolves), surface that conversation so the sidebar isn't blank.
  const effectiveConversations = useMemo(() => {
    if (conversations.length > 0 || !conversation || !activeConversationId) {
      return conversations;
    }
    return [conversation];
  }, [activeConversationId, conversation, conversations]);

  useEffect(() => {
    if (!activeConversationId) {
      dispatch(clearCandidateCurrentConversation());
      return;
    }
    const idStr = String(activeConversationId);
    const selected = conversations.find((item: ChatShellConversation) => String(item._id) === idStr);
    if (selected && String(conversation?._id ?? "") !== idStr) {
      dispatch(setCandidateCurrentConversation(selected));
    }
  }, [activeConversationId, conversation?._id, conversations, dispatch]);

  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  useEffect(() => {
    if (!activeConversationId || !currentUserId) return;
    markReadMutation.mutate(String(activeConversationId));
    // Intentionally omit `markReadMutation` from deps: including the mutation object can retrigger
    // this effect on unrelated renders and was previously paired with a destructive cleanup.
  }, [activeConversationId, currentUserId]);

  // Mark conversation read when user returns to the tab while already inside a thread.
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && activeConversationIdRef.current && currentUserId) {
        markReadMutation.mutate(String(activeConversationIdRef.current));
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]);

  const handleSelectConversation = useCallback(
    (id: string) => {
      const idStr = String(id);
      const activeStr = activeConversationId != null ? String(activeConversationId) : "";
      const convIdStr = conversation?._id != null ? String(conversation._id) : "";

      const alreadyShowingThisChat = idStr === activeStr && idStr === convIdStr;
      if (alreadyShowingThisChat) return;

      const selected = conversations.find((item: ChatShellConversation) => String(item._id) === idStr);
      if (selected) {
        dispatch(setCandidateCurrentConversation(selected));
      }

      if (idStr === activeStr && idStr !== convIdStr) {
        setActiveConversationId(null);
        queueMicrotask(() => {
          setActiveConversationId(idStr);
          onConversationChange?.(idStr);
        });
        return;
      }

      setActiveConversationId(idStr);
      onConversationChange?.(idStr);
    },
    [activeConversationId, conversation?._id, conversations, dispatch, onConversationChange],
  );

  const handleSendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || !conversation || !currentUserId || !activeConversationId) return;

    const uid = String(currentUserId);
    const other = conversation.participants.find((p) => String(p._id) !== uid);
    if (!other) {
      showToast({ message: t("toast.recipient_not_found"), severity: "error" });
      return;
    }

    try {
      const message = await sendMessageMutation.mutateAsync({
        conversationId: activeConversationId,
        receiverId: other._id,
        text: trimmed,
      });
      // Mutation's onMutate/onSuccess handles Redux updates optimistically.
      if (message.deliveryBlocked) {
        showToast({
          message: deliveryBlockedToastMessage(message.blockedReason, t),
          severity: "warning",
        });
      }
    } catch (error) {
      showToast({
        message: `${t("toast.failed_send")}: ${getCandidateChatMutationError(error, "Unknown error")}`,
        severity: "error",
      });
      throw error;
    }
  }, [
    conversation,
    currentUserId,
    activeConversationId,
    dispatch,
    sendMessageMutation,
    showToast,
    t,
  ]);

  const handleDeleteMessage = useCallback(async (messageId: string, scope?: "me" | "everyone") => {
    if (!enableDeletes || !activeConversationId) return;
    const effectiveScope: "me" | "everyone" =
      scope ?? (userRole === "Company" ? "everyone" : "me");
    try {
      await deleteMessageMutation.mutateAsync({
        messageId,
        scope: effectiveScope,
        conversationId: activeConversationId,
      });
      showToast({
        message:
          effectiveScope === "everyone"
            ? t("toast.message_deleted_for_everyone")
            : t("toast.message_removed_for_me"),
        severity: "success",
      });
    } catch (error) {
      showToast({
        message: `${t("toast.failed_delete_message")}: ${getCandidateChatMutationError(error, "Unknown error")}`,
        severity: "error",
      });
    }
  }, [
    deleteMessageMutation,
    enableDeletes,
    activeConversationId,
    showToast,
    t,
    userRole,
  ]);

  const executeDeleteConversation = useCallback(async (targetId: string) => {
    try {
      await deleteConversationMutation.mutateAsync(targetId);
      showToast({ message: t("toast.conversation_removed_list"), severity: "success" });
      const wasActive =
        activeConversationId != null && String(activeConversationId) === String(targetId);
      if (wasActive) {
        setActiveConversationId(null);
        router.push(deleteRedirectRoute);
      }
    } catch (error) {
      showToast({
        message: `${t("toast.failed_delete_conversation")}: ${getCandidateChatMutationError(error, "Unknown error")}`,
        severity: "error",
      });
      throw error;
    }
  }, [activeConversationId, deleteConversationMutation, deleteRedirectRoute, router, showToast, t]);

  const totalUnread = useMemo(
    () => conversations.reduce(
      (acc: number, conversationItem: ChatShellConversation) =>
        acc + normalizeConversationUnreadCount(
          conversationItem.unreadCount,
          currentUserId != null ? String(currentUserId) : undefined,
        ),
      0,
    ),
    [conversations, currentUserId],
  );
  const otherUser = useMemo(
    () => conversation?.participants?.find(
      (participant) => String(participant._id) !== String(currentUserId ?? ""),
    ),
    [conversation, currentUserId],
  );

  return {
    currentUserId,
    conversations: effectiveConversations,
    conversation,
    messages,
    loading,
    sending,
    otherUser,
    totalUnread,
    activeConversationId,
    setActiveConversationId,
    handleSelectConversation,
    handleSendMessage,
    handleDeleteMessage,
    executeDeleteConversation,
  };
};
