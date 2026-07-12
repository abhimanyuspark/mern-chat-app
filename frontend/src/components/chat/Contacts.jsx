import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchConversations } from "../../redux/features/chat/chatThunk";
import { useLocation, useNavigate } from "react-router";
import UserSearchPanel from "./UserSearchPanel";
import ConversationList from "./ConversationList";
import { FiSearch } from "react-icons/fi";

const Contacts = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const searchPanel = location.pathname === "/search";

  const openSearchPanel = () => {
    navigate(searchPanel ? -1 : "/search");
  };

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  return (
    <div className="flex flex-col gap-3 border-r border-base-200">
      {!searchPanel && (
        <div className="p-2">
          <div
            onClick={openSearchPanel}
            className="input input-neutral w-full flex gap-2 p-2"
          >
            <FiSearch />
            <p>Search here...</p>
          </div>
        </div>
      )}
      {searchPanel && <UserSearchPanel onClose={openSearchPanel} />}
      {!searchPanel && <ConversationList />}
    </div>
  );
};

export default Contacts;
