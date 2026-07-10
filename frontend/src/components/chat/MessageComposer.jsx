import React, { useState } from "react";
import { FiSend } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { sendMessage } from "../../redux/features/chat/chatThunk";

const MessageComposer = () => {
  const [text, setText] = useState("");
  const { sendingMessage, activeConversationId } = useSelector(
    (state) => state.chat,
  );
  const dispatch = useDispatch();

  const onSubmit = (e) => {
    e.preventDefault();

    if (!text.trim() || !activeConversationId) return;

    dispatch(
      sendMessage({ conversationId: activeConversationId, text: text.trim() }),
    ).then((action) => {
      if (action.payload?.message) {
        setText("");
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="flex gap-2 bg-base-300 p-3">
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
  );
};

export default MessageComposer;
