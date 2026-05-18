import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppDispatch, RootState, store } from "@/store/store";
import {
  candidateChatApi,
  getCandidateChatErrorMessage,
} from "@/modules/candidate-chat/api/candidateChatApi";
import { candidateChatKeys } from "@/modules/candidate-chat/queries/keys";
import {
  addCandidateMessage,
  confirmCandidatePendingMessage,
  markCandidateConversationReadLocal,
  removeCandidateConversation,
  removeCandidateMessage,
  setCandidateConversations,
  setCandidateCurrentConversation,
  setCandidateMessages,
  setCandidateTotalUnread,
  syncConversationLastMessage,
  upsertCandidateConversation,
  upsertCandidateMessage,
} from "@/modules/candidate-chat/store/candidateChatSlice";
import type { ChatShellMessage } from "@/modules/shared/chat/types/shell";
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
    queryKey: candidateChatKeys.conversations(params),
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
    staleTime: 30_000,
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
    queryKey: candidateChatKeys.conversation(conversationId || "none"),
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
    // viewerKey is intentionally NOT part of the query key. The queryFn already filters
    // by viewer via closure. Including viewerKey caused setQueriesData callers (which omit it)
    // to silently miss the cache and leave optimistic/socket updates unwritten.
    queryKey: candidateChatKeys.messages(conversationId || "none", params),
    queryFn: async () => {
      try {
        const messages = await candidateChatApi.fetchMessages(conversationId as string, params);
        return messages
          .map(toChatShellMessage)
          .filter((msg) => !msg.deliveryBlocked || !viewerKey || String(msg.sender._id) === viewerKey);
      } catch (err: any) {
        // 404 means the conversation has no messages yet or was just created.
        // Treat it as an empty list so the chat opens cleanly instead of erroring.
        const status = err?.response?.status ?? err?.status;
        if (status === 404) return [] as ReturnType<typeof toChatShellMessage>[];
        throw err;
      }
    },
    enabled,
    // Socket events keep the message cache fresh in real-time via setQueryData/dispatch.
    // Allowing React Query to background-refetch overwrites socket updates and causes
    // messages to disappear on window focus or stale-time expiry.
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    // Retry once after a short delay for transient server errors (e.g. backend not yet ready).
    retry: (failureCount, err: any) => {
      const status = err?.response?.status ?? err?.status;
      if (status === 404 || status === 403) return false; // handled above or auth issue
      return failureCount < 1;
    },
  });

  useEffect(() => {
    dispatch(setCandidateMessages([]));
  }, [conversationId, dispatch]);

  useEffect(() => {
    if (!conversationId || !enabled) return;
    if (!query.isFetched || !query.isSuccess) return;
    const apiMessages = Array.isArray(query.data) ? query.data : [];
    // Merge API data with any socket-received messages that arrived while the
    // fetch was in-flight. Without this, the dispatch overwrites them and the
    // other user's messages disappear until the next socket event.
    const current = store.getState().candidateChat.messages;
    const apiIds = new Set(apiMessages.map((m) => String(m._id)));
    const socketOnly = current.filter(
      (m) => !apiIds.has(String(m._id)) && !String(m._id).startsWith("temp_"),
    );
    dispatch(setCandidateMessages([...apiMessages, ...socketOnly]));
  }, [conversationId, dispatch, enabled, query.data, query.isFetched, query.isSuccess]);

  return query;
};

export const useCandidateUnreadCountQuery = (options?: { enabled?: boolean }) => {
  const dispatch = useDispatch<AppDispatch>();
  const query = useQuery({
    queryKey: candidateChatKeys.unreadCount(),
    queryFn: () => candidateChatApi.fetchUnreadCount(),
    enabled: options?.enabled ?? true,
    staleTime: 60_000,
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
      // markCandidateConversationReadLocal zeros out the badge in Redux immediately.
      // Conversations list invalidation is skipped — the local update is sufficient for the UI.
      dispatch(markCandidateConversationReadLocal(conversationId));
      queryClient.invalidateQueries({ queryKey: candidateChatKeys.unreadCount() });
    },
  });
};

