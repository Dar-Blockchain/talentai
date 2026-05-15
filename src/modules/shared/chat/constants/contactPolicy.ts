/** Matches backend preview for last message when delivery is blocked. */
export const CHAT_LAST_MESSAGE_BLOCKED_PREVIEW = "[Not delivered]";

/**
 * Matches backend `LAST_MESSAGE_DELETED_SENTINEL` (candidate ↔ company chat).
 * Sidebar previews this sentinel as the deleted-for-everyone placeholder.
 */
export const CHAT_LAST_MESSAGE_DELETED_SENTINEL = "__DELETED__";

/**
 * Matches backend `MESSAGE_BODY_TOMBSTONE` (candidate ↔ company chat).
 * Stored body after delete-for-everyone (Mongoose `text` is required, so we
 * keep a non-empty placeholder and clear it in the mapper).
 */
export const CHAT_MESSAGE_BODY_TOMBSTONE = "__CHAT_MESSAGE_DELETED__";
