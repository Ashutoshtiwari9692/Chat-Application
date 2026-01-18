import Message from "../models/Message.js";
import Chat from "../models/Chat.js";

// @desc    Get messages for a chat
// @route   GET /api/messages/:chatId
// @access  Private
export const getMessages = async (req, res, next) => {
  try {
    const { chatId } = req.params;

    // Verify user is part of the chat
    const chat = await Chat.findById(chatId);

    if (!chat) {
      res.status(404);
      throw new Error("Chat not found");
    }

    const isParticipant = chat.participants.some(
      (p) => p.toString() === req.user._id.toString(),
    );

    if (!isParticipant) {
      res.status(403);
      throw new Error("Not authorized to access this chat");
    }

    const messages = await Message.find({ chatId })
      .populate("senderId", "name avatarUrl")
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
export const sendMessage = async (req, res, next) => {
  try {
    const { chatId, text } = req.body;

    if (!chatId || !text) {
      res.status(400);
      throw new Error("Please provide chatId and text");
    }

    // Verify user is part of the chat
    const chat = await Chat.findById(chatId);

    if (!chat) {
      res.status(404);
      throw new Error("Chat not found");
    }

    const isParticipant = chat.participants.some(
      (p) => p.toString() === req.user._id.toString(),
    );

    if (!isParticipant) {
      res.status(403);
      throw new Error("Not authorized to send message in this chat");
    }

    // Create message
    const message = await Message.create({
      chatId,
      senderId: req.user._id,
      text,
      readBy: [req.user._id],
    });

    // Update chat's last message
    chat.lastMessage = text.substring(0, 50);
    chat.lastMessageTime = message.createdAt;
    await chat.save();

    // Populate sender info
    await message.populate("senderId", "name avatarUrl");

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    next(error);
  }
};
