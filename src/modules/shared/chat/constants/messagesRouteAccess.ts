export type MessagesRouteSurface = "team" | "company-candidates";

export const MESSAGES_TEAM_ROLES = ["Candidate", "Employee", "Company"] as const;
export const MESSAGES_COMPANY_CANDIDATES_ROLES = ["Company"] as const;

export const MESSAGES_ROUTE_ACCESS: Record<MessagesRouteSurface, readonly string[]> = {
  team: MESSAGES_TEAM_ROLES,
  "company-candidates": MESSAGES_COMPANY_CANDIDATES_ROLES,
};

export const isRoleAllowedOnMessagesSurface = (
  role: string | null | undefined,
  surface: MessagesRouteSurface,
) => !!role && MESSAGES_ROUTE_ACCESS[surface].includes(role);
