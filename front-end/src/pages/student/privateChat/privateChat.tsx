import { useState, useRef, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Send, Image, ArrowLeft, Check, CheckCheck, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { io, Socket } from "socket.io-client";
import { useInView } from "react-intersection-observer";
import { toast } from "sonner";
import Header from "../../student/components/header";
import React from "react";
import { RootState } from "../../../redux/store";
import { profileService } from "@/services/userServices/profileService";
import { v4 as uuidv4 } from "uuid";

interface Message {
  _id?: string;
  senderId: string;
  sender: string;
  content: string;
  timestamp: string;
  status?: "sent" | "delivered" | "read";
  imageUrl?: string;
  courseId?: string;
  studentId?: string;
  tutorId?: string;
  courseTitle?: string;
  studentName?: string;
  clientId?: string;
}

interface Notification {
  type: string;
  message: string;
  courseId: string;
  studentId: string;
  tutorId: string;
  courseTitle: string;
  timestamp: string;
  senderId: string;
}

interface PrivateChatProps {
  studentId?: string;
  tutorId?: string;
  courseId?: string;
  courseTitle?: string;
}

// Skeleton Loader for Messages
const MessageSkeleton = ({ isOwnMessage }: { isOwnMessage: boolean }) => (
  <div
    className={cn(
      "flex w-full gap-2 items-end animate-pulse",
      isOwnMessage ? "justify-end" : "justify-start"
    )}
  >
    <div
      className={cn(
        "max-w-md rounded-2xl p-4 shadow-md",
        isOwnMessage
          ? "bg-gradient-to-br from-indigo-500/50 to-purple-600/50 rounded-br-sm"
          : "bg-gray-100 rounded-bl-sm"
      )}
    >
      <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
      <div className="h-4 bg-gray-300 rounded w-40"></div>
    </div>
  </div>
);

// Memoized Message Item
const MessageItem = React.memo(
  ({
    message,
    userId,
    formatTimestamp,
  }: {
    message: Message;
    userId: string;
    formatTimestamp: (timestamp: string) => string;
  }) => (
    <div
      className={cn(
        "flex w-full gap-2 items-end animate-fade-in",
        message.senderId === userId ? "justify-end" : "justify-start" // Conditional alignment
      )}
    >
      <div
        className={cn(
          "max-w-md rounded-2xl p-4 shadow-md",
          "transform transition-all duration-200 hover:scale-[1.01]",
          message.senderId === userId
            ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-br-sm"
            : "bg-white text-gray-800 rounded-bl-sm"
        )}
      >
        <div className="flex items-baseline justify-between mb-1">
          <span className="font-medium text-sm">{message.sender}</span>
          <span
            className={cn(
              "text-xs ml-2 flex items-center gap-1",
              message.senderId === userId ? "text-indigo-100" : "text-gray-400"
            )}
          >
            {formatTimestamp(message.timestamp)}
            {message.senderId === userId && message.status && (
              <span className="ml-1">
                {message.status === "delivered" ? (
                  <Check className="h-3 w-3" />
                ) : message.status === "read" ? (
                  <CheckCheck className="h-3 w-3" />
                ) : null}
              </span>
            )}
          </span>
        </div>
        {message.imageUrl ? (
          <img
            src={message.imageUrl}
            alt="Uploaded image"
            className="max-w-full h-auto rounded-lg mt-2"
            loading="lazy"
          />
        ) : (
          <p className="text-[15px] leading-relaxed">{message.content}</p>
        )}
      </div>
    </div>
  )
);

export function PrivateChat() {
  const location = useLocation();
  const navigate = useNavigate();
  const { courseId: paramCourseId, tutorId: paramTutorId } = useParams<{
    courseId?: string;
    tutorId?: string;
  }>();
  const {
    studentId: stateStudentId,
    tutorId: stateTutorId,
    courseId: stateCourseId,
    courseTitle,
  } = (location.state as PrivateChatProps) || {};
  const [messages, setMessages] = useState<Message[]>([]);
  const [visibleMessages, setVisibleMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [tutorName, setTutorName] = useState<string>("Instructor");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { ref: loadMoreRef, inView } = useInView();
  const user = useSelector((state: RootState) => state.user.userDatas);
  const userId = user?._id || user?.id;
  const userName = user?.name || user?.username || "User";
  const studentId = user?.role === "student" ? userId : stateStudentId;
  const tutorId = stateTutorId || paramTutorId;
  const studentName = user?.role === "student" ? userName : `Student ${studentId || ""}`;
  const courseId = stateCourseId || paramCourseId;

  // Debug user and message data
  useEffect(() => {
    console.log("User data:", { userId, userName, role: user?.role, user });
    console.log("Chat config:", { courseId, studentId, tutorId, tutorName });
  }, [userId, userName, user, courseId, studentId, tutorId, tutorName]);

  // Fetch tutor details
  useEffect(() => {
    if (!tutorId) return;
    const fetchTutorName = async () => {
      try {
        const tutor = await profileService.userDetails(tutorId);
        setTutorName(tutor.userData.name || "Instructor");
      } catch (error: any) {
        console.error("Failed to fetch tutor name:", error);
        toast.error(error.message || "Could not load tutor's name");
        setTutorName("Instructor");
      }
    };
    fetchTutorName();
  }, [tutorId]);

  // Socket.IO connection
  useEffect(() => {
    if (!userId) {
      toast.error("Please log in to access the chat");
      navigate("/login");
      return;
    }

    if (!studentId || !tutorId || !courseId) {
      toast.error("Invalid chat configuration. Please try again.");
      console.error("Missing chat configuration:", {
        studentId,
        tutorId,
        courseId,
      });
      navigate(-1);
      return;
    }

    socketRef.current = io(import.meta.env.VITE_AUTH_BASEURL || "http://localhost:3000", {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current.on("connect", () => {
      console.log("Socket.IO connected:", socketRef.current?.id);
      socketRef.current?.emit("join_user", userId);
      socketRef.current?.emit("join_private_chat", {
        courseId,
        studentId,
        tutorId,
      });
      setIsLoadingMessages(true);
    });

    socketRef.current.on("connect_error", (error) => {
      console.error("Socket.IO connection error:", error);
      toast.error("Failed to connect to chat server");
      setIsLoadingMessages(false);
    });

    socketRef.current.on("error", (error: { message: string }) => {
      console.error("Socket.IO error:", error);
      toast.error(error.message || "An error occurred");
      setIsLoadingMessages(false);
    });

    socketRef.current.on("private_message_history", (history: Message[]) => {
      console.log("Received message history:", history);
      setMessages(
        history.map((msg) => {
          const isTutor = msg.sender.toLowerCase() === tutorName.toLowerCase();
          const senderId = isTutor ? tutorId : studentId;
          console.log("History message:", { senderId, userId, sender: msg.sender });
          return {
            _id: msg._id?.toString(),
            senderId: senderId || userId,
            sender: isTutor ? tutorName : studentName,
            content: msg.content || "",
            timestamp: msg.timestamp,
            status: msg.status || "sent",
            imageUrl: msg.imageUrl,
            courseId,
            studentId,
            tutorId,
            courseTitle,
            studentName,
            clientId: msg.clientId,
          };
        })
      );
      setIsLoadingMessages(false);
    });

    socketRef.current.on("receive_private_message", (message: Message) => {
      console.log("Received private message:", message);
      const isTutor = message.sender.toLowerCase() === tutorName.toLowerCase();
      const senderId = isTutor ? tutorId : studentId;
      console.log("Message details:", { senderId, userId, sender: message.sender });
      setMessages((prev) => {
        if (
          (message._id && prev.some((msg) => msg._id === message._id)) ||
          (message.clientId && prev.some((msg) => msg.clientId === message.clientId))
        ) {
          return prev;
        }
        return [
          ...prev,
          {
            _id: message._id?.toString(),
            senderId: senderId || userId,
            sender: isTutor ? tutorName : studentName,
            content: message.content || "",
            timestamp: message.timestamp,
            status: message.status || "sent",
            imageUrl: message.imageUrl,
            courseId,
            studentId,
            tutorId,
            courseTitle,
            studentName: message.studentName || studentName,
            clientId: message.clientId,
          },
        ];
      });
    });

    socketRef.current.on("notification", (notification: Notification) => {
      console.log("Received notification:", notification);
      if (
        notification.senderId !== userId &&
        notification.type === "chat_message"
      ) {
        toast.info(notification.message, {
          action: {
            label: "Mark as Read",
            onClick: () => {
              socketRef.current?.emit("mark_private_message_notification_as_read", {
                courseId: notification.courseId,
                studentId: notification.studentId,
                tutorId: notification.tutorId,
              });
              toast.success("Notification marked as read");
            },
          },
        });
      }
    });

    return () => {
      socketRef.current?.off("connect");
      socketRef.current?.off("connect_error");
      socketRef.current?.off("error");
      socketRef.current?.off("private_message_history");
      socketRef.current?.off("receive_private_message");
      socketRef.current?.off("notification");
      socketRef.current?.disconnect();
    };
  }, [
    courseId,
    studentId,
    tutorId,
    userId,
    userName,
    studentName,
    courseTitle,
    tutorName,
    navigate,
  ]);

  // Infinite scrolling
  const messagesPerPage = 20;
  useEffect(() => {
    setVisibleMessages(messages.slice(0, messagesPerPage));
  }, [messages]);

  useEffect(() => {
    if (inView && visibleMessages.length < messages.length) {
      setVisibleMessages((prev) => messages.slice(0, prev.length + messagesPerPage));
    }
  }, [inView, messages, visibleMessages.length]);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSendMessage = useCallback(() => {
    if (!newMessage.trim() || !studentId || !tutorId || !courseId || !userName) return;

    const clientId = uuidv4();
    const newMsg: Message = {
      senderId: userId,
      sender: userName,
      content: newMessage,
      timestamp: new Date().toISOString(),
      status: "sent",
      courseId,
      studentId,
      tutorId,
      courseTitle,
      studentName,
      clientId,
    };
    console.log("Sending message:", newMsg);
    socketRef.current?.emit("send_private_message", {
      courseId,
      studentId,
      tutorId,
      message: newMsg,
    });
    setNewMessage("");
  }, [newMessage, studentId, tutorId, courseId, userName, userId, courseTitle, studentName]);

  const handleImageUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file || !studentId || !tutorId || !courseId || !userName) return;

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Only image files are allowed");
        return;
      }

      const clientId = uuidv4();
      const reader = new FileReader();
      reader.onload = () => {
        const newMsg: Message = {
          senderId: userId,
          sender: userName,
          content: "",
          timestamp: new Date().toISOString(),
          status: "sent",
          courseId,
          studentId,
          tutorId,
          courseTitle,
          studentName,
          clientId,
        };
        console.log("Sending image message:", newMsg);
        socketRef.current?.emit("send_private_image_message", {
          courseId,
          studentId,
          tutorId,
          message: newMsg,
          image: {
            data: reader.result,
            name: file.name,
            type: file.type,
          },
          senderId: userId,
        });
      };
      reader.readAsDataURL(file);
      event.target.value = "";
    },
    [studentId, tutorId, courseId, userName, userId, courseTitle, studentName]
  );

  const formatTimestamp = useCallback((timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  }, []);

  if (!user || user.role !== "student") {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-slate-600">Please log in as a student to access the chat</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <style>
        {`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fade-in 0.3s ease-out;
          }
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.05);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(0, 0, 0, 0.15);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(0, 0, 0, 0.25);
          }
        `}
      </style>
      <Header />
      <div className="flex flex-1">
        <div className="flex-1 flex flex-col min-w-0">
          <header className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-4">
              <button
                className="text-gray-600 hover:text-gray-900"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  Chat with {tutorName} ({courseTitle || "Unknown Course"})
                </h1>
                <p className="text-sm text-gray-500">Private Conversation</p>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-hidden relative bg-gradient-to-b from-gray-50 to-gray-100">
            <div className="absolute inset-0 overflow-y-auto px-6 py-4 custom-scrollbar">
              <div className="max-w-4xl mx-auto space-y-4">
                {isLoadingMessages ? (
                  <div className="space-y-6">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <MessageSkeleton
                        key={index}
                        isOwnMessage={index % 2 === 0}
                      />
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">No messages yet</p>
                    <p className="text-slate-400 text-sm mt-2">Start the conversation!</p>
                  </div>
                ) : (
                  visibleMessages.map((message, index) => (
                    <MessageItem
                      key={message._id || message.clientId || index}
                      message={message}
                      userId={userId}
                      formatTimestamp={formatTimestamp}
                    />
                  ))
                )}
                {visibleMessages.length < messages.length && (
                  <div ref={loadMoreRef} className="h-10" />
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          </main>

          <div className="bg-white border-t p-4 shadow-sm">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "p-3 rounded-full",
                    "bg-gray-200 text-gray-600",
                    "hover:bg-gray-300",
                    "transition-all duration-200"
                  )}
                >
                  <Image className="h-5 w-5" />
                </button>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Type your message..."
                  className={cn(
                    "flex-1 px-4 py-3 rounded-full",
                    "bg-gray-100 border border-gray-200",
                    "focus:ring-2",
                    "placeholder-gray-400 text-gray-800 transition-all duration-200"
                  )}
                />
                <button
                  onClick={handleSendMessage}
                  className={cn(
                    "p-3 rounded-full",
                    "bg-gradient-to-r from-indigo-500 to-purple-600",
                    "text-white shadow-md",
                    "hover:from-indigo-600 hover:to-purple-700",
                    "transition-all duration-200",
                    "disabled:opacity-50",
                    "focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  )}
                  disabled={!newMessage.trim()}
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(PrivateChat);