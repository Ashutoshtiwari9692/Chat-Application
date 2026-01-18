import Chat from "../models/Chat.js";
import Message from "../models/Message.js";

// @desc    Get all chats for current user
// @route   GET /api/chats
// @access  Private
export const getChats = async (req, res, next) => {
  try {
    const chats = await Chat.find({
      participants: req.user._id,
    })
      .populate("participants", "name email avatarUrl isOnline lastSeen")
      .sort({ lastMessageTime: -1 });

    res.json({
      success: true,
      data: chats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or get existing chat
// @route   POST /api/chats
// @access  Private
export const createChat = async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      res.status(400);
      throw new Error("Please provide userId");
    }

    if (userId === req.user._id.toString()) {
      res.status(400);
      throw new Error("Cannot create chat with yourself");
    }

    // Check if chat already exists
    let chat = await Chat.findOne({
      participants: { $all: [req.user._id, userId] },
    }).populate("participants", "name email avatarUrl isOnline lastSeen");

    if (chat) {
      return res.json({
        success: true,
        data: chat,
      });
    }

    // Create new chat
    chat = await Chat.create({
      participants: [req.user._id, userId],
    });

    chat = await Chat.findById(chat._id).populate(
      "participants",
      "name email avatarUrl isOnline lastSeen",
    );

    res.status(201).json({
      success: true,
      data: chat,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get chat by ID
// @route   GET /api/chats/:id
// @access  Private
export const getChatById = async (req, res, next) => {
  try {
    const chat = await Chat.findById(req.params.id).populate(
      "participants",
      "name email avatarUrl isOnline lastSeen",
    );

    if (!chat) {
      res.status(404);
      throw new Error("Chat not found");
    }

    // Check if user is participant
    const isParticipant = chat.participants.some(
      (p) => p._id.toString() === req.user._id.toString(),
    );

    if (!isParticipant) {
      res.status(403);
      throw new Error("Not authorized to access this chat");
    }

    res.json({
      success: true,
      data: chat,
    });
  } catch (error) {
    next(error);
  }
};
