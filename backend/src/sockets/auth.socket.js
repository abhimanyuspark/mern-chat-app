import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Unauthorized"));
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decoded.id).select(
      "-password -refreshToken",
    );

    if (!user) {
      return next(new Error("User not found"));
    }

    socket.user = user;

    next();
  } catch (error) {
    next(new Error("Invalid Token"));
  }
};

export default socketAuth;
