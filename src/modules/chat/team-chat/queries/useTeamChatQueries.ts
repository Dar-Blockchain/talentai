import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppDispatch, store } from "@/store/store";
import { getTeamChatErrorMessage, teamChatApi } from "@/modules/chat/team-chat/api/teamChatApi";
import { teamChatKeys } from "@/modules/chat/team-chat/queries/keys";
import {
  addTeamMessage,
  confirmTeamPendingMessage,
  markTeamConversationReadLocal,
  removeTeamConversation,
  removeTeamMessage,
  setTeamConversations,
  setTeamCurrentConversation,
  setTeamMessages,
  setTeamTotalUnread,
  upsertTeamConversation,
  upsertTeamMessage,
} from "@/modules/chat/team-chat/store/teamChatSlice";
import type { ChatShellMessage } from "@/modules/chat/shared/types/shell";
import type {
  SendTeamMessagePayload,
  TeamChatConversationsParams,
  TeamChatMessagesParams,
  TeamMessage,
} from "@/modules/chat/team-chat/types";
import { toChatShellConversation, toChatShellMessage } from "@/modules/chat/team-chat/utils/mappers";

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
    staleTime: 30_000,
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
    staleTime: 30_000,
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
      try {
        const messages = await teamChatApi.fetchMessages(conversationId as string, params);
        return messages.map(toChatShellMessage);
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
      if (status === 404 || status === 403) return false; // handled above or auth issue — don't retry
      return failureCount < 1;
    },
  });

  // Clear messages immediately when switching conversations so stale messages
  // from the previous conversation don't flash before the new fetch completes.
  useEffect(() => {
    dispatch(setTeamMessages([]));
  }, [conversationId, dispatch]);

  useEffect(() => {
    if (!conversationId || !enabled) return;
    if (!query.isFetched || !query.isSuccess) return;
    const apiMessages = Array.isArray(query.data) ? query.data : [];
    // Merge API data with any socket-received messages that arrived while the
    // fetch was in-flight. Without this, the dispatch overwrites them and the
    // other user's messages disappear until the next socket event.
    const current = store.getState().teamChat.messages;
    const apiIds = new Set(apiMessages.map((m) => String(m._id)));
    const socketOnly = current.filter(
      (m) => !apiIds.has(String(m._id)) && !String(m._id).startsWith("temp_"),
    );
    dispatch(setTeamMessages([...apiMessages, ...socketOnly]));
  }, [conversationId, dispatch, enabled, query.data, query.isFetched, query.isSuccess]);

  return query;
};

export const useTeamUnreadCountQuery = (options?: { enabled?: boolean }) => {
  const dispatch = useDispatch<AppDispatch>();
  const query = useQuery({
    queryKey: teamChatKeys.unreadCount(),
    queryFn: () => teamChatApi.fetchUnreadCount(),
    enabled: options?.enabled ?? true,
    staleTime: 60_000,
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
      // markTeamConversationReadLocal zeros out the badge in Redux immediately.
      // Conversations list invalidation is skipped — the local update is sufficient for the UI.
      dispatch(markTeamConversationReadLocal(conversationId));
      queryClient.invalidateQueries({ queryKey: teamChatKeys.unreadCount() });
    },
  });
};

