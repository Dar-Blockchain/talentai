export type {
  TeamChatParticipant,
  TeamConversation,
  TeamMessage,
  TeamChatConversationsParams,
  TeamChatMessagesParams,
  SendTeamMessagePayload,
  TeamChatSocketMessagePayload,
} from "@/modules/chat/team-chat/types";

export { teamChatApi, getTeamChatErrorMessage } from "@/modules/chat/team-chat/api/teamChatApi";
export { teamChatKeys } from "@/modules/chat/team-chat/queries/keys";
export {
  useTeamConversationsQuery,
  useTeamConversationQuery,
  useTeamMessagesQuery,
  useTeamUnreadCountQuery,
  useMarkTeamConversationReadMutation,
  useSendTeamMessageMutation,
  useOpenTeamConversationMutation,
  useDeleteTeamMessageMutation,
  useDeleteTeamConversationMutation,
  getTeamChatMutationError,
} from "@/modules/chat/team-chat/queries/useTeamChatQueries";
export {
  setTeamConversations,
  setTeamCurrentConversation,
  setTeamMessages,
  setTeamTotalUnread,
  addTeamMessage,
  clearTeamCurrentConversation,
  upsertTeamConversation,
  markTeamConversationReadLocal,
  removeTeamMessage,
  removeTeamConversation,
  selectTeamConversations,
  selectTeamCurrentConversation,
  selectTeamMessages,
  selectTeamTotalUnread,
} from "@/modules/chat/team-chat/store/teamChatSlice";
export { default as teamChatReducer } from "@/modules/chat/team-chat/store/teamChatSlice";
export { useTeamChatSession } from "@/modules/chat/team-chat/hooks/useTeamChatSession";
export { useStartTeamChat } from "@/modules/chat/team-chat/hooks/useStartTeamChat";
export {
  toChatShellConversation,
  toChatShellMessage,
  toParticipant,
} from "@/modules/chat/team-chat/utils/mappers";
export type {
  ChatShellConversation,
  ChatShellMessage,
} from "@/modules/chat/shared";
export { getTeamChatBasePath, getTeamChatConversationPath } from "@/modules/chat/team-chat/utils/routes";
export { default as TeamChatPageContent } from "@/modules/chat/team-chat/components/TeamChatPageContent";
export { default as TeamChatColleaguesPanel } from "@/modules/chat/team-chat/components/TeamChatColleaguesPanel";
