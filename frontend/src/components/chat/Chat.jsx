import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Empty from "./Empty";
import { fetchMessages } from "../../redux/features/chat/chatThunk";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageComposer from "./MessageComposer";

const Chat = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { messages, loadingMessages, error, activeConversationId } =
    useSelector((state) => state.chat);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!activeConversationId) return;
    dispatch(fetchMessages(activeConversationId));
  }, [activeConversationId, dispatch]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeConversationId]);

  if (!activeConversationId) {
    return <Empty />;
  }

  const conversationMessages = messages[activeConversationId] || [];

  return (
    <div className="flex h-full flex-col bg-base-100">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4">
        <MessageList
          messages={conversationMessages}
          loadingMessages={loadingMessages}
          error={error}
          user={user}
          bottomRef={bottomRef}
        />
      </div>

      <MessageComposer />
    </div>
  );
};

export default Chat;
