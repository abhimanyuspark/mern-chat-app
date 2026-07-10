import { Router } from "express";
import protect from "../middleware/auth.middleware.js";
import {
  createConversation,
  getConversations,
  getConversationById,
} from "../controllers/conversation.controller.js";

const router = Router();

router.use(protect);

router.post("/", createConversation);
router.get("/", getConversations);
router.get("/:id", getConversationById);

export default router;
