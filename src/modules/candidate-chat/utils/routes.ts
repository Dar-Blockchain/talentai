import {
  MESSAGES_BASE_PATH,
  MESSAGES_CANDIDATES_PATH,
} from "@/modules/shared/chat/constants/messagesRoutes";

export const CANDIDATE_MESSAGES_BASE_PATH = MESSAGES_BASE_PATH;

export const getCandidateChatBasePath = (role?: string | null) =>
  role === "Candidate" ? MESSAGES_BASE_PATH : MESSAGES_CANDIDATES_PATH;

export const getCandidateChatConversationPath = (
  role: string | null | undefined,
  conversationId: string,
) => `${getCandidateChatBasePath(role)}/${conversationId}`;

export const isCandidateMessagesPath = (pathname: string) =>
  pathname === MESSAGES_BASE_PATH
  || pathname.startsWith(`${MESSAGES_BASE_PATH}/`)
  || pathname === MESSAGES_CANDIDATES_PATH
  || pathname.startsWith(`${MESSAGES_CANDIDATES_PATH}/`);
