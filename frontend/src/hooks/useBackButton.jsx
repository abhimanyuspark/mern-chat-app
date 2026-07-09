import React, { useEffect } from "react";

const useBackButton = (isOpen, onClose) => {
  useEffect(() => {
    if (!isOpen) return;

    window.history.pushState({ backHandler: true }, "");

    const handlePopState = () => {
      onClose();
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isOpen, onClose]);
};

export default useBackButton;
