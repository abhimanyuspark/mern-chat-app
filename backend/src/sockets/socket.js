import { Server } from "socket.io";
import socketAuth from "./auth.socket.js";
import { addUser, removeUser, getOnlineUsers } from "./socketManager.js";

let io;

function initSocket(server) {
  if (io) {
    return io;
  }

  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "*",
      credentials: true,
      methods: ["GET", "POST"],
    },
  });

  io.use(socketAuth);

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}, ${socket.user.name}`);

    addUser(socket.user._id, socket.id);

    io.emit("online-users", getOnlineUsers());

    socket.on("join-conversation", (conversationId) => {
      socket.join(conversationId);

      console.log(`${socket.user.name} joined ${conversationId}`);
    });

    socket.on("leave-conversation", (conversationId) => {
      socket.leave(conversationId);
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);

      removeUser(socket.user._id);

      io.emit("online-users", getOnlineUsers());
    });
  });

  return io;
}

function getIo() {
  if (!io) {
    throw new Error("Socket.io has not been initialized.");
  }
  return io;
}

export { initSocket, getIo };
