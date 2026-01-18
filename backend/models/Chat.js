import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: {
      type: String,
      default: "",
    },
    lastMessageTime: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Index for faster queries
chatSchema.index({ participants: 1 });

// Ensure only 2 participants for one-to-one chat
chatSchema.pre("save", function (next) {
  if (this.participants.length !== 2) {
    return next(new Error("Chat must have exactly 2 participants"));
  }
  next();
});

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;
