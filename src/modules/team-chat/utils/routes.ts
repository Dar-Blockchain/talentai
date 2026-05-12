export const getTeamChatBasePath = (role?: string | null) =>
  role === "Employee" ? "/employee/team-chat" : "/company/team-chat";

export const getTeamChatConversationPath = (role: string | null | undefined, conversationId: string) =>
  `${getTeamChatBasePath(role)}/${conversationId}`;
