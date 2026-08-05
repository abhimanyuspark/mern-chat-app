import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../../redux/features/theme/themeSlice";
import { FiUser, FiMoon, FiSun, FiChevronLeft } from "react-icons/fi";
import { useNavigate } from "react-router";
import Avatar from "../../components/common/Avatar";

const Settings = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { theme } = useSelector((state) => state.theme);
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full bg-base-100 max-w-2xl mx-auto p-4 md:p-6 gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-ghost btn-circle md:hidden"
        >
          <FiChevronLeft size={24} />
        </button>
        <h2 className="text-2xl font-bold">Settings</h2>
      </div>

      {/* Profile Section */}
      <div className="card bg-base-200 shadow-sm overflow-hidden">
        <div className="card-body p-4 md:p-6">
          <h3 className="card-title text-base opacity-70 mb-2 flex items-center gap-2">
            <FiUser /> Profile
          </h3>
          <div className="flex items-center gap-4">
            <Avatar name={user?.name} size="lg" />
            <div>
              <p className="text-lg font-bold">{user?.name}</p>
              <p className="text-sm opacity-60">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Appearance Section */}
      <div className="card bg-base-200 shadow-sm overflow-hidden">
        <div className="card-body p-4 md:p-6">
          <h3 className="card-title text-base opacity-70 mb-4 flex items-center gap-2">
            <FiSun /> Appearance
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-medium">Dark Mode</span>
              <span className="text-xs opacity-60">Adjust the appearance of the application</span>
            </div>
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={theme === "dark"}
              onChange={() => dispatch(toggleTheme())}
            />
          </div>
        </div>
      </div>

      {/* App Info */}
      <div className="mt-auto py-6 text-center opacity-40">
        <p className="text-xs">ChatApp v1.0.0</p>
      </div>
    </div>
  );
};

export default Settings;
