export type {
  CandidateChatParticipant,
  CandidateConversation,
  CandidateMessage,
  CandidateChatConversationsParams,
  CandidateChatMessagesParams,
  SendCandidateMessagePayload,
  CreateCandidateConversationPayload,
} from "@/modules/candidate-chat/types";

export {
  candidateChatApi,
  getCandidateChatErrorMessage,
} from "@/modules/candidate-chat/api/candidateChatApi";
export { candidateChatKeys } from "@/modules/candidate-chat/queries/keys";
export {
  useCandidateConversationsQuery,
  useCandidateConversationQuery,
  useCandidateMessagesQuery,
  useCandidateUnreadCountQuery,
  useMarkCandidateConversationReadMutation,
  useSendCandidateMessageMutation,
  useCreateCandidateConversationMutation,
  useDeleteCandidateMessageMutation,
  useDeleteCandidateConversationMutation,
  getCandidateChatMutationError,
} from "@/modules/candidate-chat/queries/useCandidateChatQueries";
export {
  setCandidateConversations,
  setCandidateCurrentConversation,
  setCandidateMessages,
  setCandidateTotalUnread,
  addCandidateMessage,
  clearCandidateCurrentConversation,
  upsertCandidateConversation,
  markCandidateConversationReadLocal,
  removeCandidateMessage,
  removeCandidateConversation,
  selectCandidateConversations,
  selectCandidateCurrentConversation,
  selectCandidateMessages,
  selectCandidateTotalUnread,
} from "@/modules/candidate-chat/store/candidateChatSlice";
export { default as candidateChatReducer } from "@/modules/candidate-chat/store/candidateChatSlice";
export { useCandidateChatSession } from "@/modules/candidate-chat/hooks/useCandidateChatSession";
export {
  toChatShellConversation,
  toChatShellMessage,
  toParticipant,
} from "@/modules/candidate-chat/utils/mappers";
export type {
  ChatShellConversation,
  ChatShellMessage,
} from "@/modules/shared/chat";
export {
  CANDIDATE_MESSAGES_BASE_PATH,
  getCandidateChatBasePath,
  getCandidateChatConversationPath,
  isCandidateMessagesPath,
} from "@/modules/candidate-chat/utils/routes";
export { default as CandidateChatPageContent } from "@/modules/candidate-chat/components/CandidateChatPageContent";
export { default as CandidateChatRealtimeBridge } from "@/modules/candidate-chat/components/CandidateChatRealtimeBridge";
