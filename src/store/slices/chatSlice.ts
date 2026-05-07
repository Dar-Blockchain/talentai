import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { chatService } from "@/services/chatService";

// ─── Types ───────────────────────────────────────────────

interface Participant {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  profile?: {
    _id?: string;
    firstName?: string;
    lastName?: string;
    type?: "Candidate" | "Company";
    companyDetails?: {
      name?: string;
    };
  };
}

interface Message {
  _id: string;
  text: string;
  sender: {
    _id: string;
    email?: string;
    profile?: any;
  };
  receiver: {
    _id: string;
    email?: string;
    profile?: any;
  };
  isRead: boolean;
  createdAt: string;
  conversationId?: string;
  conversation?: string;
}

interface Conversation {
  _id: string;
  participants: Participant[];
  lastMessage?: {
    text: string;
    timestamp: string;
  };
  unreadCount: number;
  updatedAt: string;
}

interface ChatState {
  conversations: Conversation[];
  conversationsLoading: boolean;
  conversationsError: string | null;
  currentConversation: Conversation | null;
  currentConversationLoading: boolean;
  currentConversationError: string | null;
  messages: Message[];
  messagesLoading: boolean;
  messagesError: string | null;
  sendingMessage: boolean;
  sendMessageError: string | null;
}

// ─── Initial State ───────────────────────────────────────

const initialState: ChatState = {
  conversations: [],
  conversationsLoading: false,
  conversationsError: null,
  currentConversation: null,
  currentConversationLoading: false,
  currentConversationError: null,
  messages: [],
  messagesLoading: false,
  messagesError: null,
  sendingMessage: false,
  sendMessageError: null,
};

// ─── Thunks ──────────────────────────────────────────────

// Fetch all conversations
export const fetchConversations = createAsyncThunk(
  "chat/fetchConversations",
  async (params: { limit?: number } | undefined, { rejectWithValue }) => {
    try {
      return await chatService.fetchConversations(params) as Conversation[];
    } catch (error: any) {
      return rejectWithValue(error.message || "Error fetching conversations");
    }
  }
);

// Fetch single conversation details
export const fetchConversation = createAsyncThunk(
  "chat/fetchConversation",
  async (conversationId: string, { rejectWithValue }) => {
    try {
      return await chatService.fetchConversation(conversationId) as Conversation;
    } catch (error: any) {
      return rejectWithValue(error.message || "Error fetching conversation");
    }
  }
);

// Fetch messages for a conversation
export const fetchMessages = createAsyncThunk(
  "chat/fetchMessages",
  async (conversationId: string, { rejectWithValue }) => {
    try {
      return await chatService.fetchMessages(conversationId) as Message[];
    } catch (error: any) {
      return rejectWithValue(error.message || "Error fetching messages");
    }
  }
);

// Send a message
export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async (
    payload: { conversationId: string; receiverId: string; text: string },
    { rejectWithValue }
  ) => {
    try {
      return await chatService.sendMessage(payload);
    } catch (error: any) {
      return rejectWithValue(error.message || "Error sending message");
    }
  }
);

// Mark conversation as read
export const markConversationRead = createAsyncThunk(
  "chat/markConversationRead",
  async (conversationId: string, { rejectWithValue }) => {
    try {
      return await chatService.markConversationRead(conversationId);
    } catch (error: any) {
      return rejectWithValue(error.message || "Error marking conversation as read");
    }
  }
);

// Delete a message
export const deleteMessage = createAsyncThunk(
  "chat/deleteMessage",
  async (messageId: string, { rejectWithValue }) => {
    try {
      return await chatService.deleteMessage(messageId);
    } catch (error: any) {
      return rejectWithValue(error.message || "Error deleting message");
    }
  }
);

// Delete a conversation
export const deleteConversation = createAsyncThunk(
  "chat/deleteConversation",
  async (conversationId: string, { rejectWithValue }) => {
    try {
      return await chatService.deleteConversation(conversationId);
    } catch (error: any) {
      return rejectWithValue(error.message || "Error deleting conversation");
    }
  }
);

// Create or find a conversation between two users
export const createOrFindConversation = createAsyncThunk<
  any,
  { candidateId: string; companyId: string },
  { rejectValue: string }
>(
  "chat/createOrFindConversation",
  async ({ candidateId, companyId }, { rejectWithValue }) => {
    try {
      return await chatService.createOrFindConversation(candidateId, companyId);
    } catch (error: any) {
      return rejectWithValue(error.message || "Error creating conversation");
    }
  }
);

