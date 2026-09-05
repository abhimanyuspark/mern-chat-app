import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router";
import {
  FiArrowLeft,
  FiUser,
  FiMail,
  FiSlash,
  FiCheckCircle,
  FiMessageSquare,
  FiClock,
  FiFileText,
  FiInfo,
} from "react-icons/fi";
import { fetchConversationById } from "../../redux/features/chat/chatThunk";
import { toggleBlockUser } from "../../redux/features/auth/authThunk";
import Avatar from "../../components/common/Avatar";
import Loading from "../../components/common/Loading";
import api from "../../api/axios";
import toast from "react-hot-toast";

const UserInfo = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user: currentUser } = useSelector((state) => state.auth);
  const { activeConversation, loadingConversations, error } = useSelector(
    (state) => state.chat,
  );
  const onlineUsers = useSelector((state) => state.socket.onlineUsers);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchedUser, setFetchedUser] = useState(null);

  useEffect(() => {
    if (conversationId) {
      dispatch(fetchConversationById(conversationId));
    }
  }, [conversationId, dispatch]);

  const targetParticipant = activeConversation?.participants?.find(
    (p) => (p._id || p) !== currentUser?._id,
  );

  const targetUserId =
    targetParticipant?._id ||
    (typeof targetParticipant === "string" ? targetParticipant : null);

  useEffect(() => {
    if (targetUserId) {
      api
        .get(`/users/${targetUserId}`)
        .then((res) => {
          if (res.data?.data) {
            setFetchedUser(res.data.data);
          }
        })
        .catch(() => {});
    }
  }, [targetUserId]);

  if (loadingConversations && !activeConversation) return <Loading />;
  if (error) return <div className="p-4 text-error">{error}</div>;

  const userDetail =
    fetchedUser ||
    (typeof targetParticipant === "object" ? targetParticipant : null);

  const isOnline = userDetail?._id ? onlineUsers.includes(userDetail._id) : false;

  const isBlocked = currentUser?.blockedUsers?.some(
    (id) => (id._id || id)?.toString() === userDetail?._id?.toString(),
  );

  const handleToggleBlock = async () => {
    if (!userDetail?._id) return;

    const actionText = isBlocked ? "unblock" : "block";
    if (
      window.confirm(
        `Are you sure you want to ${actionText} ${userDetail.name || "this user"}?`,
      )
    ) {
      setIsSubmitting(true);
      try {
        const action = await dispatch(toggleBlockUser(userDetail._id));
        if (toggleBlockUser.fulfilled.match(action)) {
          toast.success(
            `User ${isBlocked ? "unblocked" : "blocked"} successfully`,
          );
        } else {
          toast.error(action.payload || `Failed to ${actionText} user`);
        }
      } catch (err) {
        toast.error("Something went wrong");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 md:static md:z-auto w-full h-full bg-base-100 overflow-y-auto flex flex-col">
      {/* Sticky Header */}
      <div className="p-4 border-b border-base-200 sticky top-0 bg-base-100/95 backdrop-blur-sm z-10">
        <div className="w-full max-w-3xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-ghost btn-circle btn-sm"
            title="Go Back"
          >
            <FiArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-bold">User Contact Info</h2>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 md:p-8 flex-1 flex flex-col gap-6 w-full max-w-3xl mx-auto">
        {/* User Profile Banner Card */}
        <div className="p-6 md:p-8 border border-base-200 rounded-3xl bg-base-200/40 flex flex-col sm:flex-row items-center text-center sm:text-left gap-6 shadow-xs">
          <Avatar
            name={userDetail?.name || "User"}
            src={userDetail?.avatar}
            size="xl"
            isOnline={isOnline}
          />
          <div className="flex-1 space-y-2 w-full flex flex-col items-center sm:items-start">
            <div className="flex items-center gap-3">
              <h3 className="text-2xl md:text-3xl font-black tracking-tight">
                {userDetail?.name || "Unknown User"}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider ${
                  isOnline
                    ? "bg-success/10 text-success border border-success/20"
                    : "bg-base-content/10 text-base-content/50"
                }`}
              >
                {isOnline ? "Active Now" : "Offline"}
              </span>

              {isBlocked && (
                <span className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider bg-error/10 text-error border border-error/20">
                  Blocked
                </span>
              )}
            </div>

            {userDetail?.email && (
              <p className="text-sm opacity-60 flex items-center gap-1.5 pt-1">
                <FiMail size={15} /> {userDetail.email}
              </p>
            )}
          </div>
        </div>

        {/* Beautiful About & Bio Card */}
        <div className="p-6 border border-base-200 rounded-3xl bg-base-100 shadow-xs flex flex-col gap-3">
          <div className="flex items-center gap-2 border-b border-base-200 pb-3">
            <FiFileText className="text-primary" size={18} />
            <h4 className="font-bold uppercase text-xs tracking-widest opacity-60">
              About & Bio
            </h4>
          </div>

          <div className="p-4 rounded-2xl bg-base-200/50 border border-base-200/80 mt-1">
            <p className="text-base text-base-content/90 font-medium leading-relaxed italic">
              "{userDetail?.bio || "Hey there! I am using ChatApp."}"
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => navigate(`/chat/${conversationId}`)}
            className="btn btn-primary rounded-2xl gap-2 h-12"
          >
            <FiMessageSquare size={18} />
            <span>Send Message</span>
          </button>

          <button
            onClick={handleToggleBlock}
            disabled={isSubmitting}
            className={`btn rounded-2xl gap-2 h-12 ${
              isBlocked ? "btn-outline btn-success" : "btn-error btn-outline"
            }`}
          >
            <FiSlash size={18} />
            <span>{isBlocked ? "Unblock User" : "Block User"}</span>
          </button>
        </div>

        {/* Account Details Card */}
        <div className="p-6 border border-base-200 rounded-3xl bg-base-100 shadow-xs flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-base-200 pb-3">
            <FiInfo className="text-primary" size={18} />
            <h4 className="font-bold uppercase text-xs tracking-widest opacity-60">
              Account Details
            </h4>
          </div>

          <div className="flex flex-col gap-3.5 divide-y divide-base-200">
            <div className="flex items-center justify-between pt-1">
              <span className="text-sm font-medium opacity-70 flex items-center gap-2">
                <FiUser size={16} /> Display Name
              </span>
              <span className="text-sm font-bold">{userDetail?.name || "N/A"}</span>
            </div>

            <div className="flex items-center justify-between pt-3">
              <span className="text-sm font-medium opacity-70 flex items-center gap-2">
                <FiMail size={16} /> Email Address
              </span>
              <span className="text-sm font-medium">
                {userDetail?.email || "N/A"}
              </span>
            </div>

            <div className="flex items-center justify-between pt-3">
              <span className="text-sm font-medium opacity-70 flex items-center gap-2">
                <FiClock size={16} /> Activity Status
              </span>
              <span className="text-sm font-medium">
                {isOnline ? "Online" : "Offline"}
              </span>
            </div>

            <div className="flex items-center justify-between pt-3">
              <span className="text-sm font-medium opacity-70 flex items-center gap-2">
                <FiCheckCircle size={16} /> Block Status
              </span>
              <span
                className={`text-sm font-bold ${
                  isBlocked ? "text-error" : "text-success"
                }`}
              >
                {isBlocked ? "Blocked" : "Active / Not Blocked"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;
