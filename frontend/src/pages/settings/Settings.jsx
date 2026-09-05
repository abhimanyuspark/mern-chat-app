import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../../redux/features/theme/themeSlice";
import { updateProfile } from "../../redux/features/auth/authThunk";
import {
  FiUser,
  FiSun,
  FiChevronLeft,
  FiEdit3,
  FiCheck,
  FiX,
  FiMail,
  FiFileText,
  FiCamera,
  FiMoon,
} from "react-icons/fi";
import { useNavigate } from "react-router";
import Avatar from "../../components/common/Avatar";
import toast from "react-hot-toast";

const Settings = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { theme } = useSelector((state) => state.theme);
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [showAvatarInput, setShowAvatarInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setBio(user.bio || "");
      setAvatar(user.avatar || "");
    }
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    if (name.trim().length < 3 || name.trim().length > 50) {
      toast.error("Name must be between 3 and 50 characters");
      return;
    }

    setIsSubmitting(true);
    try {
      const action = await dispatch(
        updateProfile({
          name: name.trim(),
          bio: bio.trim(),
          avatar: avatar.trim(),
        }),
      );

      if (updateProfile.fulfilled.match(action)) {
        toast.success("Profile updated successfully!");
        setIsEditing(false);
        setShowAvatarInput(false);
      } else {
        toast.error(action.payload || "Failed to update profile");
      }
    } catch (err) {
      toast.error("An error occurred while updating profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 md:static md:z-auto w-full h-full bg-base-100 overflow-y-auto flex flex-col">
      {/* Sticky Top Header */}
      <div className="p-4 border-b border-base-200 sticky top-0 bg-base-100/95 backdrop-blur-sm z-10">
        <div className="w-full flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-ghost btn-circle btn-sm"
            title="Go Back"
          >
            <FiChevronLeft size={22} />
          </button>
          <h2 className="text-xl font-bold">Settings & Profile</h2>
        </div>
      </div>

      {/* Main Container */}
      <div className="p-4 md:p-8 flex-1 flex flex-col gap-6 w-full max-w-2xl mx-auto">
        {/* Profile Card */}
        <div className="border border-base-200 rounded-3xl bg-base-200/40 p-6 md:p-8 shadow-xs flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-base-300/60 pb-4">
            <h3 className="font-bold text-base uppercase tracking-wider opacity-60 flex items-center gap-2">
              <FiUser className="text-primary" size={18} /> Profile Information
            </h3>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-primary btn-sm rounded-xl gap-2 px-4"
              >
                <FiEdit3 size={15} /> Edit
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsEditing(false);
                  setShowAvatarInput(false);
                  setName(user?.name || "");
                  setBio(user?.bio || "");
                  setAvatar(user?.avatar || "");
                }}
                className="btn btn-ghost btn-circle btn-sm"
                title="Cancel editing"
              >
                <FiX size={18} />
              </button>
            )}
          </div>

          {/* Profile Content */}
          <div className="flex flex-col items-center gap-6">
            {/* Avatar Header Display */}
            <div className="relative group">
              <Avatar
                name={name || user?.name}
                src={avatar || user?.avatar}
                size="xl"
              />
              {isEditing && (
                <button
                  type="button"
                  onClick={() => setShowAvatarInput(!showAvatarInput)}
                  className="absolute bottom-0 right-0 p-2 bg-primary text-primary-content rounded-full shadow-md hover:scale-105 transition-transform"
                  title="Change Avatar URL"
                >
                  <FiCamera size={14} />
                </button>
              )}
            </div>

            {/* Read-Only Profile View */}
            {!isEditing ? (
              <div className="w-full flex flex-col gap-4 text-center sm:text-left">
                <div className="flex flex-col items-center sm:items-start gap-1">
                  <h4 className="text-2xl font-black tracking-tight">{user?.name}</h4>
                  <span className="text-sm opacity-60 flex items-center gap-2">
                    <FiMail size={14} /> {user?.email}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-base-100 border border-base-200/80 space-y-1">
                  <span className="text-xs uppercase font-bold tracking-widest opacity-50 flex items-center gap-1.5">
                    <FiFileText size={12} /> About / Bio
                  </span>
                  <p className="text-sm opacity-90 leading-relaxed italic">
                    "{user?.bio || "No bio added yet."}"
                  </p>
                </div>
              </div>
            ) : (
              /* Editable Profile Form */
              <form onSubmit={handleSaveProfile} className="w-full flex flex-col gap-5">
                {showAvatarInput && (
                  <div className="form-control w-full">
                    <label className="label py-1">
                      <span className="label-text font-bold text-xs uppercase opacity-70">
                        Avatar Image URL
                      </span>
                    </label>
                    <input
                      type="url"
                      placeholder="https://example.com/avatar.png"
                      className="input input-bordered w-full rounded-xl"
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                    />
                  </div>
                )}

                <div className="form-control w-full">
                  <label className="label py-1">
                    <span className="label-text font-bold text-xs uppercase opacity-70">
                      Display Name <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    className="input input-bordered w-full rounded-xl text-base"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div className="form-control w-full">
                  <label className="label py-1">
                    <span className="label-text font-bold text-xs uppercase opacity-70">
                      About / Bio
                    </span>
                  </label>
                  <textarea
                    placeholder="Tell something about yourself..."
                    className="textarea textarea-bordered w-full rounded-xl text-base h-28 leading-relaxed resize-none"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>

                {/* Form Action Buttons */}
                <div className="flex justify-end gap-3 pt-2 border-t border-base-300/60">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setShowAvatarInput(false);
                      setName(user?.name || "");
                      setBio(user?.bio || "");
                      setAvatar(user?.avatar || "");
                    }}
                    className="btn btn-ghost rounded-xl px-5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !name.trim()}
                    className="btn btn-primary rounded-xl px-6 gap-2"
                  >
                    <FiCheck size={16} />
                    <span>{isSubmitting ? "Saving..." : "Save Changes"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Appearance Card */}
        <div className="border border-base-200 rounded-3xl bg-base-100 p-6 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-primary/10 text-primary rounded-2xl">
              {theme === "dark" ? <FiMoon size={20} /> : <FiSun size={20} />}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base">Dark Mode</span>
              <span className="text-xs opacity-60">
                Switch between dark and light themes
              </span>
            </div>
          </div>
          <input
            type="checkbox"
            className="toggle toggle-primary toggle-md"
            checked={theme === "dark"}
            onChange={() => dispatch(toggleTheme())}
          />
        </div>

        {/* App Footer */}
        <div className="mt-auto py-6 text-center opacity-40">
          <p className="text-xs font-semibold tracking-wider">ChatApp v1.0.0</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
