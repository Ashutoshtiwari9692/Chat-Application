import express from "express";
import {
  getUserProfile,
  updateAvatar,
  removeAvatar,
  searchUsers,
} from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

router.get("/me", protect, getUserProfile);
router.put("/me/avatar", protect, upload.single("avatar"), updateAvatar);
router.delete("/me/avatar", protect, removeAvatar);
router.get("/search", protect, searchUsers);

export default router;
