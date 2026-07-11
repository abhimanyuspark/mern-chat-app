import React from "react";
import Contacts from "../Contacts.jsx";
import Chat from "../Chat.jsx";
import { useSelector } from "react-redux";

const Mobile = () => {
  const activeConversationId = useSelector(
    (state) => state.chat.activeConversationId,
  );

  return (
    <div className="h-full w-full">
      <div className="h-full overflow-y-auto bg-base-300">
        <Contacts />
      </div>

      <div
        className={`fixed top-0 z-50 duration-300 ${activeConversationId ? "left-0" : "left-full"} size-full`}
      >
        <Chat />
      </div>
    </div>
  );
};

export default Mobile;
