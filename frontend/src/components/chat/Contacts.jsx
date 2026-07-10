import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchConversations } from "../../redux/features/chat/chatThunk";
import UserSearchPanel from "./UserSearchPanel";
import ConversationList from "./ConversationList";

const Contacts = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  return (
    <div className="flex flex-col gap-3 p-3">
      <UserSearchPanel />
      <ConversationList />
    </div>
  );
};

export default Contacts;
