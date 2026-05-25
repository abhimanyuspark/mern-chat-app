import { Suspense } from "react";
import { Home } from "./pages";
import Loading from "./components/common/Loading";

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Home />
    </Suspense>
  );
}

export default App;
