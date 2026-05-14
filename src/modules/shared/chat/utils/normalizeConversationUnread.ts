/**
 * Chat `unreadCount` may be a number (API-normalized) or a plain object from a Mongoose Map
 * (`{ [participantId]: count }`). React must never receive the raw object as a child.
 */
export function normalizeConversationUnreadCount(
  raw: unknown,
  viewerUserId?: string | null,
): number {
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (raw && typeof raw === "object" && !Array.isArray(raw) && viewerUserId != null && viewerUserId !== "") {
    const sid = String(viewerUserId);
    const map = raw as Record<string, unknown>;
    const v = map[sid];
    if (typeof v === "number" && Number.isFinite(v)) return v;
  }
  return 0;
}
