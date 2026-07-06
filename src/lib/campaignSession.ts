export function buildCampaignSessionUrl(campaignId: string, token?: string): string {
  const q = token ? `?token=${encodeURIComponent(token)}` : '';
  return `/campaigns/sessions/${campaignId}${q}`;
}
