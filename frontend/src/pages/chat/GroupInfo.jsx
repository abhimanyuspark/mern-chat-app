import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router";
import {
  FiArrowLeft,
  FiEdit2,
  FiUserPlus,
  FiLogOut,
  FiTrash2,
  FiSearch,
  FiCheck,
  FiX,
} from "react-icons/fi";
import {
  updateGroupInfo,
  addGroupMember,
  removeGroupMember,
  leaveGroup,
  fetchUsers,
  fetchConversationById,
} from "../../redux/features/chat/chatThunk";
import Avatar from "../../components/common/Avatar";
import Loading from "../../components/common/Loading";

const GroupInfo = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((state) => state.auth);
  const { activeConversation, users, loadingUsers, error } = useSelector(
    (state) => state.chat,
  );

  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (conversationId) {
      dispatch(fetchConversationById(conversationId));
    }
  }, [conversationId, dispatch]);

  useEffect(() => {
    if (activeConversation) {
      setNewName(activeConversation.groupName);
    }
  }, [activeConversation]);

  useEffect(() => {
    if (isAddingMember) {
      const timeoutId = setTimeout(() => {
        dispatch(fetchUsers(searchTerm.trim()));
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [dispatch, searchTerm, isAddingMember]);

  if (!activeConversation && !error) return <Loading />;
  if (error) return <div className="p-4 text-error">{error}</div>;
  if (!activeConversation.isGroup) {
      return <div className="p-4">This is not a group conversation.</div>;
  }

  const isAdmin = activeConversation?.groupAdmins?.some(
    (admin) => (admin._id || admin) === currentUser?._id,
  );

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
      addGroupMember({
        conversationId: activeConversation._id,
        memberId: userId,
      }),
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
      navigate("/");
    }
  };

  return (
    <div className="flex flex-col h-full bg-base-100 max-w-2xl mx-auto w-full border-x border-base-200 shadow-sm">
      <div className="p-4 border-b border-base-200 flex items-center gap-4 sticky top-0 bg-base-100 z-10">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-ghost btn-circle btn-sm"
        >
          <FiArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-bold">Group Info</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-8 flex flex-col items-center gap-4 border-b border-base-200 bg-base-200/20">
          <Avatar
            name={activeConversation.groupName}
            src={activeConversation.groupAvatar}
            size="xl"
          />
          <div className="w-full flex items-center justify-center gap-2">
            {isEditingName ? (
              <div className="flex w-full max-w-md gap-2">
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
                <button
                  onClick={() => setIsEditingName(false)}
                  className="btn btn-ghost btn-square"
                >
                  <FiX />
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-3xl font-bold text-center">
                  {activeConversation.groupName}
                </h3>
                {isAdmin && (
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="p-1 hover:text-primary transition-colors"
                  >
                    <FiEdit2 size={20} />
                  </button>
                )}
              </>
            )}
          </div>
          <p className="text-sm font-medium opacity-60">
            {activeConversation.participants?.length} members
          </p>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-bold uppercase text-xs tracking-widest opacity-50">
              Members
            </h4>
            {isAdmin && (
              <button
                onClick={() => setIsAddingMember(!isAddingMember)}
                className="btn btn-primary btn-sm gap-2"
              >
                <FiUserPlus size={16} /> Add Member
              </button>
            )}
          </div>

          {isAddingMember && (
            <div className="mb-6 space-y-3 bg-base-200/50 p-4 rounded-2xl">
              <div className="relative">
                <FiSearch
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search to add..."
                  className="input input-bordered w-full pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="max-h-60 overflow-y-auto border border-base-200 rounded-xl bg-base-100">
                {loadingUsers ? (
                  <div className="p-4 text-center text-sm opacity-60">
                    Loading users...
                  </div>
                ) : users.length === 0 ? (
                  <div className="p-4 text-center text-sm opacity-60">
                    No users found
                  </div>
                ) : (
                  users
                    .filter(
                      (u) =>
                        !activeConversation.participants.some(
                          (p) => (p._id || p) === u._id,
                        ),
                    )
                    .map((user) => (
                      <button
                        key={user._id}
                        onClick={() => handleAddMember(user._id)}
                        className="w-full flex items-center justify-between p-3 hover:bg-base-200 transition-colors border-b border-base-200 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar name={user.name} src={user.avatar} size="sm" />
                          <span className="font-medium">{user.name}</span>
                        </div>
                        <FiUserPlus className="text-primary" size={18} />
                      </button>
                    ))
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            {activeConversation.participants?.map((participant) => {
              const isParticipantAdmin = activeConversation.groupAdmins?.some(
                (admin) => (admin._id || admin) === participant._id,
              );
              const isSelf = participant._id === currentUser?._id;

              return (
                <div
                  key={participant._id}
                  className="flex items-center justify-between p-3 hover:bg-base-200 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar
                      name={participant.name}
                      src={participant.avatar}
                      size="sm"
                    />
                    <div>
                      <p className="font-bold">
                        {participant.name} {isSelf && "(You)"}
                      </p>
                      {isParticipantAdmin && (
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          Admin
                        </span>
                      )}
                    </div>
                  </div>
                  {isAdmin && !isSelf && (
                    <button
                      onClick={() => handleRemoveMember(participant._id)}
                      className="btn btn-ghost btn-circle btn-sm text-error"
                      title="Remove Member"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-6 border-t border-base-200 mt-4">
          <button
            onClick={handleLeaveGroup}
            className="btn btn-error btn-outline w-full gap-2"
          >
            <FiLogOut size={20} /> Leave Group
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupInfo;
