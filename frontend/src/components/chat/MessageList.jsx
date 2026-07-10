import React from "react";

const MessageList = ({ messages, loadingMessages, error, user, bottomRef }) => {
  if (loadingMessages) {
    return <p className="text-sm text-gray-600">Loading messages...</p>;
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
    <div className="flex flex-col gap-2">
      {messages.map((message) => {
        const isMine = message.sender?._id === user?._id;

        return (
          <div
            key={message._id}
            className={`flex ${isMine ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow ${
                isMine ? "bg-primary" : "bg-base-300"
              }`}
            >
              <div>{message.text}</div>
              <div className="mt-1 text-[10px] opacity-70">
                {new Date(message.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;
