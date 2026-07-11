import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router";
import { Provider } from "react-redux";
import { store } from "./redux/store.jsx";
import BackButtonProvider from "./components/others/BackButtonProvider.jsx";

createRoot(document.getElementById("root")).render(
  // <StrictMode>
  <Provider store={store}>
    <BrowserRouter>
      <BackButtonProvider>
        <App />
      </BackButtonProvider>
    </BrowserRouter>
  </Provider>,
  // </StrictMode>
);
