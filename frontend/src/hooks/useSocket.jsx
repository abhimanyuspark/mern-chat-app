import { useEffect } from "react";
import socket from "../socket/socket";

const useSocket = (user) => {
  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem("accessToken");

    socket.auth = {
      token,
    };

    socket.on("connect_error", (error) => {
      console.log(error.message);
    });

    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, [user]);
};

export default useSocket;
