import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/store/store";
import type { TeamConversation, TeamMessage } from "@/modules/team-chat/types";
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
} from "@/modules/team-chat/utils/mappers";

interface TeamChatState {
  conversations: ChatShellConversation[];
  currentConversation: ChatShellConversation | null;
  messages: ChatShellMessage[];
  totalUnread: number;
}

type TeamChatMessagePayload =
  | ChatShellMessage
  | TeamMessage
  | {
      message: ChatShellMessage | TeamMessage;
      viewerUserId: string;
      viewerIsViewingConversation?: boolean;
    };

const initialState: TeamChatState = {
  conversations: [],
  currentConversation: null,
  messages: [],
  totalUnread: 0,
};

/** Immer-safe: sync sidebar / header preview from a message row. */
const applyLastMessagePreviewFromMessage = (conv: ChatShellConversation, next: ChatShellMessage) => {
  if (next.deliveryBlocked) return;
  const del = !!next.isDeletedForEveryone;
  conv.lastMessage = {
    text: del ? "" : next.text,
    timestamp: next.createdAt,
    isDeletedForEveryone: del,
  };
};

const teamChatSlice = createSlice({
  name: "teamChat",
  initialState,
  reducers: {
    setTeamConversations: (state, action: PayloadAction<ChatShellConversation[]>) => {
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

      // Same set — merge field-by-field so Immer only dirtys what actually changed
      for (const conv of incoming) {
        const cur = existingById.get(conv._id)!;
        if (cur.unreadCount !== conv.unreadCount) cur.unreadCount = conv.unreadCount;
        if (cur.updatedAt !== conv.updatedAt) cur.updatedAt = conv.updatedAt;

        const lm = conv.lastMessage;
        const curLm = cur.lastMessage;
        if (!lm) {
          // Keep existing lastMessage
        } else if (
          !curLm
          || curLm.text !== lm.text
          || curLm.timestamp !== lm.timestamp
          || curLm.isDeletedForEveryone !== lm.isDeletedForEveryone
        ) {
          cur.lastMessage = lm;
        }
      }
    },
    setTeamCurrentConversation: (state, action: PayloadAction<ChatShellConversation | null>) => {
      state.currentConversation = action.payload;
    },
    setTeamMessages: (state, action: PayloadAction<ChatShellMessage[]>) => {
      state.messages = dedupeMessages(action.payload).sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    },
    setTeamTotalUnread: (state, action: PayloadAction<number>) => {
      state.totalUnread = action.payload;
    },
    addTeamMessage: (state, action: PayloadAction<TeamChatMessagePayload>) => {
      const { message: raw, viewerUserId, viewerIsViewingConversation } = resolveMessagePayload(action.payload);
      const msg: ChatShellMessage = "senderId" in raw
        ? toChatShellMessage(raw as TeamMessage)
        : raw as ChatShellMessage;
      applyIncomingMessage(state, msg, viewerUserId, viewerIsViewingConversation);
    },
    clearTeamCurrentConversation: (state) => {
      state.currentConversation = null;
      state.messages = [];
    },
    upsertTeamConversation: (state, action: PayloadAction<TeamConversation | ChatShellConversation>) => {
      const next = Array.isArray(action.payload.participants)
        && typeof action.payload.participants[0] === "string"
        ? toChatShellConversation(action.payload as TeamConversation)
        : action.payload as ChatShellConversation;
      const idx = state.conversations.findIndex((c) => c._id === next._id);
      if (idx >= 0) state.conversations[idx] = next;
      else state.conversations.unshift(next);
    },
    markTeamConversationReadLocal: (state, action: PayloadAction<string>) => {
      const conv = state.conversations.find((c) => c._id === action.payload);
      if (conv) conv.unreadCount = 0;
      if (state.currentConversation?._id === action.payload) {
        state.currentConversation.unreadCount = 0;
      }
    },
    removeTeamMessage: (state, action: PayloadAction<string>) => {
      const id = String(action.payload);
      state.messages = state.messages.filter((m) => String(m._id) !== id);
    },
    upsertTeamMessage: (state, action: PayloadAction<ChatShellMessage>) => {
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
    confirmTeamPendingMessage: (
      state,
      action: PayloadAction<{ tempId: string; message: ChatShellMessage }>,
    ) => {
      const { tempId, message } = action.payload;
      const idx = state.messages.findIndex((m) => String(m._id) === tempId);
      if (idx >= 0) {
        state.messages[idx] = message;
      } else {
        const exists = state.messages.some((m) => String(m._id) === String(message._id));
        if (!exists) {
          state.messages.push(message);
          state.messages.sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          );
        }
      }
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
    removeTeamConversation: (state, action: PayloadAction<string>) => {
      const id = String(action.payload);
      state.conversations = state.conversations.filter((c) => String(c._id) !== id);
      if (state.currentConversation && String(state.currentConversation._id) === id) {
        state.currentConversation = null;
        state.messages = [];
      }
    },
  },
});

export const {
  setTeamConversations,
  setTeamCurrentConversation,
  setTeamMessages,
  setTeamTotalUnread,
  addTeamMessage,
  clearTeamCurrentConversation,
  upsertTeamConversation,
  markTeamConversationReadLocal,
  removeTeamMessage,
  upsertTeamMessage,
  confirmTeamPendingMessage,
  removeTeamConversation,
} = teamChatSlice.actions;

export const selectTeamConversations = (state: RootState) => state.teamChat.conversations;
export const selectTeamCurrentConversation = (state: RootState) => state.teamChat.currentConversation;
export const selectTeamMessages = (state: RootState) => state.teamChat.messages;
export const selectTeamTotalUnread = (state: RootState) => state.teamChat.totalUnread;

export default teamChatSlice.reducer;
