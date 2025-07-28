import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import mongoose, { Document, Schema } from "mongoose";
import { TutorService } from "../services/tutorServices";
import { TutorRepository } from "../repositories/tutorRepository";
import { courseModel } from "../models/course";
import { userModel } from "../models/userModel";
import { purchaseModel } from "../models/buyCourseModal";
import { NotificationModel } from "../models/notificationModel";
import jwt from "jsonwebtoken";

// ZegoCloud configuration
const ZEGO_APP_ID = process.env.ZEGOCLOUD_APP_ID || "0";
const ZEGO_SERVER_SECRET = process.env.ZEGOCLOUD_SERVER_SECRET || "";

// Generate ZegoCloud token
const generateZegoToken = (appId: string, userId: string, serverSecret: string, effectiveTimeInSeconds: number, roomId: string): string => {
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
  return jwt.sign(payload, serverSecret, { algorithm: 'HS256', noTimestamp: true });
};

// Interfaces for chat functionality (Keeping for context, not directly modified)
interface Message extends Document {
  _id: string;
  communityId?: string;
  privateChatId?: string;
  sender: string;
  content: string;
  timestamp: string;
  status: "sent" | "delivered" | "read";
  imageUrl?: string;
  reactions: {
    userId: string;
    emoji: string;
  }[];
}

interface Notification {
  communityId: string;
  courseTitle: string;
  message: Message;
  senderId: string;
}

// Interfaces for ZEGOCLOUD video call events
interface User {
  userId: string;
  socketId: string;
}

interface OutgoingVideoCallPayload {
  to: string;
  from: string;
  trainerName: string;
  trainerImage: string;
  callType: string;
  roomId: string;
}

interface AcceptIncomingCallPayload {
  to: string;
  from: string;
  roomId: string;
}

interface TrainerCallAcceptPayload {
  roomId: string;
  trainerId: string;
  to: string;
}

interface RejectCallPayload {
  to: string; // The ID of the recipient of the rejection (e.g., the caller)
  sender: "user" | "trainer"; // The role of the person rejecting
  name: string; // Name of the person rejecting
  from?: string; // ID of the person rejecting (can be used as senderId)
  senderId?: string; // Explicit sender ID
  callId: string; // Crucial for updating history
}

interface LeaveRoomPayload {
  to: string; // The ID of the other user in the call (recipient of 'user-left' event)
  callId: string; // Crucial for updating history
}

interface EndCallPayload {
  to: string; // This is actually the roomId based on your usage
  callId: string;
}

// CallHistory Schema (modified to remove endTime and status)
const callHistorySchema = new mongoose.Schema({
  tutorId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  startTime: { type: Date, required: true, default: Date.now },
  courseName: { type: String, required: true },
});

// Add index for performance
callHistorySchema.index({ tutorId: 1, studentId: 1, startTime: -1 });

export const CallHistory = mongoose.model('CallHistory', callHistorySchema);

const messageSchema = new Schema<Message>({
  privateChatId: { type: String },
  sender: { type: String, required: true },
  content: { type: String, default: "" },
  timestamp: { type: String, required: true },
  status: {
    type: String,
    enum: ["sent", "delivered", "read"],
    default: "sent",
  },
  imageUrl: { type: String, default: "" },
  reactions: [
    {
      userId: { type: String, required: true },
      emoji: { type: String, required: true }
    }
  ]
});

export const MessageModel = mongoose.model<Message>("Message", messageSchema);

const tutorRepository = new TutorRepository();
const tutorService = new TutorService(tutorRepository);

// Map to track rooms each socket is in
const socketRooms = new Map<string, Set<string>>();

const connectedUsers = new Map<string, User>(); 

