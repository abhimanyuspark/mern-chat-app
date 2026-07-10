import { Navigate, Outlet } from "react-router";
import { useSelector } from "react-redux";
import Loading from "../common/Loading";

export default function ProtectedRoute() {
  const { user, loading } = useSelector((state) => state.auth);

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
