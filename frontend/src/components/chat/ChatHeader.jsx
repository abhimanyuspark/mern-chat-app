import React, { useEffect } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { selectConversationId } from "../../redux/features/chat/chatSlice";
import { fetchConversationById } from "../../redux/features/chat/chatThunk";

const ChatHeader = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { activeConversationId, activeConversation } = useSelector(
    (state) => state.chat,
  );

  const onlineUsers = useSelector((state) => state.socket.onlineUsers);

  let isOnline;

  useEffect(() => {
    if (!activeConversationId) return;
    dispatch(fetchConversationById(activeConversationId));
  }, [activeConversationId, dispatch]);

  const participant = activeConversation?.participants?.find((item) => {
    isOnline = onlineUsers.includes(item._id);
    return item._id !== user?._id;
  });

  const chatTitle = participant?.name || "Conversation";

  return (
    <div className="flex items-center gap-4 border-b border-base-200 bg-base-300 p-3">
      <button
        onClick={() => {
          dispatch(selectConversationId(null));
          navigate(-1, { replace: true });
        }}
        className="rounded-full p-2 text-gray-700 hover:bg-gray-100"
      >
        <FiArrowLeft />
      </button>
      <div>
        <h3 className="font-semibold">{chatTitle}</h3>
        {isOnline ? (
          <span className="text-green-500">Online</span>
        ) : (
          <span className="text-gray-400">Offline</span>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;
