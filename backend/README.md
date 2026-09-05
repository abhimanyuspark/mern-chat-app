# Backend Implementation & Changes Summary

This document summarizes all database schema updates, controller logic, socket event triggers, and API routes implemented in the **Backend** of the Chat Application.

---

## 1. Mongoose Models (`src/models/`)

### 1.1 User Model (`src/models/user.model.js`)
- Added `blockedUsers`: Array of `ObjectId` references (`ref: "User"`) to track users blocked by the account holder.

### 1.2 Conversation Model (`src/models/conversation.model.js`)
- Added `deletedBy`: Array of `ObjectId` references (`ref: "User"`) to track per-user conversation deletion.

---

## 2. Controllers (`src/controllers/`)

### 2.1 User Controller (`src/controllers/user.controller.js`)
- **`updateProfile`**:
  - Updates current user's `name`, `bio`, and `avatar`.
  - Enforces name length validation (3 to 50 characters).
  - Returns updated user object excluding password and refreshToken.
- **`toggleBlockUser`**:
  - Toggles target `userId` in `req.user.blockedUsers`.
  - Prevents blocking self.
  - Returns updated block state.

### 2.2 Conversation Controller (`src/controllers/conversation.controller.js`)
- **`createConversation`**:
  - Automatically populates `participants` with `"name avatar email status lastSeen bio"`.
  - Emits `new-conversation` Socket.io event to the recipient if online.
- **`getConversations`**:
  - Queries `Conversation.find({ participants: req.user._id, deletedBy: { $ne: req.user._id } })`.
  - Populates `participants` with `"name avatar email status lastSeen bio"`.
  - Returns active and cleared conversations (including chats with `lastMessage: null`).
- **`getConversationById`**:
  - Populates `participants` with `"name avatar email status lastSeen bio"`.
- **`createGroup`**:
  - Enforces minimum **2 selected members** (`participants.length < 2`).
  - Populates full conversation and emits `new-conversation` socket event.
- **`deleteConversation`**:
  - Marks all messages in conversation as `deletedFor` the user.
  - Adds `userId` to `conversation.deletedBy`.
  - Emits `conversation-removed` socket event to the user.

### 2.3 Message Controller (`src/controllers/message.controller.js`)
- **`sendMessage`**:
  - Enforces block checks in 1-on-1 chats: rejects message delivery if sender blocked recipient or recipient blocked sender.
  - Clears `conversation.deletedBy = []` so conversations automatically reappears when a new message is sent or received.
- **`clearChat`**:
  - Marks all messages in a conversation as `deletedFor` current user.
  - Resets `conversation.lastMessage` for user if no visible messages remain.
  - Emits `conversation-updated` socket event with `lastMessage: null` (keeping conversation in list).

---

## 3. API Routes (`src/routes/`)

### 3.1 User Routes (`src/routes/user.route.js`)
- `PATCH /api/users/profile` $\rightarrow$ `updateProfile`
- `POST /api/users/toggle-block/:userId` $\rightarrow$ `toggleBlockUser`
- `GET /api/users/search` $\rightarrow$ `searchUsers`
- `GET /api/users/:id` $\rightarrow$ `getUserById`

### 3.2 Conversation Routes (`src/routes/conversation.route.js`)
- `POST /api/conversations/` $\rightarrow$ `createConversation`
- `GET /api/conversations/` $\rightarrow$ `getConversations`
- `GET /api/conversations/:id` $\rightarrow$ `getConversationById`
- `DELETE /api/conversations/:id` $\rightarrow$ `deleteConversation`
- `POST /api/conversations/group` $\rightarrow$ `createGroup`
- `PATCH /api/conversations/group/:conversationId` $\rightarrow$ `updateGroupInfo`
- `POST /api/conversations/group/:conversationId/add` $\rightarrow$ `addGroupMember`
- `POST /api/conversations/group/:conversationId/remove` $\rightarrow$ `removeGroupMember`
- `POST /api/conversations/group/:conversationId/leave` $\rightarrow$ `leaveGroup`

### 3.3 Message Routes (`src/routes/message.route.js`)
- `POST /api/messages/` $\rightarrow$ `sendMessage`
- `GET /api/messages/:conversationId` $\rightarrow$ `getMessages`
- `DELETE /api/messages/clear/:conversationId` $\rightarrow$ `clearChat`
- `DELETE /api/messages/:id` $\rightarrow$ `deleteMessage`

---

## 4. Real-time Socket.io Events (`src/sockets/`)
- `new-conversation`: Dispatched when a new chat or group is created.
- `conversation-updated`: Dispatched on new messages, cleared chats (`lastMessage: null`), or group info updates.
- `conversation-removed`: Dispatched on conversation deletion or leaving group.
- `message-deleted`: Dispatched on single or multi-message deletion.
