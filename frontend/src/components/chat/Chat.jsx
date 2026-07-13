import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Empty from "./desktop/Empty";
import { fetchMessages } from "../../redux/features/chat/chatThunk";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageComposer from "./MessageComposer";
import useDeviceType from "../../hooks/useDeviceType";
import socket from "../../socket/socket";
import { addMessage } from "../../redux/features/chat/chatSlice";

const Chat = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { messages, loadingMessages, error, activeConversationId } =
    useSelector((state) => state.chat);
  const bottomRef = useRef(null);
  const { isDesktop } = useDeviceType();

  useEffect(() => {
    if (!activeConversationId) return;
    dispatch(fetchMessages(activeConversationId));
  }, [activeConversationId, dispatch]);

  useEffect(() => {
    if (!activeConversationId) return;

    socket.emit("join-conversation", activeConversationId);

    return () => {
      socket.emit("leave-conversation", activeConversationId);
    };
  }, [activeConversationId]);

  useEffect(() => {
    socket.on("receive-message", (message) => {
      dispatch(addMessage(message));
    });

    return () => {
      socket.off("receive-message");
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeConversationId]);

  if (isDesktop && !activeConversationId) {
    return <Empty />;
  }

  const conversationMessages = messages[activeConversationId] || [];

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-base-100">
      <ChatHeader />

      <div className="flex-1 min-h-0 overflow-y-auto p-4 pb-24">
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