export const useSendCandidateMessageMutation = () => {
  const dispatch = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SendCandidateMessagePayload) => candidateChatApi.sendMessage(payload),
    onMutate: (variables) => {
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const currentUserId = store.getState().user?.connectedUser?.user?._id;
      if (!currentUserId) return { tempId };

      const tempMessage: ChatShellMessage = {
        _id: tempId,
        // stableKey persists across the temp→confirmed transition so MessageList
        // reuses the same component instance (smooth CSS opacity/time transition,
        // no remount animation replay).
        stableKey: tempId,
        text: variables.text,
        sender: { _id: String(currentUserId) },
        receiver: { _id: variables.receiverId },
        isRead: false,
        createdAt: new Date().toISOString(),
        conversationId: variables.conversationId,
        pending: true,
      };

      dispatch(addCandidateMessage({
        message: tempMessage,
        viewerUserId: String(currentUserId),
        viewerIsViewingConversation: true,
      }));

      queryClient.setQueriesData(
        { queryKey: candidateChatKeys.messages(variables.conversationId) },
        (old) => Array.isArray(old) ? [...old, tempMessage] : old,
      );

      return { tempId };
    },
    onSuccess: (message, variables, context) => {
      if (!context?.tempId) return;
      const mapped = toChatShellMessage(message);
      // Carry the stableKey forward so the MessageRow key stays "temp_xxx" in both
      // the temp and confirmed states — React reuses the component, no remount.
      mapped.stableKey = context.tempId;

      // In-place replacement: finds the temp slot and replaces it atomically.
      // Avoids the remove→add two-step that changes the React key and triggers
      // an unwanted remount + bubbleIn animation on the confirmed message.
      dispatch(confirmCandidatePendingMessage({ tempId: context.tempId, message: mapped }));

      queryClient.setQueriesData(
        { queryKey: candidateChatKeys.messages(variables.conversationId) },
        (old) => {
          if (!Array.isArray(old)) return old;
          return [...old.filter((m: any) => String(m._id) !== context.tempId), mapped];
        },
      );
    },
    onError: (_err, variables, context) => {
      if (!context?.tempId) return;
      dispatch(removeCandidateMessage(context.tempId));
      queryClient.setQueriesData(
        { queryKey: candidateChatKeys.messages(variables.conversationId) },
        (old) => Array.isArray(old)
          ? old.filter((m: any) => String(m._id) !== context.tempId)
          : old,
      );
      // Restore the correct lastMessage preview that the temp message set optimistically.
      queryClient.invalidateQueries({ queryKey: [...candidateChatKeys.all, "conversations"] });
    },
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
  const dispatch = useDispatch<AppDispatch>();
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
    onMutate: async (variables) => {
      const messagesKey = candidateChatKeys.messages(variables.conversationId);
      // Cancel any in-flight refetch before the delete so a stale response
      // can't land after we clear the cache and put the deleted row back.
      await queryClient.cancelQueries({ queryKey: messagesKey });
      const snapshot = queryClient.getQueryData(messagesKey);
      return { snapshot };
    },
    onError: (_err, variables, context) => {
      if (context?.snapshot !== undefined) {
        queryClient.setQueryData(
          candidateChatKeys.messages(variables.conversationId),
          context.snapshot,
        );
      }
    },
    onSuccess: async (_, variables) => {
      const messagesKey = candidateChatKeys.messages(variables.conversationId);

      if (variables.scope === "everyone") {
        const prev = store.getState().candidateChat.messages.find(
          (m) => String(m._id) === String(variables.messageId),
        );
        if (prev) {
          const deleterId = store.getState().user?.connectedUser?.user?._id;
          const mapped = toChatShellMessage({
            _id: variables.messageId,
            conversationId: variables.conversationId,
            sender: { _id: String(prev.sender._id) },
            receiver: { _id: String(prev.receiver._id) },
            isRead: prev.isRead,
            createdAt: prev.createdAt,
            isDeletedForEveryone: true,
            text: "",
            deletedAt: new Date().toISOString(),
            ...(deleterId != null ? { deletedForEveryoneBy: String(deleterId) } : {}),
          } as any);
          dispatch(upsertCandidateMessage(mapped));
          queryClient.setQueriesData({ queryKey: messagesKey }, (old) => {
            if (!Array.isArray(old)) return old;
            const id = String(variables.messageId);
            const idx = old.findIndex((m: any) => String(m._id) === id);
            if (idx < 0) return old;
            const next = [...old];
            next[idx] = mapped;
            return next;
          });
        }
      } else {
        dispatch(removeCandidateMessage(variables.messageId));
        // After removal, recompute the conversation's sidebar preview from the
        // remaining messages so the deleted row no longer appears as lastMessage.
        dispatch(syncConversationLastMessage(variables.conversationId));
        queryClient.setQueriesData({ queryKey: messagesKey }, (old) => {
          if (!Array.isArray(old)) return old;
          return old.filter((m: any) => String(m._id) !== String(variables.messageId));
        });
      }
      // Only refresh the server unread total; Redux already handles conversations and messages.
      queryClient.invalidateQueries({ queryKey: candidateChatKeys.unreadCount() });
    },
  });
};

export const useDeleteCandidateConversationMutation = () => {
  const dispatch = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => candidateChatApi.deleteConversation(conversationId),
    onSuccess: (_data, conversationId) => {
      dispatch(removeCandidateConversation(conversationId));
      queryClient.removeQueries({ queryKey: candidateChatKeys.messages(conversationId) });
      queryClient.removeQueries({ queryKey: candidateChatKeys.conversation(conversationId) });
      queryClient.setQueriesData(
        { queryKey: [...candidateChatKeys.all, "conversations"] },
        (old) => {
          if (!Array.isArray(old)) return old;
          return old.filter((c: any) => String(c._id) !== String(conversationId));
        },
      );
      queryClient.invalidateQueries({ queryKey: candidateChatKeys.unreadCount() });
    },
  });
};

export const getCandidateChatMutationError = (error: unknown, fallback: string) =>
  getCandidateChatErrorMessage(error, fallback);
