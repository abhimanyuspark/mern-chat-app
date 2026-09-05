import { Router } from "express";
import protect from "../middleware/auth.middleware.js";
import {
  getUsers,
  searchUsers,
  getUserById,
  updateFcmToken,
  toggleBlockUser,
  updateProfile,
} from "../controllers/user.controller.js";

const router = Router();

router.use(protect);

router.patch("/fcm-token", updateFcmToken);

router.patch("/profile", updateProfile);

router.post("/toggle-block/:userId", toggleBlockUser);

router.get("/", getUsers);

router.get("/search", searchUsers);

router.get("/:id", getUserById);

export default router;
