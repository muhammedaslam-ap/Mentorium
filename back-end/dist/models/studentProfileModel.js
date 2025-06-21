"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentProfileModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const userProfileSchema = new mongoose_1.default.Schema({
    studentId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "user"
    },
    education: {
        type: String,
        required: false
    },
    aboutMe: {
        type: String,
        required: false
    },
    interests: {
        type: String,
        required: false
    }
});
exports.studentProfileModel = mongoose_1.default.model("studentProfile", userProfileSchema);
