import { useEffect } from "react";
import { useDispatch } from "react-redux";
import socket from "../socket/socket";
import { setOnlineUsers } from "../redux/features/socket/socketSlice";

const useSocket = (user) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem("accessToken");

    socket.auth = {
      token,
    };

    socket.connect();

    socket.on("connect", () => {
      console.log("Connected:", socket.id);
    });

    socket.on("online-users", (users) => {
      dispatch(setOnlineUsers(users));
    });

    socket.on("disconnect", () => {
      console.log("Disconnected");
    });

    return () => {
      socket.off("connect");
      socket.off("online-users");
      socket.off("disconnect");

      socket.disconnect();
    };
  }, [user, dispatch]);
};

export default useSocket;
