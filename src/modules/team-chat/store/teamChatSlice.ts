import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/store/store";
import type { TeamConversation, TeamMessage } from "@/modules/team-chat/types";
import {
  toChatShellConversation,
  toChatShellMessage,
  type ChatShellConversation,
  type ChatShellMessage,
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
    };

const resolveTeamChatMessage = (payload: TeamChatMessagePayload) => {
  if (typeof payload === "object" && payload !== null && "message" in payload) {
    return {
      message: payload.message,
      viewerUserId: payload.viewerUserId,
    };
  }

  return { message: payload, viewerUserId: undefined as string | undefined };
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
      const seen = new Set<string>();
      state.messages = action.payload.filter((message) => {
        const id = String(message._id);
        if (!id || seen.has(id)) return false;
        seen.add(id);
        return true;
      });
    },
    setTeamTotalUnread: (state, action: PayloadAction<number>) => {
      state.totalUnread = action.payload;
    },
    addTeamMessage: (state, action: PayloadAction<TeamChatMessagePayload>) => {
      const { message: raw, viewerUserId } = resolveTeamChatMessage(action.payload);
      const msg: ChatShellMessage = "senderId" in raw
        ? toChatShellMessage(raw as TeamMessage)
        : raw as ChatShellMessage;
      const msgId = String(msg._id);
      const convId = String(msg.conversationId || "");
      const isActiveConversation = String(state.currentConversation?._id || "") === convId;
      const isIncoming = viewerUserId
        ? String(msg.sender._id) !== String(viewerUserId)
        : false;

      if (isActiveConversation && msgId && !state.messages.some((m) => String(m._id) === msgId)) {
        state.messages.push(msg);
      }

      const conv = state.conversations.find((c) => String(c._id) === convId);
      if (conv) {
        conv.lastMessage = { text: msg.text, timestamp: msg.createdAt };
        conv.updatedAt = msg.createdAt;
        if (isIncoming && !isActiveConversation) {
          conv.unreadCount = (conv.unreadCount || 0) + 1;
        }
      }

      if (isIncoming && !isActiveConversation) {
        state.totalUnread += 1;
      }

      state.conversations.sort((a, b) => {
        const aTime = new Date(a.lastMessage?.timestamp || a.updatedAt).getTime();
        const bTime = new Date(b.lastMessage?.timestamp || b.updatedAt).getTime();
        return bTime - aTime;
      });
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
