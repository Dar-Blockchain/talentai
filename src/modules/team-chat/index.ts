export type {
  TeamChatParticipant,
  TeamConversation,
  TeamMessage,
  TeamChatConversationsParams,
  TeamChatMessagesParams,
  SendTeamMessagePayload,
  TeamChatSocketMessagePayload,
} from "@/modules/team-chat/types";

export { teamChatApi, getTeamChatErrorMessage } from "@/modules/team-chat/api/teamChatApi";
export { teamChatKeys } from "@/modules/team-chat/queries/keys";
export {
  useTeamConversationsQuery,
  useTeamConversationQuery,
  useTeamMessagesQuery,
  useTeamUnreadCountQuery,
  useMarkTeamConversationReadMutation,
  useSendTeamMessageMutation,
  useOpenTeamConversationMutation,
  getTeamChatMutationError,
} from "@/modules/team-chat/queries/useTeamChatQueries";
export {
  setTeamConversations,
  setTeamCurrentConversation,
  setTeamMessages,
  setTeamTotalUnread,
  addTeamMessage,
  clearTeamCurrentConversation,
  upsertTeamConversation,
  markTeamConversationReadLocal,
  selectTeamConversations,
  selectTeamCurrentConversation,
  selectTeamMessages,
  selectTeamTotalUnread,
} from "@/modules/team-chat/store/teamChatSlice";
export { default as teamChatReducer } from "@/modules/team-chat/store/teamChatSlice";
export { useTeamChatSession } from "@/modules/team-chat/hooks/useTeamChatSession";
export { useStartTeamChat } from "@/modules/team-chat/hooks/useStartTeamChat";
export {
  toChatShellConversation,
  toChatShellMessage,
  toParticipant,
} from "@/modules/team-chat/utils/mappers";
export type {
  ChatShellConversation,
  ChatShellMessage,
} from "@/modules/shared/chat";
export { getTeamChatBasePath, getTeamChatConversationPath } from "@/modules/team-chat/utils/routes";
export { default as TeamChatPageContent } from "@/modules/team-chat/components/TeamChatPageContent";
export { default as TeamChatColleaguesPanel } from "@/modules/team-chat/components/TeamChatColleaguesPanel";
