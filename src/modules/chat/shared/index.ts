export type {
  ChatShellConversation,
  ChatShellMessage,
  ChatShellMessagePayload,
} from "@/modules/chat/shared/types/shell";
export { normalizeId } from "@/modules/chat/shared/utils/normalizeId";
export { normalizeConversationUnreadCount } from "@/modules/chat/shared/utils/normalizeConversationUnread";
export { getApiErrorMessage } from "@/modules/chat/shared/utils/errors";
export {
  containsEmailAddress,
  containsPhoneNumber,
  getBlockedMessageReason,
} from "@/modules/chat/shared/utils/messageValidation";
export { deliveryBlockedToastMessage } from "@/modules/chat/shared/utils/deliveryBlockedToast";
export {
  CHAT_LAST_MESSAGE_BLOCKED_PREVIEW,
  CHAT_LAST_MESSAGE_DELETED_SENTINEL,
  CHAT_MESSAGE_BODY_TOMBSTONE,
} from "@/modules/chat/shared/constants/contactPolicy";
export { playNotificationSound } from "@/modules/chat/shared/utils/notificationSound";
export { resolveMessagePayload } from "@/modules/chat/shared/utils/resolveMessagePayload";
export {
  dedupeMessages,
  sortConversationsByRecent,
  applyIncomingMessage,
} from "@/modules/chat/shared/store/chatShellState";
export {
  createNamespaceSocket,
  type ChatConversationRoomConfig,
  type ChatNamespaceSocketConfig,
} from "@/modules/chat/shared/realtime/createNamespaceSocket";
export {
  chatModulePageSx,
  chatDashboardShellSx,
  chatDashboardShellFlexSx,
} from "@/modules/chat/shared/styles/modulePage";
export { companyChatSx } from "@/modules/chat/shared/styles/companyChat";
export { chatSegmentedControlSx } from "@/modules/chat/shared/styles/segmentedControl";
export {
  COMPANY_TEAM_CHAT_PATH,
  COMPANY_CANDIDATE_CHAT_PATH,
  getCompanyChatChannel,
  getCompanyChatChannelBasePath,
  type CompanyChatChannel,
} from "@/modules/chat/shared/constants/companyChannels";
export { default as ChatModulePageFrame } from "@/modules/chat/shared/components/ChatModulePageFrame";
export { default as CompanyHubChatFrame } from "@/modules/chat/shared/components/CompanyHubChatFrame";
export { default as CompanyHubMintChatShell } from "@/modules/chat/shared/components/CompanyHubMintChatShell";
export { default as CompanyChatLayout } from "@/modules/chat/shared/components/CompanyChatLayout";
export { default as CompanyChatTopNav } from "@/modules/chat/shared/components/CompanyChatTopNav";
export { default as ChatSegmentedControl } from "@/modules/chat/shared/components/ChatSegmentedControl";
export { default as ChatUnreadBadge } from "@/modules/chat/shared/components/ChatUnreadBadge";
export { default as ChatUnreadSyncBridge } from "@/modules/chat/shared/components/ChatUnreadSyncBridge";
export { useChatUnreadBadges } from "@/modules/chat/shared/hooks/useChatUnreadBadges";
export { useChatUnreadQuerySync } from "@/modules/chat/shared/hooks/useChatUnreadQuerySync";
export {
  getOpenConversationIdFromPath,
  isCandidateChatPath,
  isChatModulePath,
  isTeamChatPath,
  isViewerInActiveConversation,
  normalizeResolvedPath,
  type ChatUnreadModule,
} from "@/modules/chat/shared/unread/paths";
export { getIncomingMessageFlags } from "@/modules/chat/shared/unread/incoming";
export { sumConversationUnread } from "@/modules/chat/shared/unread/selectors";
