import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppDispatch, store } from "@/store/store";
import { getTeamChatErrorMessage, teamChatApi } from "@/modules/team-chat/api/teamChatApi";
import { teamChatKeys } from "@/modules/team-chat/queries/keys";
import {
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
      const convId = message?.conversationId ? String(message.conversationId) : null;
      queryClient.invalidateQueries({ queryKey: teamChatKeys.conversations() });
      queryClient.invalidateQueries({ queryKey: teamChatKeys.unreadCount() });
      if (convId) {
        queryClient.invalidateQueries({ queryKey: teamChatKeys.messages(convId) });
      }
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

      await queryClient.invalidateQueries({ queryKey: teamChatKeys.conversations() });
      await queryClient.invalidateQueries({ queryKey: messagesPrefix });
      await queryClient.invalidateQueries({ queryKey: teamChatKeys.unreadCount() });
    },
  });
};

export const useDeleteTeamConversationMutation = () => {
  const dispatch = useDispatch<AppDispatch>();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => teamChatApi.deleteConversation(conversationId),
    onSuccess: (_data, conversationId) => {
      dispatch(removeTeamConversation(conversationId));
      // Drop cached messages/conversation so reopening refetches with clearedAt filter (not stale full history).
      queryClient.removeQueries({ queryKey: teamChatKeys.messages(conversationId) });
      queryClient.removeQueries({ queryKey: teamChatKeys.conversation(conversationId) });
      queryClient.invalidateQueries({ queryKey: teamChatKeys.conversations() });
      queryClient.invalidateQueries({ queryKey: teamChatKeys.unreadCount() });
    },
  });
};

export const getTeamChatMutationError = (error: unknown, fallback: string) =>
  getTeamChatErrorMessage(error, fallback);
