import { useEffect, useState } from "react";

const getDeviceType = () => {
  const width = window.innerWidth;

  if (width < 768) {
    return "mobile";
  }

  if (width >= 768 && width < 1024) {
    return "tablet";
  }

  return "desktop";
};

const useDeviceType = () => {
  const [deviceType, setDeviceType] = useState(getDeviceType());

  useEffect(() => {
    const handleResize = () => {
      setDeviceType(getDeviceType());
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return {
    deviceType,
    isMobile: deviceType === "mobile",
    isTablet: deviceType === "tablet",
    isDesktop: deviceType === "desktop",
  };
};

export default useDeviceType;
