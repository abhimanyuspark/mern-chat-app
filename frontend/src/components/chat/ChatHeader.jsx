import React, { useEffect } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { selectConversationId } from "../../redux/features/chat/chatSlice";
import { fetchConversationById } from "../../redux/features/chat/chatThunk";
import Avatar from "../common/Avatar";

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
    <div className="flex items-center gap-3 border-b border-base-200 bg-base-100 px-4 py-3 shadow-sm z-10">
      <button
        onClick={() => {
          dispatch(selectConversationId(null));
          navigate(-1, { replace: true });
        }}
        className="btn btn-ghost btn-circle btn-sm md:hidden"
      >
        <FiArrowLeft size={20} />
      </button>

      <Avatar name={chatTitle} size="sm" isOnline={isOnline} />

      <div className="flex flex-col">
        <h3 className="font-bold text-base leading-tight tracking-tight">{chatTitle}</h3>
        <div className="flex items-center gap-1">
          <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-success" : "bg-base-content/20"}`}></div>
          <span className={`text-[11px] font-semibold uppercase tracking-wider ${isOnline ? "text-success" : "text-base-content/40"}`}>
            {isOnline ? "Active Now" : "Offline"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
