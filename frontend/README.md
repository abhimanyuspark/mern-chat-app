# Frontend Implementation & Changes Summary

This document summarizes all changes, new features, UI enhancements, and refactoring implemented in the **Frontend** of the Chat Application.

---

## 1. Pages & Views

### 1.1 Create Group Page (`src/pages/chat/CreateGroup.jsx`)
- **Converted from Modal to Page**: Group creation is now a dedicated full-page view accessible via the `/create-group` route.
- **Form Mechanics & Enter Key**: Wrapped in a standard `<form onSubmit={handleSubmit}>` tag allowing form submission on Enter press. Non-submit buttons explicitly use `type="button"`.
- **Validation**: Uses central `validator.js` requiring a valid group name (3-50 characters) and at least **2 selected members**. Displays real-time indicator badge (`0/2`, `1/2`, `2/2 selected`).
- **Full Screen Mobile View**: Uses `fixed inset-0 z-50 md:static md:z-auto` to occupy 100% full screen on mobile devices with a sticky top bar and back button.

### 1.2 Settings & Profile Page (`src/pages/settings/Settings.jsx`)
- **Full Screen Mobile Layout**: Responsive `fixed inset-0 z-50 md:static md:z-auto` layout for mobile view.
- **Profile Editing**: Form section to update Display Name and About/Bio directly via `updateProfile` thunk.
- **Avatar Management**: Top-centered avatar preview with camera button option to update avatar image URL.
- **Appearance Control**: Dark mode / Light mode toggle switch.

### 1.3 User Contact Info Page (`src/pages/chat/UserInfo.jsx`)
- **Dedicated Route**: Located at `/chat/:conversationId/user-info`.
- **Profile Card**: Displays large Avatar, Display Name, Email address, and Active/Offline status badge.
- **About & Bio Card**: Dedicated quote card displaying the user's status/bio statement.
- **Account Details**: Shows Display Name, Email, Activity Status, and Block Status.
- **Actions**: Quick buttons for "Send Message" and "Block User / Unblock User".

### 1.4 Group Info Page (`src/pages/chat/GroupInfo.jsx`)
- **Responsive Layout**: Updated to take 100% full screen on mobile (`fixed inset-0 z-50 md:static md:z-auto`).
- **Group Management**: Editable group name, member list with admin badges, add member search panel, remove member, and leave group.

---

## 2. Components & UI Enhancements

### 2.1 Navigation & Header (`src/components/others/Header.jsx`)
- **User Avatar Dropdown**: Added **"Create Group"** (`<FiUsers />`) link to the top header avatar menu.
- **Dropdown Behavior**: Automatically closes the dropdown menu (`document.activeElement.blur()`) upon clicking any menu item.

### 2.2 Chat Header (`src/components/chat/ChatHeader.jsx`)
- **Options Menu (`⋮`)**:
  - **View Contact** (`<FiUser />`): Navigates to `/chat/:conversationId/user-info`.
  - **Block User / Unblock User** (`<FiSlash />`): Toggles user block status with confirmation modal.
  - **Clear Chat** (`<FiTrash />`): Clears all messages inside the chat while keeping the conversation item in the chat list.
  - **Delete Chat** (`<FiTrash2 />`): Clears messages AND deletes the conversation from your chat list.

### 2.3 Message Composer (`src/components/chat/MessageComposer.jsx`)
- **Block Status Enforcement**: Displays a banner *"You have blocked this user. Unblock"* and disables message input when chatting with a blocked user.

### 2.4 Universal Avatar Component (`src/components/common/Avatar.jsx`)
- **Dual Prop Support**: Supports both `src` and `image` props (`const avatarSrc = src || image`), rendering profile images across all pages.
- **Image Fallback**: Includes `onError` handling that automatically falls back to user initials if an avatar URL is broken or fails to load.

### 2.5 Contacts Panel (`src/components/chat/Contacts.jsx`)
- **Sidebar Header**: Removed inline create group modal trigger in favor of header dropdown and dedicated page navigation.

---

## 3. Form Validation (`src/utils/validator.js`)
- **Central Validator**: Consolidates validation rules for Login, Register, and Create Group forms.
- **Rules**:
  - `name`: 4 to 16 characters (for user registration).
  - `groupName`: 3 to 50 characters (for group creation).
  - `email`: Standard regex format check.
  - `password`: 4 to 16 characters.
  - `selectedUsers` / `members`: Minimum 2 selected members required for groups.

---

## 4. Redux Store & Thunks

### 4.1 Auth Slice & Thunks (`src/redux/features/auth/`)
- `updateProfile`: Sends `PATCH /api/users/profile` and updates `state.auth.user`.
- `toggleBlockUser`: Sends `POST /api/users/toggle-block/:userId` and updates `state.auth.user.blockedUsers`.

### 4.2 Chat Slice & Thunks (`src/redux/features/chat/`)
- `clearChatMessages`: Sends `DELETE /api/messages/clear/:conversationId`, sets `messages = []` and `lastMessage = null`, keeping conversation in `state.conversations`.
- `deleteConversationThunk`: Sends `DELETE /api/conversations/:id`, removes conversation from `state.conversations`.

---

## 5. Asset Pruning & Code Hygiene
- Removed unused template files (`GroupSettings.jsx`, `hero.png`, `react.svg`, `vite.svg`, `icons.svg`).
