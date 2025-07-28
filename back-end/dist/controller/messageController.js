"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageController = void 0;
class MessageController {
    constructor(messageService) {
        this.messageService = messageService;
    }
    addReaction(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { messageId } = req.params;
                const { userId, emoji } = req.body;
                const updated = yield this.messageService.addReaction(messageId, userId, emoji);
                res.status(200).json({ message: "Reaction added", updated });
            }
            catch (err) {
                console.error("Error adding reaction:", err);
                res.status(500).json({ message: "Internal server error" });
            }
        });
    }
    removeReaction(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { messageId } = req.params;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const emoji = "❤️";
                if (!userId) {
                    return res.status(401).json({ message: "Unauthorized: User not authenticated" });
                }
                if (!emoji) {
                    return res.status(400).json({ message: "Emoji is required to remove reaction" });
                }
                const updated = yield this.messageService.removeReaction(messageId, userId, emoji);
                res.status(200).json({ message: "Reaction removed", updated });
            }
            catch (err) {
                console.error("Error removing reaction:", err);
                res.status(500).json({ message: "Internal server error" });
            }
        });
    }
    deleteMessage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { messageId } = req.params;
                yield this.messageService.deleteMessage(messageId);
                res.status(200).json({ message: "Message deleted successfully" });
            }
            catch (err) {
                console.error("Error deleting message:", err);
                res.status(500).json({ message: "Internal server error" });
            }
        });
    }
}
exports.MessageController = MessageController;
