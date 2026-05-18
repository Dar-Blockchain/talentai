import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/store/store";
import type { CandidateConversation, CandidateMessage } from "@/modules/candidate-chat/types";
import {
  applyIncomingMessage,
  dedupeMessages,
  resolveMessagePayload,
  sortConversationsByRecent,
  type ChatShellConversation,
  type ChatShellMessage,
} from "@/modules/shared/chat";
import {
  toChatShellConversation,
  toChatShellMessage,
} from "@/modules/candidate-chat/utils/mappers";

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
      state.messages = dedupeMessages(action.payload);
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
  removeCandidateConversation,
} = candidateChatSlice.actions;

export const selectCandidateConversations = (state: RootState) => state.candidateChat.conversations;
export const selectCandidateCurrentConversation = (state: RootState) => state.candidateChat.currentConversation;
export const selectCandidateMessages = (state: RootState) => state.candidateChat.messages;
export const selectCandidateTotalUnread = (state: RootState) => state.candidateChat.totalUnread;

export default candidateChatSlice.reducer;
