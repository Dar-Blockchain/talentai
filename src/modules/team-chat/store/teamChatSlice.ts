import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/store/store";
import type { TeamConversation, TeamMessage } from "@/modules/team-chat/types";
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

const teamChatSlice = createSlice({
  name: "teamChat",
  initialState,
  reducers: {
    setTeamConversations: (state, action: PayloadAction<ChatShellConversation[]>) => {
      state.conversations = action.payload;
    },
    setTeamCurrentConversation: (state, action: PayloadAction<ChatShellConversation | null>) => {
      state.currentConversation = action.payload;
    },
    setTeamMessages: (state, action: PayloadAction<ChatShellMessage[]>) => {
      state.messages = dedupeMessages(action.payload);
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
} = teamChatSlice.actions;

export const selectTeamConversations = (state: RootState) => state.teamChat.conversations;
export const selectTeamCurrentConversation = (state: RootState) => state.teamChat.currentConversation;
export const selectTeamMessages = (state: RootState) => state.teamChat.messages;
export const selectTeamTotalUnread = (state: RootState) => state.teamChat.totalUnread;

export default teamChatSlice.reducer;
