import { useCallback } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import { useQueryClient } from "@tanstack/react-query";
import { RootState } from "@/store/store";
import { useToast } from "@/hooks/useToast";
import {
  getTeamChatMutationError,
  useOpenTeamConversationMutation,
  useTeamConversationsQuery,
} from "@/modules/chat/team-chat/queries/useTeamChatQueries";
import { teamChatKeys } from "@/modules/chat/team-chat/queries/keys";
import { getTeamChatConversationPath } from "@/modules/chat/team-chat/utils/routes";
import type { ChatShellConversation } from "@/modules/chat/team-chat/utils/mappers";

const findConversationForUser = (
  conversations: ChatShellConversation[],
  targetUserId: string,
) => conversations.find((conversation) =>
  conversation.participants.some((participant) => String(participant._id) === String(targetUserId)),
);

export const useStartTeamChat = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const currentUser = useSelector((state: RootState) => state.user.connectedUser.user);
  const currentUserId = currentUser?._id;
  const openConversationMutation = useOpenTeamConversationMutation();
  useTeamConversationsQuery(undefined, { enabled: !!currentUserId });

  const navigateToConversation = useCallback(async (
    targetUserId: string,
    opened?: ChatShellConversation,
  ) => {
    let conversationId = opened?._id ? String(opened._id) : "";

    if (!conversationId) {
      const conversations = await queryClient.fetchQuery({
        queryKey: teamChatKeys.conversations(),
        queryFn: async () => {
          const { teamChatApi } = await import("@/modules/chat/team-chat/api/teamChatApi");
          const { toChatShellConversation } = await import("@/modules/chat/team-chat/utils/mappers");
          const data = await teamChatApi.fetchConversations();
          return data.map(toChatShellConversation);
        },
      });
      conversationId = findConversationForUser(conversations, targetUserId)?._id || "";
    }

    if (!conversationId) {
      showToast({ message: "Could not open the conversation.", severity: "error" });
      return;
    }

    await router.push(getTeamChatConversationPath(currentUser?.role, conversationId));
  }, [currentUser?.role, queryClient, router, showToast]);

  return useCallback(async (targetUserId: string) => {
    if (!targetUserId) return;
    if (targetUserId === currentUserId) {
      showToast({ message: "You cannot start a chat with yourself.", severity: "error" });
      return;
    }

    // Check cache synchronously — zero latency for existing conversations.
    const cached = queryClient.getQueryData<ChatShellConversation[]>(teamChatKeys.conversations());
    const existingConv = cached ? findConversationForUser(cached, targetUserId) : null;

    if (existingConv?._id) {
      // Navigate instantly, then fire openConversation in the background to keep server state in sync.
      void router.push(getTeamChatConversationPath(currentUser?.role, String(existingConv._id)));
      openConversationMutation.mutate(targetUserId);
      return;
    }

    // New conversation — must wait for the API to obtain the conversation ID.
    try {
      const conversation = await openConversationMutation.mutateAsync(targetUserId);
      await navigateToConversation(targetUserId, conversation);
    } catch (error) {
      try {
        const conversations = await queryClient.fetchQuery({
          queryKey: teamChatKeys.conversations(),
          queryFn: async () => {
            const { teamChatApi } = await import("@/modules/chat/team-chat/api/teamChatApi");
            const { toChatShellConversation } = await import("@/modules/chat/team-chat/utils/mappers");
            const data = await teamChatApi.fetchConversations();
            return data.map(toChatShellConversation);
          },
        });
        const existing = findConversationForUser(conversations, targetUserId);
        if (existing?._id) {
          await navigateToConversation(targetUserId, existing);
          return;
        }
      } catch {
        // fall through to generic error
      }

      showToast({
        message: getTeamChatMutationError(error, "Could not start team chat."),
        severity: "error",
      });
    }
  }, [currentUser?.role, currentUserId, navigateToConversation, openConversationMutation, queryClient, router, showToast]);
};
