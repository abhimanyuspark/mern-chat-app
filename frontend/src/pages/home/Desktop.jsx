import React, { useState } from "react";
import Contacts from "../../components/chat/Contacts";
import Chat from "../../components/chat/Chat";

const Desktop = () => {
  const [conversationId, setConversationId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="flex h-full w-full">
      <div className="h-full w-xs shrink-0 overflow-y-auto bg-amber-200">
        <Contacts
          onSelectConversation={setConversationId}
          reloadKey={refreshKey}
          selectedConversationId={conversationId}
        />
      </div>

      <div className="flex-1 overflow-y-auto bg-amber-600">
        <Chat
          onClose={() => setConversationId(null)}
          conversationId={conversationId}
          onMessageSent={() => setRefreshKey((value) => value + 1)}
        />
      </div>
    </div>
  );
};

export default Desktop;
