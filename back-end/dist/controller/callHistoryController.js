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
exports.CallHistoryController = void 0;
const socketIO_1 = require("../config/socketIO");
const mongoose_1 = __importDefault(require("mongoose"));
class CallHistoryController {
    getCallHistory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { role } = req.user;
                const { userId } = req.query;
                if (!userId || typeof userId !== 'string' || !mongoose_1.default.Types.ObjectId.isValid(userId)) {
                    return res.status(400).json({ message: 'Missing or invalid userId' });
                }
                if (!['tutor', 'student'].includes(role)) {
                    return res.status(403).json({ message: 'Invalid role' });
                }
                const populateField = role === 'tutor' ? 'studentId' : 'tutorId';
                let calls;
                const objectId = new mongoose_1.default.Types.ObjectId(userId);
                if (role === 'tutor') {
                    console.log("here im");
                    calls = yield socketIO_1.CallHistory.find({ tutorId: userId })
                        .populate(populateField, 'name')
                        .sort({ startTime: -1 });
                }
                else {
                    calls = yield socketIO_1.CallHistory.find({ studentId: userId })
                        .populate(populateField, 'name')
                        .sort({ startTime: -1 });
                }
                ;
                console.log('[DEBUG] Role:', role);
                console.log('[DEBUG] Number of calls returned:', calls);
                return res.status(200).json({ data: calls });
            }
            catch (err) {
                console.error('[ERROR] getCallHistory:', err);
                return res.status(500).json({ message: 'Internal server error' });
            }
        });
    }
}
exports.CallHistoryController = CallHistoryController;
