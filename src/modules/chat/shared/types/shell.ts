export interface ChatShellConversation {
  _id: string;
  participants: import("@/modules/chat/shared/components/helpers").Participant[];
  lastMessage?: {
    text: string;
    timestamp: string;
    /** Last message author (for alignment when thread body is empty but preview is deleted). */
    senderId?: string;
    /** True when last visible row is a "deleted for everyone" placeholder */
    isDeletedForEveryone?: boolean;
  };
  unreadCount: number;
  updatedAt: string;
}

export interface ChatShellMessage {
  _id: string;
  text: string;
  sender: { _id: string };
  receiver: { _id: string };
  isRead: boolean;
  createdAt: string;
  conversationId?: string;
  /** Message stored for sender but not delivered to peer (email/phone policy) */
  deliveryBlocked?: boolean;
  blockedReason?: "email" | "phone";
  /** Soft-delete for everyone — UI shows placeholder; text is cleared in API */
  isDeletedForEveryone?: boolean;
  deletedAt?: string | null;
  deletedForEveryoneBy?: string;
  /** Optimistic placeholder — true until the server confirms the send. */
  pending?: boolean;
  /**
   * Stable React key that persists across the temp→confirmed transition.
   * Set to tempId in onMutate, carried forward in onSuccess so MessageList
   * never unmounts/remounts the bubble — the pending→confirmed change is a
   * smooth CSS transition (opacity, time label) rather than a re-mount animation.
   */
  stableKey?: string;
}

export interface ChatShellMessagePayload<TMessage = ChatShellMessage> {
  message: TMessage;
  viewerUserId: string;
}
