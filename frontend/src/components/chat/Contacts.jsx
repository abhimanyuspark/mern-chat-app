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
    <div className="flex flex-col h-full bg-base-100">
      {!searchPanel && (
        <div className="px-4 py-4">
          <div
            onClick={openSearchPanel}
            className="flex items-center gap-3 px-4 py-3 bg-base-200 hover:bg-base-300 rounded-2xl cursor-pointer transition-colors text-base-content/60"
          >
            <FiSearch size={18} />
            <span className="text-sm font-medium">Search conversations...</span>
          </div>
        </div>
      )}
      {searchPanel && <UserSearchPanel onClose={openSearchPanel} />}
      {!searchPanel && <ConversationList />}
    </div>
  );
};

export default Contacts;
