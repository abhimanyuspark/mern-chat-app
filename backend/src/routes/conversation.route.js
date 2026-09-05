import { Router } from "express";
import protect from "../middleware/auth.middleware.js";
import {
  createConversation,
  getConversations,
  getConversationById,
  deleteConversation,
  createGroup,
  updateGroupInfo,
  addGroupMember,
  removeGroupMember,
  leaveGroup,
} from "../controllers/conversation.controller.js";

const router = Router();

router.use(protect);

router.post("/", createConversation);
router.get("/", getConversations);
router.get("/:id", getConversationById);
router.delete("/:id", deleteConversation);

router.post("/group", createGroup);
router.patch("/group/:conversationId", updateGroupInfo);
router.post("/group/:conversationId/add", addGroupMember);
router.post("/group/:conversationId/remove", removeGroupMember);
router.post("/group/:conversationId/leave", leaveGroup);

export default router;
