import React, { useState } from "react";
import { FiSend } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { sendMessage } from "../../redux/features/chat/chatThunk";
import { setReplyingTo } from "../../redux/features/chat/chatSlice";

const MessageComposer = () => {
  const [text, setText] = useState("");
  const { sendingMessage, activeConversationId, replyingTo } = useSelector(
    (state) => state.chat,
  );
  const dispatch = useDispatch();

  const onSubmit = (e) => {
    e.preventDefault();

    if (!text.trim() || !activeConversationId) return;

    dispatch(
      sendMessage({
        conversationId: activeConversationId,
        text: text.trim(),
        replyTo: replyingTo?._id,
      }),
    ).then((action) => {
      if (action.payload?.message) {
        setText("");
        dispatch(setReplyingTo(null));
      }
    });
  };

  return (
    <div className="flex flex-col border-t border-base-300 bg-base-100">
      {replyingTo && (
        <div className="flex items-center justify-between bg-base-200 px-4 py-2 text-xs border-b border-base-300">
          <div className="flex flex-col overflow-hidden border-l-4 border-primary pl-2">
            <span className="font-bold text-primary">
              Replying to {replyingTo.sender?.name || "User"}
            </span>
            <span className="truncate opacity-70">{replyingTo.text}</span>
          </div>
          <button
            onClick={() => dispatch(setReplyingTo(null))}
            className="rounded-full p-1 hover:bg-base-300"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>
      )}
      
      <form onSubmit={onSubmit} className="flex gap-2 p-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message"
          className="input input-primary flex-1"
        />
        <button
          type="submit"
          disabled={!text.trim() || sendingMessage}
          className="btn btn-primary disabled:btn-disabled"
        >
          <FiSend />
        </button>
      </form>
    </div>
  );
};

export default MessageComposer;
