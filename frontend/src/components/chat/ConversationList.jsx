import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import {
  selectConversationId,
  updateConversation,
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

    return () => {
      socket.off("conversation-updated");
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
        <p className="text-sm text-gray-600">No conversations yet.</p>
      ) : (
        <div className="flex flex-col">
          {conversations.map((conversation) => {
            let isOnline;
            const participant = conversation.participants?.find((item) => {
              isOnline = onlineUsers.includes(item._id);
              return item._id !== user?._id;
            });
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
                  name={participant?.name || "C"}
                  size="sm"
                  isOnline={isOnline}
                />

                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-baseline">
                    <h4 className="font-bold truncate text-base">
                      {participant?.name || "Conversation"}
                    </h4>
                  </div>
                  <p className="truncate text-sm opacity-60">
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
