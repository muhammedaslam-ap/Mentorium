"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
exports.upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(), // Store file in memory temporarily
    limits: { fileSize: 50 * 1024 * 1024 }, // Increased file size limit to 50MB for videos
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            "application/pdf",
            "image/jpeg",
            "image/png",
            "video/mp4",
            "video/avi",
            "video/quicktime",
        ];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error("Only PDF, JPG, PNG, and video files (MP4, AVI, MOV) are allowed"));
        }
        cb(null, true);
    },
});
