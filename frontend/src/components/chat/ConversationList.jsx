import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import {
  selectConversationId,
  updateConversation,
} from "../../redux/features/chat/chatSlice";
import socket from "../../socket/socket";

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
    <div>
      <h3 className="mb-2 text-sm font-semibold tracking-wide">Chats</h3>
      {loadingConversations ? (
        <p className="text-sm text-gray-600">Loading conversations...</p>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : conversations.length === 0 ? (
        <p className="text-sm text-gray-600">No conversations yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
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
                className={`px-3 py-2 text-left transition cursor-pointer ${
                  activeConversationId === conversation._id
                    ? "bg-base-100"
                    : "bg-base-100 hover:bg-base-200"
                }`}
              >
                <div className="font-semibold">
                  {participant?.name || "Conversation"}{" "}
                  {isOnline ? (
                    <span className="text-green-500">Online</span>
                  ) : (
                    <span className="text-gray-400">Offline</span>
                  )}
                </div>
                <div className="truncate text-sm opacity-80">{preview}</div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ConversationList;
