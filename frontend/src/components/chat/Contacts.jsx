import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchConversations } from "../../redux/features/chat/chatThunk";
import { useLocation, useNavigate } from "react-router";
import UserSearchPanel from "./UserSearchPanel";
import ConversationList from "./ConversationList";
import CreateGroupModal from "./CreateGroupModal";
import { FiSearch, FiUsers } from "react-icons/fi";

const Contacts = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const searchPanel = location.pathname === "/search";
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);

  const openSearchPanel = () => {
    navigate(searchPanel ? -1 : "/search");
  };

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  return (
    <div className="flex flex-col h-full bg-base-100">
      {!searchPanel && (
        <div className="px-4 py-4 flex gap-2">
          <div
            onClick={openSearchPanel}
            className="flex-1 flex items-center gap-3 px-4 py-3 bg-base-200 hover:bg-base-300 rounded-2xl cursor-pointer transition-colors text-base-content/60"
          >
            <FiSearch size={18} />
            <span className="text-sm font-medium">Search conversations...</span>
          </div>
          <button
            onClick={() => setIsCreateGroupOpen(true)}
            className="p-3 bg-primary text-primary-content rounded-2xl hover:opacity-90 transition-opacity"
            title="Create Group"
          >
            <FiUsers size={18} />
          </button>
        </div>
      )}
      {searchPanel && <UserSearchPanel onClose={openSearchPanel} />}
      {!searchPanel && <ConversationList />}

      {isCreateGroupOpen && (
        <CreateGroupModal onClose={() => setIsCreateGroupOpen(false)} />
      )}
    </div>
  );
};

export default Contacts;
