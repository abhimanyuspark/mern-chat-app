import { Router } from "express";
import protect from "../middleware/auth.middleware.js";
import {
  sendMessage,
  getMessages,
  deleteMessage,
} from "../controllers/message.controller.js";

const router = Router();

router.use(protect);

router.post("/", sendMessage);

router.get("/:conversationId", getMessages);

router.delete("/:id", deleteMessage);

export default router;