export const useSendTeamMessageMutation = () => {
  const dispatch = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SendTeamMessagePayload) => teamChatApi.sendMessage(payload),
    onMutate: (variables) => {
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const currentUserId = store.getState().user?.connectedUser?.user?._id;
      if (!currentUserId) return { tempId };

      const tempMessage: ChatShellMessage = {
        _id: tempId,
        stableKey: tempId,
        text: variables.text,
        sender: { _id: String(currentUserId) },
        receiver: { _id: variables.receiverId },
        isRead: false,
        createdAt: new Date().toISOString(),
        conversationId: variables.conversationId,
        pending: true,
      };

      dispatch(addTeamMessage({
        message: tempMessage,
        viewerUserId: String(currentUserId),
        viewerIsViewingConversation: true,
      }));

      queryClient.setQueriesData(
        { queryKey: teamChatKeys.messages(variables.conversationId) },
        (old) => Array.isArray(old) ? [...old, tempMessage] : old,
      );

      return { tempId };
    },
    onSuccess: (message, variables, context) => {
      if (!context?.tempId) return;
      const mapped = toChatShellMessage(message);
      mapped.stableKey = context.tempId;

      dispatch(confirmTeamPendingMessage({ tempId: context.tempId, message: mapped }));

      queryClient.setQueriesData(
        { queryKey: teamChatKeys.messages(variables.conversationId) },
        (old) => {
          if (!Array.isArray(old)) return old;
          return [...old.filter((m: any) => String(m._id) !== context.tempId), mapped];
        },
      );
    },
    onError: (_err, variables, context) => {
      if (!context?.tempId) return;
      dispatch(removeTeamMessage(context.tempId));
      queryClient.setQueriesData(
        { queryKey: teamChatKeys.messages(variables.conversationId) },
        (old) => Array.isArray(old)
          ? old.filter((m: any) => String(m._id) !== context.tempId)
          : old,
      );
      queryClient.invalidateQueries({ queryKey: [...teamChatKeys.all, "conversations"] });
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

export const useDeleteTeamMessageMutation = () => {
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
    }) => teamChatApi.deleteMessage(messageId, scope),
    onMutate: async (variables) => {
      const messagesPrefix = [...teamChatKeys.all, "messages", variables.conversationId] as const;
      // Cancel in-flight fetches before the delete so a stale response can't
      // land after we clear the cache and put the deleted row back.
      await queryClient.cancelQueries({ queryKey: messagesPrefix });
      const snapshot = queryClient.getQueryData(messagesPrefix);
      return { snapshot };
    },
    onError: (_err, variables, context) => {
      if (context?.snapshot !== undefined) {
        const messagesPrefix = [...teamChatKeys.all, "messages", variables.conversationId] as const;
        queryClient.setQueryData(messagesPrefix, context.snapshot);
      }
    },
    onSuccess: async (data, variables) => {
      const messagesPrefix = [...teamChatKeys.all, "messages", variables.conversationId] as const;

      if (data.scope === "everyone") {
        let mapped: ReturnType<typeof toChatShellMessage> | null = null;
        if (data.message) {
          const merged = {
            ...data.message,
            conversationId: data.message?.conversationId ?? variables.conversationId,
          };
          mapped = toChatShellMessage(merged as TeamMessage);
        } else {
          const prev = store.getState().teamChat.messages.find(
            (m) => String(m._id) === String(variables.messageId),
          );
          if (prev) {
            const deleterId =
              store.getState().user?.connectedUser?.user?._id
              ?? store.getState().user?.connectedUser?.user?.id;
            mapped = toChatShellMessage({
              _id: variables.messageId,
              conversationId: variables.conversationId,
              senderId: String(prev.sender._id),
              receiverId: String(prev.receiver._id),
              isRead: prev.isRead,
              createdAt: prev.createdAt,
              isDeletedForEveryone: true,
              text: "",
              deletedAt: new Date().toISOString(),
              ...(deleterId != null ? { deletedForEveryoneBy: String(deleterId) } : {}),
            } as TeamMessage);
          }
        }
        if (mapped) {
          dispatch(upsertTeamMessage(mapped));
          queryClient.setQueriesData({ queryKey: messagesPrefix }, (old) => {
            if (!Array.isArray(old)) return old;
            const id = String(variables.messageId);
            const idx = old.findIndex((m) => String(m._id) === id);
            if (idx < 0) return old;
            const next = [...old];
            next[idx] = mapped;
            return next;
          });
        }
      } else {
        dispatch(removeTeamMessage(variables.messageId));
        queryClient.setQueriesData({ queryKey: messagesPrefix }, (old) => {
          if (!Array.isArray(old)) return old;
          return old.filter((m) => String(m._id) !== String(variables.messageId));
        });
      }

      // setQueriesData above and Redux dispatch (upsertTeamMessage / removeTeamMessage) already handle
      // messages and conversation lastMessage previews — no full refetch needed.
      await queryClient.invalidateQueries({ queryKey: teamChatKeys.unreadCount() });
    },
  });
};

export const useDeleteTeamConversationMutation = () => {
  const dispatch = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => teamChatApi.deleteConversation(conversationId),
    onSuccess: async (_data, conversationId) => {
      // Cancel in-flight fetches first so they don't land after we clear the cache.
      await queryClient.cancelQueries({ queryKey: teamChatKeys.conversation(conversationId) });
      await queryClient.cancelQueries({ queryKey: teamChatKeys.messages(conversationId) });

      // Set to null instead of removeQueries: an active observer seeing removeQueries will
      // immediately schedule a new fetch (the cache is empty but enabled=true). setQueryData(null)
      // marks the slot as having fresh data → no refetch → no 404 noise.
      queryClient.setQueryData(teamChatKeys.conversation(conversationId), null);
      queryClient.setQueryData(teamChatKeys.messages(conversationId, undefined), null);

      dispatch(removeTeamConversation(conversationId));
      queryClient.setQueriesData(
        { queryKey: [...teamChatKeys.all, "conversations"] },
        (old) => {
          if (!Array.isArray(old)) return old;
          return old.filter((c: any) => String(c._id) !== String(conversationId));
        },
      );
      queryClient.invalidateQueries({ queryKey: teamChatKeys.unreadCount() });
    },
  });
};

export const getTeamChatMutationError = (error: unknown, fallback: string) =>
  getTeamChatErrorMessage(error, fallback);
