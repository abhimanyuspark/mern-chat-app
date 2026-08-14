import { createSlice } from "@reduxjs/toolkit";
import {
  fetchConversations,
  fetchUsers,
  startConversation,
  fetchMessages,
  sendMessage,
  fetchConversationById,
  deleteMessages,
  createGroup,
  updateGroupInfo,
  addGroupMember,
  removeGroupMember,
  leaveGroup,
} from "./chatThunk";

const initialState = {
  conversations: [],
  users: [],
  messages: {},
  activeConversationId: null,
  activeConversation: null,
  replyingTo: null,
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
    setReplyingTo: (state, action) => {
      state.replyingTo = action.payload;
    },
    markMessageDeleted: (state, action) => {
      const { messageId, conversationId, isDeletedForEveryone, text } =
        action.payload;

      if (isDeletedForEveryone) {
        if (state.messages[conversationId]) {
          const message = state.messages[conversationId].find(
            (m) => m._id === messageId,
          );
          if (message) {
            message.isDeleted = true;
            message.text = text || "This message was deleted";
          }
        }

        // Update lastMessage in conversation list if it was this message
        const conversation = state.conversations.find(
          (c) => c._id === conversationId,
        );
        if (conversation?.lastMessage?._id === messageId) {
          // Find the next best last message from the loaded messages
          const msgs = state.messages[conversationId] || [];
          const lastNonDeleted = [...msgs]
            .reverse()
            .find((m) => m._id !== messageId && !m.isDeleted);

          conversation.lastMessage = lastNonDeleted || null;
        }
      } else {
        if (state.messages[conversationId]) {
          state.messages[conversationId] = state.messages[
            conversationId
          ].filter((m) => m._id !== messageId);
        }
      }
    },
    removeMessages: (state, action) => {
      const { conversationId, deletedIds = [] } = action.payload;

      if (!conversationId) return;

      const conversationMessages = state.messages[conversationId] || [];
      state.messages[conversationId] = conversationMessages.filter(
        (message) => !deletedIds.includes(message._id),
      );

      const conversation = state.conversations.find(
        (item) => item._id === conversationId,
      );

      if (conversation) {
        const remainingMessages = state.messages[conversationId] || [];
        conversation.lastMessage =
          remainingMessages.length > 0
            ? remainingMessages[remainingMessages.length - 1]
            : null;
      }
    },
    upsertConversation: (state, action) => {
      const conversation = action.payload;
      const index = state.conversations.findIndex(
        (c) => c._id === conversation._id,
      );
      if (index !== -1) {
        state.conversations[index] = {
          ...state.conversations[index],
          ...conversation,
        };
      } else {
        state.conversations.unshift(conversation);
      }

      if (state.activeConversationId === conversation._id) {
        state.activeConversation = {
          ...state.activeConversation,
          ...conversation,
        };
      }
    },
    removeConversation: (state, action) => {
      const conversationId = action.payload;
      state.conversations = state.conversations.filter(
        (c) => c._id !== conversationId,
      );
      if (state.activeConversationId === conversationId) {
        state.activeConversationId = null;
        state.activeConversation = null;
      }
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
      })

      .addCase(deleteMessages.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteMessages.fulfilled, (state, action) => {
        const { mode, deletedIds, conversationId } = action.payload;
        if (mode === "everyone") {
          deletedIds.forEach((id) => {
            chatSlice.caseReducers.markMessageDeleted(state, {
              payload: {
                messageId: id,
                conversationId,
                isDeletedForEveryone: true,
              },
            });
          });
        } else {
          chatSlice.caseReducers.removeMessages(state, action);
        }
      })
      .addCase(deleteMessages.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(createGroup.pending, (state) => {
        state.error = null;
      })
      .addCase(createGroup.fulfilled, (state, action) => {
        const conversation = action.payload;
        const exists = state.conversations.find((c) => c._id === conversation._id);
        if (!exists) {
          state.conversations.unshift(conversation);
        }
        state.activeConversationId = conversation._id;
        state.activeConversation = conversation;
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(updateGroupInfo.fulfilled, (state, action) => {
        const index = state.conversations.findIndex(
          (c) => c._id === action.payload._id,
        );
        if (index !== -1) {
          state.conversations[index] = action.payload;
        }
        if (state.activeConversationId === action.payload._id) {
          state.activeConversation = action.payload;
        }
      })

      .addCase(addGroupMember.fulfilled, (state, action) => {
        const index = state.conversations.findIndex(
          (c) => c._id === action.payload._id,
        );
        if (index !== -1) {
          state.conversations[index] = action.payload;
        }
        if (state.activeConversationId === action.payload._id) {
          state.activeConversation = action.payload;
        }
      })

      .addCase(removeGroupMember.fulfilled, (state, action) => {
        const index = state.conversations.findIndex(
          (c) => c._id === action.payload._id,
        );
        if (index !== -1) {
          state.conversations[index] = action.payload;
        }
        if (state.activeConversationId === action.payload._id) {
          state.activeConversation = action.payload;
        }
      })

      .addCase(leaveGroup.fulfilled, (state, action) => {
        state.conversations = state.conversations.filter(
          (c) => c._id !== action.payload,
        );
        if (state.activeConversationId === action.payload) {
          state.activeConversationId = null;
          state.activeConversation = null;
        }
      });
  },
});

export const {
  clearChatError,
  selectConversationId,
  addMessage,
  updateConversation,
  removeMessages,
  markMessageDeleted,
  setReplyingTo,
  upsertConversation,
  removeConversation,
} = chatSlice.actions;
export default chatSlice.reducer;
