import { Suspense } from "react";
import {
  Home,
  Login,
  Register,
  Settings,
  GroupInfo,
  CreateGroup,
} from "./pages";
import Loading from "./components/common/Loading";
import { Route, Routes } from "react-router";
import UserLayout from "./components/others/UserLayout";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCurrentUser } from "./redux/features/auth/authThunk";
import ProtectedRoute from "./components/others/ProtectedRoute";
import { Toaster } from "react-hot-toast";
import { useEffect as useIsomorphicLayoutEffect } from "react";
import usePushNotifications from "./hooks/usePushNotifications";

function App() {
  const dispatch = useDispatch();
  const { theme } = useSelector((state) => state.theme);

  // Initialize push notifications
  usePushNotifications();

  useIsomorphicLayoutEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      dispatch(getCurrentUser());
    }
  }, [dispatch]);

  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<UserLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/chat/:conversationId" element={<Home />} />
            <Route path="/chat/:conversationId/info" element={<GroupInfo />} />
            <Route path="/search" element={<Home />} />
            <Route path="/create-group" element={<CreateGroup />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>
      </Routes>

      <Toaster position="top-right" reverseOrder={false} />
    </Suspense>
  );
}

export default App;
