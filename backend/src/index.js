import express from "express";
import dotenv from "dotenv";
dotenv.config({ quiet: true });
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import connectDB from "./config/connectDB.js";
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import conversationRoutes from "./routes/conversation.route.js";
import messageRoutes from "./routes/message.route.js";
import errorHandler from "./middleware/error.middleware.js";
import { initSocket } from "./sockets/socket.js";

const app = express();
const PORT = process.env.PORT || 3000;
const server = createServer(app);

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use(errorHandler);

connectDB().then(() => {
  initSocket(server);

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
