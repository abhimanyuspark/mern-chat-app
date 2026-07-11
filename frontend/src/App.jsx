import { Suspense } from "react";
import { Home, Login, Register } from "./pages";
import Loading from "./components/common/Loading";
import { Route, Routes } from "react-router";
import UserLayout from "./components/others/UserLayout";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getCurrentUser } from "./redux/features/auth/authThunk";
import ProtectedRoute from "./components/others/ProtectedRoute";
import { Toaster } from "react-hot-toast";

function App() {
  const dispatch = useDispatch();

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
            <Route path="/search" element={<Home />} />
          </Route>
        </Route>
      </Routes>

      <Toaster position="top-right" reverseOrder={false} />
    </Suspense>
  );
}

export default App;
