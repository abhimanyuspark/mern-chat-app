import React, { useEffect } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { selectConversationId } from "../../redux/features/chat/chatSlice";
import { fetchConversationById } from "../../redux/features/chat/chatThunk";
import useBackButton from "../../hooks/useBackButton";

const ChatHeader = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { activeConversationId, activeConversation } = useSelector(
    (state) => state.chat,
  );
  const { onBack } = useBackButton();

  useEffect(() => {
    if (!activeConversationId) return;
    dispatch(fetchConversationById(activeConversationId));
  }, [activeConversationId, dispatch]);

  const participant = activeConversation?.participants?.find(
    (person) => person._id !== user?._id,
  );
  const chatTitle = participant?.name || "Conversation";

  return (
    <div className="flex items-center gap-4 border-b border-base-200 bg-base-300 p-3">
      <button
        onClick={() => {
          dispatch(selectConversationId(null));
          onBack();
        }}
        className="rounded-full p-2 text-gray-700 hover:bg-gray-100"
      >
        <FiArrowLeft />
      </button>
      <div>
        <h3 className="font-semibold">{chatTitle}</h3>
        <p className="text-sm">Active chat</p>
      </div>
    </div>
  );
};

export default ChatHeader;
