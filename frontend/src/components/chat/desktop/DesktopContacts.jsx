import React, { useState } from "react";
import UserSearchPanel from "../UserSearchPanel";
import ConversationList from "../ConversationList";
import { FiSearch } from "react-icons/fi";

const DesktopContacts = () => {
  const [searchPanel, setSearchPanel] = useState(false);

  const openSearchPanel = () => {
    setSearchPanel(!searchPanel);
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
      {searchPanel && <UserSearchPanel onClose={openSearchPanel} />}
      {!searchPanel && <ConversationList />}
    </div>
  );
};

export default DesktopContacts;
