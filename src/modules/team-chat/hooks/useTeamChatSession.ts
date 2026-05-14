import { useEffect, useRef, useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { RootState, AppDispatch } from "@/store/store";
import { useToast } from "@/hooks/useToast";
import { deliveryBlockedToastMessage } from "@/modules/shared/chat";
import {
  addTeamMessage,
  clearTeamCurrentConversation,
  markTeamConversationReadLocal,
  selectTeamConversations,
  selectTeamCurrentConversation,
  selectTeamMessages,
} from "@/modules/team-chat/store/teamChatSlice";
import {
  useDeleteTeamConversationMutation,
  useDeleteTeamMessageMutation,
  useMarkTeamConversationReadMutation,
  useSendTeamMessageMutation,
  useTeamConversationQuery,
  useTeamConversationsQuery,
  useTeamMessagesQuery,
  useTeamUnreadCountQuery,
  getTeamChatMutationError,
} from "@/modules/team-chat/queries/useTeamChatQueries";
import { useTeamChatConversationRoom } from "@/modules/team-chat/hooks/useTeamChatRealtime";
import { toChatShellMessage } from "@/modules/team-chat/utils/mappers";

export interface UseTeamChatSessionOptions {
  initialConversationId: string | null;
  deleteRedirectRoute: string;
  onConversationChange?: (id: string) => void;
}

export const useTeamChatSession = ({
  initialConversationId,
  deleteRedirectRoute,
  onConversationChange,
}: UseTeamChatSessionOptions) => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { showToast } = useToast();
  const { t } = useTranslation("shared/chat");

  const currentUserId = useSelector((state: RootState) => state.user?.connectedUser?.user?._id);
  const conversations = useSelector(selectTeamConversations);
  const conversation = useSelector(selectTeamCurrentConversation);
  const messages = useSelector(selectTeamMessages);

  const [activeConversationId, setActiveConversationId] = useState<string | null>(initialConversationId);

  // Only follow URL-driven conversation changes. Including activeConversationId in deps
  // caused resets after sidebar picks: replaceState updated the address bar but not
  // router.query, so stale initialConversationId overwrote the user's selection.
  useEffect(() => {
    if (initialConversationId) {
      setActiveConversationId(initialConversationId);
    }
  }, [initialConversationId]);

  const [newMessage, setNewMessage] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const activeConversationIdRef = useRef<string | null>(initialConversationId);
  const deleteConversationTargetIdRef = useRef<string | null>(null);

  const conversationsQuery = useTeamConversationsQuery(undefined, { enabled: !!currentUserId });
  useTeamUnreadCountQuery({ enabled: !!currentUserId });
  const conversationQuery = useTeamConversationQuery(activeConversationId, { enabled: !!currentUserId });
  const messagesQuery = useTeamMessagesQuery(activeConversationId, undefined, { enabled: !!currentUserId });
  const markReadMutation = useMarkTeamConversationReadMutation();
  const sendMessageMutation = useSendTeamMessageMutation();
  const deleteMessageMutation = useDeleteTeamMessageMutation();
  const deleteConversationMutation = useDeleteTeamConversationMutation();

  useTeamChatConversationRoom(activeConversationId);

  const loading = conversationsQuery.isLoading
    || (conversationQuery.isLoading && !conversation)
    || (messagesQuery.isLoading && messages.length === 0);
  const sending = sendMessageMutation.isPending;

  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  useEffect(() => {
    if (!activeConversationId || !currentUserId) return;
    const convId = String(activeConversationId);
    markReadMutation.mutate(convId);
    // Do not add `markReadMutation` to deps — its identity can change after cache updates, re-running
    // cleanup and clearing the open thread while the same conversation is still active (infinite loop).
    return () => {
      /** Leaving this thread: sync read state so server + list badges do not "catch up" later when refetching. */
      dispatch(markTeamConversationReadLocal(convId));
      markReadMutation.mutate(convId);
      dispatch(clearTeamCurrentConversation());
    };
  }, [activeConversationId, currentUserId, dispatch]);

  const handleSelectConversation = useCallback(
    (id: string) => {
      const idStr = String(id);
      const activeStr = activeConversationId != null ? String(activeConversationId) : "";
      const convIdStr = conversation?._id != null ? String(conversation._id) : "";

      const alreadyShowingThisChat = idStr === activeStr && idStr === convIdStr;
      if (alreadyShowingThisChat) return;

      setNewMessage("");

      // After hide/delete, active id can still match the row while Redux/query cleared — must bump state so queries refetch.
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
    [activeConversationId, conversation?._id, onConversationChange],
  );

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !conversation || !currentUserId || !activeConversationId) return;

    const other = conversation.participants.find((p) => p._id !== currentUserId);
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
      dispatch(addTeamMessage({
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
        message: `${t("toast.failed_send")}: ${getTeamChatMutationError(error, "Unknown error")}`,
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

  const handleDeleteMessage = useCallback(
    async (messageId: string, scope: "me" | "everyone" = "me") => {
      if (!activeConversationId) return;
      try {
        await deleteMessageMutation.mutateAsync({
          messageId,
          scope,
          conversationId: activeConversationId,
        });
        showToast({
          message:
            scope === "everyone"
              ? t("toast.message_deleted_for_everyone")
              : t("toast.message_removed_for_me"),
          severity: "success",
        });
      } catch (error) {
        showToast({
          message: `${t("toast.failed_delete_message")}: ${getTeamChatMutationError(error, "Unknown error")}`,
          severity: "error",
        });
      }
    },
    [activeConversationId, deleteMessageMutation, showToast, t],
  );

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
        message: `${t("toast.failed_delete_conversation")}: ${getTeamChatMutationError(error, "Unknown error")}`,
        severity: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  }, [
    activeConversationId,
    deleteConversationMutation,
    deleteRedirectRoute,
    router,
    showToast,
    t,
  ]);

  const totalUnread = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
  const otherUser = conversation?.participants?.find((p) => p._id !== currentUserId);

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
    requestDeleteConversation,
    resetDeleteConversationTarget,
    isDeleting,
    handleSelectConversation,
    handleSendMessage,
    handleKeyDown,
    handleDeleteMessage,
    handleConfirmDeleteConversation,
  };
};
