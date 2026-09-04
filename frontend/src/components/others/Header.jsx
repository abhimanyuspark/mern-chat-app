import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router";
import toast from "react-hot-toast";
import { logout } from "../../redux/features/auth/authThunk";
import { toggleTheme } from "../../redux/features/theme/themeSlice";
import { FiSun, FiMoon, FiSettings, FiLogOut, FiUsers } from "react-icons/fi";
import Avatar from "../common/Avatar";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { theme } = useSelector((state) => state.theme);

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      toast.success("Logged out successfully");
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(error || "Logout failed");
    }
  };

  return (
    <div className="navbar bg-base-100 border-b border-base-200 h-16 px-4 shadow-sm">
      <div className="flex-1">
        <Link
          to="/"
          className="text-xl font-black text-primary tracking-tighter"
        >
          CHATAPP
        </Link>
      </div>
      <div className="flex gap-3 items-center">
        <button
          onClick={() => dispatch(toggleTheme())}
          className="btn btn-ghost btn-circle"
          aria-label="Toggle theme"
        >
          {theme === "light" ? <FiMoon size={20} /> : <FiSun size={20} />}
        </button>

        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
            <Avatar name={user?.name} size="sm" isOnline={true} />
          </div>
          <ul
            tabIndex={0}
            className="mt-3 z-100 p-2 shadow-xl menu menu-sm dropdown-content bg-base-100 rounded-box w-52 border border-base-200"
          >
            <li className="menu-title px-4 py-2 opacity-60">{user?.name}</li>
            <div className="divider my-0 opacity-20"></div>
            <li>
              <Link to="/create-group" className="py-2">
                <FiUsers /> Create Group
              </Link>
            </li>
            <li>
              <Link to="/settings" className="py-2">
                <FiSettings /> Settings
              </Link>
            </li>
            <li>
              <button onClick={handleLogout} className="text-error py-2">
                <FiLogOut /> Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Header;
