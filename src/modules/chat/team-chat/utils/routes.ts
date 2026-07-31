import { MESSAGES_BASE_PATH } from "@/modules/chat/shared/constants/messagesRoutes";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getTeamChatBasePath = (_role?: string | null) => MESSAGES_BASE_PATH;

export const getTeamChatConversationPath = (
  role: string | null | undefined,
  conversationId: string,
) => `${getTeamChatBasePath(role)}/${conversationId}`;
