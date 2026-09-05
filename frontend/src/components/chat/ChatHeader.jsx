import React, { useEffect } from "react";
import {
  FiArrowLeft,
  FiInfo,
  FiMoreVertical,
  FiTrash2,
  FiUser,
  FiSlash,
  FiTrash,
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { selectConversationId } from "../../redux/features/chat/chatSlice";
import {
  fetchConversationById,
  clearChatMessages,
  deleteConversationThunk,
} from "../../redux/features/chat/chatThunk";
import { toggleBlockUser } from "../../redux/features/auth/authThunk";
import Avatar from "../common/Avatar";
import toast from "react-hot-toast";

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
  let targetUser = null;

  if (activeConversation.isGroup) {
    displayName = activeConversation.groupName;
    displayAvatar = activeConversation.groupAvatar;
    subText = `${activeConversation.participants?.length || 0} members`;
  } else {
    targetUser = activeConversation.participants?.find((item) => {
      const itemId =
        typeof item === "object" ? item?._id?.toString() : item?.toString();
      return itemId && itemId !== user?._id?.toString();
    });

    if (typeof targetUser === "object" && targetUser?.name) {
      displayName = targetUser.name;
      displayAvatar = targetUser.avatar;
      isOnline = onlineUsers.includes(targetUser._id);
      subText = isOnline ? "Active Now" : "Offline";
    } else {
      displayName = "Deleted User";
      subText = "Offline";
    }
  }

  const isBlocked =
    !activeConversation.isGroup && targetUser?._id
      ? user?.blockedUsers?.some(
          (id) => (id._id || id)?.toString() === targetUser._id.toString(),
        )
      : false;

  const handleHeaderClick = () => {
    if (activeConversation.isGroup) {
      navigate(`/chat/${activeConversation._id}/info`);
    } else {
      navigate(`/chat/${activeConversation._id}/user-info`);
    }
  };

  const closeDropdown = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  const handleToggleBlock = async () => {
    closeDropdown();
    if (!targetUser?._id) return;

    const actionText = isBlocked ? "unblock" : "block";
    if (
      window.confirm(
        `Are you sure you want to ${actionText} ${displayName}?`,
      )
    ) {
      try {
        const action = await dispatch(toggleBlockUser(targetUser._id));
        if (toggleBlockUser.fulfilled.match(action)) {
          toast.success(
            `User ${isBlocked ? "unblocked" : "blocked"} successfully`,
          );
        } else {
          toast.error(action.payload || `Failed to ${actionText} user`);
        }
      } catch (err) {
        toast.error("Something went wrong");
      }
    }
  };

  const handleClearChat = async () => {
    closeDropdown();
    if (
      window.confirm(
        "Are you sure you want to clear this chat? All messages will be cleared, but the conversation will remain in your chat list.",
      )
    ) {
      try {
        await dispatch(clearChatMessages(activeConversation._id)).unwrap();
        toast.success("Chat cleared");
      } catch (err) {
        toast.error(err || "Failed to clear chat");
      }
    }
  };

  const handleDeleteChat = async () => {
    closeDropdown();
    if (
      window.confirm(
        "Are you sure you want to delete this chat? All messages and this conversation will be removed from your chat list.",
      )
    ) {
      try {
        await dispatch(deleteConversationThunk(activeConversation._id)).unwrap();
        toast.success("Chat deleted");
        dispatch(selectConversationId(null));
        navigate("/", { replace: true });
      } catch (err) {
        toast.error(err || "Failed to delete chat");
      }
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
              className={`w-1.5 h-1.5 rounded-full ${
                isOnline ? "bg-success" : "bg-base-content/20"
              }`}
            ></div>
          )}
          <span
            className={`text-[11px] font-semibold uppercase tracking-wider ${
              isOnline ? "text-success" : "text-base-content/40"
            }`}
          >
            {subText}
          </span>
          {isBlocked && (
            <span className="ml-2 text-[10px] bg-error/10 text-error px-1.5 py-0.5 rounded-full font-bold">
              Blocked
            </span>
          )}
        </div>
      </div>

      <div className="dropdown dropdown-end">
        <div
          tabIndex={0}
          role="button"
          className="btn btn-ghost btn-circle btn-sm"
        >
          <FiMoreVertical size={20} />
        </div>
        <ul
          tabIndex={0}
          className="mt-3 z-50 p-2 shadow-xl menu menu-sm dropdown-content bg-base-100 rounded-box w-48 border border-base-200"
        >
          {activeConversation.isGroup ? (
            <li>
              <button
                onClick={() => {
                  closeDropdown();
                  navigate(`/chat/${activeConversation._id}/info`);
                }}
                className="py-2 flex items-center gap-2"
              >
                <FiInfo size={16} />
                <span>Group Info</span>
              </button>
            </li>
          ) : (
            <>
              <li>
                <button
                  onClick={() => {
                    closeDropdown();
                    navigate(`/chat/${activeConversation._id}/user-info`);
                  }}
                  className="py-2 flex items-center gap-2"
                >
                  <FiUser size={16} />
                  <span>View Contact</span>
                </button>
              </li>
              <li>
                <button
                  onClick={handleToggleBlock}
                  className="py-2 text-warning flex items-center gap-2"
                >
                  <FiSlash size={16} />
                  <span>{isBlocked ? "Unblock User" : "Block User"}</span>
                </button>
              </li>
            </>
          )}

          <li>
            <button
              onClick={handleClearChat}
              className="py-2 flex items-center gap-2"
            >
              <FiTrash size={16} />
              <span>Clear Chat</span>
            </button>
          </li>
          <li>
            <button
              onClick={handleDeleteChat}
              className="py-2 text-error flex items-center gap-2"
            >
              <FiTrash2 size={16} />
              <span>Delete Chat</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ChatHeader;
