import { useState, useEffect, useRef } from "react";
import { Send, Menu, Check, CheckCheck, Image, MessageSquare, Smile } from "lucide-react";
import { cn } from "@/lib/utils";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import { Header } from "../components/header";
import SideBar from "../components/sideBar";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { useSelector } from "react-redux";
import { profileService } from "@/services/userServices/profileService";
// import { RootState } from "@/redux/store";
import Picker from "emoji-picker-react"; // Import emoji picker

interface Chat {
  privateChatId: string;
  courseId: string;
  studentId: string;
  courseTitle: string;
  studentName: string;
  latestMessage: {
    content: string;
    timestamp: string;
    imageUrl?: string;
  } | null;
  unreadCount: number;
}

interface Message {
  _id?: string;
  sender: string;
  content: string;
  timestamp: string;
  status?: "sent" | "delivered" | "read";
  imageUrl?: string;
  courseId: string;
  studentId: string;
  tutorId: string;
  courseTitle: string;
  studentName: string;
}

export function MessagesPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isChatListOpen, setIsChatListOpen] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [studentNames, setStudentNames] = useState<{ [key: string]: string }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const processedMessageIds = useRef<Set<string>>(new Set()); // Track processed messages
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); // State for emoji picker visibility

  const { tutorId, tutorName } = useSelector((state: any) => ({
    tutorId: state.tutor.tutorDatas?.id || state.tutor.tutorDatas?._id ,
    tutorName: state.tutor.tutorDatas?.username || "Unknown",
  }));

  useEffect(() => {
    if (!tutorId) {
      console.error("No tutorId found in Redux store");
      toast.error("Please log in to view messages");
    } else {
      console.log("Tutor details from Redux:", { tutorId, tutorName });
    }
  }, [tutorId, tutorName]);

  const fetchStudentName = async (studentId: string): Promise<string> => {
    if (studentNames[studentId]) {
      return studentNames[studentId];
    }
    try {
      const response = await profileService.userDetails(studentId);
      const studentName = response?.userdata?.username || `Student ${studentId}`;
      setStudentNames((prev) => ({ ...prev, [studentId]: studentName }));
      return studentName;
    } catch (error) {
      console.error(`Failed to fetch student name for studentId ${studentId}:`, error);
      return `Student ${studentId}`;
    }
  };

  useEffect(() => {
    if (!tutorId) return;

    socketRef.current = io(import.meta.env.VITE_AUTH_BASEURL, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current.on("connect", () => {
      console.log("Socket connected on tutor side:", socketRef.current?.id);
      setIsSocketConnected(true);

      socketRef.current?.emit("join_user", tutorId, () => {
        console.log("Tutor joined user room:", tutorId);
        socketRef.current?.emit("fetch_private_chats", { tutorId });
        console.log("Fetching private chats for tutor:", tutorId);
      });
    });

    socketRef.current.on("private_chats", async (data: { chats: Chat[] }) => {
      console.log("[private_chats] Received:", data.chats);

      const studentNamePromises = data.chats.map(async (chat: Chat) => {
        const studentName = chat.studentName || (await fetchStudentName(chat.studentId));
        return { ...chat, studentName };
      });

      const updatedChatsWithNames = await Promise.all(studentNamePromises);

      const updatedChats = updatedChatsWithNames.map((chat) => ({
        ...chat,
        unreadCount: 0,
      }));

      setChats(updatedChats || []);
      if (updatedChats.length > 0 && !selectedChat) {
        setSelectedChat(updatedChats[0]);
        console.log("Auto-selected chat:", updatedChats[0]);
      }
    });

    socketRef.current.on(
      "notification",
      async ({
        type,
        message: notificationMessage,
        courseId,
        studentId,
        tutorId: notificationTutorId,
        courseTitle,
        studentName: providedStudentName,
        timestamp,
        senderId,
      }) => {
        console.log("Received notification:", {
          type,
          notificationMessage,
          courseId,
          studentId,
          tutorId: notificationTutorId,
          courseTitle,
          studentName: providedStudentName,
          timestamp,
          senderId,
        });

        if (type !== "chat_message" || notificationTutorId !== tutorId || senderId === tutorId) {
          console.log("Skipping notification:", { type, notificationTutorId, tutorId, senderId });
          return;
        }

        const privateChatId = `private_${courseId}_${studentId}_${tutorId}`;
        const messageContent = notificationMessage
          .replace(`${providedStudentName || "Unknown Student"} sent a message: `, "")
          .replace(/\.\.\.$/, "")
          .trim();

        const studentName =
          providedStudentName || studentNames[studentId] || (await fetchStudentName(studentId));

        setChats((prev) => {
          const chatIndex = prev.findIndex((chat) => chat.privateChatId === privateChatId);
          let updatedChats: Chat[];

          if (chatIndex === -1) {
            const newChat: Chat = {
              privateChatId,
              courseId,
              studentId,
              courseTitle: courseTitle || "Unknown Course",
              studentName,
              latestMessage: {
                content: messageContent,
                timestamp: timestamp,
              },
              unreadCount: selectedChat?.privateChatId === privateChatId ? 0 : 1,
            };
            updatedChats = [newChat, ...prev];
            console.log("Added new chat from notification:", newChat);

            if (!selectedChat) {
              setSelectedChat(newChat);
              console.log("Auto-selected new chat:", newChat);
            }
          } else {
            updatedChats = [...prev];
            updatedChats[chatIndex] = {
              ...updatedChats[chatIndex],
              studentName: updatedChats[chatIndex].studentName || studentName,
              latestMessage: {
                content: messageContent,
                timestamp: timestamp,
              },
              unreadCount:
                selectedChat?.privateChatId === privateChatId
                  ? updatedChats[chatIndex].unreadCount
                  : (updatedChats[chatIndex].unreadCount || 0) + 1,
            };
            updatedChats = [
              updatedChats[chatIndex],
              ...updatedChats.slice(0, chatIndex),
              ...updatedChats.slice(chatIndex + 1),
            ];
            console.log("Updated existing chat from notification:", updatedChats[chatIndex]);
          }

          updatedChats.sort(
            (a, b) =>
              new Date(b.latestMessage?.timestamp || 0).getTime() -
              new Date(a.latestMessage?.timestamp || 0).getTime()
          );

          return updatedChats;
        });
      }
    );

    socketRef.current.on("private_message_history", (history: Message[]) => {
      console.log("Received private_message_history:", history);
      if (!selectedChat) {
        console.log("No selected chat when history received, waiting...");
        return;
      }

      // Clear processed messages to reset for new history
      processedMessageIds.current.clear();

      const mappedHistory = history.map((msg) => {
        const mappedMsg: Message = {
          _id: msg._id?.toString(),
          sender: msg.sender || "Unknown",
          content: msg.content || "",
          timestamp: msg.timestamp
            ? new Date(msg.timestamp).toISOString()
            : new Date().toISOString(),
          status: msg.status || "sent",
          imageUrl: msg.imageUrl,
          courseId: selectedChat.courseId,
          studentId: selectedChat.studentId,
          tutorId: tutorId!,
          courseTitle: selectedChat.courseTitle,
          studentName: selectedChat.studentName,
        };
        // Add to processed messages
        if (mappedMsg._id) {
          processedMessageIds.current.add(mappedMsg._id);
        }
        return mappedMsg;
      });

      console.log("Mapped message history:", mappedHistory);
      setMessages([...mappedHistory]);
      console.log("Updated messages state with history:", mappedHistory);
    });

    socketRef.current.on("receive_private_message", async (message: Message) => {
      console.log("Received private message:", message);
      const privateChatId = `private_${message.courseId}_${message.studentId}_${message.tutorId}`;

      // Skip if message is already processed
      if (message._id && processedMessageIds.current.has(message._id)) {
        console.log("Skipping duplicate message with _id:", message._id);
        return;
      }

      const studentName =
        message.studentName ||
        studentNames[message.studentId] ||
        (await fetchStudentName(message.studentId));

      setChats((prev) => {
        const chatIndex = prev.findIndex((chat) => chat.privateChatId === privateChatId);
        let updatedChats: Chat[] = [...prev];

        if (chatIndex === -1) {
          const newChat: Chat = {
            privateChatId,
            courseId: message.courseId,
            studentId: message.studentId,
            courseTitle: message.courseTitle,
            studentName,
            latestMessage: {
              content: message.content,
              timestamp: message.timestamp,
              imageUrl: message.imageUrl,
            },
            unreadCount: selectedChat?.privateChatId === privateChatId ? 0 : 1,
          };
          updatedChats = [newChat, ...updatedChats];
          console.log("Added new chat from receive_private_message:", newChat);

          if (!selectedChat) {
            setSelectedChat(newChat);
            console.log("Auto-selected new chat:", newChat);
          }
        } else {
          updatedChats[chatIndex] = {
            ...updatedChats[chatIndex],
            studentName: updatedChats[chatIndex].studentName || studentName,
            latestMessage: {
              content: message.content,
              timestamp: message.timestamp,
              imageUrl: message.imageUrl,
            },
            unreadCount:
              selectedChat?.privateChatId === privateChatId
                ? updatedChats[chatIndex].unreadCount
                : (updatedChats[chatIndex].unreadCount || 0) + 1,
          };
          updatedChats = [
            updatedChats[chatIndex],
            ...updatedChats.slice(0, chatIndex),
            ...updatedChats.slice(chatIndex + 1),
          ];
          console.log("Updated chat with correct studentName:", updatedChats[chatIndex]);
        }

        updatedChats.sort(
          (a, b) =>
            new Date(b.latestMessage?.timestamp || 0).getTime() -
            new Date(a.latestMessage?.timestamp || 0).getTime()
        );

        return updatedChats;
      });

      if (selectedChat && selectedChat.privateChatId === privateChatId) {
        console.log("Updating messages for selected chat, sender:", message.sender, "tutorName:", tutorName);
        if (message.sender !== tutorName) {
          if (message._id) {
            processedMessageIds.current.add(message._id);
          }
          console.log("Adding received message from student:", message);
          setMessages((prev) => [...prev, { ...message, studentName }]);
        } else {
          console.log("Skipping message sent by tutor:", message);
        }
      } else {
        console.log("Message received but not for selected chat:", { message, selectedChat });
      }
    });

    socketRef.current.on("error", (error: { message: string }) => {
      console.error("Socket error:", error);
      toast.error(error.message || "Failed to load chats");
    });

    socketRef.current.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      toast.error("Failed to connect to server, retrying...");
    });

    return () => {
      socketRef.current?.off("connect");
      socketRef.current?.off("private_chats");
      socketRef.current?.off("notification");
      socketRef.current?.off("receive_private_message");
      socketRef.current?.off("private_message_history");
      socketRef.current?.off("error");
      socketRef.current?.off("connect_error");
      socketRef.current?.disconnect();
      setIsSocketConnected(false);
    };
  }, [tutorId, tutorName, selectedChat]);

  useEffect(() => {
    if (!isSocketConnected || !selectedChat || !socketRef.current || !tutorId) {
      console.log("Skipping join_private_chat, conditions not met:", {
        isSocketConnected,
        selectedChat,
        tutorId,
      });
      return;
    }

    console.log("Joining private chat:", {
      courseId: selectedChat.courseId,
      studentId: selectedChat.studentId,
      tutorId,
    });
    setMessages([]);
    socketRef.current.emit("join_private_chat", {
      courseId: selectedChat.courseId,
      studentId: selectedChat.studentId,
      tutorId,
    });
  }, [isSocketConnected, selectedChat, tutorId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSelectChat = (chat: Chat) => {
    setSelectedChat(chat);
    setIsChatListOpen(false);
    setChats((prev) =>
      prev.map((c) => (c.privateChatId === chat.privateChatId ? { ...c, unreadCount: 0 } : c))
    );
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && tutorId && selectedChat && tutorName) {
      const newMsg: Message = {
        sender: tutorName,
        content: newMessage,
        timestamp: new Date().toISOString(),
        status: "sent",
        courseId: selectedChat.courseId,
        studentId: selectedChat.studentId,
        tutorId,
        courseTitle: selectedChat.courseTitle,
        studentName: selectedChat.studentName,
      };
      console.log("Sending private message:", newMsg);
      socketRef.current?.emit("send_private_message", {
        courseId: selectedChat.courseId,
        studentId: selectedChat.studentId,
        tutorId,
        message: newMsg,
      });
      setMessages((prev) => [...prev, newMsg]);
      setNewMessage("");

      const privateChatId = `private_${selectedChat.courseId}_${selectedChat.studentId}_${tutorId}`;
      setChats((prev) => {
        const chatIndex = prev.findIndex((chat) => chat.privateChatId === privateChatId);
        if (chatIndex === -1) return prev;

        const updatedChats = [...prev];
        updatedChats[chatIndex] = {
          ...updatedChats[chatIndex],
          latestMessage: {
            content: newMessage,
            timestamp: new Date().toISOString(),
          },
        };
        return [
          updatedChats[chatIndex],
          ...updatedChats.slice(0, chatIndex),
          ...updatedChats.slice(chatIndex + 1),
        ];
      });
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && tutorId && selectedChat && tutorName) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Only image files are allowed");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const newMsg: Message = {
          sender: tutorName,
          content: "",
          timestamp: new Date().toISOString(),
          status: "sent",
          courseId: selectedChat.courseId,
          studentId: selectedChat.studentId,
          tutorId,
          courseTitle: selectedChat.courseTitle,
          studentName: selectedChat.studentName,
        };
        console.log("Sending private image message:", newMsg);
        socketRef.current?.emit("send_private_image_message", {
          courseId: selectedChat.courseId,
          studentId: selectedChat.studentId,
          tutorId,
          message: newMsg,
          image: {
            data: reader.result,
            name: file.name,
            type: file.type,
          },
          senderId: tutorId,
        });
        setMessages((prev) => [
          ...prev,
          { ...newMsg, imageUrl: reader.result as string },
        ]);

        const privateChatId = `private_${selectedChat.courseId}_${selectedChat.studentId}_${tutorId}`;
        setChats((prev) => {
          const chatIndex = prev.findIndex((chat) => chat.privateChatId === privateChatId);
          if (chatIndex === -1) return prev;

          const updatedChats = [...prev];
          updatedChats[chatIndex] = {
            ...updatedChats[chatIndex],
            latestMessage: {
              content: "",
              timestamp: new Date().toISOString(),
              imageUrl: reader.result as string,
            },
          };
          return [
            updatedChats[chatIndex],
            ...updatedChats.slice(0, chatIndex),
            ...updatedChats.slice(chatIndex + 1),
          ];
        });
      };
      reader.readAsDataURL(file);
      event.target.value = "";
    }
  };

  const handleEmojiClick = (emojiData: any) => {
    setNewMessage((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false); // Optionally hide picker after selection
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col w-full">
      <style>
        {`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes pulse {
            0% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.2); opacity: 1; }
            100% { transform: scale(1); opacity: 0.9; }
          }
          .animate-fade-in {
            animation: fade-in 0.3s ease-out;
          }
          .animate-pulse-on-update {
            animation: pulse 0.5s ease-in-out;
          }
        `}
      </style>
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex flex-col md:flex-row gap-6 p-6 w-full">
        <div className="w-full md:w-64 flex-shrink-0">
          <SideBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        </div>
        <div className={`flex-1 w-full ${sidebarOpen ? "md:ml-64" : ""}`}>
          {tutorId ? (
            <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-8rem)] w-full">
              <aside
                className={cn(
                  "w-full md:w-80 bg-white shadow-lg border-r",
                  "md:block",
                  isChatListOpen ? "block" : "hidden"
                )}
              >
                <div className="p-6 border-b bg-gradient-to-r from-indigo-600 to-purple-600">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    Student Chats
                  </h2>
                  <p className="text-indigo-100 text-sm mt-1">
                    Connect with Your Students
                  </p>
                </div>
                <div className="overflow-y-auto h-[calc(100vh-12rem)]">
                  {chats.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-200 w-full">
                      <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500 font-medium">No chats yet</p>
                    </div>
                  ) : (
                    chats.map((chat) => (
                      <div
                        key={chat.privateChatId}
                        className={cn(
                          "p-4 cursor-pointer transition-colors duration-200",
                          "hover:bg-indigo-50 border-b border-gray-100",
                          selectedChat?.privateChatId === chat.privateChatId && "bg-indigo-50"
                        )}
                        onClick={() => handleSelectChat(chat)}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-semibold text-slate-800 truncate">
                            {chat.studentName}
                          </h3>
                          {chat.unreadCount > 0 && (
                            <span
                              className={cn(
                                "bg-gradient-to-r from-indigo-500 to-purple-600",
                                "text-white text-sm font-medium rounded-full px-2.5 py-0.5",
                                "shadow-sm opacity-90",
                                "hover:scale-110 hover:brightness-110",
                                "transition-all duration-200",
                                "animate-pulse-on-update"
                              )}
                            >
                              {chat.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 mt-1">{chat.courseTitle}</p>
                        {chat.latestMessage && (
                          <p className="text-xs text-slate-500 mt-1 truncate">
                            {chat.latestMessage.content || "Image"}
                          </p>
                        )}
                        <div className="flex items-center mt-2 text-xs text-slate-400">
                          <span>Private Chat</span>
                          <span className="mx-2">•</span>
                          <span>{chat.latestMessage ? formatTimestamp(chat.latestMessage.timestamp) : "No messages yet"}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </aside>

              <div className="flex-1 flex flex-col w-full">
                {chats.length === 0 ? (
                  <div className="flex items-center justify-center h-full w-full">
                    <Card className="border-0 shadow-md w-full max-w-md">
                      <CardContent className="pt-6 text-center">
                        <MessageSquare className="h-12 w-12 text-indigo-500 mx-auto mb-4" />
                        <CardTitle className="text-xl font-bold text-slate-800">
                          No Messages Yet
                        </CardTitle>
                        <p className="text-slate-600 mt-2">
                          Start a conversation with your students to get started!
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <>
                    <header className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm">
                      <div className="flex items-center space-x-4">
                        <button
                          className="md:hidden text-slate-600 hover:text-slate-900"
                          onClick={() => setIsChatListOpen(!isChatListOpen)}
                        >
                          <Menu className="h-6 w-6" />
                        </button>
                        <div>
                          <h1 className="text-xl font-bold text-slate-800">
                            {selectedChat?.studentName || "Select a Student"}
                          </h1>
                          <p className="text-sm text-slate-600">{selectedChat?.courseTitle || ""}</p>
                        </div>
                      </div>
                    </header>

                    <main className="flex-1 overflow-y-auto p-6 bg-gray-100">
                      <div className="max-w-4xl mx-auto space-y-4">
                        {messages.map((message) => (
                          <div
                            key={message._id || message.timestamp}
                            className={cn(
                              "flex w-full gap-2 items-end animate-fade-in",
                              message.sender === tutorName ? "justify-end" : "justify-start"
                            )}
                          >
                            <div
                              className={cn(
                                "max-w-md rounded-2xl p-4 shadow-md",
                                "transform transition-all duration-200 hover:scale-[1.01]",
                                message.sender === tutorName
                                  ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-br-sm"
                                  : "bg-white text-gray-800 rounded-bl-sm"
                              )}
                            >
                              <div className="flex items-baseline justify-between mb-1">
                                <span className="font-medium text-sm">{message.sender}</span>
                                <span
                                  className={cn(
                                    "text-xs ml-2 flex items-center gap-1",
                                    message.sender === tutorName ? "text-indigo-100" : "text-gray-400"
                                  )}
                                >
                                  {formatTimestamp(message.timestamp)}
                                  {message.sender === tutorName && message.status && (
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
                                />
                              ) : (
                                <p className="text-[15px] leading-relaxed">{message.content}</p>
                              )}
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    </main>

                    <div className="bg-white border-t p-6 shadow-sm">
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
                              "focus:ring-2 focus:ring-indigo-500 focus:outline-none",
                              "placeholder-gray-400 text-gray-800 transition-all duration-200"
                            )}
                          />
                          <button
                            type="button"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className={cn(
                              "p-3 rounded-full",
                              "bg-gray-200 text-gray-600",
                              "hover:bg-gray-300",
                              "transition-all duration-200"
                            )}
                          >
                            <Smile className="h-5 w-5" />
                          </button>
                          {showEmojiPicker && (
                            <div className="absolute bottom-20 right-6 z-50">
                              <Picker onEmojiClick={handleEmojiClick} />
                            </div>
                          )}
                          <button
                            onClick={handleSendMessage}
                            className={cn(
                              "p-3 rounded-full",
                              "bg-gradient-to-r from-indigo-500 to-purple-600",
                              "text-white shadow-md",
                              "hover:from-indigo-600 hover:to-purple-700",
                              "transition-all duration-200",
                              "focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            )}
                          >
                            <Send className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full w-full">
              <Card className="border-0 shadow-md w-full max-w-md">
                <CardContent className="pt-6 text-center">
                  <p className="text-slate-600 mb-4 font-medium">Please log in to view messages</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}