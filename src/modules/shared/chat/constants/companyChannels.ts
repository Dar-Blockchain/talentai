import {
  COMPANY_CANDIDATE_CHAT_PATH,
  COMPANY_TEAM_CHAT_PATH,
} from "@/modules/shared/chat/constants/messagesRoutes";

export { COMPANY_CANDIDATE_CHAT_PATH, COMPANY_TEAM_CHAT_PATH };

export type CompanyChatChannel = "team" | "candidate";

export const getCompanyChatChannel = (pathname: string): CompanyChatChannel =>
  pathname.startsWith(COMPANY_CANDIDATE_CHAT_PATH) ? "candidate" : "team";

export const getCompanyChatChannelBasePath = (channel: CompanyChatChannel) =>
  channel === "candidate" ? COMPANY_CANDIDATE_CHAT_PATH : COMPANY_TEAM_CHAT_PATH;
