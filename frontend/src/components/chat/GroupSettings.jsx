import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiX, FiEdit2, FiUserPlus, FiLogOut, FiTrash2, FiSearch, FiCheck } from "react-icons/fi";
import {
  updateGroupInfo,
  addGroupMember,
  removeGroupMember,
  leaveGroup,
  fetchUsers,
} from "../../redux/features/chat/chatThunk";
import Avatar from "../common/Avatar";

const GroupSettings = ({ onClose }) => {
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((state) => state.auth);
  const { activeConversation, users, loadingUsers } = useSelector(
    (state) => state.chat,
  );

  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(activeConversation?.groupName || "");
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const isAdmin = activeConversation?.groupAdmins?.some(
    (admin) => (admin._id || admin) === currentUser?._id,
  );

  useEffect(() => {
    if (isAddingMember) {
      const timeoutId = setTimeout(() => {
        dispatch(fetchUsers(searchTerm.trim()));
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [dispatch, searchTerm, isAddingMember]);

  const handleUpdateName = async () => {
    if (!newName.trim() || newName === activeConversation.groupName) {
      setIsEditingName(false);
      return;
    }
    await dispatch(
      updateGroupInfo({ conversationId: activeConversation._id, name: newName }),
    );
    setIsEditingName(false);
  };

  const handleAddMember = async (userId) => {
    await dispatch(
      addGroupMember({ conversationId: activeConversation._id, memberId: userId }),
    );
    setIsAddingMember(false);
    setSearchTerm("");
  };

  const handleRemoveMember = async (userId) => {
    if (window.confirm("Are you sure you want to remove this member?")) {
      await dispatch(
        removeGroupMember({
          conversationId: activeConversation._id,
          memberId: userId,
        }),
      );
    }
  };

  const handleLeaveGroup = async () => {
    if (window.confirm("Are you sure you want to leave this group?")) {
      await dispatch(leaveGroup(activeConversation._id));
      onClose();
    }
  };

  if (!activeConversation) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-base-100 w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-base-200 flex justify-between items-center bg-base-200/50">
          <h2 className="text-xl font-bold">Group Info</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-base-300 rounded-full transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center gap-4 border-b border-base-200">
          <Avatar
            name={activeConversation.groupName}
            src={activeConversation.groupAvatar}
            size="xl"
          />
          <div className="w-full flex items-center justify-center gap-2">
            {isEditingName ? (
              <div className="flex w-full gap-2">
                <input
                  type="text"
                  className="input input-bordered flex-1"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  autoFocus
                />
                <button
                  onClick={handleUpdateName}
                  className="btn btn-primary btn-square"
                >
                  <FiCheck />
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-center">
                  {activeConversation.groupName}
                </h3>
                {isAdmin && (
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="p-1 hover:text-primary transition-colors"
                  >
                    <FiEdit2 size={16} />
                  </button>
                )}
              </>
            )}
          </div>
          <p className="text-sm opacity-60">
            {activeConversation.participants?.length} members
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex justify-between items-center mb-4 px-2">
            <h4 className="font-bold uppercase text-xs tracking-widest opacity-50">
              Members
            </h4>
            {isAdmin && (
              <button
                onClick={() => setIsAddingMember(!isAddingMember)}
                className="btn btn-ghost btn-xs text-primary gap-1"
              >
                <FiUserPlus size={14} /> Add Member
              </button>
            )}
          </div>

          {isAddingMember && (
            <div className="mb-4 space-y-2">
              <div className="relative px-2">
                <FiSearch
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-base-content/50"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Search to add..."
                  className="input input-sm input-bordered w-full pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="max-h-40 overflow-y-auto border border-base-200 rounded-lg">
                {loadingUsers ? (
                  <div className="p-3 text-center text-xs opacity-60">
                    Loading...
                  </div>
                ) : users.length === 0 ? (
                  <div className="p-3 text-center text-xs opacity-60">
                    No users found
                  </div>
                ) : (
                  users
                    .filter(
                      (u) =>
                        !activeConversation.participants.some(
                          (p) => p._id === u._id,
                        ),
                    )
                    .map((user) => (
                      <button
                        key={user._id}
                        onClick={() => handleAddMember(user._id)}
                        className="w-full flex items-center justify-between p-2 hover:bg-base-200 transition-colors border-b border-base-200 last:border-0"
                      >
                        <div className="flex items-center gap-2">
                          <Avatar name={user.name} src={user.avatar} size="xs" />
                          <span className="text-sm font-medium">{user.name}</span>
                        </div>
                        <FiUserPlus className="text-primary" size={16} />
                      </button>
                    ))
                )}
              </div>
            </div>
          )}

          <div className="space-y-1">
            {activeConversation.participants?.map((participant) => {
              const isParticipantAdmin = activeConversation.groupAdmins?.some(
                (admin) => (admin._id || admin) === participant._id,
              );
              const isSelf = participant._id === currentUser?._id;

              return (
                <div
                  key={participant._id}
                  className="flex items-center justify-between p-2 hover:bg-base-200 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={participant.name}
                      src={participant.avatar}
                      size="sm"
                    />
                    <div>
                      <p className="font-medium text-sm">
                        {participant.name} {isSelf && "(You)"}
                      </p>
                      {isParticipantAdmin && (
                        <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold uppercase">
                          Admin
                        </span>
                      )}
                    </div>
                  </div>
                  {isAdmin && !isSelf && (
                    <button
                      onClick={() => handleRemoveMember(participant._id)}
                      className="p-2 text-error hover:bg-error/10 rounded-full transition-colors"
                      title="Remove Member"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-base-200">
          <button
            onClick={handleLeaveGroup}
            className="btn btn-error btn-outline w-full gap-2"
          >
            <FiLogOut size={18} /> Leave Group
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupSettings;
