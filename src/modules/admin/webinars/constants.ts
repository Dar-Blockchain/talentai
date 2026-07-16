export interface WebinarStatusMeta {
  label: string;
  color: string;
  bg: string;
  dot: string;
}

/** Status chip styling shared by the card list and the detail page header. */
export const WEBINAR_STATUS_META: Record<string, WebinarStatusMeta> = {
  active: { label: "Published", color: "#059669", bg: "#ECFDF5", dot: "#10B981" },
  draft: { label: "Draft", color: "#D97706", bg: "#FFFBEB", dot: "#F59E0B" },
};

export const getWebinarStatusMeta = (status: string): WebinarStatusMeta =>
  WEBINAR_STATUS_META[status] ?? WEBINAR_STATUS_META.draft;