const fetchPrivateChats = async (tutorId: string, socket: Socket) => {
  try {
    console.log(`[${new Date().toISOString()}] Fetching private chats for tutor ${tutorId}`);
    const messages = await MessageModel.find({
      privateChatId: { $regex: `private_.*_.*_${tutorId}$` },
    })
      .sort({ timestamp: -1 })
      .lean();

    console.log(`[${new Date().toISOString()}] Found ${messages.length} messages for tutor ${tutorId}`);

    const chats: any[] = [];
    const uniqueChatIds = [...new Set(messages.map((msg) => msg.privateChatId))];
    console.log(`[${new Date().toISOString()}] Unique chat IDs from messages: ${uniqueChatIds.length}`);

    for (const privateChatId of uniqueChatIds) {
      if (privateChatId) {
        const parts = privateChatId.split("_");
        if (parts.length >= 4) {
          const courseId = parts[1];
          const studentId = parts[2];
          const latestMessage = messages.find((msg) => msg.privateChatId === privateChatId);

          const course = await courseModel.findById(courseId).lean();
          const student = await userModel.findById(studentId).lean();

          console.log(`[${new Date().toISOString()}] Processing message-based chat ${privateChatId}:`, {
            courseId,
            studentId,
            courseFound: !!course,
            studentFound: !!student,
            latestMessage: latestMessage?.content || "No content",
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
        } else {
            console.warn(`[${new Date().toISOString()}] Invalid privateChatId format: ${privateChatId}`);
        }
      }
    }

    const courses = await courseModel.find({ tutorId }).lean();
    const courseIds = courses.map((course) => course._id.toString());
    console.log(`[${new Date().toISOString()}] Found ${courses.length} courses for tutor ${tutorId}:`, courseIds);

    const purchases = await purchaseModel
      .find({
        "purchase.courseId": { $in: courseIds },
        "purchase.status": "completed",
      })
      .lean();

    console.log(`[${new Date().toISOString()}] Found ${purchases.length} completed purchases for tutor's courses`);

    for (const purchase of purchases) {
      const student = await userModel.findById(purchase.userId).lean();
      if (!student) {
        console.log(`[${new Date().toISOString()}] Student not found for userId ${purchase.userId}`);
        continue;
      }

      for (const purchaseItem of purchase.purchase) {
        if (courseIds.includes(purchaseItem.courseId.toString()) && purchaseItem.status === "completed") {
          const course = courses.find((c) => c._id.toString() === purchaseItem.courseId.toString());
          if (!course) continue;

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
  } catch (err: any) {
    console.error(`[${new Date().toISOString()}] Error fetching private chats for tutor ${tutorId}:`, {
      error: err.message,
      stack: err.stack,
    });
    socket.emit("error", { message: "Failed to fetch private chats" });
  }
};

export const initializeSocket = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log(`[${new Date().toISOString()}] New client connected: ${socket.id}`);
    socketRooms.set(socket.id, new Set<string>());

    const queryUserId = socket.handshake.query.userId as string | undefined;
    if (queryUserId) {
      connectedUsers.set(queryUserId, { userId: queryUserId, socketId: socket.id });
      console.log(`[${new Date().toISOString()}] User ${queryUserId} registered with socket ${socket.id} from handshake`);
    }

    socket.on("join_user", (userId: string, callback?: () => void) => {
      if (!userId) {
        console.error(`[${new Date().toISOString()}] join_user: No userId provided`);
        socket.emit("error", { message: "User ID is required" });
        return;
      }
      console.log(`[${new Date().toISOString()}] Socket ${socket.id} joining user room ${userId}`);
      socket.join(userId);
      socketRooms.get(socket.id)?.add(userId);

      if (!connectedUsers.has(userId)) {
        connectedUsers.set(userId, { userId, socketId: socket.id });
        console.log(`[${new Date().toISOString()}] User ${userId} registered via join_user with socket ${socket.id}`);
      } else {
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
          if (callback) callback();
        })
        .catch((err) => {
          console.error(`[${new Date().toISOString()}] Error joining user room ${userId}:`, err);
          socket.emit("error", { message: "Failed to join user room" });
        });
    });

    socket.on("join_room", (roomId: string) => {
      if (!roomId) {
        console.error(`[${new Date().toISOString()}] join_room: No roomId provided`);
        socket.emit("error", { message: "Room ID is required" });
        return;
      }
      console.log(`[${new Date().toISOString()}] Socket ${socket.id} joining room ${roomId}`);
      socket.join(roomId);
      socketRooms.get(socket.id)?.add(roomId);
      socket.emit("joined_room");
      console.log(`[${new Date().toISOString()}] Socket ${socket.id} joined room ${roomId}`);
    });

    socket.on("join_community", async (communityId: string) => {
      if (!communityId) {
        console.error(`[${new Date().toISOString()}] No communityId provided`);
        socket.emit("error", { message: "Community ID is required" });
        return;
      }
      try {
        socket.join(communityId);
        socketRooms.get(socket.id)?.add(communityId);
        console.log(`[${new Date().toISOString()}] User ${socket.id} joined community: ${communityId}`);
        const messages = await MessageModel.find({ communityId })
          .sort({ timestamp: 1 })
          .limit(50)
          .lean();
        socket.emit("message_history", messages);
      } catch (error: any) {
        console.error(`[${new Date().toISOString()}] Error joining community ${communityId}:`, error.message);
        socket.emit("error", { message: "Failed to join community" });
      }
    });

    socket.on(
      "join_private_chat",
      async ({ courseId, studentId, tutorId }: { courseId: string; studentId: string; tutorId: string }) => {
        const privateChatId = `private_${courseId}_${studentId}_${tutorId}`;
        socket.join(privateChatId);
        socketRooms.get(socket.id)?.add(privateChatId);
        console.log(`[${new Date().toISOString()}] User ${socket.id} joined private chat ${privateChatId}`);
        try {
          const messages = await MessageModel.find({ privateChatId })
            .select("sender content timestamp status imageUrl courseId studentId tutorId courseTitle studentName reactions") // Updated to include reactions
            .sort({ timestamp: 1 })
            .limit(50)
            .lean();
          socket.emit("private_message_history", messages);
        } catch (err: any) {
          console.error(`[${new Date().toISOString()}] Error fetching private message history for chat ${privateChatId}:`, err.message);
          socket.emit("error", { message: "Failed to fetch private chat history" });
        }
      }
    );

    socket.on("fetch_private_chats", async ({ tutorId }: { tutorId: string }) => {
      await fetchPrivateChats(tutorId, socket);
    });

    socket.on(
      "send_message",
      async ({ communityId, message }: { communityId: string; message: Message }) => {
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
          await newMessage.save();
          console.log(`[${new Date().toISOString()}] Message saved for community ${communityId}:`, newMessage._id);
          io.to(communityId).emit("receive_message", {
            _id: newMessage._id,
            sender: newMessage.sender,
            content: newMessage.content,
            timestamp: newMessage.timestamp,
            status: newMessage.status,
          });
          await MessageModel.updateOne({ _id: newMessage._id }, { status: "delivered" });
          io.to(communityId).emit("receive_message", {
            ...newMessage.toObject(),
            status: "delivered",
          });
        } catch (error: any) {
          console.error(`[${new Date().toISOString()}] Error sending message:`, error.message);
          socket.emit("error", { message: "Failed to send message" });
        }
      }
    );

    socket.on(
      "send_private_message",
      async (data: {
        courseId: string;
        studentId: string;
        tutorId: string;
        message: {
          sender: string;
          content: string;
          timestamp: string;
          status: string;
          senderId?: string;
        };
      }) => {
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
          await newMessage.save();
          console.log(`[${new Date().toISOString()}] Private message saved to ${privateChatId}:`, newMessage._id);
          const course = await courseModel.findById(courseId).lean();
          const student = await userModel.findById(studentId).lean();
          io.to(privateChatId).emit("receive_private_message", {
            _id: newMessage._id,
            sender: newMessage.sender,
            content: newMessage.content,
            timestamp: newMessage.timestamp,
            status: "sent",
            courseId,
            studentId,
            tutorId,
            courseTitle: course?.title || "Unknown Course",
            studentName: student?.name || "Unknown Student",
          });
          await MessageModel.updateOne({ _id: newMessage._id }, { status: "delivered" });
          io.to(privateChatId).emit("receive_private_message", {
            ...newMessage.toObject(),
            status: "delivered",
            courseId,
            studentId,
            tutorId,
            courseTitle: course?.title || "Unknown Course",
            studentName: student?.name || "Unknown Student",
          });
          const tutor = await userModel.findById(tutorId).lean();
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
            const notification = new NotificationModel({
              userId: recipientId,
              type: "chat_message",
              message: `${message.sender} sent a message: ${message.content.slice(0, 50)}...`,
              read: false,
              createdAt: new Date(),
              courseTitle: course?.title || "Unknown Course",
              senderId: senderId, // Use the correct sender ID
            });
            await notification.save();
            console.log(`[${new Date().toISOString()}] Notification saved for ${recipientId}:`, notification._id);
            io.to(recipientId).emit("notification", {
              _id: notification._id,
              type: "chat_message",
              message: `${message.sender} sent a message: ${message.content.slice(0, 50)}...`,
              courseId,
              studentId,
              tutorId,
              courseTitle: course?.title || "Unknown Course",
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
        } catch (err: any) {
          console.error(`[${new Date().toISOString()}] Error saving private message to chat ${privateChatId}:`, err.message);
          socket.emit("error", { message: "Failed to send private message" });
        }
      }
    );

    socket.on(
      "send_image_message",
      async ({
        communityId,
        message,
        image,
        senderId,
      }: {
        communityId: string;
        message: Message;
        image: { data: string; name: string; type: string };
        senderId: string;
      }) => {
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
          await newMessage.save();
          console.log(`[${new Date().toISOString()}] Image message saved for community ${communityId}:`, newMessage._id);
          io.to(communityId).emit("receive_message", {
            _id: newMessage._id,
            sender: newMessage.sender,
            content: newMessage.content,
            timestamp: newMessage.timestamp,
            status: newMessage.status,
            imageUrl: newMessage.imageUrl,
          });
          await MessageModel.updateOne({ _id: newMessage._id }, { status: "delivered" });
          io.to(communityId).emit("receive_message", {
            ...newMessage.toObject(),
            status: "delivered",
          });
        } catch (error: any) {
          console.error(`[${new Date().toISOString()}] Error sending image message:`, error.message);
          socket.emit("error", { message: "Failed to send image message" });
        }
      }
    );

    socket.on(
      "send_private_image_message",
      async (data: {
        courseId: string;
        studentId: string;
        tutorId: string;
        message: {
          sender: string;
          content: string;
          timestamp: string;
          status: string;
        };
        image: { data: string; name: string; type: string };
        senderId: string;
      }) => {
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
          await newMessage.save();
          console.log(`[${new Date().toISOString()}] Image message saved to ${privateChatId}:`, newMessage._id);
          const course = await courseModel.findById(courseId).lean();
          const student = await userModel.findById(studentId).lean();
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
            courseTitle: course?.title || "Unknown Course",
            studentName: student?.name || "Unknown Student",
          });
          await MessageModel.updateOne({ _id: newMessage._id }, { status: "delivered" });
          io.to(privateChatId).emit("receive_private_message", {
            ...newMessage.toObject(),
            status: "delivered",
            courseId,
            studentId,
            tutorId,
            courseTitle: course?.title || "Unknown Course",
            studentName: student?.name || "Unknown Student",
          });
          const recipientId = senderId === tutorId ? studentId : tutorId;
          if (recipientId) {
            const notification = new NotificationModel({
              userId: recipientId,
              type: "chat_message",
              message: `${data.message.sender} sent an image in ${course?.title || "course"}`,
              read: false,
              createdAt: new Date(),
              courseTitle: course?.title || "Unknown Course",
              senderId,
            });
            await notification.save();
            console.log(`[${new Date().toISOString()}] Notification saved for ${recipientId}:`, notification._id);
            io.to(recipientId).emit("notification", {
              _id: notification._id,
              type: "chat_message",
              message: `${data.message.sender} sent an image in ${course?.title || "course"}`,
              courseId,
              studentId,
              tutorId,
              courseTitle: course?.title || "Unknown Course",
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
        } catch (err: any) {
          console.error(`[${new Date().toISOString()}] Error saving image message to private chat ${privateChatId}:`, err.message);
          socket.emit("error", { message: "Failed to send private image message" });
        }
      }
    );

    socket.on(
      "send_notification",
      async ({ communityId, courseTitle, message, senderId }: Notification) => {
        try {
          console.log(`[${new Date().toISOString()}] Sending notification for community ${communityId}`);
          await tutorService.sendCommunityNotifications(communityId, senderId, message, courseTitle);
          socket.to(communityId).emit("receive_notification", {
            type: "chat_message",
            message: `${message.sender} : ${message.content ? message.content.slice(0, 50) + "..." : "Sent an image"}`,
            communityId,
            courseTitle,
            senderId,
            createdAt: new Date().toISOString(),
          });
        } catch (error: any) {
          console.error(`[${new Date().toISOString()}] Error sending notification:`, error.message);
          socket.emit("error", { message: "Failed to send notification" });
        }
      }
    );

    socket.on(
      "mark_private_message_notification_as_read",
      async ({ notificationId }: { notificationId: string }) => {
        try {
          await NotificationModel.updateOne({ _id: notificationId }, { read: true });
          console.log(`[${new Date().toISOString()}] Notification ${notificationId} marked as read`);
          io.emit("notification_read", { notificationId });
        } catch (err: any) {
          console.error(`[${new Date().toISOString()}] Error marking notification as read:`, err.message);
          socket.emit("error", { message: "Failed to mark notification as read" });
        }
      }
    );

    // ------------------- Video Call Event Handlers (Refined) -------------------

    socket.on(
      "call_request",
      async (data: {
        roomId: string;
        studentId: string;
        courseId: string;
        courseTitle: string;
        tutorId: string;
        timestamp: string;
        callerName: string;
      }) => {
        const { roomId, studentId, courseId, courseTitle, tutorId, timestamp, callerName } = data;
        console.log(`[${new Date().toISOString()}] Received call_request:`, data);

        try {
          if (!roomId || !studentId || !courseId || !courseTitle || !tutorId || !timestamp || !callerName) {
            console.error(`[${new Date().toISOString()}] Invalid call_request data: Missing required fields.`, data);
            socket.emit("error", { message: "Invalid call request data" });
            return;
          }

          if (
            !mongoose.Types.ObjectId.isValid(studentId) ||
            !mongoose.Types.ObjectId.isValid(courseId) ||
            !mongoose.Types.ObjectId.isValid(tutorId)
          ) {
            console.error(`[${new Date().toISOString()}] Invalid ObjectId format`, { studentId, courseId, tutorId });
            socket.emit("error", { message: "Invalid student, course, or tutor ID format" });
            return;
          }

          const student = await userModel.findById(studentId).lean();
          if (!student) {
            console.error(`[${new Date().toISOString()}] Student not found: ${studentId}`);
            socket.emit("error", { message: `Student not found with ID ${studentId}` });
            return;
          }

          const course = await courseModel.findById(courseId).lean();
          if (!course) {
            console.error(`[${new Date().toISOString()}] Course not found: ${courseId}`);
            socket.emit("error", { message: `Course not found with ID ${courseId}` });
            return;
          }

          const tutor = await userModel.findById(tutorId).lean();
          if (!tutor) {
            console.error(`[${new Date().toISOString()}] Tutor not found: ${tutorId}`);
            socket.emit("error", { message: `Tutor not found with ID ${tutorId}` });
            return;
          }

          const notification = new NotificationModel({
            userId: tutorId,
            type: "call_request",
            message: `${callerName || student.name || "Student"} is requesting a video call in ${
              courseTitle || course.title || "course"
            }`,
            read: false,
            createdAt: new Date(),
            courseTitle: courseTitle || course.title || "Unknown Course",
            senderId: studentId,
            courseId,
            studentId,
            tutorId,
          });

          await notification.save();
          console.log(`[${new Date().toISOString()}] Call notification saved for tutor ${tutorId}:`, notification._id);

          // Removed status from callHistory creation
          const callHistory = new CallHistory({
            tutorId,
            studentId,
            courseId,
            courseName: courseTitle || course.title || "Unknown Course",
            startTime: new Date(timestamp || Date.now()),
          });
          const savedCall = await callHistory.save();
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
          } else {
            console.warn(`[${new Date().toISOString()}] Tutor ${tutorId} is not connected. Call request not sent.`);
            socket.emit("error", { message: `Tutor ${tutorId} is currently offline or unreachable.` });
          }
        } catch (error: any) {
          console.error(`[${new Date().toISOString()}] Error processing call_request:`, {
            error: error.message,
            stack: error.stack,
            data,
            validationErrors: error.errors ? Object.values(error.errors).map((e: any) => (e as any).message) : null,
          });
          socket.emit("error", { message: `Failed to initiate call: ${error.message}` });
        }
      }
    );

    socket.on("call_accepted", async (data: { callId: string; roomId: string; receiverId: string; userId: string }) => {
      const { callId, roomId, receiverId, userId } = data; // userId is the caller (student), receiverId is the acceptor (tutor)
      console.log(`[${new Date().toISOString()}] Call ${callId} accepted by ${receiverId} (tutor) from ${userId} (student) for room ${roomId}`);

      try {
        if (!callId || !roomId || !receiverId || !userId) {
          console.error(`[${new Date().toISOString()}] Invalid call_accepted data: Missing required fields.`, data);
          socket.emit("error", { message: "Invalid call acceptance data" });
          return;
        }

        // Removed status and endTime updates
        const updatedCall = await CallHistory.findByIdAndUpdate(
          callId,
          { startTime: new Date() },
          { new: true }
        );
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
        } else {
          console.warn(`[${new Date().toISOString()}] Tutor socket not found for ${receiverId}.`);
        }

        if (studentSocketInfo && studentSocketInfo.socketId) {
          io.to(studentSocketInfo.socketId).emit("videoCallStarted", { roomId, roomName, token: studentToken, callId, partnerId: receiverId });
          console.log(`[${new Date().toISOString()}] Sent videoCallStarted to student ${userId} (socket: ${studentSocketInfo.socketId})`);
        } else {
          console.warn(`[${new Date().toISOString()}] Student socket not found for ${userId}.`);
        }

        // Removed status update from notification
        await NotificationModel.updateOne(
          { 
            userId: receiverId, 
            type: "call_request", 
            senderId: userId,
            read: false 
          }, 
          { read: true }
        );
        console.log(`[${new Date().toISOString()}] Notification related to call ${callId} marked as read.`);
      } catch (error: any) {
        console.error(`[${new Date().toISOString()}] Error in call_accepted for callId ${callId}:`, {
          error: error.message,
          stack: error.stack,
          data,
        });
        socket.emit("error", { message: `Failed to accept call: ${error.message}` });
      }
    });

    socket.on(
      "joinVideoCall",
      (data: { roomId: string; userId: string; role: "tutor" | "student" }) => {
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
          socketRooms.get(socket.id)?.add(roomId);

          io.to(roomId).emit("videoCallJoined", {
            roomId,
            roomName,
            token,
          });
          console.log(`[${new Date().toISOString()}] Sent videoCallJoined to room ${roomId}`);
        } catch (error: any) {
          console.error(`[${new Date().toISOString()}] Error in joinVideoCall for user ${userId} in room ${roomId}:`, {
            error: error.message,
            stack: error.stack,
            data,
          });
          socket.emit("error", { message: `Failed to join call: ${error.message}` });
        }
      }
    );

    socket.on("end_call", async (data: EndCallPayload) => {
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
      } catch (error: any) {
        console.error(`[${new Date().toISOString()}] Error in end_call for callId ${callId}:`, {
          error: error.message,
          stack: error.stack,
          data,
        });
        socket.emit("error", { message: `Failed to end call: ${error.message}` });
      }
    });

    // ... (outgoing-video-call, accept-incoming-call, trainer-call-accept remain unchanged as they seem to be for different call flows)

    socket.on("reject-call", async (data: RejectCallPayload) => {
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

          const notification = new NotificationModel({
            userId: to,
            type: "video_call",
            message: `Call rejected by ${name || sender || "the other party"}`,
            read: false,
            createdAt: new Date(),
            senderId: actualSenderId,
          });
          await notification.save();
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
        } else {
          console.error(`[${new Date().toISOString()}] Recipient user ${to} is not online. Cannot send 'call-rejected' or notification.`);
        }
      } catch (error: any) {
        console.error(`[${new Date().toISOString()}] Error in reject-call for callId ${callId}:`, {
          error: error.message,
          stack: error.stack,
          data,
        });
        socket.emit("error", { message: "Failed to reject call" });
      }
    });

    socket.on("leave-room", async (data: LeaveRoomPayload) => {
      const { to, callId } = data;
      console.log(`[${new Date().toISOString()}] Received leave-room from ${queryUserId} for callId ${callId}, notifying ${to}`);
      console.log("huak",callId,to)
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

          const sender = await userModel.findById(queryUserId).lean();
          if (sender) {
            const notification = new NotificationModel({
              userId: to,
              type: "video_call",
              message: `${sender.name || "User"} left the call`,
              read: false,
              createdAt: new Date(),
              senderId: queryUserId,
            });
            await notification.save();
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
        } else {
          console.warn(`[${new Date().toISOString()}] Recipient user ${to} is not online. Cannot send 'user-left' or notification.`);
        }
      } catch (error: any) {
        console.error(`[${new Date().toISOString()}] Error in leave-room for callId ${callId}:`, {
          error: error.message,
          stack: error.stack,
          data,
        });
        socket.emit("error", { message: "Failed to leave room" });
      }
    });

    socket.on("leave_room", (roomId: string) => {
      socket.leave(roomId);
      socketRooms.get(socket.id)?.delete(roomId);
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