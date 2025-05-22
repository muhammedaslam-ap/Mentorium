import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import mongoose, { Document, Schema } from "mongoose";
import { TutorService } from "../services/tutorServices";
import { TutorRepository } from "../repositories/tutorRepository";

interface Message extends Document {
  _id: string;
  communityId: string;
  sender: string;
  content: string;
  timestamp: string;
  status: "sent" | "delivered" | "read";
  imageUrl?: string;
}

interface Notification {
  communityId: string;
  courseTitle: string;
  message: Message;
  senderId: string;
}

const messageSchema = new Schema<Message>({
  communityId: { type: String, required: true },
  sender: { type: String, required: true },
  content: { type: String, default: "" },
  timestamp: { type: String, required: true },
  status: { type: String, enum: ["sent", "delivered", "read"], default: "sent" },
  imageUrl: { type: String, default: "" },
});

const MessageModel = mongoose.model<Message>("Message", messageSchema);

const tutorRepository = new TutorRepository();
const tutorService = new TutorService(tutorRepository);

export const initializeSocket = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log(`New client connected: ${socket.id}`);

    socket.on("join_community", async (communityId: string) => {
      if (!communityId) {
        console.error("No communityId provided");
        socket.emit("error", { message: "Community ID is required" });
        return;
      }

      try {
        socket.join(communityId);
        console.log(`User ${socket.id} joined community: ${communityId}`);

        const messages = await MessageModel.find({ communityId })
          .sort({ timestamp: 1 })
          .limit(50)
          .lean();

        console.log(`Fetched ${messages.length} messages for community ${communityId}`);
        socket.emit("message_history", messages);
      } catch (error) {
        console.error(`Error joining community ${communityId}:`, error);
        socket.emit("error", { message: "Failed to join community" });
      }
    });

    socket.on(
      "send_message",
      async ({ communityId, message }: { communityId: string; message: Message }) => {
        if (!communityId || !message.sender || !message.timestamp) {
          console.error("Invalid message data");
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
          console.log(`Message saved for community ${communityId}:`, newMessage._id);

          io.to(communityId).emit("receive_message", {
            _id: newMessage._id,
            sender: newMessage.sender,
            content: newMessage.content,
            timestamp: newMessage.timestamp,
            status: newMessage.status,
          });

          await MessageModel.updateOne(
            { _id: newMessage._id },
            { status: "delivered" }
          );

          io.to(communityId).emit("receive_message", {
            ...newMessage.toObject(),
            status: "delivered",
          });
        } catch (error) {
          console.error("Error sending message:", error);
          socket.emit("error", { message: "Failed to send message" });
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
          console.error("Invalid image message data");
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
          console.log(`Image message saved for community ${communityId}:`, newMessage._id);

          io.to(communityId).emit("receive_message", {
            _id: newMessage._id,
            sender: newMessage.sender,
            content: newMessage.content,
            timestamp: newMessage.timestamp,
            status: newMessage.status,
            imageUrl: newMessage.imageUrl,
          });

          await MessageModel.updateOne(
            { _id: newMessage._id },
            { status: "delivered" }
          );

          io.to(communityId).emit("receive_message", {
            ...newMessage.toObject(),
            status: "delivered",
          });
        } catch (error) {
          console.error("Error sending image message:", error);
          socket.emit("error", { message: "Failed to send image message" });
        }
      }
    );

    socket.on(
      "send_notification",
      async ({
        communityId,
        courseTitle,
        message,
        senderId,
      }: Notification) => {
        try {
          console.log(`Sending notification for community ${communityId}`);

          await tutorService.sendCommunityNotifications(
            communityId,
            senderId,
            message,
            courseTitle
          );

          socket.to(communityId).emit("receive_notification", {
            type: "chat_message",
            message: `${message.sender} : ${
              message.content ? message.content.slice(0, 50) + "..." : "Sent an image"
            }`,
            communityId,
            courseTitle,
            senderId,
            createdAt: new Date().toISOString(),
          });
        } catch (error) {
          console.error("Error sending notification:", error);
          socket.emit("error", { message: "Failed to send notification" });
        }
      }
    );

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};