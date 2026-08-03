import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/store/store";
import type { CandidateConversation, CandidateMessage } from "@/modules/chat/candidate-chat/types";
// Imported from their concrete files (not the `@/modules/chat/shared` barrel):
// that barrel also re-exports heavy chat UI shells + the socket.io client
// factory, and this slice is combined into the root reducer that `_app.tsx`
// loads eagerly — a barrel import here would drag all of that into the
// shared `_app` chunk on every route.
import {
  applyIncomingMessage,
  dedupeMessages,
  sortConversationsByRecent,
} from "@/modules/chat/shared/store/chatShellState";
import { resolveMessagePayload } from "@/modules/chat/shared/utils/resolveMessagePayload";
import type { ChatShellConversation, ChatShellMessage } from "@/modules/chat/shared/types/shell";
import {
  toChatShellConversation,
  toChatShellMessage,
} from "@/modules/chat/candidate-chat/utils/mappers";

interface CandidateChatState {
  conversations: ChatShellConversation[];
  currentConversation: ChatShellConversation | null;
  messages: ChatShellMessage[];
  totalUnread: number;
}

type CandidateChatMessagePayload =
  | ChatShellMessage
  | CandidateMessage
  | {
      message: ChatShellMessage | CandidateMessage;
      viewerUserId: string;
      viewerIsViewingConversation?: boolean;
    };

const initialState: CandidateChatState = {
  conversations: [],
  currentConversation: null,
  messages: [],
  totalUnread: 0,
};

/** Immer-safe: sync sidebar / header preview from a message row. */
const applyLastMessagePreviewFromMessage = (
  conv: ChatShellConversation,
  next: ChatShellMessage,
) => {
  if (next.deliveryBlocked) return;
  const del = !!next.isDeletedForEveryone;
  conv.lastMessage = {
    text: del ? "" : next.text,
    timestamp: next.createdAt,
    isDeletedForEveryone: del,
    ...(next.sender?._id ? { senderId: String(next.sender._id) } : {}),
  };
};

