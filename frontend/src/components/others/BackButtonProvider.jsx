import { useEffect } from "react";
import { App as CapacitorApp } from "@capacitor/app";
import { useLocation, useNavigate } from "react-router";

const BackButtonProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handler = CapacitorApp.addListener("backButton", ({ canGoBack }) => {
      if (
        location.pathname === "/" ||
        location.pathname === "/login" ||
        location.pathname === "/register"
      ) {
        CapacitorApp.exitApp();
        return;
      }

      if (canGoBack) {
        navigate(-1);
        return;
      }

      navigate("/");
    });

    return () => {
      handler.then((remove) => remove());
    };
  }, [location.pathname, navigate]);

  return children;
};

export default BackButtonProvider;
