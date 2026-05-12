import { useEffect, useRef, useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { useToast } from "@/hooks/useToast";
import {
  addTeamMessage,
  clearTeamCurrentConversation,
  selectTeamConversations,
  selectTeamCurrentConversation,
  selectTeamMessages,
} from "@/modules/team-chat/store/teamChatSlice";
import {
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
  onConversationChange?: (id: string) => void;
}

export const useTeamChatSession = ({
  initialConversationId,
  onConversationChange,
}: UseTeamChatSessionOptions) => {
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();

  const currentUserId = useSelector((state: RootState) => state.user?.connectedUser?.user?._id);
  const conversations = useSelector(selectTeamConversations);
  const conversation = useSelector(selectTeamCurrentConversation);
  const messages = useSelector(selectTeamMessages);

  const [activeConversationId, setActiveConversationId] = useState<string | null>(initialConversationId);

  useEffect(() => {
    if (initialConversationId && initialConversationId !== activeConversationId) {
      setActiveConversationId(initialConversationId);
    }
  }, [initialConversationId, activeConversationId]);

  const [newMessage, setNewMessage] = useState("");
  const activeConversationIdRef = useRef<string | null>(initialConversationId);

  const conversationsQuery = useTeamConversationsQuery(undefined, { enabled: !!currentUserId });
  useTeamUnreadCountQuery({ enabled: !!currentUserId });
  const conversationQuery = useTeamConversationQuery(activeConversationId, { enabled: !!currentUserId });
  const messagesQuery = useTeamMessagesQuery(activeConversationId, undefined, { enabled: !!currentUserId });
  const markReadMutation = useMarkTeamConversationReadMutation();
  const sendMessageMutation = useSendTeamMessageMutation();

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
    markReadMutation.mutate(activeConversationId);
    return () => {
      dispatch(clearTeamCurrentConversation());
    };
  }, [activeConversationId, currentUserId, dispatch]);

  const handleSelectConversation = useCallback((id: string) => {
    if (id === activeConversationId) return;
    setNewMessage("");
    setActiveConversationId(id);
    onConversationChange?.(id);
  }, [activeConversationId, onConversationChange]);

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !conversation || !currentUserId || !activeConversationId) return;

    if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(newMessage)) {
      showToast({ message: "Sharing email addresses is not allowed.", severity: "error" });
      return;
    }
    if (/(\+?\d{1,4}[\s-]?)?\(?\d{1,4}\)?[\s-]?\d{1,4}[\s-]?\d{1,9}|\d{10,}/.test(newMessage)) {
      showToast({ message: "Sharing phone numbers is not allowed.", severity: "error" });
      return;
    }

    const other = conversation.participants.find((p) => p._id !== currentUserId);
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
      dispatch(addTeamMessage({
        message: toChatShellMessage(message),
        viewerUserId: String(currentUserId),
      }));
    } catch (error) {
      setNewMessage(text);
      showToast({
        message: `Failed to send: ${getTeamChatMutationError(error, "Unknown error")}`,
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
    handleSelectConversation,
    handleSendMessage,
    handleKeyDown,
  };
};
