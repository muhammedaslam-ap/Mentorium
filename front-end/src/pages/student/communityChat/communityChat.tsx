import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { Send, Menu, Check, CheckCheck, Image, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import Header from "../components/header";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authAxiosInstance } from "@/api/authAxiosInstance";

interface Message {
  _id?: string;
  sender: string;
  content: string;
  timestamp: string;
  status?: "sent" | "delivered" | "read";
  imageUrl?: string;
}

interface Community {
  id: string;
  name: string;
  course: string;
  messages: Message[];
  members?: number;
  activeNow?: number;
}

export function CommunityChat() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const user = useSelector((state: any) => state.user.userDatas);
  const userID = user.id || user._id || "";
  useEffect(() => {
    setUserName(user?.username || "");
    console.log("USER IN THE FRONTEND", user); // Debug sender
  }, [user]);

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const enrolledCoursesData = await authAxiosInstance.get("/purchase/enrolledCourses");
        const enrolledCourses = enrolledCoursesData.data.courses;
        console.log("ENROLLED COURSES", enrolledCourses);
        const newCommunities: Community[] = enrolledCourses.map((course: any) => ({
          id: course._id,
          name: `${course.title} Community`,
          course: course.title,
          messages: [],
          members: course.enrollments || 100,
          activeNow: Math.floor(Math.random() * 20) + 5,
        }));
        setCommunities(newCommunities);
        if (newCommunities.length > 0) {
          setSelectedCommunity(newCommunities[0]);
        }
      } catch (error) {
        console.error("Error fetching enrolled courses:", error);
        toast.error("Failed to load communities");
      }
    };
    if (user) {
      fetchCommunities();
    }
  }, [user]);

  useEffect(() => {
    if (!userID) {
      console.error("No user ID available");
      toast.error("User not authenticated. Please log in again.");
      return;
    }

    socketRef.current = io(import.meta.env.VITE_AUTH_BASEURL, {
      reconnection: true,
    });

    socketRef.current.on("connect", () => {
      console.log("Socket.IO connected:", socketRef.current?.id);
      // Emit join_community after connection
      if (selectedCommunity) {
        console.log("Emitting join_community after connect:", selectedCommunity.id);
        socketRef.current?.emit("join_community", selectedCommunity.id);
      }
    });

    socketRef.current.on("connect_error", (error) => {
      console.error("Socket.IO connection error:", error);
      toast.error("Failed to connect to chat server");
    });

    socketRef.current.on("error", (error: { message: string }) => {
      console.error("Socket.IO error:", error);
      toast.error(error.message);
    });

    socketRef.current.on("message_history", (history: Message[]) => {
      console.log("Received message history:", history);
      console.log("Message history count:", history.length);
      setMessages(
        history.map((msg) => ({
          _id: msg._id,
          sender: msg.sender,
          content: msg.content,
          timestamp: msg.timestamp,
          status: msg.status,
          imageUrl: msg.imageUrl,
        }))
      );
    });

    socketRef.current.on("receive_message", (message: Message) => {
      console.log("Received message:", message);
      setMessages((prev) => {
        // Skip if message is from the current user (already added locally)
        if (message.sender === userName) {
          console.log("Skipping sender's own message:", message);
          return prev;
        }
        // Skip if message._id exists in prev (prevent duplicates)
        if (message._id && prev.some((msg) => msg._id === message._id)) {
          console.log("Skipping duplicate message with _id:", message._id);
          return prev;
        }
        return [
          ...prev,
          {
            _id: message._id,
            sender: message.sender,
            content: message.content,
            timestamp: message.timestamp,
            status: message.status,
            imageUrl: message.imageUrl,
          },
        ];
      });
    });

    // Emit join_community if selectedCommunity changes while connected
    if (selectedCommunity && socketRef.current?.connected) {
      console.log("Emitting join_community on selectedCommunity change:", selectedCommunity.id);
      socketRef.current.emit("join_community", selectedCommunity.id);
    }

    return () => {
      socketRef.current?.off("connect");
      socketRef.current?.off("connect_error");
      socketRef.current?.off("error");
      socketRef.current?.off("message_history");
      socketRef.current?.off("receive_message");
      socketRef.current?.disconnect();
    };
  }, [selectedCommunity?.id, userID, userName]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSelectCommunity = (community: Community) => {
    setSelectedCommunity(community);
    setMessages([]);
    setIsSidebarOpen(false);
    if (socketRef.current?.connected) {
      console.log("Emitting join_community on community select:", community.id);
      socketRef.current.emit("join_community", community.id);
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) {
      toast.error("Message cannot be empty");
      return;
    }
    if (!userID || !userName) {
      console.error("Missing userID or userName:", { userID, userName });
      toast.error("User not authenticated. Please log in again.");
      return;
    }
    if (!selectedCommunity) {
      toast.error("No community selected");
      return;
    }
    if (!socketRef.current?.connected) {
      console.error("Socket not connected");
      toast.error("Not connected to chat server. Please try again.");
      return;
    }

    const newMsg: Message = {
      sender: userName,
      content: newMessage,
      timestamp: new Date().toISOString(),
      status: "sent",
    };
    console.log("Sending message:", newMsg);
    setMessages((prev) => [...prev, newMsg]);
    socketRef.current?.emit("send_message", {
      communityId: selectedCommunity.id,
      message: newMsg,
    });
    console.log("Emitting send_notification:", { senderId: userID, communityId: selectedCommunity.id });
    socketRef.current?.emit("send_notification", {
      communityId: selectedCommunity.id,
      courseTitle: selectedCommunity.course,
      message: newMsg,
      senderId: userID,
    });
    setNewMessage("");
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && userID && selectedCommunity && userName) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Only image files are allowed");
        return;
      }
      if (!socketRef.current?.connected) {
        console.error("Socket not connected for image upload");
        toast.error("Not connected to chat server. Please try again.");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const newMsg: Message = {
          sender: userName,
          content: "",
          timestamp: new Date().toISOString(),
          status: "sent",
        };
        setMessages((prev) => [...prev, { ...newMsg, imageUrl: reader.result as string }]);
        socketRef.current?.emit("send_image_message", {
          communityId: selectedCommunity.id,
          message: newMsg,
          image: {
            data: reader.result,
            name: file.name,
            type: file.type,
          },
          senderId: userID,
        });
        console.log("Emitting send_notification for image:", { senderId: userID, communityId: selectedCommunity.id });
        socketRef.current?.emit("send_notification", {
          communityId: selectedCommunity.id,
          courseTitle: selectedCommunity.course,
          message: { ...newMsg, content: "Sent an image" },
          senderId: userID,
        });
      };
      reader.readAsDataURL(file);
      event.target.value = "";
    } else {
      console.error("Missing required data for image upload:", { userID, selectedCommunity, userName });
      toast.error("Unable to upload image. Please ensure you are logged in and a community is selected.");
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-96 shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold text-indigo-700">Access Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center pt-2">
            <Users className="h-16 w-16 text-indigo-500 mx-auto mb-4 opacity-80" />
            <p className="text-slate-600 text-lg">Please log in to view your learning communities</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100">
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        /* Custom scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
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
        
        /* Message bubble effects */
        .message-bubble {
          transition: all 0.2s ease;
        }
        .message-bubble:hover {
          transform: scale(1.01);
        }
      `}</style>
      
      <Header />
      
      <div className="flex flex-1 pt-0 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed top-16 left-0 w-80 bg-white shadow-xl border-r border-indigo-100",
            "transform transition-transform duration-300 ease-in-out z-40 h-[calc(100vh-4rem)]",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full",
            "md:static md:translate-x-0 md:top-0"
          )}
        >
          <div className="p-6 border-b bg-gradient-to-r from-indigo-600 to-indigo-800">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Learning Communities
            </h2>
            <p className="text-indigo-100 text-sm mt-1">
              Connect & Learn Together
            </p>
          </div>
          
          <div className="overflow-y-auto h-[calc(100vh-12rem)] custom-scrollbar">
            {communities.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-indigo-300 mx-auto mb-4" />
                <p className="text-indigo-700 font-medium">No communities yet</p>
                <p className="text-slate-500 text-sm mt-2 px-6">
                  Enroll in courses to join their communities
                </p>
              </div>
            ) : (
              communities.map((community) => (
                <div
                  key={community.id}
                  className={cn(
                    "p-4 cursor-pointer transition-all duration-200",
                    "hover:bg-indigo-50 border-b border-indigo-50",
                    selectedCommunity?.id === community.id 
                      ? "bg-indigo-100 border-l-4 border-l-indigo-600" 
                      : "border-l-4 border-l-transparent"
                  )}
                  onClick={() => handleSelectCommunity(community)}
                >
                  <h3 className="font-semibold text-indigo-900">
                    {community.name}
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    {community.course}
                  </p>
                  <div className="flex items-center mt-2 text-xs text-slate-500">
                    <span>{community.members} members</span>
                    <span className="mx-2">•</span>
                    <span className="text-emerald-600 font-medium flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block"></span>
                      {community.activeNow} active now
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {communities.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <Card className="max-w-lg w-full shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <Users className="h-16 w-16 text-indigo-500 mx-auto mb-4 opacity-80" />
                  <CardTitle className="text-3xl font-bold text-indigo-800">
                    No Communities Yet
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-slate-600 text-lg">
                    Enroll in a course to join its community and start
                    collaborating with other learners!
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <header className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-4">
                  <button
                    className="md:hidden text-indigo-700 hover:text-indigo-900 bg-indigo-100 p-2 rounded-full"
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  >
                    <Menu className="h-5 w-5" />
                  </button>
                  <div>
                    <h1 className="text-xl font-bold text-indigo-900">
                      {selectedCommunity?.name || "Select a Community"}
                    </h1>
                    <p className="text-sm text-slate-500">
                      {selectedCommunity?.course || ""}
                    </p>
                  </div>
                </div>
                <div className="text-sm font-medium text-emerald-700 flex items-center gap-1.5 bg-emerald-50 py-1.5 px-3 rounded-full">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {selectedCommunity?.activeNow || 0} active now
                </div>
              </header>

              {/* Messages Area */}
              <main className="flex-1 overflow-hidden relative bg-gradient-to-b from-indigo-50/50 to-blue-50/50">
                <div className="absolute inset-0 overflow-y-auto px-4 py-6 custom-scrollbar">
                  <div className="max-w-3xl mx-auto space-y-6">
                    {messages.map((message, index) => (
                      <div
                        key={message._id || index}
                        className={cn(
                          "flex w-full gap-2 items-end animate-fade-in",
                          message.sender === userName
                            ? "justify-end"
                            : "justify-start"
                        )}
                      >
                        {/* Message bubble */}
                        <div
                          className={cn(
                            "max-w-md rounded-2xl p-4 shadow-md message-bubble",
                            message.sender === userName
                              ? "bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-br-none"
                              : "bg-white text-slate-800 rounded-bl-none border border-indigo-100"
                          )}
                        >
                          {/* Message header with sender and time */}
                          <div className="flex items-baseline justify-between mb-1.5">
                            <span className={cn(
                              "font-medium text-sm",
                              message.sender === userName ? "text-indigo-100" : "text-indigo-700"
                            )}>
                              {message.sender}
                            </span>
                            <span
                              className={cn(
                                "text-xs ml-2 flex items-center gap-1",
                                message.sender === userName
                                  ? "text-indigo-200"
                                  : "text-slate-400"
                              )}
                            >
                              {formatTimestamp(message.timestamp)}
                              {message.sender === userName && message.status && (
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
                          
                          {/* Message content */}
                          {message.imageUrl ? (
                            <img
                              src={message.imageUrl}
                              alt="Shared image"
                              className="max-w-full h-auto rounded-lg mt-2 border border-indigo-100 shadow-sm"
                              loading="lazy"
                            />
                          ) : (
                            <p className="text-[15px] leading-relaxed">
                              {message.content}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </div>
              </main>

              {/* Message Input */}
              <div className="bg-white border-t p-4 shadow-sm">
                <div className="max-w-3xl mx-auto">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        "p-3 rounded-full",
                        "bg-indigo-100 text-indigo-700",
                        "hover:bg-indigo-200",
                        "transition-all duration-200",
                        "focus:outline-none focus:ring-2 focus:ring-indigo-500",
                      )}
                      aria-label="Upload image"
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
                        "bg-indigo-50 border border-indigo-100",
                        "focus:ring-2 focus:ring-indigo-500 focus:outline-none",
                        "placeholder-slate-400 text-slate-800 transition-all duration-200"
                      )}
                    />
                    <button
                      onClick={handleSendMessage}
                      className={cn(
                        "p-3 rounded-full",
                        "bg-gradient-to-r from-indigo-600 to-indigo-800",
                        "text-white shadow-md",
                        "hover:from-indigo-700 hover:to-indigo-900",
                        "transition-all duration-200",
                        "focus:outline-none focus:ring-2 focus:ring-indigo-500",
                        "disabled:opacity-50"
                      )}
                      disabled={!newMessage.trim()}
                      aria-label="Send message"
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
    </div>
  );
}