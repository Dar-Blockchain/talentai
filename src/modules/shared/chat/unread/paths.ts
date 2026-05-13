import {
  MESSAGES_BASE_PATH,
  MESSAGES_CANDIDATES_PATH,
} from "@/modules/shared/chat/constants/messagesRoutes";

export type ChatUnreadModule = "team" | "candidate";

const LEGACY_TEAM_CHAT_PATH_PREFIXES = ["/company/team-chat", "/employee/team-chat"] as const;
const LEGACY_CANDIDATE_CHAT_PATH_PREFIXES = [
  "/company/candidate-chat",
  "/candidate/messages",
  "/chat",
] as const;

export const normalizeResolvedPath = (path: string): string => {
  const withoutHash = path.split("#")[0] ?? "";
  const withoutQuery = withoutHash.split("?")[0] ?? "";
  const normalized = withoutQuery.replace(/\/$/, "");
  return normalized || "/";
};

const matchesPathPrefix = (pathname: string, prefix: string) =>
  pathname === prefix || pathname.startsWith(`${prefix}/`);

const isMessagesCandidatesPath = (pathname: string) =>
  matchesPathPrefix(pathname, MESSAGES_CANDIDATES_PATH);

const isMessagesTeamHubPath = (pathname: string) =>
  pathname === MESSAGES_BASE_PATH
  || (pathname.startsWith(`${MESSAGES_BASE_PATH}/`) && !isMessagesCandidatesPath(pathname));

export const isTeamChatPath = (path: string, role?: string | null) => {
  const pathname = normalizeResolvedPath(path);
  if (isMessagesCandidatesPath(pathname)) return false;

  if (LEGACY_TEAM_CHAT_PATH_PREFIXES.some((prefix) => matchesPathPrefix(pathname, prefix))) {
    return true;
  }

  if (role === "Candidate") return false;
  if (role === "Company" || role === "Employee") {
    return isMessagesTeamHubPath(pathname);
  }

  return isMessagesTeamHubPath(pathname);
};

export const isCandidateChatPath = (path: string, role?: string | null) => {
  const pathname = normalizeResolvedPath(path);
  if (isMessagesCandidatesPath(pathname)) return true;

  if (LEGACY_CANDIDATE_CHAT_PATH_PREFIXES.some((prefix) => matchesPathPrefix(pathname, prefix))) {
    return true;
  }

  if (role === "Company" || role === "Employee") return false;
  if (role === "Candidate") {
    return isMessagesTeamHubPath(pathname);
  }

  return false;
};

export const isChatModulePath = (
  path: string,
  module: ChatUnreadModule,
  role?: string | null,
) => (module === "team"
  ? isTeamChatPath(path, role)
  : isCandidateChatPath(path, role));

const getTeamConversationId = (path: string, role?: string | null) => {
  const pathname = normalizeResolvedPath(path);
  if (!isTeamChatPath(pathname, role)) return null;

  const match = pathname.match(/^\/(?:messages|company\/team-chat|employee\/team-chat)\/([^/]+)/);
  return match?.[1] ?? null;
};

const getCandidateConversationId = (path: string, role?: string | null) => {
  const pathname = normalizeResolvedPath(path);
  if (!isCandidateChatPath(pathname, role)) return null;

  const companyMatch = pathname.match(
    /^\/(?:messages\/candidates|company\/candidate-chat)\/([^/]+)/,
  );
  if (companyMatch) return companyMatch[1];

  const candidateMatch = pathname.match(/^\/(?:messages|candidate\/messages|chat)\/([^/]+)/);
  return candidateMatch?.[1] ?? null;
};

export const getOpenConversationIdFromPath = (
  path: string,
  module: ChatUnreadModule,
  role?: string | null,
): string | null => (module === "team"
  ? getTeamConversationId(path, role)
  : getCandidateConversationId(path, role));

export const isViewerInActiveConversation = (
  path: string,
  module: ChatUnreadModule,
  conversationId: string,
  openConversationId: string | null,
  role?: string | null,
) => {
  if (!isChatModulePath(path, module, role)) return false;

  const routeConversationId = getOpenConversationIdFromPath(path, module, role);
  if (routeConversationId) {
    return routeConversationId === conversationId;
  }

  return !!openConversationId && openConversationId === conversationId;
};
