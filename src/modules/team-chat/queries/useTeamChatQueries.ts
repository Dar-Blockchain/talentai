import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppDispatch } from "@/store/store";
import { getTeamChatErrorMessage, teamChatApi } from "@/modules/team-chat/api/teamChatApi";
import { teamChatKeys } from "@/modules/team-chat/queries/keys";
import {
  markTeamConversationReadLocal,
  setTeamConversations,
  setTeamCurrentConversation,
  setTeamMessages,
  setTeamTotalUnread,
  upsertTeamConversation,
} from "@/modules/team-chat/store/teamChatSlice";
import type {
  SendTeamMessagePayload,
  TeamChatConversationsParams,
  TeamChatMessagesParams,
} from "@/modules/team-chat/types";
import { toChatShellConversation, toChatShellMessage } from "@/modules/team-chat/utils/mappers";

const syncConversations = (dispatch: AppDispatch, data: ReturnType<typeof toChatShellConversation>[]) => {
  dispatch(setTeamConversations(data));
};

export const useTeamConversationsQuery = (
  params?: TeamChatConversationsParams,
  options?: { enabled?: boolean },
) => {
  const dispatch = useDispatch<AppDispatch>();
  const query = useQuery({
    queryKey: teamChatKeys.conversations(params),
    queryFn: async () => {
      const conversations = await teamChatApi.fetchConversations(params);
      return conversations.map(toChatShellConversation);
    },
    enabled: options?.enabled ?? true,
  });

  useEffect(() => {
    if (query.data) syncConversations(dispatch, query.data);
  }, [dispatch, query.data]);

  return query;
};

export const useTeamConversationQuery = (
  conversationId: string | null,
  options?: { enabled?: boolean },
) => {
  const dispatch = useDispatch<AppDispatch>();
  const enabled = (options?.enabled ?? true) && !!conversationId;
  const query = useQuery({
    queryKey: teamChatKeys.conversation(conversationId || "none"),
    queryFn: async () => toChatShellConversation(
      await teamChatApi.fetchConversation(conversationId as string),
    ),
    enabled,
  });

  useEffect(() => {
    if (query.data) dispatch(setTeamCurrentConversation(query.data));
  }, [dispatch, query.data]);

  return query;
};

export const useTeamMessagesQuery = (
  conversationId: string | null,
  params?: TeamChatMessagesParams,
  options?: { enabled?: boolean },
) => {
  const dispatch = useDispatch<AppDispatch>();
  const enabled = (options?.enabled ?? true) && !!conversationId;
  const query = useQuery({
    queryKey: teamChatKeys.messages(conversationId || "none", params),
    queryFn: async () => {
      const messages = await teamChatApi.fetchMessages(conversationId as string, params);
      return messages.map(toChatShellMessage);
    },
    enabled,
  });

  useEffect(() => {
    if (query.data) dispatch(setTeamMessages(query.data));
  }, [dispatch, query.data]);

  return query;
};

export const useTeamUnreadCountQuery = (options?: { enabled?: boolean }) => {
  const dispatch = useDispatch<AppDispatch>();
  const query = useQuery({
    queryKey: teamChatKeys.unreadCount(),
    queryFn: () => teamChatApi.fetchUnreadCount(),
    enabled: options?.enabled ?? true,
  });

  useEffect(() => {
    if (typeof query.data === "number") dispatch(setTeamTotalUnread(query.data));
  }, [dispatch, query.data]);

  return query;
};

export const useMarkTeamConversationReadMutation = () => {
  const dispatch = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => teamChatApi.markConversationRead(conversationId),
    onSuccess: (conversationId) => {
      dispatch(markTeamConversationReadLocal(conversationId));
      queryClient.invalidateQueries({ queryKey: teamChatKeys.conversations() });
      queryClient.invalidateQueries({ queryKey: teamChatKeys.unreadCount() });
    },
  });
};

export const useSendTeamMessageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SendTeamMessagePayload) => teamChatApi.sendMessage(payload),
    onSuccess: (message) => {
      queryClient.invalidateQueries({ queryKey: teamChatKeys.conversations() });
      queryClient.invalidateQueries({ queryKey: teamChatKeys.unreadCount() });
      return toChatShellMessage(message);
    },
    meta: {
      errorMessage: "Error sending team message",
    },
  });
};

export const useOpenTeamConversationMutation = () => {
  const dispatch = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetUserId: string) => {
      const conversation = await teamChatApi.openConversation(targetUserId);
      return toChatShellConversation(conversation);
    },
    onSuccess: (mapped) => {
      dispatch(upsertTeamConversation(mapped));
      queryClient.invalidateQueries({ queryKey: teamChatKeys.conversations() });
    },
  });
};

export const getTeamChatMutationError = (error: unknown, fallback: string) =>
  getTeamChatErrorMessage(error, fallback);
