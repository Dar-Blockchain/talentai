import { MESSAGES_BASE_PATH } from "@/modules/shared/chat/constants/messagesRoutes";

export const getTeamChatBasePath = (_role?: string | null) => MESSAGES_BASE_PATH;

export const getTeamChatConversationPath = (
  role: string | null | undefined,
  conversationId: string,
) => `${getTeamChatBasePath(role)}/${conversationId}`;
