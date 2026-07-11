import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectConversationId } from "../../redux/features/chat/chatSlice";

const ConversationList = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { conversations, loadingConversations, error, activeConversationId } =
    useSelector((state) => state.chat);

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
            const participant = conversation.participants?.find(
              (item) => item._id !== user?._id,
            );
            const preview = conversation.lastMessage?.text || "Start chatting";

            return (
              <button
                key={conversation._id}
                onClick={() => dispatch(selectConversationId(conversation._id))}
                className={`px-3 py-2 text-left transition cursor-pointer ${
                  activeConversationId === conversation._id
                    ? "bg-base-100"
                    : "bg-base-100 hover:bg-base-200"
                }`}
              >
                <div className="font-semibold">
                  {participant?.name || "Conversation"}
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
