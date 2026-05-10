export const isInvitationUrl = (url?: string) =>
  !!url &&
  (decodeURIComponent(url).includes("/employee/invitation/joinTeam") ||
    decodeURIComponent(url).includes("/invitation/joinTeam"));
