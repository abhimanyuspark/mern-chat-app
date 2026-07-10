import { createSlice } from "@reduxjs/toolkit";
import {
  fetchConversations,
  fetchUsers,
  startConversation,
  fetchMessages,
  sendMessage,
} from "./chatThunk";

const initialState = {
  conversations: [],
  users: [],
  messages: {},
  activeConversationId: null,
  loadingConversations: false,
  loadingUsers: false,
  loadingMessages: false,
  sendingMessage: false,
  error: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    selectConversation: (state, action) => {
      state.activeConversationId = action.payload;
    },
    clearChatError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.loadingConversations = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loadingConversations = false;
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loadingConversations = false;
        state.error = action.payload;
      })

      .addCase(fetchUsers.pending, (state) => {
        state.loadingUsers = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loadingUsers = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loadingUsers = false;
        state.error = action.payload;
      })

      .addCase(startConversation.fulfilled, (state, action) => {
        const conversation = action.payload;
        if (!conversation) return;

        const exists = state.conversations.some(
          (item) => item._id === conversation._id,
        );

        if (!exists) {
          state.conversations.unshift(conversation);
        }

        state.activeConversationId = conversation._id;
      })
      .addCase(startConversation.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(fetchMessages.pending, (state) => {
        state.loadingMessages = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loadingMessages = false;
        state.messages[action.payload.conversationId] = action.payload.messages;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loadingMessages = false;
        state.error = action.payload;
      })

      .addCase(sendMessage.pending, (state) => {
        state.sendingMessage = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.sendingMessage = false;
        const { conversationId, message } = action.payload;
        const existing = state.messages[conversationId] || [];
        state.messages[conversationId] = [...existing, message];
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.sendingMessage = false;
        state.error = action.payload;
      });
  },
});

export const { selectConversation, clearChatError } = chatSlice.actions;
export default chatSlice.reducer;
