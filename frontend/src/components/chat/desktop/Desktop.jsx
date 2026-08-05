import React from "react";
import Contacts from "../Contacts";
import Chat from "../Chat";

const Desktop = () => {
  return (
    <div className="flex h-full w-full bg-base-200">
      <div className="h-full w-80 shrink-0 border-r border-base-300">
        <Contacts />
      </div>

      <div className="flex-1 min-w-0">
        <Chat />
      </div>
    </div>
  );
};

export default Desktop;
