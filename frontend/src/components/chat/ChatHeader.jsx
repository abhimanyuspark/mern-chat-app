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
    <div className="flex items-center gap-3 border-b border-base-200 bg-base-300 p-3">
      <button
        onClick={() => {
          dispatch(selectConversationId(null));
          navigate(-1, { replace: true });
        }}
        className="btn btn-ghost btn-circle btn-sm md:hidden"
      >
        <FiArrowLeft className="text-xl" />
      </button>

      <div className={`avatar ${isOnline ? "online" : "offline"}`}>
        <div className="bg-neutral text-neutral-content flex items-center justify-center rounded-full p-4">
          <span>{chatTitle.charAt(0)}</span>
        </div>
      </div>

      <div className="flex flex-col">
        <h3 className="font-bold text-sm leading-tight">{chatTitle}</h3>
        <span className={`text-[10px] font-medium ${isOnline ? "text-success" : "text-base-content/50"}`}>
          {isOnline ? "Online" : "Offline"}
        </span>
      </div>
    </div>
  );
};

export default ChatHeader;
