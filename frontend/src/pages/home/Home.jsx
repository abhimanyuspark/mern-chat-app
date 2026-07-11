import React from "react";
import useDeviceType from "../../hooks/useDeviceType";
import Desktop from "../../components/chat/desktop/Desktop";
import Mobile from "../../components/chat/mobile/Mobile";

const Home = () => {
  const { isDesktop, isMobile, isTablet } = useDeviceType();

  return (
    <>
      {isDesktop && <Desktop />}
      {isTablet && <Desktop />}
      {isMobile && <Mobile />}
    </>
  );
};

export default Home;