const candidateChatSlice = createSlice({
  name: "candidateChat",
  initialState,
  reducers: {
    setCandidateConversations: (state, action: PayloadAction<ChatShellConversation[]>) => {
      const incoming = action.payload;
      const existingById = new Map(state.conversations.map((c) => [c._id, c]));
      const hasStructuralChange =
        incoming.length !== state.conversations.length
        || incoming.some((c) => !existingById.has(c._id));

      if (hasStructuralChange) {
        // Set of conversations changed — full replacement, preserve cached lastMessages
        state.conversations = incoming.map((conv) => {
          if (!conv.lastMessage) {
            const cur = existingById.get(conv._id);
            if (cur?.lastMessage) return { ...conv, lastMessage: cur.lastMessage };
          }
          return conv;
        });
        return;
      }

      // Same set of conversations — merge field-by-field to preserve object identity
      // Immer only creates a new array reference if something actually changes here
      for (const conv of incoming) {
        const cur = existingById.get(conv._id)!;
        if (cur.unreadCount !== conv.unreadCount) cur.unreadCount = conv.unreadCount;
        if (cur.updatedAt !== conv.updatedAt) cur.updatedAt = conv.updatedAt;

        const lm = conv.lastMessage;
        const curLm = cur.lastMessage;
        if (!lm) {
          // Incoming has no lastMessage — keep existing (WebSocket may have set a newer one)
        } else if (
          !curLm
          || curLm.text !== lm.text
          || curLm.timestamp !== lm.timestamp
          || curLm.isDeletedForEveryone !== lm.isDeletedForEveryone
          || curLm.senderId !== lm.senderId
        ) {
          cur.lastMessage = lm;
        }
      }
    },
    setCandidateCurrentConversation: (state, action: PayloadAction<ChatShellConversation | null>) => {
      state.currentConversation = action.payload;
    },
    setCandidateMessages: (state, action: PayloadAction<ChatShellMessage[]>) => {
      state.messages = dedupeMessages(action.payload).sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    },
    setCandidateTotalUnread: (state, action: PayloadAction<number>) => {
      state.totalUnread = action.payload;
    },
    addCandidateMessage: (state, action: PayloadAction<CandidateChatMessagePayload>) => {
      const { message: raw, viewerUserId, viewerIsViewingConversation } = resolveMessagePayload(action.payload);
      const msg: ChatShellMessage = "sender" in raw && typeof raw.sender === "object" && raw.sender !== null && "_id" in raw.sender
        ? toChatShellMessage(raw as CandidateMessage)
        : raw as ChatShellMessage;
      applyIncomingMessage(state, msg, viewerUserId, viewerIsViewingConversation);
    },
    clearCandidateCurrentConversation: (state) => {
      state.currentConversation = null;
      state.messages = [];
    },
    upsertCandidateConversation: (state, action: PayloadAction<CandidateConversation | ChatShellConversation>) => {
      const next = toChatShellConversation(action.payload as CandidateConversation, undefined);
      const idx = state.conversations.findIndex((c) => c._id === next._id);
      if (idx >= 0) state.conversations[idx] = next;
      else state.conversations.unshift(next);
    },
    markCandidateConversationReadLocal: (state, action: PayloadAction<string>) => {
      const conv = state.conversations.find((c) => c._id === action.payload);
      if (conv) conv.unreadCount = 0;
      if (state.currentConversation?._id === action.payload) {
        state.currentConversation.unreadCount = 0;
      }
    },
    removeCandidateMessage: (state, action: PayloadAction<string>) => {
      state.messages = state.messages.filter((message) => String(message._id) !== action.payload);
    },
    upsertCandidateMessage: (state, action: PayloadAction<ChatShellMessage>) => {
      const next = action.payload;
      const id = String(next._id);
      const idx = state.messages.findIndex((m) => String(m._id) === id);
      if (idx >= 0) {
        state.messages[idx] = next;
      } else {
        state.messages.push(next);
        state.messages.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
      }

      // Refresh sidebar & header previews if this row is the newest visible one.
      let convId = next.conversationId ? String(next.conversationId) : "";
      if (!convId && state.currentConversation?._id) {
        const cur = String(state.currentConversation._id);
        if (state.messages.some((m) => String(m._id) === id)) {
          convId = cur;
        }
      }
      if (convId) {
        const conv = state.conversations.find((c) => String(c._id) === convId);
        if (conv) {
          applyLastMessagePreviewFromMessage(conv, next);
          sortConversationsByRecent(state.conversations);
        }
        if (state.currentConversation && String(state.currentConversation._id) === convId) {
          applyLastMessagePreviewFromMessage(state.currentConversation, next);
        }
      }
    },
    syncConversationLastMessage: (state, action: PayloadAction<string>) => {
      const convId = action.payload;

      // Messages are sorted ascending by createdAt. Walk backwards for the last
      // non-pending, non-blocked message (matches applyLastMessagePreviewFromMessage rules).
      let lastVisible: ChatShellMessage | undefined;
      for (let i = state.messages.length - 1; i >= 0; i--) {
        const m = state.messages[i];
        if (!m.pending && !m.deliveryBlocked) {
          lastVisible = m;
          break;
        }
      }

      const conv = state.conversations.find((c) => String(c._id) === convId);
      if (conv) {
        if (lastVisible) {
          applyLastMessagePreviewFromMessage(conv, lastVisible);
        } else {
          conv.lastMessage = undefined;
        }
        sortConversationsByRecent(state.conversations);
      }

      if (state.currentConversation && String(state.currentConversation._id) === convId) {
        if (lastVisible) {
          applyLastMessagePreviewFromMessage(state.currentConversation, lastVisible);
        } else {
          state.currentConversation.lastMessage = undefined;
        }
      }
    },
    confirmCandidatePendingMessage: (
      state,
      action: PayloadAction<{ tempId: string; message: ChatShellMessage }>,
    ) => {
      const { tempId, message } = action.payload;
      const idx = state.messages.findIndex((m) => String(m._id) === tempId);
      if (idx >= 0) {
        // In-place replacement — same array slot, same stableKey → React reuses the
        // MessageRow component instance: pending→confirmed is a CSS transition, not a remount.
        state.messages[idx] = message;
      } else {
        // Temp was already gone (socket echo handled it) — ensure real message is present.
        const exists = state.messages.some((m) => String(m._id) === String(message._id));
        if (!exists) {
          state.messages.push(message);
          state.messages.sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          );
        }
      }
      // Sync sidebar preview with the now-confirmed message.
      const convId = message.conversationId
        ? String(message.conversationId)
        : (state.currentConversation ? String(state.currentConversation._id) : "");
      if (!convId) return;
      const conv = state.conversations.find((c) => String(c._id) === convId);
      if (conv) {
        applyLastMessagePreviewFromMessage(conv, message);
        sortConversationsByRecent(state.conversations);
      }
      if (state.currentConversation && String(state.currentConversation._id) === convId) {
        applyLastMessagePreviewFromMessage(state.currentConversation, message);
      }
    },
    removeCandidateConversation: (state, action: PayloadAction<string>) => {
      state.conversations = state.conversations.filter((conversation) => conversation._id !== action.payload);
      if (state.currentConversation?._id === action.payload) {
        state.currentConversation = null;
        state.messages = [];
      }
    },
  },
});

export const {
  setCandidateConversations,
  setCandidateCurrentConversation,
  setCandidateMessages,
  setCandidateTotalUnread,
  addCandidateMessage,
  clearCandidateCurrentConversation,
  upsertCandidateConversation,
  markCandidateConversationReadLocal,
  removeCandidateMessage,
  upsertCandidateMessage,
  confirmCandidatePendingMessage,
  removeCandidateConversation,
  syncConversationLastMessage,
} = candidateChatSlice.actions;

export const selectCandidateConversations = (state: RootState) => state.candidateChat.conversations;
export const selectCandidateCurrentConversation = (state: RootState) => state.candidateChat.currentConversation;
export const selectCandidateMessages = (state: RootState) => state.candidateChat.messages;
export const selectCandidateTotalUnread = (state: RootState) => state.candidateChat.totalUnread;

export default candidateChatSlice.reducer;
