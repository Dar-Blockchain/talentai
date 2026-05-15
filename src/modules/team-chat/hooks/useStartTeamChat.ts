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
} from "@/modules/team-chat/queries/useTeamChatQueries";
import { teamChatKeys } from "@/modules/team-chat/queries/keys";
import { getTeamChatConversationPath } from "@/modules/team-chat/utils/routes";
import type { ChatShellConversation } from "@/modules/team-chat/utils/mappers";

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
          const { teamChatApi } = await import("@/modules/team-chat/api/teamChatApi");
          const { toChatShellConversation } = await import("@/modules/team-chat/utils/mappers");
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

    try {
      const conversation = await openConversationMutation.mutateAsync(targetUserId);
      await navigateToConversation(targetUserId, conversation);
    } catch (error) {
      try {
        const conversations = await queryClient.fetchQuery({
          queryKey: teamChatKeys.conversations(),
          queryFn: async () => {
            const { teamChatApi } = await import("@/modules/team-chat/api/teamChatApi");
            const { toChatShellConversation } = await import("@/modules/team-chat/utils/mappers");
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
  }, [currentUserId, navigateToConversation, openConversationMutation, queryClient, showToast]);
};
