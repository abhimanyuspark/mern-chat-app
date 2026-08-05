import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import {
  fetchUsers,
  startConversation,
} from "../../redux/features/chat/chatThunk";
import { selectConversationId } from "../../redux/features/chat/chatSlice";
import { FiArrowLeft } from "react-icons/fi";
import { UserSkeleton } from "./ChatSkeletons";
import Avatar from "../common/Avatar";

const UserSearchPanel = ({ onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
        navigate(`/chat/${action.payload._id}`);
      }
    });
  };

  return (
    <div className="flex gap-2 flex-col h-full overflow-hidden">
      <div className="flex gap-2 items-start p-2 border-b border-base-200">
        <button
          onClick={() => onClose?.()}
          className="rounded-full p-2 mt-1 text-gray-700 hover:bg-gray-100"
        >
          <FiArrowLeft />
        </button>

        <div className="flex-1 flex flex-col gap-2">
          <input
            type="search"
            autoFocus
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search users..."
            className="input input-primary w-full"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loadingUsers ? (
          <UserSkeleton />
        ) : error ? (
          <p className="text-sm text-red-600 p-4">{error}</p>
        ) : users.length === 0 ? (
          <p className="text-sm text-gray-600 p-4 text-center">
            {searchTerm.trim()
              ? "No users found."
              : "Type a name or email to search users."}
          </p>
        ) : (
          <div className="flex flex-col">
            {users.map((person) => (
              <button
                key={person._id}
                onClick={() => handleStartConversation(person)}
                className="text-left px-4 py-4 hover:bg-base-200 bg-base-100 border-b border-base-200 flex items-center gap-3 transition"
              >
                <Avatar name={person.name} size="sm" />
                <span className="font-medium">{person.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSearchPanel;
