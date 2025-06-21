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
exports.checkUserBlocked = void 0;
const userModel_1 = require("../models/userModel");
const checkUserBlocked = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({
                status: "error",
                message: "Unauthorized: No user found in request",
            });
            return;
        }
        const { id, } = req.user;
        const user = yield userModel_1.userModel.findById(id);
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
            return;
        }
        if (user.isBlocked) {
            res.status(403).json({
                success: false,
                message: "Access denied: Your account has been blocked",
            });
            return;
        }
        next();
    }
    catch (error) {
        console.error("Error in blocked status middleware:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error while checking blocked status",
        });
        return;
    }
});
exports.checkUserBlocked = checkUserBlocked;
