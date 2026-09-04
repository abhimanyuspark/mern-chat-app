import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import {
  FiArrowLeft,
  FiSearch,
  FiCheck,
  FiX,
  FiUsers,
  FiAlertCircle,
} from "react-icons/fi";
import { fetchUsers, createGroup } from "../../redux/features/chat/chatThunk";
import { validator } from "../../utils/validator";
import Avatar from "../../components/common/Avatar";
import toast from "react-hot-toast";

const CreateGroup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { users, loadingUsers } = useSelector((state) => state.chat);

  const [groupName, setGroupName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      dispatch(fetchUsers(searchTerm.trim()));
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [dispatch, searchTerm]);

  const handleGroupNameChange = (e) => {
    setGroupName(e.target.value);
    if (errors?.groupName) {
      setErrors((prev) => ({ ...prev, groupName: "" }));
    }
  };

  const toggleUser = (user) => {
    if (selectedUsers.find((u) => u._id === user._id)) {
      setSelectedUsers(selectedUsers.filter((u) => u._id !== user._id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
    if (errors?.members) {
      setErrors((prev) => ({ ...prev, members: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Perform validation using central validator.js
    const { errors: valErrors, validate: hasErrors } = validator({
      groupName,
      selectedUsers,
    });

    if (hasErrors) {
      setErrors(valErrors);
      if (valErrors.groupName) {
        toast.error(valErrors.groupName);
      } else if (valErrors.members) {
        toast.error(valErrors.members);
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const action = await dispatch(
        createGroup({
          name: groupName.trim(),
          participants: selectedUsers.map((u) => u._id),
        }),
      );

      if (createGroup.fulfilled.match(action)) {
        toast.success("Group created successfully!");
        const newGroup = action.payload;
        if (newGroup?._id) {
          navigate(`/chat/${newGroup._id}`);
        } else {
          navigate("/");
        }
      } else {
        toast.error(action.payload || "Failed to create group.");
      }
    } catch (err) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="fixed inset-0 z-50 md:static md:z-auto w-full h-full bg-base-100 overflow-y-auto flex flex-col"
    >
      {/* Sticky Header */}
      <div className="p-4 border-b border-base-200 sticky top-0 bg-base-100/95 backdrop-blur-sm z-10">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn btn-ghost btn-circle btn-sm"
              title="Go Back"
            >
              <FiArrowLeft size={20} />
            </button>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FiUsers size={22} className="text-primary shrink-0" />
              <span>Create New Group</span>
            </h2>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary btn-sm px-5"
          >
            {isSubmitting ? "Creating..." : "Create"}
          </button>
        </div>
      </div>

      {/* Main Form Content */}
      <div className="p-4 md:p-8 flex-1 flex flex-col gap-6 w-full max-w-3xl mx-auto">
        {/* Group Name Section */}
        <div className="p-6 border border-base-200 rounded-2xl bg-base-200/30 flex flex-col gap-2 shadow-xs">
          <div className="form-control w-full flex gap-4 flex-col">
            <label className="label">
              <span className="label-text font-bold text-base">
                Group Name <span className="text-error">*</span>
              </span>
            </label>
            <input
              type="text"
              placeholder="Enter group name (e.g., Project Team)"
              className={`input input-bordered w-full text-lg ${
                errors.groupName ? "input-error" : ""
              }`}
              value={groupName}
              onChange={handleGroupNameChange}
              autoFocus
            />
            {errors.groupName && (
              <label className="label">
                <span className="label-text-alt text-error flex items-center gap-1 font-medium">
                  <FiAlertCircle size={14} /> {errors.groupName}
                </span>
              </label>
            )}
          </div>
        </div>

        {/* Add Members Section */}
        <div className="p-6 border border-base-200 rounded-2xl bg-base-100 shadow-xs flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold uppercase text-xs tracking-widest opacity-60">
              Add Members <span className="text-error">*</span>
            </h3>
            <span
              className={`text-xs font-semibold ${
                selectedUsers.length >= 2 ? "text-success" : "text-warning"
              }`}
            >
              {selectedUsers.length}/2 min selected
            </span>
          </div>

          {/* Search Box */}
          <div className="relative flex items-center w-full">
            <FiSearch
              className="absolute left-3.5 z-10 pointer-events-none text-base-content/70"
              size={18}
            />
            <input
              type="text"
              placeholder="Search users by name or email..."
              className="input input-bordered w-full pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                }
              }}
            />
          </div>

          {errors.members && (
            <p className="text-xs text-error flex items-center gap-1 font-medium">
              <FiAlertCircle size={14} /> {errors.members}
            </p>
          )}

          {/* Selected Members Chips */}
          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2 py-2 border-b border-base-200">
              {selectedUsers.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium"
                >
                  <Avatar name={user.name} src={user.avatar} size="xs" />
                  <span>{user.name}</span>
                  <button
                    type="button"
                    onClick={() => toggleUser(user)}
                    className="p-0.5 hover:bg-primary/20 rounded-full transition-colors"
                    title={`Remove ${user.name}`}
                  >
                    <FiX size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* User Suggestions List */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold opacity-50 uppercase tracking-wider">
              Suggested Users
            </p>
            <div className="max-h-80 overflow-y-auto rounded-xl border border-base-200">
              {loadingUsers ? (
                <div className="p-6 text-center text-sm opacity-60">
                  Loading users...
                </div>
              ) : users.length === 0 ? (
                <div className="p-6 text-center text-sm opacity-60">
                  No users found
                </div>
              ) : (
                users.map((user) => {
                  const isSelected = selectedUsers.some(
                    (u) => u._id === user._id,
                  );
                  return (
                    <button
                      key={user._id}
                      type="button"
                      onClick={() => toggleUser(user)}
                      className={`w-full flex items-center justify-between p-3.5 hover:bg-base-200 transition-colors border-b border-base-200 last:border-0 ${
                        isSelected ? "bg-primary/5" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar name={user.name} src={user.avatar} size="sm" />
                        <div className="text-left">
                          <p className="font-semibold text-sm">{user.name}</p>
                          {user.email && (
                            <p className="text-xs opacity-50">{user.email}</p>
                          )}
                        </div>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center border transition-colors ${
                          isSelected
                            ? "bg-primary border-primary text-primary-content"
                            : "border-base-300"
                        }`}
                      >
                        {isSelected && <FiCheck size={14} />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons at bottom */}
        <div className="flex justify-end gap-3 pt-2 pb-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn btn-ghost px-6"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary px-8"
          >
            {isSubmitting ? "Creating Group..." : "Create Group"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default CreateGroup;
