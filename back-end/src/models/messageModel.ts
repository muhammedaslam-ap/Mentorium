import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  communityId: {
    type: String,
    required: false,
    index: true, 
  },
  privateChatId: {
    type: String,
    required: false,
    index: true, 
  },
  sender: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: false,
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["sent", "delivered", "read"],
    default: "sent",
  },
  imageUrl: { type: String, required: false },
});

export const MessageModel = mongoose.model("Message",messageSchema)