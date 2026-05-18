import { useEffect, useRef, useCallback, useState, useMemo } from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { RootState, AppDispatch } from "@/store/store";
import { useToast } from "@/hooks/useToast";
import { deliveryBlockedToastMessage } from "@/modules/shared/chat";
import {
  clearTeamCurrentConversation,
  markTeamConversationReadLocal,
  selectTeamConversations,
  selectTeamCurrentConversation,
  selectTeamMessages,
} from "@/modules/team-chat/store/teamChatSlice";
import type { ChatShellConversation } from "@/modules/shared/chat/types/shell";
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
  const conversations = useSelector(selectTeamConversations, shallowEqual);
  const conversation = useSelector(selectTeamCurrentConversation);
  const messages = useSelector(selectTeamMessages, shallowEqual);

  const [activeConversationId, setActiveConversationId] = useState<string | null>(initialConversationId);

  // Only follow URL-driven conversation changes. Including activeConversationId in deps
  // caused resets after sidebar picks: replaceState updated the address bar but not
  // router.query, so stale initialConversationId overwrote the user's selection.
  useEffect(() => {
    if (initialConversationId) {
      setActiveConversationId(initialConversationId);
    }
  }, [initialConversationId]);

  const activeConversationIdRef = useRef<string | null>(initialConversationId);

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

  const handleSendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || !conversation || !currentUserId || !activeConversationId) return;

    const other = conversation.participants.find((p) => p._id !== currentUserId);
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
        message: `${t("toast.failed_send")}: ${getTeamChatMutationError(error, "Unknown error")}`,
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
        message: `${t("toast.failed_delete_conversation")}: ${getTeamChatMutationError(error, "Unknown error")}`,
        severity: "error",
      });
      throw error;
    }
  }, [activeConversationId, deleteConversationMutation, deleteRedirectRoute, router, showToast, t]);

  const totalUnread = useMemo(
    () => conversations.reduce((acc: number, c: ChatShellConversation) => acc + (c.unreadCount || 0), 0),
    [conversations],
  );
  const otherUser = useMemo(
    () => conversation?.participants?.find((p) => p._id !== currentUserId),
    [conversation, currentUserId],
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
    handleSelectConversation,
    handleSendMessage,
    handleDeleteMessage,
    executeDeleteConversation,
  };
};
