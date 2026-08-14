import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiX, FiSearch, FiCheck } from "react-icons/fi";
import { fetchUsers, createGroup } from "../../redux/features/chat/chatThunk";
import Avatar from "../common/Avatar";

const CreateGroupModal = ({ onClose }) => {
  const dispatch = useDispatch();
  const { users, loadingUsers } = useSelector((state) => state.chat);
  const [groupName, setGroupName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      dispatch(fetchUsers(searchTerm.trim()));
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [dispatch, searchTerm]);

  const toggleUser = (user) => {
    if (selectedUsers.find((u) => u._id === user._id)) {
      setSelectedUsers(selectedUsers.filter((u) => u._id !== user._id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleCreate = async () => {
    if (!groupName.trim() || selectedUsers.length < 2) return;

    const action = await dispatch(
      createGroup({
        name: groupName,
        participants: selectedUsers.map((u) => u._id),
      }),
    );

    if (createGroup.fulfilled.match(action)) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-base-100 w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-base-200 flex justify-between items-center">
          <h2 className="text-xl font-bold">Create New Group</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-base-200 rounded-full transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="p-4 flex flex-col gap-4 overflow-y-auto">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">Group Name</span>
            </label>
            <input
              type="text"
              placeholder="Enter group name"
              className="input input-bordered w-full"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">
                Add Members (min 2)
              </span>
            </label>
            <div className="relative">
              <FiSearch
                className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50"
                size={18}
              />
              <input
                type="text"
                placeholder="Search users..."
                className="input input-bordered w-full pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2 py-2">
              {selectedUsers.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium"
                >
                  <span>{user.name}</span>
                  <button
                    onClick={() => toggleUser(user)}
                    className="hover:text-primary-focus"
                  >
                    <FiX size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wider px-1">
              Suggestions
            </p>
            <div className="max-h-60 overflow-y-auto rounded-lg border border-base-200">
              {loadingUsers ? (
                <div className="p-4 text-center text-sm opacity-60">
                  Loading users...
                </div>
              ) : users.length === 0 ? (
                <div className="p-4 text-center text-sm opacity-60">
                  No users found
                </div>
              ) : (
                users.map((user) => (
                  <button
                    key={user._id}
                    onClick={() => toggleUser(user)}
                    className="w-full flex items-center justify-between p-3 hover:bg-base-200 transition-colors border-b border-base-200 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={user.name} src={user.avatar} size="sm" />
                      <span className="font-medium">{user.name}</span>
                    </div>
                    {selectedUsers.find((u) => u._id === user._id) && (
                      <FiCheck className="text-primary" size={20} />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-base-200 flex gap-3">
          <button onClick={onClose} className="btn btn-ghost flex-1">
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!groupName.trim() || selectedUsers.length < 2}
            className="btn btn-primary flex-1"
          >
            Create Group
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;
