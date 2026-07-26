import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { logout } from "../../redux/features/auth/authThunk";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

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
    <div className="navbar bg-base-100 border-b border-base-200 h-16 px-4">
      <div className="flex-1">
        <h1 className="text-xl font-bold text-primary tracking-tight">ChatApp</h1>
      </div>
      <div className="flex-none gap-2">
        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost btn-circle avatar placeholder"
          >
            <div className="bg-neutral text-neutral-content rounded-full p-4 flex items-center justify-center">
              <span>{user?.name?.charAt(0)}</span>
            </div>
          </div>
          <ul
            tabIndex={0}
            className="mt-3 z-100 p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52 border border-base-200"
          >
            <li className="menu-title px-4 py-2 opacity-60">
              Hello, {user?.name}
            </li>
            <div className="divider my-0"></div>
            <li>
              <button onClick={handleLogout} className="text-error">
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Header;
