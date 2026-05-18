import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppDispatch, store } from "@/store/store";
import { getTeamChatErrorMessage, teamChatApi } from "@/modules/team-chat/api/teamChatApi";
import { teamChatKeys } from "@/modules/team-chat/queries/keys";
import {
  addTeamMessage,
  markTeamConversationReadLocal,
  removeTeamConversation,
  removeTeamMessage,
  setTeamConversations,
  setTeamCurrentConversation,
  setTeamMessages,
  setTeamTotalUnread,
  upsertTeamConversation,
  upsertTeamMessage,
} from "@/modules/team-chat/store/teamChatSlice";
import type { ChatShellMessage } from "@/modules/shared/chat/types/shell";
import type {
  SendTeamMessagePayload,
  TeamChatConversationsParams,
  TeamChatMessagesParams,
  TeamMessage,
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
      const messages = await teamChatApi.fetchMessages(conversationId as string, params);
      return messages.map(toChatShellMessage);
    },
    enabled,
    staleTime: 30_000,
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
      const currentUserId = store.getState().user?.connectedUser?.user?._id;

      dispatch(removeTeamMessage(context.tempId));
      dispatch(addTeamMessage({
        message: mapped,
        viewerUserId: String(currentUserId ?? ""),
        viewerIsViewingConversation: true,
      }));

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
    onSuccess: async (data, variables) => {
      const messagesPrefix = [...teamChatKeys.all, "messages", variables.conversationId] as const;
      // Drop in-flight message list fetches (started before delete); otherwise a stale
      // response can finish last and put the deleted row back in cache → Redux resyncs it.
      await queryClient.cancelQueries({ queryKey: messagesPrefix });

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
