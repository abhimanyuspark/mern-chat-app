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
    <div className="border-b border-base-200 flex items-center justify-between h-16 px-4">
      <h2 className="">ChatApp</h2>
      <div>
        <p>{user?.name}</p>
        <p
          className="cursor-pointer text-blue-600 hover:text-blue-800"
          onClick={handleLogout}
        >
          Logout
        </p>
      </div>
    </div>
  );
};

export default Header;
