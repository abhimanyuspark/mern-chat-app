import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiArrowLeft, FiSend } from "react-icons/fi";
import Empty from "./Empty";
import {
  fetchMessages,
  sendMessage,
} from "../../redux/features/chat/chatThunk";

const Chat = ({ conversationId, onClose, onMessageSent }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { messages, loadingMessages, sendingMessage, error } = useSelector(
    (state) => state.chat,
  );
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!conversationId) return;
    dispatch(fetchMessages(conversationId));
  }, [conversationId, dispatch]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, conversationId]);

  const handleSend = (e) => {
    e.preventDefault();

    if (!text.trim() || !conversationId) return;

    dispatch(sendMessage({ conversationId, text: text.trim() })).then(
      (action) => {
        if (action.payload?.message) {
          setText("");
          onMessageSent?.();
        }
      },
    );
  };

  if (!conversationId) {
    return <Empty />;
  }

  const conversationMessages = messages[conversationId] || [];

  return (
    <div className="flex h-full flex-col bg-amber-50">
      <div className="flex items-center gap-2 border-b border-gray-300 bg-white p-3">
        <button
          onClick={onClose}
          className="rounded-full p-2 text-gray-700 hover:bg-gray-100"
        >
          <FiArrowLeft />
        </button>
        <div>
          <h2 className="font-semibold text-gray-800">Conversation</h2>
          <p className="text-sm text-gray-500">
            Messages are synced with the backend
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {loadingMessages ? (
          <p className="text-sm text-gray-600">Loading messages...</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : conversationMessages.length === 0 ? (
          <p className="text-sm text-gray-600">
            No messages yet. Start the conversation.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {conversationMessages.map((message) => {
              const isMine = message.sender?._id === user?._id;

              return (
                <div
                  key={message._id}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow ${
                      isMine
                        ? "bg-amber-600 text-white"
                        : "bg-white text-gray-800"
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
        )}
      </div>

      <form
        onSubmit={handleSend}
        className="flex gap-2 border-t border-gray-300 bg-white p-3"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message"
          className="flex-1 rounded-full border border-gray-300 px-4 py-2 outline-none focus:border-amber-500"
        />
        <button
          type="submit"
          disabled={!text.trim() || sendingMessage}
          className="rounded-full bg-amber-600 p-3 text-white disabled:opacity-60"
        >
          <FiSend />
        </button>
      </form>
    </div>
  );
};

export default Chat;
