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
      updateGroupInfo({
        conversationId: activeConversation._id,
        name: newName,
      }),
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
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="fixed inset-0 z-50 md:static md:z-auto w-full h-full bg-base-100 overflow-y-auto flex flex-col">
      {/* Top sticky header */}
      <div className="p-4 border-b border-base-200 sticky top-0 bg-base-100/95 backdrop-blur-sm z-10">
        <div className="w-full flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-ghost btn-circle btn-sm"
          >
            <FiArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-bold">Group Info</h2>
        </div>
      </div>

      {/* Main Content Area - Centered & Responsive Container */}
      <div className="p-4 md:p-8 flex-1 flex flex-col gap-6 w-full max-w-3xl mx-auto">
        {/* Group Profile Header - Responsive Card Layout */}
        <div className="p-6 md:p-8 border border-base-200 rounded-2xl bg-base-200/30 flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-6 shadow-xs">
          <Avatar
            name={activeConversation.groupName}
            src={activeConversation.groupAvatar}
            size="xl"
          />
          <div className="flex-1 space-y-2 w-full flex flex-col items-center sm:items-start">
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
              <div className="flex items-center justify-center sm:justify-start gap-3 w-full">
                <h3 className="text-2xl md:text-3xl font-bold">
                  {activeConversation.groupName}
                </h3>
                {isAdmin && (
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="p-1.5 hover:text-primary transition-colors rounded-lg hover:bg-base-200"
                    title="Edit Group Name"
                  >
                    <FiEdit2 size={18} />
                  </button>
                )}
              </div>
            )}
            <p className="text-sm font-medium opacity-60">
              {activeConversation.participants?.length} members
            </p>
          </div>
        </div>

        {/* Members Section */}
        <div className="p-4 md:p-6 border border-base-200 rounded-2xl bg-base-100 shadow-xs">
          <div className="flex justify-between items-center mb-6 gap-2">
            <h4 className="font-bold uppercase text-xs tracking-widest opacity-50">
              Members ({activeConversation.participants?.length || 0})
            </h4>
            {isAdmin && (
              <button
                onClick={() => setIsAddingMember(!isAddingMember)}
                className="btn btn-primary btn-sm gap-2"
              >
                <FiUserPlus size={16} />{" "}
                <span className="hidden sm:inline">Add Member</span>
              </button>
            )}
          </div>

          {isAddingMember && (
            <div className="mb-6 space-y-3 bg-base-200/50 p-4 rounded-2xl border border-base-200">
              <div className="relative flex items-center w-full">
                <FiSearch
                  className="absolute left-3.5 z-10 pointer-events-none text-base-content/70"
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
                        className="w-full flex items-center justify-between p-3 hover:bg-base-200 transition-colors border-b border-base-200 last:border-0 text-left"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar
                            name={user.name}
                            src={user.avatar}
                            size="sm"
                          />
                          <span className="font-medium text-sm md:text-base">
                            {user.name}
                          </span>
                        </div>
                        <FiUserPlus
                          className="text-primary shrink-0"
                          size={18}
                        />
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
                  className="flex items-center justify-between p-3 hover:bg-base-200 rounded-xl transition-colors gap-2"
                >
                  <div className="flex items-center gap-3 md:gap-4 min-w-0">
                    <Avatar
                      name={participant.name}
                      src={participant.avatar}
                      size="sm"
                    />
                    <div className="min-w-0 text-left">
                      <p className="font-bold text-sm md:text-base truncate">
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
                      className="btn btn-ghost btn-circle btn-sm text-error shrink-0"
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

        {/* Leave Group Section */}
        <div className="pt-2 pb-8 flex justify-center">
          <button
            onClick={handleLeaveGroup}
            className="btn btn-error btn-outline w-full gap-4"
          >
            <FiLogOut size={20} /> Leave Group
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupInfo;
