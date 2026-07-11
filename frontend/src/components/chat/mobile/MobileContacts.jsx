import React from "react";
import { useLocation, useNavigate } from "react-router";
import UserSearchPanel from "../UserSearchPanel";
import ConversationList from "../ConversationList";
import { FiSearch } from "react-icons/fi";

const MobileContacts = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchPanel = location.pathname === "/search";

  const openSearchPanel = () => {
    navigate("/search");
  };

  const closeSearchPanel = () => {
    navigate("/");
  };

  return (
    <div className="flex flex-col gap-3 border-r border-base-200">
      {!searchPanel && (
        <div className="p-2">
          <div
            onClick={openSearchPanel}
            className="input input-primary w-full flex gap-2 p-2"
          >
            <FiSearch />
            <p>Search here...</p>
          </div>
        </div>
      )}
      {searchPanel && <UserSearchPanel onClose={closeSearchPanel} />}
      {!searchPanel && <ConversationList />}
    </div>
  );
};

export default MobileContacts;
