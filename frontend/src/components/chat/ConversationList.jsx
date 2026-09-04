import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import {
  selectConversationId,
  updateConversation,
  upsertConversation,
  removeConversation,
} from "../../redux/features/chat/chatSlice";
import socket from "../../socket/socket";

import { ConversationSkeleton } from "./ChatSkeletons";
import Avatar from "../common/Avatar";

const ConversationList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { conversations, loadingConversations, error, activeConversationId } =
    useSelector((state) => state.chat);

  useEffect(() => {
    socket.on("conversation-updated", (data) => {
      dispatch(updateConversation(data));
    });

    socket.on("new-conversation", (data) => {
      dispatch(upsertConversation(data));
    });

    socket.on("group-updated", (data) => {
      dispatch(upsertConversation(data));
    });

    socket.on("conversation-removed", (conversationId) => {
      dispatch(removeConversation(conversationId));
    });

    return () => {
      socket.off("conversation-updated");
      socket.off("new-conversation");
      socket.off("group-updated");
      socket.off("conversation-removed");
    };
  }, [dispatch]);

  const onlineUsers = useSelector((state) => state.socket.onlineUsers);

  return (
    <div className="h-full overflow-y-auto">
      {loadingConversations ? (
        <ConversationSkeleton />
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : conversations.length === 0 ? (
        <p className="text-sm text-center text-gray-600">
          No conversations yet.
        </p>
      ) : (
        <div className="flex flex-col">
          {conversations.map((conversation) => {
            let isOnline = false;
            let displayName = "";
            let displayAvatar = "";

            if (conversation.isGroup) {
              displayName = conversation.groupName;
              displayAvatar = conversation.groupAvatar;
            } else {
              const participant = conversation.participants?.find(
                (item) => item._id !== user?._id,
              );
              displayName = participant?.name || "Deleted User";
              displayAvatar = participant?.avatar;
              isOnline = onlineUsers.includes(participant?._id);
            }

            const preview = conversation.lastMessage?.text || "Start chatting";

            return (
              <button
                key={conversation._id}
                onClick={() => {
                  dispatch(selectConversationId(conversation._id));
                  navigate(`/chat/${conversation._id}`);
                }}
                className={`flex items-center gap-3 px-4 py-2 text-left transition cursor-pointer border-b border-base-200/50 ${
                  activeConversationId === conversation._id
                    ? "bg-base-200"
                    : "bg-base-100 hover:bg-base-200"
                }`}
              >
                <Avatar
                  name={displayName}
                  src={displayAvatar}
                  size="sm"
                  isOnline={!conversation.isGroup && isOnline}
                />

                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-baseline">
                    <h4 className="font-bold truncate text-base">
                      {displayName}
                    </h4>
                  </div>
                  <p className="truncate text-sm opacity-60">
                    {conversation.lastMessage?.sender?._id === user?._id
                      ? "You: "
                      : conversation.isGroup && conversation.lastMessage?.sender
                        ? `${conversation.lastMessage.sender.name}: `
                        : ""}
                    {preview}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ConversationList;
