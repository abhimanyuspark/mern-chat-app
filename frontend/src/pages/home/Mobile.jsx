import React from "react";
import Contacts from "../../components/chat/Contacts";
import Chat from "../../components/chat/Chat";
import { useDispatch, useSelector } from "react-redux";
import useBackButton from "../../hooks/useBackButton";
import { selectConversationId } from "../../redux/features/chat/chatSlice.js";

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
    <div>
      <div className="h-full overflow-y-auto bg-base-300">
        <Contacts />
      </div>

      <div
        className={`fixed top-0 z-50 flex-1 overflow-y-auto duration-100 ${activeConversationId ? "left-0" : "left-full"} size-full`}
      >
        <Chat />
      </div>
    </div>
  );
};

export default Mobile;
