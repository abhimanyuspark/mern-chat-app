import React from "react";
import Contacts from "../Contacts.jsx";
import Chat from "../Chat.jsx";
import { useDispatch, useSelector } from "react-redux";
import useBackButton from "../../../hooks/useBackButton.jsx";
import { selectConversationId } from "../../../redux/features/chat/chatSlice.js";

const Mobile = () => {
  const activeConversationId = useSelector(
    (state) => state.chat.activeConversationId,
  );
  const dispatch = useDispatch();
  const onClose = () => {
    dispatch(selectConversationId(null));
  };
  useBackButton(activeConversationId, onClose);

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
