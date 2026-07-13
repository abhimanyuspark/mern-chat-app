import { createSlice } from "@reduxjs/toolkit";
import {
  fetchConversations,
  fetchUsers,
  startConversation,
  fetchMessages,
  sendMessage,
  fetchConversationById,
} from "./chatThunk";

const initialState = {
  conversations: [],
  users: [],
  messages: {},
  activeConversationId: null,
  activeConversation: null,
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
    clearChatError: (state) => {
      state.error = null;
    },
    addMessage: (state, action) => {
      const { conversation } = action.payload;
      const existing = state.messages[conversation] || [];
      state.messages[conversation] = [...existing, action.payload];

      const conversationIndex = state.conversations.findIndex(
        (item) => item._id === conversation,
      );

      if (conversationIndex !== -1) {
        state.conversations[conversationIndex] = {
          ...state.conversations[conversationIndex],
          lastMessage: action.payload,
        };
      }
    },
    updateConversation: (state, action) => {
      const { conversationId, lastMessage } = action.payload;

      const index = state.conversations.findIndex(
        (conversation) => conversation._id === conversationId,
      );

      if (index === -1) return;

      state.conversations[index].lastMessage = lastMessage;

      // Move updated conversation to the top
      const updatedConversation = state.conversations.splice(index, 1)[0];
      state.conversations.unshift(updatedConversation);
    },
    selectConversationId: (state, action) => {
      state.activeConversationId = action.payload;
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

      .addCase(fetchConversationById.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchConversationById.fulfilled, (state, action) => {
        state.activeConversation = action.payload;
      })
      .addCase(fetchConversationById.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(sendMessage.pending, (state) => {
        state.sendingMessage = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.sendingMessage = false;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.sendingMessage = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearChatError,
  selectConversationId,
  addMessage,
  updateConversation,
} = chatSlice.actions;
export default chatSlice.reducer;
