import { useEffect, useRef, useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { RootState, AppDispatch } from "@/store/store";
import { useToast } from "@/hooks/useToast";
import { deliveryBlockedToastMessage } from "@/modules/shared/chat";
import {
  addCandidateMessage,
  setCandidateCurrentConversation,
  selectCandidateConversations,
  selectCandidateCurrentConversation,
  selectCandidateMessages,
} from "@/modules/candidate-chat/store/candidateChatSlice";
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
} from "@/modules/candidate-chat/queries/useCandidateChatQueries";
import { useCandidateChatConversationRoom } from "@/modules/candidate-chat/hooks/useCandidateChatRealtime";
import { toChatShellMessage } from "@/modules/candidate-chat/utils/mappers";
import { normalizeConversationUnreadCount } from "@/modules/shared/chat/utils/normalizeConversationUnread";

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
  const conversations = useSelector(selectCandidateConversations);
  const conversation = useSelector(selectCandidateCurrentConversation);
  const messages = useSelector(selectCandidateMessages);

  const [activeConversationId, setActiveConversationId] = useState<string | null>(initialConversationId);

  // Sync active thread when the route param changes (including `null` when leaving a thread).
  useEffect(() => {
    setActiveConversationId(initialConversationId);
  }, [initialConversationId]);

  const [newMessage, setNewMessage] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const activeConversationIdRef = useRef<string | null>(initialConversationId);
  const deleteConversationTargetIdRef = useRef<string | null>(null);

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

  useEffect(() => {
    if (!activeConversationId) return;
    const idStr = String(activeConversationId);
    const selected = conversations.find((item) => String(item._id) === idStr);
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

  const handleSelectConversation = useCallback(
    (id: string) => {
      const idStr = String(id);
      const activeStr = activeConversationId != null ? String(activeConversationId) : "";
      const convIdStr = conversation?._id != null ? String(conversation._id) : "";

      const alreadyShowingThisChat = idStr === activeStr && idStr === convIdStr;
      if (alreadyShowingThisChat) return;

      const selected = conversations.find((item) => String(item._id) === idStr);
      if (selected) {
        dispatch(setCandidateCurrentConversation(selected));
      }

      setNewMessage("");

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

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !conversation || !currentUserId || !activeConversationId) return;

    const uid = String(currentUserId);
    const other = conversation.participants.find((p) => String(p._id) !== uid);
    if (!other) {
      showToast({ message: t("toast.recipient_not_found"), severity: "error" });
      return;
    }

    const text = newMessage.trim();
    setNewMessage("");

    try {
      const message = await sendMessageMutation.mutateAsync({
        conversationId: activeConversationId,
        receiverId: other._id,
        text,
      });
      dispatch(addCandidateMessage({
        message: toChatShellMessage(message),
        viewerUserId: String(currentUserId),
      }));
      if (message.deliveryBlocked) {
        showToast({
          message: deliveryBlockedToastMessage(message.blockedReason, t),
          severity: "warning",
        });
      }
    } catch (error) {
      setNewMessage(text);
      showToast({
        message: `${t("toast.failed_send")}: ${getCandidateChatMutationError(error, "Unknown error")}`,
        severity: "error",
      });
    }
  }, [
    newMessage,
    conversation,
    currentUserId,
    activeConversationId,
    dispatch,
    sendMessageMutation,
    showToast,
    t,
  ]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

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

  const requestDeleteConversation = useCallback((conversationId: string) => {
    deleteConversationTargetIdRef.current = String(conversationId);
    setDeleteDialogOpen(true);
  }, []);

  const resetDeleteConversationTarget = useCallback(() => {
    deleteConversationTargetIdRef.current = null;
  }, []);

  const handleConfirmDeleteConversation = useCallback(async () => {
    const targetId = deleteConversationTargetIdRef.current ?? activeConversationId;
    if (!targetId) {
      setDeleteDialogOpen(false);
      deleteConversationTargetIdRef.current = null;
      return;
    }
    setIsDeleting(true);
    try {
      await deleteConversationMutation.mutateAsync(targetId);
      showToast({ message: t("toast.conversation_removed_list"), severity: "success" });
      setDeleteDialogOpen(false);
      deleteConversationTargetIdRef.current = null;

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
    } finally {
      setIsDeleting(false);
    }
  }, [activeConversationId, deleteConversationMutation, deleteRedirectRoute, router, showToast, t]);

  const totalUnread = conversations.reduce(
    (acc, conversationItem) =>
      acc + normalizeConversationUnreadCount(
        conversationItem.unreadCount,
        currentUserId != null ? String(currentUserId) : undefined,
      ),
    0,
  );
  const otherUser = conversation?.participants?.find(
    (participant) => String(participant._id) !== String(currentUserId ?? ""),
  );

  return {
    currentUserId,
    conversations,
    conversation,
    messages,
    loading,
    sending,
    otherUser,
    totalUnread,
    activeConversationId,
    setActiveConversationId,
    newMessage,
    setNewMessage,
    deleteDialogOpen,
    setDeleteDialogOpen,
    isDeleting,
    handleSelectConversation,
    handleSendMessage,
    handleKeyDown,
    handleDeleteMessage,
    handleConfirmDeleteConversation,
    requestDeleteConversation,
    resetDeleteConversationTarget,
  };
};
