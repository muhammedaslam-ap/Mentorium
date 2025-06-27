"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.initializeSocket = exports.CallHistory = void 0;
const socket_io_1 = require("socket.io");
const mongoose_1 = __importStar(require("mongoose"));
const tutorServices_1 = require("../services/tutorServices");
const tutorRepository_1 = require("../repositories/tutorRepository");
const course_1 = require("../models/course");
const userModel_1 = require("../models/userModel");
const buyCourseModal_1 = require("../models/buyCourseModal");
const notificationModel_1 = require("../models/notificationModel");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// ZegoCloud configuration
const ZEGO_APP_ID = process.env.ZEGOCLOUD_APP_ID || "0";
const ZEGO_SERVER_SECRET = process.env.ZEGOCLOUD_SERVER_SECRET || "";
// Generate ZegoCloud token
const generateZegoToken = (appId, userId, serverSecret, effectiveTimeInSeconds, roomId) => {
    const payload = {
        app_id: parseInt(appId),
        user_id: userId,
        nonce: Math.floor(Math.random() * 1000000),
        ctime: Math.floor(Date.now() / 1000),
        expire: Math.floor(Date.now() / 1000) + effectiveTimeInSeconds,
        room_id: roomId,
    };
    // Ensure ZEGO_SERVER_SECRET is a string for jwt.sign
    if (!serverSecret) {
        console.error("ZEGO_SERVER_SECRET is not defined. Token generation will fail.");
        // Return a dummy token or throw an error based on your error handling policy
        return `dummy_token_error_no_secret_${userId}`;
    }
    return jsonwebtoken_1.default.sign(payload, serverSecret, { algorithm: 'HS256', noTimestamp: true });
};
// CallHistory Schema (modified to remove endTime and status)
const callHistorySchema = new mongoose_1.default.Schema({
    tutorId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'user', required: true },
    studentId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'user', required: true },
    courseId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Course', required: true },
    startTime: { type: Date, required: true, default: Date.now },
    courseName: { type: String, required: true },
});
// Add index for performance
callHistorySchema.index({ tutorId: 1, studentId: 1, startTime: -1 });
exports.CallHistory = mongoose_1.default.model('CallHistory', callHistorySchema);
const messageSchema = new mongoose_1.Schema({
    communityId: { type: String },
    privateChatId: { type: String },
    sender: { type: String, required: true },
    content: { type: String, default: "" },
    timestamp: { type: String, required: true },
    status: { type: String, enum: ["sent", "delivered", "read"], default: "sent" },
    imageUrl: { type: String, default: "" },
});
const MessageModel = mongoose_1.default.model("Message", messageSchema);
const tutorRepository = new tutorRepository_1.TutorRepository();
const tutorService = new tutorServices_1.TutorService(tutorRepository);
// Map to track rooms each socket is in
const socketRooms = new Map();
const connectedUsers = new Map();
const fetchPrivateChats = (tutorId, socket) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(`[${new Date().toISOString()}] Fetching private chats for tutor ${tutorId}`);
        const messages = yield MessageModel.find({
            privateChatId: { $regex: `private_.*_.*_${tutorId}$` },
        })
            .sort({ timestamp: -1 })
            .lean();
        console.log(`[${new Date().toISOString()}] Found ${messages.length} messages for tutor ${tutorId}`);
        const chats = [];
        const uniqueChatIds = [...new Set(messages.map((msg) => msg.privateChatId))];
        console.log(`[${new Date().toISOString()}] Unique chat IDs from messages: ${uniqueChatIds.length}`);
        for (const privateChatId of uniqueChatIds) {
            if (privateChatId) {
                const parts = privateChatId.split("_");
                if (parts.length >= 4) {
                    const courseId = parts[1];
                    const studentId = parts[2];
                    const latestMessage = messages.find((msg) => msg.privateChatId === privateChatId);
                    const course = yield course_1.courseModel.findById(courseId).lean();
                    const student = yield userModel_1.userModel.findById(studentId).lean();
                    console.log(`[${new Date().toISOString()}] Processing message-based chat ${privateChatId}:`, {
                        courseId,
                        studentId,
                        courseFound: !!course,
                        studentFound: !!student,
                        latestMessage: (latestMessage === null || latestMessage === void 0 ? void 0 : latestMessage.content) || "No content",
                    });
                    if (course && student && latestMessage) {
                        chats.push({
                            privateChatId,
                            courseId,
                            studentId,
                            courseTitle: course.title || "Unknown Course",
                            studentName: student.name || "Unknown Student",
                            latestMessage: {
                                content: latestMessage.content || "",
                                timestamp: latestMessage.timestamp.toString(),
                                imageUrl: latestMessage.imageUrl || undefined,
                            },
                            unreadCount: 0,
                        });
                    }
                }
                else {
                    console.warn(`[${new Date().toISOString()}] Invalid privateChatId format: ${privateChatId}`);
                }
            }
        }
        const courses = yield course_1.courseModel.find({ tutorId }).lean();
        const courseIds = courses.map((course) => course._id.toString());
        console.log(`[${new Date().toISOString()}] Found ${courses.length} courses for tutor ${tutorId}:`, courseIds);
        const purchases = yield buyCourseModal_1.purchaseModel
            .find({
            "purchase.courseId": { $in: courseIds },
            "purchase.status": "completed",
        })
            .lean();
        console.log(`[${new Date().toISOString()}] Found ${purchases.length} completed purchases for tutor's courses`);
        for (const purchase of purchases) {
            const student = yield userModel_1.userModel.findById(purchase.userId).lean();
            if (!student) {
                console.log(`[${new Date().toISOString()}] Student not found for userId ${purchase.userId}`);
                continue;
            }
            for (const purchaseItem of purchase.purchase) {
                if (courseIds.includes(purchaseItem.courseId.toString()) && purchaseItem.status === "completed") {
                    const course = courses.find((c) => c._id.toString() === purchaseItem.courseId.toString());
                    if (!course)
                        continue;
                    const privateChatId = `private_${purchaseItem.courseId}_${purchase.userId}_${tutorId}`;
                    if (!uniqueChatIds.includes(privateChatId)) {
                        chats.push({
                            privateChatId,
                            courseId: purchaseItem.courseId.toString(),
                            studentId: purchase.userId.toString(),
                            courseTitle: course.title || "Unknown Course",
                            studentName: student.name || "Unknown Student",
                            latestMessage: null,
                            unreadCount: 0,
                        });
                        console.log(`[${new Date().toISOString()}] Added purchase-based chat: ${privateChatId}`);
                    }
                }
            }
        }
        chats.sort((a, b) => {
            const aTime = a.latestMessage ? new Date(a.latestMessage.timestamp).getTime() : 0;
            const bTime = b.latestMessage ? new Date(b.latestMessage.timestamp).getTime() : 0;
            return bTime - aTime;
        });
        console.log(`[${new Date().toISOString()}] Sending ${chats.length} chats to tutor ${tutorId}:`, chats);
        socket.emit("private_chats", { chats });
        console.log(`[${new Date().toISOString()}] Sent private chats to tutor ${tutorId}`);
    }
    catch (err) {
        console.error(`[${new Date().toISOString()}] Error fetching private chats for tutor ${tutorId}:`, {
            error: err.message,
            stack: err.stack,
        });
        socket.emit("error", { message: "Failed to fetch private chats" });
    }
});
const initializeSocket = (server) => {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:5173",
            methods: ["GET", "POST"],
            credentials: true,
        },
    });
    io.on("connection", (socket) => {
        console.log(`[${new Date().toISOString()}] New client connected: ${socket.id}`);
        socketRooms.set(socket.id, new Set());
        const queryUserId = socket.handshake.query.userId;
        if (queryUserId) {
            connectedUsers.set(queryUserId, { userId: queryUserId, socketId: socket.id });
            console.log(`[${new Date().toISOString()}] User ${queryUserId} registered with socket ${socket.id} from handshake`);
        }
        socket.on("join_user", (userId, callback) => {
            var _a;
            if (!userId) {
                console.error(`[${new Date().toISOString()}] join_user: No userId provided`);
                socket.emit("error", { message: "User ID is required" });
                return;
            }
            console.log(`[${new Date().toISOString()}] Socket ${socket.id} joining user room ${userId}`);
            socket.join(userId);
            (_a = socketRooms.get(socket.id)) === null || _a === void 0 ? void 0 : _a.add(userId);
            if (!connectedUsers.has(userId)) {
                connectedUsers.set(userId, { userId, socketId: socket.id });
                console.log(`[${new Date().toISOString()}] User ${userId} registered via join_user with socket ${socket.id}`);
            }
            else {
                const existingUser = connectedUsers.get(userId);
                if (existingUser && existingUser.socketId !== socket.id) {
                    console.log(`[${new Date().toISOString()}] Updating socketId for user ${userId}: ${existingUser.socketId} -> ${socket.id}`);
                    connectedUsers.set(userId, { userId, socketId: socket.id });
                }
            }
            io.in(userId)
                .allSockets()
                .then((sockets) => {
                console.log(`[${new Date().toISOString()}] Sockets in room ${userId}:`, sockets.size);
                fetchPrivateChats(userId, socket);
                if (callback)
                    callback();
            })
                .catch((err) => {
                console.error(`[${new Date().toISOString()}] Error joining user room ${userId}:`, err);
                socket.emit("error", { message: "Failed to join user room" });
            });
        });
        socket.on("join_room", (roomId) => {
            var _a;
            if (!roomId) {
                console.error(`[${new Date().toISOString()}] join_room: No roomId provided`);
                socket.emit("error", { message: "Room ID is required" });
                return;
            }
            console.log(`[${new Date().toISOString()}] Socket ${socket.id} joining room ${roomId}`);
            socket.join(roomId);
            (_a = socketRooms.get(socket.id)) === null || _a === void 0 ? void 0 : _a.add(roomId);
            socket.emit("joined_room");
            console.log(`[${new Date().toISOString()}] Socket ${socket.id} joined room ${roomId}`);
        });
        socket.on("join_community", (communityId) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            if (!communityId) {
                console.error(`[${new Date().toISOString()}] No communityId provided`);
                socket.emit("error", { message: "Community ID is required" });
                return;
            }
            try {
                socket.join(communityId);
                (_a = socketRooms.get(socket.id)) === null || _a === void 0 ? void 0 : _a.add(communityId);
                console.log(`[${new Date().toISOString()}] User ${socket.id} joined community: ${communityId}`);
                const messages = yield MessageModel.find({ communityId })
                    .sort({ timestamp: 1 })
                    .limit(50)
                    .lean();
                socket.emit("message_history", messages);
            }
            catch (error) {
                console.error(`[${new Date().toISOString()}] Error joining community ${communityId}:`, error.message);
                socket.emit("error", { message: "Failed to join community" });
            }
        }));
        socket.on("join_private_chat", (_a) => __awaiter(void 0, [_a], void 0, function* ({ courseId, studentId, tutorId }) {
            var _b;
            const privateChatId = `private_${courseId}_${studentId}_${tutorId}`;
            socket.join(privateChatId);
            (_b = socketRooms.get(socket.id)) === null || _b === void 0 ? void 0 : _b.add(privateChatId);
            console.log(`[${new Date().toISOString()}] User ${socket.id} joined private chat ${privateChatId}`);
            try {
                const messages = yield MessageModel.find({ privateChatId })
                    .sort({ timestamp: 1 })
                    .limit(50)
                    .lean();
                socket.emit("private_message_history", messages);
            }
            catch (err) {
                console.error(`[${new Date().toISOString()}] Error fetching private message history for chat ${privateChatId}:`, err.message);
                socket.emit("error", { message: "Failed to fetch private chat history" });
            }
        }));
        socket.on("fetch_private_chats", (_a) => __awaiter(void 0, [_a], void 0, function* ({ tutorId }) {
            yield fetchPrivateChats(tutorId, socket);
        }));
        socket.on("send_message", (_a) => __awaiter(void 0, [_a], void 0, function* ({ communityId, message }) {
            if (!communityId || !message.sender || !message.timestamp) {
                console.error(`[${new Date().toISOString()}] Invalid message data`);
                socket.emit("error", { message: "Invalid message data" });
                return;
            }
            try {
                const newMessage = new MessageModel({
                    communityId,
                    sender: message.sender,
                    content: message.content,
                    timestamp: message.timestamp,
                    status: "sent",
                });
                yield newMessage.save();
                console.log(`[${new Date().toISOString()}] Message saved for community ${communityId}:`, newMessage._id);
                io.to(communityId).emit("receive_message", {
                    _id: newMessage._id,
                    sender: newMessage.sender,
                    content: newMessage.content,
                    timestamp: newMessage.timestamp,
                    status: newMessage.status,
                });
                yield MessageModel.updateOne({ _id: newMessage._id }, { status: "delivered" });
                io.to(communityId).emit("receive_message", Object.assign(Object.assign({}, newMessage.toObject()), { status: "delivered" }));
            }
            catch (error) {
                console.error(`[${new Date().toISOString()}] Error sending message:`, error.message);
                socket.emit("error", { message: "Failed to send message" });
            }
        }));
        socket.on("send_private_message", (data) => __awaiter(void 0, void 0, void 0, function* () {
            const { courseId, studentId, tutorId, message } = data;
            const privateChatId = `private_${courseId}_${studentId}_${tutorId}`;
            try {
                const newMessage = new MessageModel({
                    privateChatId,
                    sender: message.sender,
                    content: message.content,
                    timestamp: message.timestamp,
                    status: "sent",
                });
                yield newMessage.save();
                console.log(`[${new Date().toISOString()}] Private message saved to ${privateChatId}:`, newMessage._id);
                const course = yield course_1.courseModel.findById(courseId).lean();
                const student = yield userModel_1.userModel.findById(studentId).lean();
                io.to(privateChatId).emit("receive_private_message", {
                    _id: newMessage._id,
                    sender: newMessage.sender,
                    content: newMessage.content,
                    timestamp: newMessage.timestamp,
                    status: "sent",
                    courseId,
                    studentId,
                    tutorId,
                    courseTitle: (course === null || course === void 0 ? void 0 : course.title) || "Unknown Course",
                    studentName: (student === null || student === void 0 ? void 0 : student.name) || "Unknown Student",
                });
                yield MessageModel.updateOne({ _id: newMessage._id }, { status: "delivered" });
                io.to(privateChatId).emit("receive_private_message", Object.assign(Object.assign({}, newMessage.toObject()), { status: "delivered", courseId,
                    studentId,
                    tutorId, courseTitle: (course === null || course === void 0 ? void 0 : course.title) || "Unknown Course", studentName: (student === null || student === void 0 ? void 0 : student.name) || "Unknown Student" }));
                const tutor = yield userModel_1.userModel.findById(tutorId).lean();
                if (!tutor) {
                    console.error(`[${new Date().toISOString()}] Tutor not found for tutorId: ${tutorId}`);
                    socket.emit("error", { message: "Tutor not found" });
                    return;
                }
                const tutorName = tutor.name || "Unknown Tutor";
                // Determine senderId for notification based on who sent the message
                const senderId = message.senderId || tutorId; // fallback to tutorId if missing
                const recipientId = senderId === tutorId ? studentId : tutorId;
                if (recipientId) {
                    const notification = new notificationModel_1.NotificationModel({
                        userId: recipientId,
                        type: "chat_message",
                        message: `${message.sender} sent a message: ${message.content.slice(0, 50)}...`,
                        read: false,
                        createdAt: new Date(),
                        courseTitle: (course === null || course === void 0 ? void 0 : course.title) || "Unknown Course",
                        senderId: senderId, // Use the correct sender ID
                    });
                    yield notification.save();
                    console.log(`[${new Date().toISOString()}] Notification saved for ${recipientId}:`, notification._id);
                    io.to(recipientId).emit("notification", {
                        _id: notification._id,
                        type: "chat_message",
                        message: `${message.sender} sent a message: ${message.content.slice(0, 50)}...`,
                        courseId,
                        studentId,
                        tutorId,
                        courseTitle: (course === null || course === void 0 ? void 0 : course.title) || "Unknown Course",
                        timestamp: new Date().toISOString(),
                        senderId: senderId,
                        read: false,
                        createdAt: notification.createdAt.toISOString(),
                    });
                    console.log(`[${new Date().toISOString()}] Sent notification to ${recipientId} from ${senderId}`);
                    if (recipientId === tutorId) {
                        // Only trigger fetch_private_chats if the recipient is the tutor
                        io.to(tutorId).emit("fetch_private_chats", { tutorId });
                        console.log(`[${new Date().toISOString()}] Triggered fetch_private_chats for tutor ${tutorId}`);
                    }
                }
            }
            catch (err) {
                console.error(`[${new Date().toISOString()}] Error saving private message to chat ${privateChatId}:`, err.message);
                socket.emit("error", { message: "Failed to send private message" });
            }
        }));
        socket.on("send_image_message", (_a) => __awaiter(void 0, [_a], void 0, function* ({ communityId, message, image, senderId, }) {
            if (!communityId || !message.sender || !image.data) {
                console.error(`[${new Date().toISOString()}] Invalid image message data`);
                socket.emit("error", { message: "Invalid image message data" });
                return;
            }
            try {
                const imageUrl = image.data;
                const newMessage = new MessageModel({
                    communityId,
                    sender: message.sender,
                    content: "",
                    timestamp: message.timestamp,
                    status: "sent",
                    imageUrl,
                });
                yield newMessage.save();
                console.log(`[${new Date().toISOString()}] Image message saved for community ${communityId}:`, newMessage._id);
                io.to(communityId).emit("receive_message", {
                    _id: newMessage._id,
                    sender: newMessage.sender,
                    content: newMessage.content,
                    timestamp: newMessage.timestamp,
                    status: newMessage.status,
                    imageUrl: newMessage.imageUrl,
                });
                yield MessageModel.updateOne({ _id: newMessage._id }, { status: "delivered" });
                io.to(communityId).emit("receive_message", Object.assign(Object.assign({}, newMessage.toObject()), { status: "delivered" }));
            }
            catch (error) {
                console.error(`[${new Date().toISOString()}] Error sending image message:`, error.message);
                socket.emit("error", { message: "Failed to send image message" });
            }
        }));
        socket.on("send_private_image_message", (data) => __awaiter(void 0, void 0, void 0, function* () {
            const { courseId, studentId, tutorId, image, senderId } = data;
            const privateChatId = `private_${courseId}_${studentId}_${tutorId}`;
            try {
                const imageUrl = image.data;
                const newMessage = new MessageModel({
                    privateChatId,
                    sender: data.message.sender,
                    content: data.message.content,
                    timestamp: data.message.timestamp,
                    status: "sent",
                    imageUrl,
                });
                yield newMessage.save();
                console.log(`[${new Date().toISOString()}] Image message saved to ${privateChatId}:`, newMessage._id);
                const course = yield course_1.courseModel.findById(courseId).lean();
                const student = yield userModel_1.userModel.findById(studentId).lean();
                io.to(privateChatId).emit("receive_private_message", {
                    _id: newMessage._id,
                    sender: newMessage.sender,
                    content: newMessage.content,
                    timestamp: newMessage.timestamp,
                    status: "sent",
                    imageUrl,
                    courseId,
                    studentId,
                    tutorId,
                    courseTitle: (course === null || course === void 0 ? void 0 : course.title) || "Unknown Course",
                    studentName: (student === null || student === void 0 ? void 0 : student.name) || "Unknown Student",
                });
                yield MessageModel.updateOne({ _id: newMessage._id }, { status: "delivered" });
                io.to(privateChatId).emit("receive_private_message", Object.assign(Object.assign({}, newMessage.toObject()), { status: "delivered", courseId,
                    studentId,
                    tutorId, courseTitle: (course === null || course === void 0 ? void 0 : course.title) || "Unknown Course", studentName: (student === null || student === void 0 ? void 0 : student.name) || "Unknown Student" }));
                const recipientId = senderId === tutorId ? studentId : tutorId;
                if (recipientId) {
                    const notification = new notificationModel_1.NotificationModel({
                        userId: recipientId,
                        type: "chat_message",
                        message: `${data.message.sender} sent an image in ${(course === null || course === void 0 ? void 0 : course.title) || "course"}`,
                        read: false,
                        createdAt: new Date(),
                        courseTitle: (course === null || course === void 0 ? void 0 : course.title) || "Unknown Course",
                        senderId,
                    });
                    yield notification.save();
                    console.log(`[${new Date().toISOString()}] Notification saved for ${recipientId}:`, notification._id);
                    io.to(recipientId).emit("notification", {
                        _id: notification._id,
                        type: "chat_message",
                        message: `${data.message.sender} sent an image in ${(course === null || course === void 0 ? void 0 : course.title) || "course"}`,
                        courseId,
                        studentId,
                        tutorId,
                        courseTitle: (course === null || course === void 0 ? void 0 : course.title) || "Unknown Course",
                        timestamp: new Date().toISOString(),
                        senderId,
                        read: false,
                        createdAt: notification.createdAt.toISOString(),
                    });
                    console.log(`[${new Date().toISOString()}] Sent notification to ${recipientId} from ${senderId}`);
                    if (recipientId === tutorId) {
                        io.to(tutorId).emit("fetch_private_chats", { tutorId });
                        console.log(`[${new Date().toISOString()}] Triggered fetch_private_chats for tutor ${tutorId}`);
                    }
                }
            }
            catch (err) {
                console.error(`[${new Date().toISOString()}] Error saving image message to private chat ${privateChatId}:`, err.message);
                socket.emit("error", { message: "Failed to send private image message" });
            }
        }));
        socket.on("send_notification", (_a) => __awaiter(void 0, [_a], void 0, function* ({ communityId, courseTitle, message, senderId }) {
            try {
                console.log(`[${new Date().toISOString()}] Sending notification for community ${communityId}`);
                yield tutorService.sendCommunityNotifications(communityId, senderId, message, courseTitle);
                socket.to(communityId).emit("receive_notification", {
                    type: "chat_message",
                    message: `${message.sender} : ${message.content ? message.content.slice(0, 50) + "..." : "Sent an image"}`,
                    communityId,
                    courseTitle,
                    senderId,
                    createdAt: new Date().toISOString(),
                });
            }
            catch (error) {
                console.error(`[${new Date().toISOString()}] Error sending notification:`, error.message);
                socket.emit("error", { message: "Failed to send notification" });
            }
        }));
        socket.on("mark_private_message_notification_as_read", (_a) => __awaiter(void 0, [_a], void 0, function* ({ notificationId }) {
            try {
                yield notificationModel_1.NotificationModel.updateOne({ _id: notificationId }, { read: true });
                console.log(`[${new Date().toISOString()}] Notification ${notificationId} marked as read`);
                io.emit("notification_read", { notificationId });
            }
            catch (err) {
                console.error(`[${new Date().toISOString()}] Error marking notification as read:`, err.message);
                socket.emit("error", { message: "Failed to mark notification as read" });
            }
        }));
        // ------------------- Video Call Event Handlers (Refined) -------------------
        socket.on("call_request", (data) => __awaiter(void 0, void 0, void 0, function* () {
            const { roomId, studentId, courseId, courseTitle, tutorId, timestamp, callerName } = data;
            console.log(`[${new Date().toISOString()}] Received call_request:`, data);
            try {
                if (!roomId || !studentId || !courseId || !courseTitle || !tutorId || !timestamp || !callerName) {
                    console.error(`[${new Date().toISOString()}] Invalid call_request data: Missing required fields.`, data);
                    socket.emit("error", { message: "Invalid call request data" });
                    return;
                }
                if (!mongoose_1.default.Types.ObjectId.isValid(studentId) ||
                    !mongoose_1.default.Types.ObjectId.isValid(courseId) ||
                    !mongoose_1.default.Types.ObjectId.isValid(tutorId)) {
                    console.error(`[${new Date().toISOString()}] Invalid ObjectId format`, { studentId, courseId, tutorId });
                    socket.emit("error", { message: "Invalid student, course, or tutor ID format" });
                    return;
                }
                const student = yield userModel_1.userModel.findById(studentId).lean();
                if (!student) {
                    console.error(`[${new Date().toISOString()}] Student not found: ${studentId}`);
                    socket.emit("error", { message: `Student not found with ID ${studentId}` });
                    return;
                }
                const course = yield course_1.courseModel.findById(courseId).lean();
                if (!course) {
                    console.error(`[${new Date().toISOString()}] Course not found: ${courseId}`);
                    socket.emit("error", { message: `Course not found with ID ${courseId}` });
                    return;
                }
                const tutor = yield userModel_1.userModel.findById(tutorId).lean();
                if (!tutor) {
                    console.error(`[${new Date().toISOString()}] Tutor not found: ${tutorId}`);
                    socket.emit("error", { message: `Tutor not found with ID ${tutorId}` });
                    return;
                }
                const notification = new notificationModel_1.NotificationModel({
                    userId: tutorId,
                    type: "call_request",
                    message: `${callerName || student.name || "Student"} is requesting a video call in ${courseTitle || course.title || "course"}`,
                    read: false,
                    createdAt: new Date(),
                    courseTitle: courseTitle || course.title || "Unknown Course",
                    senderId: studentId,
                    courseId,
                    studentId,
                    tutorId,
                });
                yield notification.save();
                console.log(`[${new Date().toISOString()}] Call notification saved for tutor ${tutorId}:`, notification._id);
                // Removed status from callHistory creation
                const callHistory = new exports.CallHistory({
                    tutorId,
                    studentId,
                    courseId,
                    courseName: courseTitle || course.title || "Unknown Course",
                    startTime: new Date(timestamp || Date.now()),
                });
                const savedCall = yield callHistory.save();
                console.log(`[${new Date().toISOString()}] Call history created:`, savedCall._id);
                const tutorSocketInfo = connectedUsers.get(tutorId);
                if (tutorSocketInfo && tutorSocketInfo.socketId) {
                    io.to(tutorSocketInfo.socketId).emit("call_request", {
                        roomId,
                        studentId,
                        courseId,
                        courseTitle: courseTitle || course.title || "Unknown Course",
                        tutorId,
                        timestamp: timestamp || new Date().toISOString(),
                        callId: savedCall._id.toString(),
                        callerName: callerName || student.name || "Student",
                    });
                    console.log(`[${new Date().toISOString()}] Sent call_request to tutor ${tutorId} (socket: ${tutorSocketInfo.socketId}) for room ${roomId}`);
                }
                else {
                    console.warn(`[${new Date().toISOString()}] Tutor ${tutorId} is not connected. Call request not sent.`);
                    socket.emit("error", { message: `Tutor ${tutorId} is currently offline or unreachable.` });
                }
            }
            catch (error) {
                console.error(`[${new Date().toISOString()}] Error processing call_request:`, {
                    error: error.message,
                    stack: error.stack,
                    data,
                    validationErrors: error.errors ? Object.values(error.errors).map((e) => e.message) : null,
                });
                socket.emit("error", { message: `Failed to initiate call: ${error.message}` });
            }
        }));
        socket.on("call_accepted", (data) => __awaiter(void 0, void 0, void 0, function* () {
            const { callId, roomId, receiverId, userId } = data; // userId is the caller (student), receiverId is the acceptor (tutor)
            console.log(`[${new Date().toISOString()}] Call ${callId} accepted by ${receiverId} (tutor) from ${userId} (student) for room ${roomId}`);
            try {
                if (!callId || !roomId || !receiverId || !userId) {
                    console.error(`[${new Date().toISOString()}] Invalid call_accepted data: Missing required fields.`, data);
                    socket.emit("error", { message: "Invalid call acceptance data" });
                    return;
                }
                // Removed status and endTime updates
                const updatedCall = yield exports.CallHistory.findByIdAndUpdate(callId, { startTime: new Date() }, { new: true });
                if (!updatedCall) {
                    console.error(`[${new Date().toISOString()}] Call history not found for callId ${callId}`);
                    socket.emit("error", { message: `Call history not found for callId ${callId}` });
                    return;
                }
                console.log(`[${new Date().toISOString()}] Updated call startTime:`, updatedCall._id);
                const roomName = roomId;
                const studentToken = generateZegoToken(ZEGO_APP_ID, userId, ZEGO_SERVER_SECRET, 3600, roomName);
                const tutorToken = generateZegoToken(ZEGO_APP_ID, receiverId, ZEGO_SERVER_SECRET, 3600, roomName);
                console.log("Generated token for student (caller):", studentToken);
                console.log("Generated token for tutor (acceptor):", tutorToken);
                const tutorSocketInfo = connectedUsers.get(receiverId); // This is the tutor who accepted
                const studentSocketInfo = connectedUsers.get(userId); // This is the student who initiated the call
                if (tutorSocketInfo && tutorSocketInfo.socketId) {
                    io.to(tutorSocketInfo.socketId).emit("videoCallStarted", { roomId, roomName, token: tutorToken, callId, partnerId: userId });
                    console.log(`[${new Date().toISOString()}] Sent videoCallStarted to tutor ${receiverId} (socket: ${tutorSocketInfo.socketId})`);
                }
                else {
                    console.warn(`[${new Date().toISOString()}] Tutor socket not found for ${receiverId}.`);
                }
                if (studentSocketInfo && studentSocketInfo.socketId) {
                    io.to(studentSocketInfo.socketId).emit("videoCallStarted", { roomId, roomName, token: studentToken, callId, partnerId: receiverId });
                    console.log(`[${new Date().toISOString()}] Sent videoCallStarted to student ${userId} (socket: ${studentSocketInfo.socketId})`);
                }
                else {
                    console.warn(`[${new Date().toISOString()}] Student socket not found for ${userId}.`);
                }
                // Removed status update from notification
                yield notificationModel_1.NotificationModel.updateOne({
                    userId: receiverId,
                    type: "call_request",
                    senderId: userId,
                    read: false
                }, { read: true });
                console.log(`[${new Date().toISOString()}] Notification related to call ${callId} marked as read.`);
            }
            catch (error) {
                console.error(`[${new Date().toISOString()}] Error in call_accepted for callId ${callId}:`, {
                    error: error.message,
                    stack: error.stack,
                    data,
                });
                socket.emit("error", { message: `Failed to accept call: ${error.message}` });
            }
        }));
        socket.on("joinVideoCall", (data) => {
            var _a;
            const { roomId, userId, role } = data;
            console.log(`[${new Date().toISOString()}] joinVideoCall: ${userId} (${role})`);
            try {
                if (!roomId || !userId || !role) {
                    console.error(`[${new Date().toISOString()}] Invalid joinVideoCall data: Missing required fields.`, data);
                    socket.emit("error", { message: "Invalid join call data" });
                    return;
                }
                const roomName = roomId;
                const token = generateZegoToken(ZEGO_APP_ID, userId, ZEGO_SERVER_SECRET, 3600, roomName);
                socket.join(roomId);
                if (!socketRooms.has(socket.id)) {
                    socketRooms.set(socket.id, new Set());
                }
                (_a = socketRooms.get(socket.id)) === null || _a === void 0 ? void 0 : _a.add(roomId);
                io.to(roomId).emit("videoCallJoined", {
                    roomId,
                    roomName,
                    token,
                });
                console.log(`[${new Date().toISOString()}] Sent videoCallJoined to room ${roomId}`);
            }
            catch (error) {
                console.error(`[${new Date().toISOString()}] Error in joinVideoCall for user ${userId} in room ${roomId}:`, {
                    error: error.message,
                    stack: error.stack,
                    data,
                });
                socket.emit("error", { message: `Failed to join call: ${error.message}` });
            }
        });
        socket.on("end_call", (data) => __awaiter(void 0, void 0, void 0, function* () {
            const { to: roomId, callId } = data; // 'to' is being used as roomId here
            console.log(`[${new Date().toISOString()}] Ending call for room ${roomId} with callId ${callId}`);
            try {
                if (!roomId || !callId) {
                    console.error(`[${new Date().toISOString()}] Invalid end_call payload: Missing required fields.`, data);
                    socket.emit("error", { message: "Invalid end call payload" });
                    return;
                }
                // Removed endTime and status updates
                io.to(roomId).emit("call_ended");
                console.log(`[${new Date().toISOString()}] Sent call_ended to room ${roomId}`);
            }
            catch (error) {
                console.error(`[${new Date().toISOString()}] Error in end_call for callId ${callId}:`, {
                    error: error.message,
                    stack: error.stack,
                    data,
                });
                socket.emit("error", { message: `Failed to end call: ${error.message}` });
            }
        }));
        // ... (outgoing-video-call, accept-incoming-call, trainer-call-accept remain unchanged as they seem to be for different call flows)
        socket.on("reject-call", (data) => __awaiter(void 0, void 0, void 0, function* () {
            const { to, callId, sender, name, senderId, from } = data;
            console.log(`[${new Date().toISOString()}] Received reject-call:`, data);
            try {
                if (!to || !callId) {
                    console.error(`[${new Date().toISOString()}] Invalid reject-call payload: Missing required fields.`, data);
                    socket.emit("error", { message: "Invalid reject-call payload" });
                    return;
                }
                // Removed endTime and status updates
                const recipientSocketInfo = connectedUsers.get(to);
                if (recipientSocketInfo && recipientSocketInfo.socketId) {
                    io.to(recipientSocketInfo.socketId).emit("call-rejected");
                    console.log(`[${new Date().toISOString()}] Call rejected, sent 'call-rejected' to ${to} (socket: ${recipientSocketInfo.socketId})`);
                    const actualSenderId = senderId || from || queryUserId || "unknown";
                    const notification = new notificationModel_1.NotificationModel({
                        userId: to,
                        type: "video_call",
                        message: `Call rejected by ${name || sender || "the other party"}`,
                        read: false,
                        createdAt: new Date(),
                        senderId: actualSenderId,
                    });
                    yield notification.save();
                    io.to(to).emit("notification", {
                        _id: notification._id,
                        type: "video_call",
                        message: `Call rejected by ${name || sender || "the other party"}`,
                        timestamp: new Date().toISOString(),
                        read: false,
                        senderId: actualSenderId,
                        createdAt: notification.createdAt.toISOString(),
                    });
                    console.log(`[${new Date().toISOString()}] Notification sent to ${to} about rejected call from ${actualSenderId}`);
                }
                else {
                    console.error(`[${new Date().toISOString()}] Recipient user ${to} is not online. Cannot send 'call-rejected' or notification.`);
                }
            }
            catch (error) {
                console.error(`[${new Date().toISOString()}] Error in reject-call for callId ${callId}:`, {
                    error: error.message,
                    stack: error.stack,
                    data,
                });
                socket.emit("error", { message: "Failed to reject call" });
            }
        }));
        socket.on("leave-room", (data) => __awaiter(void 0, void 0, void 0, function* () {
            const { to, callId } = data;
            console.log(`[${new Date().toISOString()}] Received leave-room from ${queryUserId} for callId ${callId}, notifying ${to}`);
            console.log("huak", callId, to);
            try {
                if (!to || !callId) {
                    console.error(`[${new Date().toISOString()}] Invalid leave-room payload: Missing required fields.`, data);
                    socket.emit("error", { message: "Invalid leave-room payload" });
                    return;
                }
                const recipientSocketInfo = connectedUsers.get(to);
                console.log("Recipient socket info:", recipientSocketInfo);
                // Removed endTime and status updates
                if (recipientSocketInfo && recipientSocketInfo.socketId) {
                    io.to(recipientSocketInfo.socketId).emit("user-left", queryUserId || "unknown");
                    console.log(`[${new Date().toISOString()}] User ${queryUserId || "unknown"} left room, notifying ${to} (socket: ${recipientSocketInfo.socketId})`);
                    const sender = yield userModel_1.userModel.findById(queryUserId).lean();
                    if (sender) {
                        const notification = new notificationModel_1.NotificationModel({
                            userId: to,
                            type: "video_call",
                            message: `${sender.name || "User"} left the call`,
                            read: false,
                            createdAt: new Date(),
                            senderId: queryUserId,
                        });
                        yield notification.save();
                        io.to(to).emit("notification", {
                            _id: notification._id,
                            type: "video_call",
                            message: `${sender.name || "User"} left the call`,
                            timestamp: new Date().toISOString(),
                            read: false,
                            senderId: queryUserId,
                            createdAt: notification.createdAt.toISOString(),
                        });
                        console.log(`[${new Date().toISOString()}] Notification sent to ${to} about user ${queryUserId} leaving the call.`);
                    }
                }
                else {
                    console.warn(`[${new Date().toISOString()}] Recipient user ${to} is not online. Cannot send 'user-left' or notification.`);
                }
            }
            catch (error) {
                console.error(`[${new Date().toISOString()}] Error in leave-room for callId ${callId}:`, {
                    error: error.message,
                    stack: error.stack,
                    data,
                });
                socket.emit("error", { message: "Failed to leave room" });
            }
        }));
        socket.on("leave_room", (roomId) => {
            var _a;
            socket.leave(roomId);
            (_a = socketRooms.get(socket.id)) === null || _a === void 0 ? void 0 : _a.delete(roomId);
            console.log(`[${new Date().toISOString()}] Socket ${socket.id} explicitly left room ${roomId}`);
        });
        socket.on("disconnect", () => {
            console.log(`[${new Date().toISOString()}] Client disconnected: ${socket.id}`);
            if (queryUserId) {
                connectedUsers.delete(queryUserId);
                console.log(`[${new Date().toISOString()}] User ${queryUserId} removed from connectedUsers on disconnect.`);
            }
            const rooms = socketRooms.get(socket.id);
            if (rooms) {
                rooms.forEach((room) => {
                    socket.leave(room);
                    console.log(`[${new Date().toISOString()}] Socket ${socket.id} left room ${room} on disconnect`);
                });
                socketRooms.delete(socket.id);
            }
        });
    });
    return io;
};
exports.initializeSocket = initializeSocket;
