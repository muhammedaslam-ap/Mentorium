"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const messageSchema = new mongoose_1.default.Schema({
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
exports.MessageModel = mongoose_1.default.model("Message", messageSchema);
