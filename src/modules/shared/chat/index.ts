export type {
  ChatShellConversation,
  ChatShellMessage,
  ChatShellMessagePayload,
} from "@/modules/shared/chat/types/shell";
export { normalizeId } from "@/modules/shared/chat/utils/normalizeId";
export { normalizeConversationUnreadCount } from "@/modules/shared/chat/utils/normalizeConversationUnread";
export { getApiErrorMessage } from "@/modules/shared/chat/utils/errors";
export {
  containsEmailAddress,
  containsPhoneNumber,
  getBlockedMessageReason,
} from "@/modules/shared/chat/utils/messageValidation";
export { deliveryBlockedToastMessage } from "@/modules/shared/chat/utils/deliveryBlockedToast";
export {
  CHAT_LAST_MESSAGE_BLOCKED_PREVIEW,
  CHAT_LAST_MESSAGE_DELETED_SENTINEL,
  CHAT_MESSAGE_BODY_TOMBSTONE,
} from "@/modules/shared/chat/constants/contactPolicy";
export { playNotificationSound } from "@/modules/shared/chat/utils/notificationSound";
export { resolveMessagePayload } from "@/modules/shared/chat/utils/resolveMessagePayload";
export {
  dedupeMessages,
  sortConversationsByRecent,
  applyIncomingMessage,
} from "@/modules/shared/chat/store/chatShellState";
export {
  createNamespaceSocket,
  type ChatConversationRoomConfig,
  type ChatNamespaceSocketConfig,
} from "@/modules/shared/chat/realtime/createNamespaceSocket";
export {
  chatModulePageSx,
  chatDashboardShellSx,
  chatDashboardShellFlexSx,
} from "@/modules/shared/chat/styles/modulePage";
export { companyChatSx } from "@/modules/shared/chat/styles/companyChat";
export { chatSegmentedControlSx } from "@/modules/shared/chat/styles/segmentedControl";
export {
  COMPANY_TEAM_CHAT_PATH,
  COMPANY_CANDIDATE_CHAT_PATH,
  getCompanyChatChannel,
  getCompanyChatChannelBasePath,
  type CompanyChatChannel,
} from "@/modules/shared/chat/constants/companyChannels";
export { default as ChatModulePageFrame } from "@/modules/shared/chat/components/ChatModulePageFrame";
export { default as CompanyHubChatFrame } from "@/modules/shared/chat/components/CompanyHubChatFrame";
export { default as CompanyHubMintChatShell } from "@/modules/shared/chat/components/CompanyHubMintChatShell";
export { default as CompanyChatLayout } from "@/modules/shared/chat/components/CompanyChatLayout";
export { default as CompanyChatTopNav } from "@/modules/shared/chat/components/CompanyChatTopNav";
export { default as ChatSegmentedControl } from "@/modules/shared/chat/components/ChatSegmentedControl";
export { default as ChatUnreadBadge } from "@/modules/shared/chat/components/ChatUnreadBadge";
export { default as ChatUnreadSyncBridge } from "@/modules/shared/chat/components/ChatUnreadSyncBridge";
export { useChatUnreadBadges } from "@/modules/shared/chat/hooks/useChatUnreadBadges";
export { useChatUnreadQuerySync } from "@/modules/shared/chat/hooks/useChatUnreadQuerySync";
export {
  getOpenConversationIdFromPath,
  isCandidateChatPath,
  isChatModulePath,
  isTeamChatPath,
  isViewerInActiveConversation,
  normalizeResolvedPath,
  type ChatUnreadModule,
} from "@/modules/shared/chat/unread/paths";
export { getIncomingMessageFlags } from "@/modules/shared/chat/unread/incoming";
export { sumConversationUnread } from "@/modules/shared/chat/unread/selectors";
