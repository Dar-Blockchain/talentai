import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppDispatch } from "@/store/store";
import {
  candidateChatApi,
  getCandidateChatErrorMessage,
} from "@/modules/candidate-chat/api/candidateChatApi";
import { candidateChatKeys } from "@/modules/candidate-chat/queries/keys";
import {
  markCandidateConversationReadLocal,
  setCandidateConversations,
  setCandidateCurrentConversation,
  setCandidateMessages,
  setCandidateTotalUnread,
  upsertCandidateConversation,
} from "@/modules/candidate-chat/store/candidateChatSlice";
import type {
  CandidateChatConversationsParams,
  CandidateChatMessagesParams,
  CreateCandidateConversationPayload,
  SendCandidateMessagePayload,
} from "@/modules/candidate-chat/types";
import { toChatShellConversation, toChatShellMessage } from "@/modules/candidate-chat/utils/mappers";

const syncConversations = (
  dispatch: AppDispatch,
  data: ReturnType<typeof toChatShellConversation>[],
) => {
  dispatch(setCandidateConversations(data));
};

export const useCandidateConversationsQuery = (
  params?: CandidateChatConversationsParams,
  options?: { enabled?: boolean },
) => {
  const dispatch = useDispatch<AppDispatch>();
  const query = useQuery({
    queryKey: candidateChatKeys.conversations(params),
    queryFn: async () => {
      const conversations = await candidateChatApi.fetchConversations(params);
      return conversations.map(toChatShellConversation);
    },
    enabled: options?.enabled ?? true,
  });

  useEffect(() => {
    if (query.data) syncConversations(dispatch, query.data);
  }, [dispatch, query.data]);

  return query;
};

export const useCandidateConversationQuery = (
  conversationId: string | null,
  options?: { enabled?: boolean },
) => {
  const dispatch = useDispatch<AppDispatch>();
  const enabled = (options?.enabled ?? true) && !!conversationId;
  const query = useQuery({
    queryKey: candidateChatKeys.conversation(conversationId || "none"),
    queryFn: async () => toChatShellConversation(
      await candidateChatApi.fetchConversation(conversationId as string),
    ),
    enabled,
  });

  useEffect(() => {
    if (query.data) dispatch(setCandidateCurrentConversation(query.data));
  }, [dispatch, query.data]);

  return query;
};

export const useCandidateMessagesQuery = (
  conversationId: string | null,
  params?: CandidateChatMessagesParams,
  options?: { enabled?: boolean },
) => {
  const dispatch = useDispatch<AppDispatch>();
  const enabled = (options?.enabled ?? true) && !!conversationId;
  const query = useQuery({
    queryKey: candidateChatKeys.messages(conversationId || "none", params),
    queryFn: async () => {
      const messages = await candidateChatApi.fetchMessages(conversationId as string, params);
      return messages.map(toChatShellMessage);
    },
    enabled,
  });

  useEffect(() => {
    if (query.data) dispatch(setCandidateMessages(query.data));
  }, [dispatch, query.data]);

  return query;
};

export const useCandidateUnreadCountQuery = (options?: { enabled?: boolean }) => {
  const dispatch = useDispatch<AppDispatch>();
  const query = useQuery({
    queryKey: candidateChatKeys.unreadCount(),
    queryFn: () => candidateChatApi.fetchUnreadCount(),
    enabled: options?.enabled ?? true,
  });

  useEffect(() => {
    if (typeof query.data === "number") dispatch(setCandidateTotalUnread(query.data));
  }, [dispatch, query.data]);

  return query;
};

export const useMarkCandidateConversationReadMutation = () => {
  const dispatch = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => candidateChatApi.markConversationRead(conversationId),
    onSuccess: (conversationId) => {
      dispatch(markCandidateConversationReadLocal(conversationId));
      queryClient.invalidateQueries({ queryKey: candidateChatKeys.conversations() });
      queryClient.invalidateQueries({ queryKey: candidateChatKeys.unreadCount() });
    },
  });
};

export const useSendCandidateMessageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SendCandidateMessagePayload) => candidateChatApi.sendMessage(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: candidateChatKeys.conversations() });
      queryClient.invalidateQueries({ queryKey: candidateChatKeys.unreadCount() });
    },
  });
};

export const useCreateCandidateConversationMutation = () => {
  const dispatch = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCandidateConversationPayload) =>
      candidateChatApi.createOrFindConversation(payload),
    onSuccess: (conversation) => {
      dispatch(upsertCandidateConversation(toChatShellConversation(conversation)));
      queryClient.invalidateQueries({ queryKey: candidateChatKeys.conversations() });
    },
  });
};

export const useDeleteCandidateMessageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) => candidateChatApi.deleteMessage(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: candidateChatKeys.conversations() });
    },
  });
};

export const useDeleteCandidateConversationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => candidateChatApi.deleteConversation(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: candidateChatKeys.conversations() });
      queryClient.invalidateQueries({ queryKey: candidateChatKeys.unreadCount() });
    },
  });
};

export const getCandidateChatMutationError = (error: unknown, fallback: string) =>
  getCandidateChatErrorMessage(error, fallback);
