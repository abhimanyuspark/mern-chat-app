import React, { useEffect } from "react";
import { FiArrowLeft, FiInfo } from "react-icons/fi";
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

  useEffect(() => {
    if (!activeConversationId) return;
    dispatch(fetchConversationById(activeConversationId));
  }, [activeConversationId, dispatch]);

  if (!activeConversation) return null;

  let displayName = "";
  let displayAvatar = "";
  let isOnline = false;
  let subText = "";

  if (activeConversation.isGroup) {
    displayName = activeConversation.groupName;
    displayAvatar = activeConversation.groupAvatar;
    subText = `${activeConversation.participants?.length || 0} members`;
  } else {
    const participant = activeConversation.participants?.find(
      (item) => item._id !== user?._id,
    );
    displayName = participant?.name || "Deleted User";
    displayAvatar = participant?.avatar;
    isOnline = onlineUsers.includes(participant?._id);
    subText = isOnline ? "Active Now" : "Offline";
  }

  const handleHeaderClick = () => {
    if (activeConversation.isGroup) {
      navigate(`/chat/${activeConversation._id}/info`);
    }
  };

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

      <Avatar
        name={displayName}
        src={displayAvatar}
        size="sm"
        isOnline={!activeConversation.isGroup && isOnline}
      />

      <div
        className="flex flex-col flex-1 cursor-pointer"
        onClick={handleHeaderClick}
      >
        <h3 className="font-bold text-base leading-tight tracking-tight">
          {displayName}
        </h3>
        <div className="flex items-center gap-1">
          {!activeConversation.isGroup && (
            <div
              className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-success" : "bg-base-content/20"}`}
            ></div>
          )}
          <span
            className={`text-[11px] font-semibold uppercase tracking-wider ${isOnline ? "text-success" : "text-base-content/40"}`}
          >
            {subText}
          </span>
        </div>
      </div>

      {activeConversation.isGroup && (
        <button
          onClick={handleHeaderClick}
          className="btn btn-ghost btn-circle btn-sm"
        >
          <FiInfo size={20} />
        </button>
      )}
    </div>
  );
};

export default ChatHeader;
