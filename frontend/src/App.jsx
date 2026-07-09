import { Suspense } from "react";
import { Home } from "./pages";
import Loading from "./components/common/Loading";
import { Route, Routes } from "react-router";
import UserLayout from "./components/others/UserLayout";

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route element={<UserLayout />}>
          <Route path="/" element={<Home />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
