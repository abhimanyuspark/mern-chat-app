import React, { useState } from "react";
import Contacts from "../../components/chat/Contacts";
import Chat from "../../components/chat/Chat";
import useBackButton from "../../hooks/useBackButton";

const Mobile = () => {
  const [conversationId, setConversationId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const onClose = () => {
    setConversationId(null);
  };
  const { onBack } = useBackButton(conversationId, onClose);

  return (
    <div>
      <div className="h-full overflow-y-auto">
        <Contacts
          onSelectConversation={setConversationId}
          reloadKey={refreshKey}
          selectedConversationId={conversationId}
        />
      </div>

      <div
        className={`fixed top-0 z-50 flex-1 overflow-y-auto bg-amber-600 duration-100 ${conversationId ? "left-0" : "left-full"} size-full`}
      >
        <Chat
          onClose={() => {
            onClose();
            onBack();
          }}
          conversationId={conversationId}
          onMessageSent={() => setRefreshKey((value) => value + 1)}
        />
      </div>
    </div>
  );
};

export default Mobile;
