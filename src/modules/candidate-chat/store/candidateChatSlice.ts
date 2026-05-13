import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/store/store";
import type { CandidateConversation, CandidateMessage } from "@/modules/candidate-chat/types";
import {
  applyIncomingMessage,
  dedupeMessages,
  resolveMessagePayload,
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

const candidateChatSlice = createSlice({
  name: "candidateChat",
  initialState,
  reducers: {
    setCandidateConversations: (state, action: PayloadAction<ChatShellConversation[]>) => {
      state.conversations = action.payload;
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
      const next = Array.isArray(action.payload.participants)
        && action.payload.participants.length > 0
        && typeof action.payload.participants[0] === "object"
        && "email" in action.payload.participants[0]
        ? toChatShellConversation(action.payload as CandidateConversation)
        : action.payload as ChatShellConversation;
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
  removeCandidateConversation,
} = candidateChatSlice.actions;

export const selectCandidateConversations = (state: RootState) => state.candidateChat.conversations;
export const selectCandidateCurrentConversation = (state: RootState) => state.candidateChat.currentConversation;
export const selectCandidateMessages = (state: RootState) => state.candidateChat.messages;
export const selectCandidateTotalUnread = (state: RootState) => state.candidateChat.totalUnread;

export default candidateChatSlice.reducer;
