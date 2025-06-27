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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const notificationModel_1 = require("../models/notificationModel");
const mongoose_1 = __importDefault(require("mongoose"));
class NotificationController {
    deleteAllNotifications(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const { userId: targetUserId } = req.params;
                if (!userId) {
                    return res.status(401).json({ message: "Unauthorized" });
                }
                if (!targetUserId || !mongoose_1.default.Types.ObjectId.isValid(targetUserId)) {
                    return res.status(400).json({ message: "Invalid userId" });
                }
                if (userId !== targetUserId) {
                    return res.status(403).json({ message: "Forbidden" });
                }
                yield notificationModel_1.NotificationModel.deleteMany({ userId: targetUserId });
                return res.status(200).json({ message: "All notifications deleted" });
            }
            catch (err) {
                console.error("[ERROR] deleteAllNotifications:", err);
                return res.status(500).json({ message: "Internal server error" });
            }
        });
    }
}
exports.NotificationController = NotificationController;
