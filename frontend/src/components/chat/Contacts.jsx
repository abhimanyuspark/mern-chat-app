import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchConversations,
  fetchUsers,
  startConversation,
} from "../../redux/features/chat/chatThunk";
import { selectConversation } from "../../redux/features/chat/chatSlice";

const Contacts = ({
  onSelectConversation,
  reloadKey,
  selectedConversationId,
}) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { conversations, users, loadingConversations, loadingUsers, error } =
    useSelector((state) => state.chat);

  useEffect(() => {
    dispatch(fetchConversations());
    dispatch(fetchUsers());
  }, [dispatch, reloadKey]);

  const handleStartConversation = (receiver) => {
    dispatch(startConversation(receiver._id)).then((action) => {
      if (action.payload?._id) {
        onSelectConversation(action.payload._id);
        dispatch(selectConversation(action.payload._id));
        dispatch(fetchConversations());
      }
    });
  };

  return (
    <div className="flex flex-col gap-3 p-3">
      <div>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-700">
          Start a chat
        </h3>
        <div className="flex flex-col gap-2">
          {loadingUsers ? (
            <p className="text-sm text-gray-600">Loading contacts...</p>
          ) : (
            users.map((person) => (
              <button
                key={person._id}
                onClick={() => handleStartConversation(person)}
                className="rounded-lg bg-amber-700 px-3 py-2 text-left text-sm text-white transition hover:bg-amber-800"
              >
                {person.name || person.email}
              </button>
            ))
          )}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-700">
          Conversations
        </h3>
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
              const preview =
                conversation.lastMessage?.text || "Start chatting";

              return (
                <button
                  key={conversation._id}
                  onClick={() => onSelectConversation(conversation._id)}
                  className={`rounded-lg border px-3 py-2 text-left transition ${
                    selectedConversationId === conversation._id
                      ? "border-amber-700 bg-amber-600 text-white"
                      : "border-gray-300 bg-white text-gray-800 hover:bg-amber-100"
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
    </div>
  );
};

export default Contacts;
