import React from "react";
import Contacts from "../../components/chat/Contacts";
import Chat from "../../components/chat/Chat";

const Desktop = () => {
  return (
    <div className="flex h-full w-full">
      <div className="h-full w-xs shrink-0 overflow-y-auto bg-base-300">
        <Contacts />
      </div>

      <div className="flex-1 overflow-y-auto">
        <Chat />
      </div>
    </div>
  );
};

export default Desktop;
