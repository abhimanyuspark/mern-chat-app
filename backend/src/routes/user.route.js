import { Router } from "express";
import protect from "../middleware/auth.middleware.js";
import {
  getUsers,
  searchUsers,
  getUserById,
  updateFcmToken,
} from "../controllers/user.controller.js";

const router = Router();

router.use(protect);

router.patch("/fcm-token", updateFcmToken);

router.get("/", getUsers);

router.get("/search", searchUsers);

router.get("/:id", getUserById);

export default router;
