import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import { errorHandler, notFound } from "./middlewares/errorMiddleware.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import User from "./models/User.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  },
});

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Chat App API is running!" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Socket.io connection handling
const onlineUsers = new Map(); // userId -> socketId
const typingUsers = new Map(); // chatId -> Set of userIds

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // User joins
  socket.on("join", async (userId) => {
    try {
      onlineUsers.set(userId, socket.id);
      socket.userId = userId;

      // Update user online status in database
      await User.findByIdAndUpdate(userId, { isOnline: true });

      // Broadcast online users to all clients
      io.emit("online_users", Array.from(onlineUsers.keys()));

      console.log(`User ${userId} joined`);
    } catch (error) {
      console.error("Error in join event:", error);
    }
  });

  // Send private message
  socket.on("private_message", async (data) => {
    try {
      const { recipientId, message } = data;

      // Send to recipient if online
      const recipientSocketId = onlineUsers.get(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("private_message", message);
      }

      // Also send back to sender for confirmation
      socket.emit("message_sent", message);
    } catch (error) {
      console.error("Error in private_message event:", error);
    }
  });

  // Typing indicator
  socket.on("typing", (data) => {
    try {
      const { chatId, userId, recipientId, isTyping } = data;

      if (!typingUsers.has(chatId)) {
        typingUsers.set(chatId, new Set());
      }

      const chatTypers = typingUsers.get(chatId);

      if (isTyping) {
        chatTypers.add(userId);
      } else {
        chatTypers.delete(userId);
      }

      // Send to recipient
      const recipientSocketId = onlineUsers.get(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("user_typing", {
          chatId,
          userId,
          isTyping,
        });
      }
    } catch (error) {
      console.error("Error in typing event:", error);
    }
  });

  // User disconnects
  socket.on("disconnect", async () => {
    try {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);

        // Update user online status and last seen
        await User.findByIdAndUpdate(socket.userId, {
          isOnline: false,
          lastSeen: new Date(),
        });

        // Broadcast updated online users
        io.emit("online_users", Array.from(onlineUsers.keys()));

        console.log(`User ${socket.userId} disconnected`);
      }
    } catch (error) {
      console.error("Error in disconnect event:", error);
    }
  });
});

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`,
  );
});