// ─── Slice ───────────────────────────────────────────────

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    // WebSocket: add incoming message (avoids duplicates)
    addMessage: (state, action: PayloadAction<Message>) => {
      const msg = action.payload;
      const msgId = String(msg._id);
      if (!state.messages.some((m) => String(m._id) === msgId)) {
        state.messages.push(msg);
      }
      // Update conversations list last message
      const convId = String(msg.conversationId || (msg as any).conversation || "");
      const conv = state.conversations.find((c) => String(c._id) === convId);
      if (conv) {
        conv.lastMessage = { text: msg.text, timestamp: msg.createdAt };
        conv.updatedAt = msg.createdAt;
      }
      // Sort conversations by most recent
      state.conversations.sort((a, b) => {
        const aTime = new Date(a.lastMessage?.timestamp || a.updatedAt).getTime();
        const bTime = new Date(b.lastMessage?.timestamp || b.updatedAt).getTime();
        return bTime - aTime;
      });
    },
    // WebSocket: mark a single message as read
    markMessageRead: (
      state,
      action: PayloadAction<{ messageId: string; conversationId: string }>
    ) => {
      const { messageId } = action.payload;
      const msg = state.messages.find((m) => m._id === messageId);
      if (msg) {
        msg.isRead = true;
      }
    },
    // WebSocket: remove a message
    removeMessage: (
      state,
      action: PayloadAction<{ messageId: string; conversationId: string }>
    ) => {
      state.messages = state.messages.filter(
        (m) => m._id !== action.payload.messageId
      );
    },
    // WebSocket: remove a conversation
    removeConversation: (state, action: PayloadAction<string>) => {
      state.conversations = state.conversations.filter(
        (c) => c._id !== action.payload
      );
      if (state.currentConversation?._id === action.payload) {
        state.currentConversation = null;
      }
    },
    // Clear current conversation when navigating away
    clearCurrentConversation: (state) => {
      state.currentConversation = null;
      state.messages = [];
      state.messagesError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ---- CONVERSATIONS LIST ----
      .addCase(fetchConversations.pending, (state) => {
        state.conversationsLoading = true;
        state.conversationsError = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.conversationsLoading = false;
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.conversationsLoading = false;
        state.conversationsError = action.payload as string;
      })
      // ---- SINGLE CONVERSATION ----
      .addCase(fetchConversation.pending, (state) => {
        state.currentConversationLoading = true;
        state.currentConversationError = null;
      })
      .addCase(fetchConversation.fulfilled, (state, action) => {
        state.currentConversationLoading = false;
        state.currentConversation = action.payload;
      })
      .addCase(fetchConversation.rejected, (state, action) => {
        state.currentConversationLoading = false;
        state.currentConversationError = action.payload as string;
      })
      // ---- MESSAGES ----
      .addCase(fetchMessages.pending, (state) => {
        state.messagesLoading = true;
        state.messagesError = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messagesLoading = false;
        state.messages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.messagesLoading = false;
        state.messagesError = action.payload as string;
      })
      // ---- SEND MESSAGE ----
      .addCase(sendMessage.pending, (state) => {
        state.sendingMessage = true;
        state.sendMessageError = null;
      })
      .addCase(sendMessage.fulfilled, (state) => {
        state.sendingMessage = false;
        // Message added via explicit dispatch(addMessage(result)) in useChatSession
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.sendingMessage = false;
        state.sendMessageError = action.payload as string;
      })
      // ---- MARK READ ----
      .addCase(markConversationRead.fulfilled, (state, action) => {
        const conv = state.conversations.find(
          (c) => c._id === action.payload
        );
        if (conv) {
          conv.unreadCount = 0;
        }
      })
      // ---- DELETE MESSAGE ----
      .addCase(deleteMessage.fulfilled, (state, action) => {
        // Message removed via WebSocket removeMessage action
      })
      // ---- DELETE CONVERSATION ----
      .addCase(deleteConversation.fulfilled, (state, action) => {
        // Conversation removed via WebSocket removeConversation action
      });
  },
});

// ─── Exports ─────────────────────────────────────────────

export const {
  addMessage,
  markMessageRead,
  removeMessage,
  removeConversation,
  clearCurrentConversation,
} = chatSlice.actions;

export default chatSlice.reducer;

// ─── Selectors ───────────────────────────────────────────

export const selectConversations = (state: { chat: ChatState }) =>
  state.chat.conversations;
export const selectConversationsLoading = (state: { chat: ChatState }) =>
  state.chat.conversationsLoading;
export const selectConversationsError = (state: { chat: ChatState }) =>
  state.chat.conversationsError;

export const selectCurrentConversation = (state: { chat: ChatState }) =>
  state.chat.currentConversation;
export const selectCurrentConversationLoading = (state: { chat: ChatState }) =>
  state.chat.currentConversationLoading;

export const selectMessages = (state: { chat: ChatState }) =>
  state.chat.messages;
export const selectMessagesLoading = (state: { chat: ChatState }) =>
  state.chat.messagesLoading;

export const selectSendingMessage = (state: { chat: ChatState }) =>
  state.chat.sendingMessage;
export const selectSendMessageError = (state: { chat: ChatState }) =>
  state.chat.sendMessageError;
