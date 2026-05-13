import { useEffect, useRef, useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { RootState, AppDispatch } from "@/store/store";
import { useToast } from "@/hooks/useToast";
import { getBlockedMessageReason } from "@/modules/shared/chat";
import {
  addCandidateMessage,
  clearCandidateCurrentConversation,
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

export interface UseCandidateChatSessionOptions {
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

  const currentUserId = useSelector((state: RootState) => state.user?.connectedUser?.user?._id);
  const conversations = useSelector(selectCandidateConversations);
  const conversation = useSelector(selectCandidateCurrentConversation);
  const messages = useSelector(selectCandidateMessages);

  const [activeConversationId, setActiveConversationId] = useState<string | null>(initialConversationId);

  useEffect(() => {
    if (initialConversationId && initialConversationId !== activeConversationId) {
      setActiveConversationId(initialConversationId);
    }
  }, [initialConversationId, activeConversationId]);

  const [newMessage, setNewMessage] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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

  useEffect(() => {
    if (!activeConversationId) return;
    const selected = conversations.find((item) => item._id === activeConversationId);
    if (selected && conversation?._id !== activeConversationId) {
      dispatch(setCandidateCurrentConversation(selected));
    }
  }, [activeConversationId, conversation?._id, conversations, dispatch]);

  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  useEffect(() => {
    if (!activeConversationId || !currentUserId) return;
    markReadMutation.mutate(activeConversationId);
    return () => {
      dispatch(clearCandidateCurrentConversation());
    };
  }, [activeConversationId, currentUserId, dispatch]);

  const handleSelectConversation = useCallback((id: string) => {
    if (id === activeConversationId) return;
    const selected = conversations.find((item) => item._id === id);
    if (selected) {
      dispatch(setCandidateCurrentConversation(selected));
    }
    setNewMessage("");
    setActiveConversationId(id);
    onConversationChange?.(id);
  }, [activeConversationId, conversations, dispatch, onConversationChange]);

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !conversation || !currentUserId || !activeConversationId) return;

    const blockedReason = getBlockedMessageReason(newMessage);
    if (blockedReason === "email") {
      showToast({ message: "Sharing email addresses is not allowed.", severity: "error" });
      return;
    }
    if (blockedReason === "phone") {
      showToast({ message: "Sharing phone numbers is not allowed.", severity: "error" });
      return;
    }

    const other = conversation.participants.find((participant) => participant._id !== currentUserId);
    if (!other) {
      showToast({ message: "Could not find recipient.", severity: "error" });
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
    } catch (error) {
      setNewMessage(text);
      showToast({
        message: `Failed to send: ${getCandidateChatMutationError(error, "Unknown error")}`,
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
  ]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const handleDeleteMessage = useCallback(async (messageId: string) => {
    if (!enableDeletes) return;
    try {
      await deleteMessageMutation.mutateAsync(messageId);
      showToast({ message: "Message deleted", severity: "success" });
    } catch (error) {
      showToast({
        message: `Failed to delete: ${getCandidateChatMutationError(error, "Unknown error")}`,
        severity: "error",
      });
    }
  }, [deleteMessageMutation, enableDeletes, showToast]);

  const handleConfirmDeleteConversation = useCallback(async () => {
    if (!enableDeletes || !activeConversationId) return;
    setIsDeleting(true);
    try {
      await deleteConversationMutation.mutateAsync(activeConversationId);
      showToast({ message: "Conversation deleted", severity: "success" });
      setDeleteDialogOpen(false);
      router.push(deleteRedirectRoute);
    } catch (error) {
      showToast({
        message: `Failed to delete: ${getCandidateChatMutationError(error, "Unknown error")}`,
        severity: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  }, [activeConversationId, deleteConversationMutation, deleteRedirectRoute, enableDeletes, router, showToast]);

  const totalUnread = conversations.reduce((acc, conversationItem) => acc + (conversationItem.unreadCount || 0), 0);
  const otherUser = conversation?.participants?.find((participant) => participant._id !== currentUserId);

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
  };
};
