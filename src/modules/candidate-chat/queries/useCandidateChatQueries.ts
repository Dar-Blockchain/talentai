import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppDispatch, RootState } from "@/store/store";
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
  const viewerId = useSelector((s: RootState) => s.user.connectedUser.user?._id);
  const viewerKey = viewerId != null ? String(viewerId) : "";

  const query = useQuery({
    queryKey: [...candidateChatKeys.conversations(params), viewerKey],
    queryFn: async () => {
      const conversations = await candidateChatApi.fetchConversations(params);

      // If the inbox came back empty, the candidate may have soft-deleted (archived)
      // all their conversations during a previous session (e.g. testing).
      // Auto-restore them once so the inbox is not permanently blank.
      if (conversations.length === 0 && viewerKey) {
        const restored = await candidateChatApi.unarchiveAllConversations();
        if (restored > 0) {
          const recovered = await candidateChatApi.fetchConversations(params);
          return recovered.map((c) => toChatShellConversation(c, viewerKey || undefined));
        }
      }

      return conversations.map((c) => toChatShellConversation(c, viewerKey || undefined));
    },
    enabled: options?.enabled ?? true,
    staleTime: 0,
    refetchOnMount: "always",
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
  const viewerId = useSelector((s: RootState) => s.user.connectedUser.user?._id);
  const viewerKey = viewerId != null ? String(viewerId) : "";
  const enabled = (options?.enabled ?? true) && !!conversationId;
  const query = useQuery({
    queryKey: [...candidateChatKeys.conversation(conversationId || "none"), viewerKey],
    queryFn: async () => toChatShellConversation(
      await candidateChatApi.fetchConversation(conversationId as string),
      viewerKey || undefined,
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
  const viewerId = useSelector((s: RootState) => s.user.connectedUser.user?._id);
  const viewerKey = viewerId != null ? String(viewerId) : "";
  const enabled = (options?.enabled ?? true) && !!conversationId;
  const query = useQuery({
    queryKey: [...candidateChatKeys.messages(conversationId || "none", params), viewerKey],
    queryFn: async () => {
      const messages = await candidateChatApi.fetchMessages(conversationId as string, params);
      return messages
        .map(toChatShellMessage)
        .filter((msg) => !msg.deliveryBlocked || !viewerKey || String(msg.sender._id) === viewerKey);
    },
    enabled,
    staleTime: 0,
    refetchOnMount: "always",
  });

  useEffect(() => {
    dispatch(setCandidateMessages([]));
  }, [conversationId, dispatch]);

  useEffect(() => {
    if (!conversationId || !enabled) return;
    if (!query.isFetched || !query.isSuccess) return;
    dispatch(setCandidateMessages(Array.isArray(query.data) ? query.data : []));
  }, [conversationId, dispatch, enabled, query.data, query.isFetched, query.isSuccess]);

  return query;
};

export const useCandidateUnreadCountQuery = (options?: { enabled?: boolean }) => {
  const dispatch = useDispatch<AppDispatch>();
  const query = useQuery({
    queryKey: candidateChatKeys.unreadCount(),
    queryFn: () => candidateChatApi.fetchUnreadCount(),
    enabled: options?.enabled ?? true,
    staleTime: 0,
    refetchOnMount: "always",
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
      queryClient.invalidateQueries({ queryKey: [...candidateChatKeys.all, "conversations"] });
      queryClient.invalidateQueries({ queryKey: candidateChatKeys.unreadCount() });
    },
  });
};

export const useSendCandidateMessageMutation = () => {
  return useMutation({
    mutationFn: (payload: SendCandidateMessagePayload) => candidateChatApi.sendMessage(payload),
  });
};

export const useCreateCandidateConversationMutation = () => {
  const dispatch = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();
  const viewerId = useSelector((s: RootState) => s.user.connectedUser.user?._id);
  const viewerKey = viewerId != null ? String(viewerId) : undefined;

  return useMutation({
    mutationFn: (payload: CreateCandidateConversationPayload) =>
      candidateChatApi.createOrFindConversation(payload),
    onSuccess: (conversation) => {
      dispatch(upsertCandidateConversation(toChatShellConversation(conversation, viewerKey)));
      queryClient.invalidateQueries({ queryKey: [...candidateChatKeys.all, "conversations"] });
    },
  });
};

export const useDeleteCandidateMessageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      messageId,
      scope,
    }: {
      messageId: string;
      scope: "me" | "everyone";
      conversationId: string;
    }) => candidateChatApi.deleteMessage(messageId, scope),
    onSuccess: async (_, variables) => {
      const messagesKey = candidateChatKeys.messages(variables.conversationId);
      await queryClient.cancelQueries({ queryKey: messagesKey });
      // Socket will broadcast `message_updated` (everyone) or `message_deleted`
      // (me) and patch the cache in place — we just trigger a fresh fetch as a
      // safety net for the case where the sender is offline / disconnected.
      queryClient.invalidateQueries({ queryKey: [...candidateChatKeys.all, "conversations"] });
      queryClient.invalidateQueries({ queryKey: candidateChatKeys.unreadCount() });
      queryClient.invalidateQueries({ queryKey: messagesKey });
    },
  });
};

export const useDeleteCandidateConversationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => candidateChatApi.deleteConversation(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...candidateChatKeys.all, "conversations"] });
      queryClient.invalidateQueries({ queryKey: candidateChatKeys.unreadCount() });
    },
  });
};

export const getCandidateChatMutationError = (error: unknown, fallback: string) =>
  getCandidateChatErrorMessage(error, fallback);
