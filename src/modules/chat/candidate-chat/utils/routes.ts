import {
  MESSAGES_BASE_PATH,
  MESSAGES_CANDIDATES_PATH,
} from "@/modules/chat/shared/constants/messagesRoutes";

export const CANDIDATE_MESSAGES_BASE_PATH = MESSAGES_BASE_PATH;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getCandidateChatBasePath = (_role?: string | null) => MESSAGES_BASE_PATH;

export const getCandidateChatConversationPath = (
  role: string | null | undefined,
  conversationId: string,
) => `${getCandidateChatBasePath(role)}/${conversationId}`;

export const isCandidateMessagesPath = (pathname: string) =>
  pathname === MESSAGES_BASE_PATH
  || pathname.startsWith(`${MESSAGES_BASE_PATH}/`)
  || pathname === MESSAGES_CANDIDATES_PATH
  || pathname.startsWith(`${MESSAGES_CANDIDATES_PATH}/`);
