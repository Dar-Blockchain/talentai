export type {
  CandidateChatParticipant,
  CandidateConversation,
  CandidateMessage,
  CandidateChatConversationsParams,
  CandidateChatMessagesParams,
  SendCandidateMessagePayload,
  CreateCandidateConversationPayload,
} from "@/modules/chat/candidate-chat/types";

export {
  candidateChatApi,
  getCandidateChatErrorMessage,
} from "@/modules/chat/candidate-chat/api/candidateChatApi";
export { candidateChatKeys } from "@/modules/chat/candidate-chat/queries/keys";
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
} from "@/modules/chat/candidate-chat/queries/useCandidateChatQueries";
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
} from "@/modules/chat/candidate-chat/store/candidateChatSlice";
export { default as candidateChatReducer } from "@/modules/chat/candidate-chat/store/candidateChatSlice";
export { useCandidateChatSession } from "@/modules/chat/candidate-chat/hooks/useCandidateChatSession";
export {
  toChatShellConversation,
  toChatShellMessage,
  toParticipant,
} from "@/modules/chat/candidate-chat/utils/mappers";
export type {
  ChatShellConversation,
  ChatShellMessage,
} from "@/modules/chat/shared";
export {
  CANDIDATE_MESSAGES_BASE_PATH,
  getCandidateChatBasePath,
  getCandidateChatConversationPath,
  isCandidateMessagesPath,
} from "@/modules/chat/candidate-chat/utils/routes";
export { default as CandidateChatPageContent } from "@/modules/chat/candidate-chat/components/CandidateChatPageContent";
export { default as CandidateChatRealtimeBridge } from "@/modules/chat/candidate-chat/components/CandidateChatRealtimeBridge";
