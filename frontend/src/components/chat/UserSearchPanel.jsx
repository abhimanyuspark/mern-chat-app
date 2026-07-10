import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUsers,
  startConversation,
} from "../../redux/features/chat/chatThunk";
import { selectConversationId } from "../../redux/features/chat/chatSlice";

const UserSearchPanel = () => {
  const dispatch = useDispatch();
  const { users, loadingUsers, error } = useSelector((state) => state.chat);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      dispatch(fetchUsers(searchTerm.trim()));
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [dispatch, searchTerm]);

  const handleStartConversation = (receiver) => {
    dispatch(startConversation(receiver._id)).then((action) => {
      if (action.payload?._id) {
        dispatch(selectConversationId(action.payload._id));
      }
    });
  };

  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-700">
        Start a chat
      </h3>
      <div className="flex flex-col gap-2">
        <input
          type="text"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search users by name or email"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-amber-600"
        />

        {loadingUsers ? (
          <p className="text-sm text-gray-600">Searching users...</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : users.length === 0 ? (
          <p className="text-sm text-gray-600">
            {searchTerm.trim()
              ? "No users found."
              : "Type a name or email to search users."}
          </p>
        ) : (
          users.map((person) => (
            <button
              key={person._id}
              onClick={() => handleStartConversation(person)}
              className="rounded-lg bg-amber-700 px-3 py-2 text-left text-sm text-white transition hover:bg-amber-800"
            >
              {person.name || person.email}
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default UserSearchPanel;
