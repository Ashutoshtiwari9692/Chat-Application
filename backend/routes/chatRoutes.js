import express from "express";
import {
  getChats,
  createChat,
  getChatById,
} from "../controllers/chatController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, getChats).post(protect, createChat);

router.get("/:id", protect, getChatById);

export default router;
