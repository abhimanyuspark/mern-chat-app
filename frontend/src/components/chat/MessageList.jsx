import React from "react";
import { MessageSkeleton } from "./ChatSkeletons";
import Avatar from "../common/Avatar";

const MessageList = ({
  messages,
  loadingMessages,
  error,
  user,
  bottomRef,
  selectedMessageIds,
  onToggleSelectMessage,
  selectionMode,
  onContextMenu,
}) => {
  if (loadingMessages) {
    return <MessageSkeleton />;
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (messages.length === 0) {
    return (
      <p className="text-sm text-gray-600">
        No messages yet. Start the conversation.
      </p>
    );
  }

  return (
    <div className="flex flex-col">
      {messages.map((message) => {
        const isMine = message.sender?._id === user?._id;
        const isSelected = selectedMessageIds.includes(message._id);
        const isDeleted = message.isDeleted;

        return (
          <div
            key={message._id}
            className={`flex py-1 items-end gap-2 ${
              isMine ? "justify-end" : "justify-start"
            } ${isSelected ? "bg-base-200" : ""}`}
          >
            {!isMine && (
              <Avatar name={message.sender?.name} size="xs" className="mb-1" />
            )}
            <div
              className={`relative max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow transition cursor-pointer ${
                isMine
                  ? isDeleted
                    ? "bg-base-200 text-base-content/50 border border-base-300"
                    : "bg-primary text-primary-content"
                  : isDeleted
                    ? "bg-base-200 text-base-content/50 border border-base-300"
                    : "bg-base-300"
              } ${isSelected ? "ring-2 ring-primary/70" : ""}`}
              onClick={() => onToggleSelectMessage?.(message._id)}
              onContextMenu={(e) => {
                e.preventDefault();
                onContextMenu?.(e, message);
              }}
            >
              {selectionMode && (
                <div
                  className={`absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border-2 border-base-100 text-[10px] font-semibold ${
                    isSelected
                      ? "bg-primary text-white"
                      : "bg-base-200 text-base-content"
                  }`}
                >
                  {isSelected ? "✓" : ""}
                </div>
              )}
              {isDeleted ? (
                <div className="flex items-center gap-1 italic">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-3.5 w-3.5 fill-current opacity-70"
                  >
                    <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                  </svg>
                  <span>This message was deleted</span>
                </div>
              ) : (
                <>
                  {message.replyTo && (
                    <div className="mb-1 rounded-lg bg-black/10 px-2 py-1 text-[11px] border-l-2 border-primary">
                      <div className="font-bold text-primary">
                        {message.replyTo.sender?.name || "User"}
                      </div>
                      <div className="truncate opacity-70">
                        {message.replyTo.text}
                      </div>
                    </div>
                  )}
                  <div className="whitespace-pre-wrap wrap-break-word">
                    {message.text}
                  </div>
                  <div className="mt-1 flex items-center justify-end gap-1 text-[10px] opacity-70">
                    {new Date(message.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;
