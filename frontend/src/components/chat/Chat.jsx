import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Empty from "./desktop/Empty";
import { deleteMessages, fetchMessages } from "../../redux/features/chat/chatThunk";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageComposer from "./MessageComposer";
import useDeviceType from "../../hooks/useDeviceType";
import socket from "../../socket/socket";
import {
  addMessage,
  markMessageDeleted,
  setReplyingTo,
} from "../../redux/features/chat/chatSlice";
import MessageContextMenu from "./MessageContextMenu";

const Chat = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { messages, loadingMessages, error, activeConversationId } =
    useSelector((state) => state.chat);
  const bottomRef = useRef(null);
  const { isDesktop } = useDeviceType();
  const [selectedMessageIds, setSelectedMessageIds] = useState([]);
  const [deletePromptOpen, setDeletePromptOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const selectionMode = selectedMessageIds.length > 0;

  useEffect(() => {
    if (!activeConversationId) return;
    dispatch(fetchMessages(activeConversationId));
  }, [activeConversationId, dispatch]);

  useEffect(() => {
    if (!activeConversationId) return;

    socket.emit("join-conversation", activeConversationId);

    return () => {
      socket.emit("leave-conversation", activeConversationId);
    };
  }, [activeConversationId]);

  useEffect(() => {
    socket.on("receive-message", (message) => {
      dispatch(addMessage(message));
    });

    socket.on("message-deleted", (payload) => {
      dispatch(markMessageDeleted(payload));
    });

    return () => {
      socket.off("receive-message");
      socket.off("message-deleted");
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeConversationId]);

  if (isDesktop && !activeConversationId) {
    return <Empty />;
  }

  const conversationMessages = messages[activeConversationId] || [];

  const toggleSelectMessage = (messageId) => {
    setSelectedMessageIds((prev) => {
      if (prev.includes(messageId)) {
        return prev.filter((id) => id !== messageId);
      }

      return [...prev, messageId];
    });
  };

  const clearSelection = () => {
    setSelectedMessageIds([]);
    setDeletePromptOpen(false);
    setMessageToDelete(null);
  };

  const handleContextMenu = (e, message) => {
    if (selectionMode) return;
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      message,
    });
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  const handleReply = (message) => {
    dispatch(setReplyingTo(message));
  };

  const handleDeleteSingle = (message) => {
    setMessageToDelete(message);
    setDeletePromptOpen(true);
  };

  const handleDeleteSelected = (mode = "me") => {
    if (!activeConversationId) return;

    const ids = messageToDelete ? [messageToDelete._id] : selectedMessageIds;

    if (ids.length === 0) return;

    dispatch(
      deleteMessages({
        conversationId: activeConversationId,
        ids,
        mode,
      }),
    );
    clearSelection();
  };

  const targetMessagesForDelete = messageToDelete
    ? [messageToDelete]
    : conversationMessages.filter((message) =>
        selectedMessageIds.includes(message._id),
      );

  const canDeleteForEveryone =
    targetMessagesForDelete.length > 0 &&
    targetMessagesForDelete.every(
      (message) => message.sender?._id === user?._id && !message.isDeleted,
    );

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-base-100">
      {selectionMode ? (
        <div className="flex items-center justify-between border-b border-base-300 bg-base-200 px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={clearSelection}
              className="rounded-full p-1 hover:bg-base-300"
              aria-label="Cancel selection"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
            <span className="text-sm font-semibold">
              {selectedMessageIds.length} selected
            </span>
          </div>
          <button
            onClick={() => setDeletePromptOpen(true)}
            className="rounded-full p-2 text-error hover:bg-base-300"
            aria-label="Delete selected messages"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
              <path d="M6 7h12l-1 13H7L6 7zm3 2v9h2v-9H9zm4 0v9h2v-9h-2zM9 3h6l1 2H8l1-2z" />
            </svg>
          </button>
        </div>
      ) : (
        <ChatHeader />
      )}

      {deletePromptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-base-100 p-4 shadow-xl">
            <p className="text-sm font-semibold">Delete message?</p>
            <p className="mt-1 text-sm text-base-content/70">
              Choose what you want to do with the {targetMessagesForDelete.length > 1 ? "selected messages" : "message"}.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <button
                onClick={() => handleDeleteSelected("me")}
                className="rounded-xl bg-base-200 px-3 py-2 text-left text-sm hover:bg-base-300"
              >
                Delete for me
              </button>
              {canDeleteForEveryone && (
                <button
                  onClick={() => handleDeleteSelected("everyone")}
                  className="rounded-xl bg-primary px-3 py-2 text-left text-sm text-primary-content"
                >
                  Delete for everyone
                </button>
              )}
            </div>
            <button
              onClick={clearSelection}
              className="mt-4 text-sm text-base-content/70"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-scroll p-4">
        <MessageList
          messages={conversationMessages}
          loadingMessages={loadingMessages}
          error={error}
          user={user}
          bottomRef={bottomRef}
          selectedMessageIds={selectedMessageIds}
          onToggleSelectMessage={toggleSelectMessage}
          selectionMode={selectionMode}
          onContextMenu={handleContextMenu}
        />
      </div>

      <MessageComposer />

      {contextMenu && (
        <MessageContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          isDeleted={contextMenu.message.isDeleted}
          canDeleteForEveryone={
            contextMenu.message.sender?._id === user?._id ||
            contextMenu.message.sender === user?._id
          }
          onClose={() => setContextMenu(null)}
          onCopy={() => handleCopy(contextMenu.message.text)}
          onReply={() => handleReply(contextMenu.message)}
          onDelete={() => handleDeleteSingle(contextMenu.message)}
        />
      )}
    </div>
  );
};

export default Chat;
