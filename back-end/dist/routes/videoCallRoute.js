"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const crypto_1 = require("crypto");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const router = express_1.default.Router();
const appID = parseInt(process.env.ZEGOCLOUD_APP_ID || "", 10);
const serverSecret = process.env.ZEGOCLOUD_SERVER_SECRET || "";
router.get("/zego-token", (req, res) => {
    const { roomId, userId, userName } = req.query;
    if (!roomId || !userId || !userName) {
        res.status(400).json({ error: "Missing parameters: roomId, userId, userName" });
        return;
    }
    if (!appID || !serverSecret || serverSecret.length !== 32) {
        res.status(500).json({ error: "Zego credentials not properly configured" });
        return;
    }
    const effectiveTimeInSeconds = 3600;
    const expireTime = Math.floor(Date.now() / 1000) + effectiveTimeInSeconds;
    const ctime = Math.floor(Date.now() / 1000);
    const nonce = (0, crypto_1.randomBytes)(8).toString("hex");
    const payload = {
        room_id: roomId,
        privilege: { "1": 1, "2": 1 }, // 1 = login, 2 = publish
        stream_id_list: null,
    };
    const tokenJson = {
        app_id: appID,
        user_id: userId,
        nonce,
        ctime,
        expire: expireTime,
        payload: JSON.stringify(payload),
    };
    try {
        const iv = (0, crypto_1.randomBytes)(16);
        const cipher = (0, crypto_1.createCipheriv)("aes-128-cbc", Buffer.from(serverSecret, "hex").slice(0, 16), iv);
        let encrypted = cipher.update(JSON.stringify(tokenJson), "utf8", "binary");
        encrypted += cipher.final("binary");
        const encryptedBuffer = Buffer.from(encrypted, "binary");
        const expireTimeBuffer = Buffer.alloc(8);
        expireTimeBuffer.writeBigInt64BE(BigInt(expireTime));
        const ivLengthBuffer = Buffer.alloc(2);
        ivLengthBuffer.writeUInt16BE(iv.length);
        const encryptedLengthBuffer = Buffer.alloc(2);
        encryptedLengthBuffer.writeUInt16BE(encryptedBuffer.length);
        const tokenBuffer = Buffer.concat([
            expireTimeBuffer,
            ivLengthBuffer,
            iv,
            encryptedLengthBuffer,
            encryptedBuffer,
        ]);
        const token = "04" + tokenBuffer.toString("base64");
        res.status(200).json({ token, appID });
    }
    catch (err) {
        console.error("Error generating Zego token:", err);
        res.status(500).json({ error: "Token generation failed" });
    }
});
exports.default = router;
