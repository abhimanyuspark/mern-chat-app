import React from "react";
import { Outlet } from "react-router";
import Header from "./Header";

const UserLayout = () => {
  return (
    <div className="h-dvh w-dvw">
      <Header />
      <div className="h-[calc(100dvh-4rem)]">
        <Outlet />
      </div>
    </div>
  );
};

export default UserLayout;
