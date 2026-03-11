export const isInvitationUrl = (url?: string) =>
  !!url && decodeURIComponent(url).includes("/invitation/joinTeam");
