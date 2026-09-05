import React, { useState } from "react";
import { FiSend, FiSlash } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { sendMessage } from "../../redux/features/chat/chatThunk";
import { setReplyingTo } from "../../redux/features/chat/chatSlice";
import { toggleBlockUser } from "../../redux/features/auth/authThunk";
import toast from "react-hot-toast";

const MessageComposer = () => {
  const [text, setText] = useState("");
  const {
    sendingMessage,
    activeConversationId,
    activeConversation,
    replyingTo,
  } = useSelector((state) => state.chat);
  const { user: currentUser } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const targetUser =
    activeConversation && !activeConversation.isGroup
      ? activeConversation.participants?.find(
          (p) => (p._id || p) !== currentUser?._id,
        )
      : null;

  const isBlocked = targetUser?._id
    ? currentUser?.blockedUsers?.some(
        (id) => (id._id || id)?.toString() === targetUser._id.toString(),
      )
    : false;

  const handleUnblock = async () => {
    if (!targetUser?._id) return;
    try {
      const action = await dispatch(toggleBlockUser(targetUser._id));
      if (toggleBlockUser.fulfilled.match(action)) {
        toast.success("User unblocked");
      }
    } catch (err) {
      toast.error("Failed to unblock user");
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (!text.trim() || !activeConversationId || isBlocked) return;

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

  if (isBlocked) {
    return (
      <div className="border-t border-base-200 bg-base-200/50 p-4 text-center text-sm font-medium">
        <p className="text-base-content/70 flex items-center justify-center gap-2">
          <FiSlash size={16} className="text-error shrink-0" />
          <span>You have blocked this user.</span>
          <button
            type="button"
            onClick={handleUnblock}
            className="text-primary underline font-bold hover:text-primary-focus ml-1 cursor-pointer"
          >
            Unblock
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col border-t border-base-200 bg-base-100 p-2 md:p-4">
      {replyingTo && (
        <div className="flex items-center justify-between bg-base-200/50 backdrop-blur-sm px-4 py-2 text-xs rounded-xl mb-2 border border-base-300">
          <div className="flex flex-col overflow-hidden border-l-2 border-primary pl-3">
            <span className="font-bold text-primary">
              Replying to {replyingTo.sender?.name || "User"}
            </span>
            <span className="truncate opacity-70 italic">
              {replyingTo.text}
            </span>
          </div>
          <button
            onClick={() => dispatch(setReplyingTo(null))}
            className="btn btn-ghost btn-circle btn-xs"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>
      )}

      <form onSubmit={onSubmit} className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            className="input bg-base-200 w-full rounded-2xl p-5 pr-12 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <button
          type="submit"
          disabled={!text.trim() || sendingMessage}
          className="btn btn-primary btn-circle btn-lg shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:bg-base-300 flex items-center justify-center"
        >
          <FiSend size={20} />
        </button>
      </form>
    </div>
  );
};

export default MessageComposer;
