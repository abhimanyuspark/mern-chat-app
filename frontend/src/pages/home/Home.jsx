import React from "react";
import useDeviceType from "../../hooks/useDeviceType";
import Desktop from "./Desktop";
import Mobile from "./Mobile";

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
