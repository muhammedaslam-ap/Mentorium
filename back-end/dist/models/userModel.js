"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userModel = void 0;
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: {
        type: String,
        enum: ["admin", "student", "tutor"],
        default: "student",
    },
    isBlocked: { type: Boolean, default: false },
    isAccepted: { type: Boolean, default: false },
}, { timestamps: true });
exports.userModel = (0, mongoose_1.model)("user", userSchema);
