import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import { Send, Menu, Check, CheckCheck, Image, Users, Smile } from "lucide-react";
import { cn } from "@/lib/utils";
import Header from "../components/header";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { authAxiosInstance } from "@/api/authAxiosInstance";
import { useInView } from "react-intersection-observer";
import React from "react";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";

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
  latestMessage: { content: string; timestamp: string; imageUrl?: string } | null;
  unreadCount: number;
}

// Skeleton Loader for Communities
const CommunitySkeleton = () => (
  <div className="p-4 border-b border-indigo-50 animate-pulse">
    <div className="h-5 bg-indigo-100 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-indigo-50 rounded w-1/2 mb-2"></div>
    <div className="flex items-center gap-2">
      <div className="h-3 bg-indigo-50 rounded w-20"></div>
    </div>
  </div>
);

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
          ? "bg-indigo-200 rounded-br-none"
          : "bg-indigo-50 rounded-bl-none"
      )}
    >
      <div className="flex items-baseline justify-between mb-1.5">
        <div className="h-4 bg-indigo-100 rounded w-20"></div>
        <div className="h-3 bg-indigo-100 rounded w-16"></div>
      </div>
      <div className="h-5 bg-indigo-100 rounded w-48"></div>
    </div>
  </div>
);

// Memoized MessageItem component
const MessageItem = React.memo(
  ({
    message,
    userName,
    formatTimestamp,
  }: {
    message: Message;
    userName: string;
    formatTimestamp: (timestamp: string) => string;
  }) => (
    <div
      className={cn(
        "flex w-full gap-2 items-end animate-fade-in",
        message.sender === userName ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-md rounded-2xl p-4 shadow-md message-bubble",
          message.sender === userName
            ? "bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-br-none"
            : "bg-white text-slate-800 rounded-bl-none border border-indigo-100"
        )}
      >
        <div className="flex items-baseline justify-between mb-1.5">
          <span
            className={cn(
              "font-medium text-sm",
              message.sender === userName ? "text-indigo-100" : "text-indigo-700"
            )}
          >
            {message.sender}
          </span>
          <span
            className={cn(
              "text-xs ml-2 flex items-center gap-1",
              message.sender === userName ? "text-indigo-200" : "text-slate-400"
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
        {message.imageUrl ? (
          <img
            src={message.imageUrl}
            alt="Shared image"
            className="max-w-full h-auto rounded-lg mt-2 border border-indigo-100 shadow-sm"
            loading="lazy"
          />
        ) : (
          <p className="text-[15px] leading-relaxed">{message.content}</p>
        )}
      </div>
    </div>
  )
);

// Memoized CommunityItem component with last message preview
const CommunityItem = React.memo(
  ({
    community,
    selectedCommunity,
    handleSelectCommunity,
    formatTimestamp,
  }: {
    community: Community;
    selectedCommunity: Community | null;
    handleSelectCommunity: (community: Community) => void;
    formatTimestamp: (timestamp: string) => string;
  }) => (
    <div
      className={cn(
        "p-4 cursor-pointer transition-all duration-200",
        "hover:bg-indigo-50 border-b border-indigo-50",
        selectedCommunity?.id === community.id
          ? "bg-indigo-100 border-l-4 border-l-indigo-600"
          : "border-l-4 border-l-transparent"
      )}
      onClick={() => handleSelectCommunity(community)}
    >
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-indigo-900">{community.name}</h3>
          <p className="text-sm text-slate-600 mt-1">{community.course}</p>
        </div>
        {community.unreadCount > 0 && (
          <span
            className={cn(
              "bg-gradient-to-r from-indigo-500 to-indigo-600",
              "text-white text-sm font-medium rounded-full px-2.5 py-0.5",
              "shadow-sm opacity-90",
              "hover:scale-110 hover:brightness-110",
              "transition-all duration-200"
            )}
          >
            {community.unreadCount}
          </span>
        )}
      </div>
      <div className="mt-2">
        {community.latestMessage && (
          <p className="text-xs text-slate-600 truncate">
            {community.latestMessage.imageUrl 
              ? "Sent an image" 
              : community.latestMessage.content}
          </p>
        )}
        <div className="flex items-center mt-1 text-xs text-slate-500">
          {community.members !== undefined && <span>{community.members} members</span>}
          {community.latestMessage && (
            <>
              {community.members !== undefined && <span className="mx-2">•</span>}
              <span>{formatTimestamp(community.latestMessage.timestamp)}</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
);

// Students Modal Component
const StudentsModal = ({
  students,
  onClose,
}: {
  students: string[];
  onClose: () => void;
}) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <Card className="w-full max-w-lg bg-white dark:bg-gray-900 shadow-2xl border-0 rounded-2xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl font-bold">
              Community Members
            </CardTitle>
            <p className="text-indigo-100 text-sm mt-1">
              {students.length} {students.length === 1 ? 'member' : 'members'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200"
            aria-label="Close"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {students.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No students enrolled</h3>
            <p className="text-gray-500 dark:text-gray-400 text-center">
              When students enroll in this course, they'll appear here.
            </p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {students.map((name, index) => {
                const initials = name
                  .split(' ')
                  .map(word => word.charAt(0).toUpperCase())
                  .join('')
                  .substring(0, 2);
                const colors = [
                  'bg-blue-500',
                  'bg-green-500',
                  'bg-purple-500',
                  'bg-pink-500',
                  'bg-indigo-500',
                  'bg-red-500',
                  'bg-yellow-500',
                  'bg-teal-500',
                  'bg-orange-500',
                  'bg-cyan-500'
                ];
                const avatarColor = colors[index % colors.length];
                return (
                  <div key={index} className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                    <div className={`w-12 h-12 ${avatarColor} rounded-full flex items-center justify-center flex-shrink-0 shadow-md`}>
                      <span className="text-white font-bold text-lg">
                        {initials}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 dark:text-white text-lg truncate">
                        {name}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Members • Enrolled
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-black-500 rounded-full"></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
      {students.length > 0 && (
        <div className="border-t border-gray-100 dark:border-gray-800 p-4 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Student information is private and secure</span>
          </div>
        </div>
      )}
    </Card>
  </div>
);

export function CommunityChat() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [visibleMessages, setVisibleMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const [isLoadingCommunities, setIsLoadingCommunities] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isStudentsModalOpen, setIsStudentsModalOpen] = useState(false);
  const [students, setStudents] = useState<string[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { ref: loadMoreRef, inView } = useInView();
  const processedCommunityIds = useRef<Set<string>>(new Set());
  const processedMessageIds = useRef<Set<string>>(new Set()); // Track processed message IDs
  const currentCommunityId = useRef<string | null>(null); // Track current community

  const user = useSelector((state: any) => state.user.userDatas);
  const userID = user.id || user._id || "";

  useEffect(() => {
    setUserName(user?.username || "");
    console.log("USER IN THE FRONTEND", user);
  }, [user]);

  const fetchCommunities = useCallback(async () => {
    setIsLoadingCommunities(true);
    try {
      const enrolledCoursesData = await authAxiosInstance.get("/purchase/enrolledCourses");
      const enrolledCourses = enrolledCoursesData.data.courses;
      console.log("ENROLLED COURSES", enrolledCourses);

      processedCommunityIds.current.clear();

      const newCommunities: Community[] = enrolledCourses.reduce((acc: Community[], course: any) => {
        if (!processedCommunityIds.current.has(course._id)) {
          processedCommunityIds.current.add(course._id);
          acc.push({
            id: course._id,
            name: `${course.title} Community`,
            course: course.title,
            messages: [],
            members: course.enrollments,
            latestMessage: null,
            unreadCount: 0,
          });
        }
        return acc;
      }, []);

      setCommunities(newCommunities);
      if (newCommunities.length > 0) {
        setSelectedCommunity(newCommunities[0]);
      }
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
      toast.error("Failed to load communities");
    } finally {
      setIsLoadingCommunities(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchCommunities();
    }
  }, [user, fetchCommunities]);

  const sortedCommunities = useMemo(() => {
    return [...communities].sort((a, b) => {
      const aTime = a.latestMessage ? new Date(a.latestMessage.timestamp).getTime() : 0;
      const bTime = b.latestMessage ? new Date(b.latestMessage.timestamp).getTime() : 0;
      return bTime - aTime;
    });
  }, [communities]);

  const fetchStudents = useCallback(async (courseId: string) => {
    try {
      const response = await authAxiosInstance.get(`/courses/${courseId}/all-students`);
      const studentsData = (response.data.students || [])
        .map((student: { name?: string }) => student.name)
        .filter((name: string | undefined): name is string => typeof name === "string");
      setStudents(studentsData);
      console.log("FRONT END STUDENT NAMES:", studentsData);
      setIsStudentsModalOpen(true);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to load enrolled students");
    }
  }, []);

  const handleHeaderClick = useCallback(() => {
    if (selectedCommunity) {
      fetchStudents(selectedCommunity.id);
    }
  }, [selectedCommunity, fetchStudents]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (!userID) {
      console.error("No user ID available");
      toast.error("User not authenticated. Please log in again.");
      return;
    }

    socketRef.current = io(import.meta.env.VITE_AUTH_BASEURL, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current.on("connect", () => {
      console.log("Socket.IO connected:", socketRef.current?.id);
      if (selectedCommunity && selectedCommunity.id !== currentCommunityId.current) {
        console.log("Emitting join_community after connect:", selectedCommunity.id);
        socketRef.current?.emit("join_community", selectedCommunity.id);
        currentCommunityId.current = selectedCommunity.id;
        setIsLoadingMessages(true);
      }
    });

    socketRef.current.on("connect_error", (error) => {
      console.error("Socket.IO connection error:", error);
      toast.error("Failed to connect to chat server");
      setIsLoadingMessages(false);
    });

    socketRef.current.on("error", (error: { message: string }) => {
      console.error("Socket.IO error:", error);
      toast.error(error.message);
      setIsLoadingMessages(false);
    });

    socketRef.current.on("message_history", (history: Message[]) => {
      console.log("Received message history:", history);
      console.log("Message history count:", history.length);
      processedMessageIds.current.clear(); // Clear processed IDs for new history
      history.forEach((msg) => {
        if (msg._id) {
          processedMessageIds.current.add(msg._id);
        }
      });
      setMessages(history);
      if (selectedCommunity) {
        const latestMsg = history.length > 0 ? history[history.length - 1] : null;
        setCommunities((prev) =>
          prev.map((community) =>
            community.id === selectedCommunity.id
              ? {
                  ...community,
                  messages: history,
                  latestMessage: latestMsg
                    ? {
                        content: latestMsg.content,
                        timestamp: latestMsg.timestamp,
                        imageUrl: latestMsg.imageUrl,
                      }
                    : null,
                  unreadCount: 0,
                }
              : community
          )
        );
      }
      setIsLoadingMessages(false);
      scrollToBottom();
    });

    socketRef.current.on("receive_message", (message: Message) => {
      console.log("Received message:", message);
      // Skip sender's own message
      if (message.sender === userName) {
        console.log("Skipping sender's own message:", message);
        return;
      }
      // Check for duplicates using _id or fallback to content+timestamp+sender
      const messageKey = message._id || `${message.sender}:${message.timestamp}:${message.content}:${message.imageUrl || ''}`;
      if (processedMessageIds.current.has(messageKey)) {
        console.log("Skipping duplicate message with key:", messageKey);
        return;
      }
      processedMessageIds.current.add(messageKey);
      console.log("Processing new message with key:", messageKey);

      setMessages((prev) => [...prev, message]);
      setCommunities((prev) => {
        const communityIndex = prev.findIndex((c) => c.id === selectedCommunity?.id);
        if (communityIndex === -1) {
          console.log("Community not found for message:", message);
          return prev;
        }
        const updatedCommunities = [...prev];
        updatedCommunities[communityIndex] = {
          ...updatedCommunities[communityIndex],
          messages: [...updatedCommunities[communityIndex].messages, message],
          latestMessage: {
            content: message.content,
            timestamp: message.timestamp,
            imageUrl: message.imageUrl,
          },
          unreadCount:
            selectedCommunity?.id === updatedCommunities[communityIndex].id
              ? updatedCommunities[communityIndex].unreadCount
              : updatedCommunities[communityIndex].unreadCount + 1,
        };
        return [
          updatedCommunities[communityIndex],
          ...updatedCommunities.slice(0, communityIndex),
          ...updatedCommunities.slice(communityIndex + 1),
        ];
      });
      scrollToBottom();
    });

    return () => {
      socketRef.current?.off("connect");
      socketRef.current?.off("connect_error");
      socketRef.current?.off("error");
      socketRef.current?.off("message_history");
      socketRef.current?.off("receive_message");
      socketRef.current?.disconnect();
      currentCommunityId.current = null;
    };
  }, [selectedCommunity?.id, userID, userName, scrollToBottom]);

  const messagesPerPage = 20;
  useEffect(() => {
    setVisibleMessages(messages.slice(0, messagesPerPage));
  }, [messages]);

  useEffect(() => {
    if (inView && visibleMessages.length < messages.length) {
      setVisibleMessages((prev) => messages.slice(0, prev.length + messagesPerPage));
    }
  }, [inView, messages]);

  const handleSelectCommunity = useCallback((community: Community) => {
    setSelectedCommunity(community);
    setMessages([]);
    setVisibleMessages([]);
    processedMessageIds.current.clear(); // Clear processed messages for new community
    setIsSidebarOpen(false);
    if (socketRef.current?.connected && community.id !== currentCommunityId.current) {
      console.log("Emitting join_community on community select:", community.id);
      socketRef.current.emit("join_community", community.id);
      currentCommunityId.current = community.id;
      setIsLoadingMessages(true);
    }
    setCommunities((prev) =>
      prev.map((c) => (c.id === community.id ? { ...c, unreadCount: 0 } : c))
    );
  }, []);

  const handleSendMessage = useCallback(() => {
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
    setCommunities((prev) => {
      const communityIndex = prev.findIndex((c) => c.id === selectedCommunity.id);
      if (communityIndex === -1) return prev;
      const updatedCommunities = [...prev];
      updatedCommunities[communityIndex] = {
        ...updatedCommunities[communityIndex],
        messages: [...updatedCommunities[communityIndex].messages, newMsg],
        latestMessage: {
          content: newMsg.content,
          timestamp: newMsg.timestamp,
        },
        unreadCount: 0,
      };
      return [
        updatedCommunities[communityIndex],
        ...updatedCommunities.slice(0, communityIndex),
        ...updatedCommunities.slice(communityIndex + 1),
      ];
    });
    socketRef.current?.emit("send_message", {
      communityId: selectedCommunity.id,
      message: newMsg,
    });
    socketRef.current?.emit("send_notification", {
      communityId: selectedCommunity.id,
      courseTitle: selectedCommunity.course,
      message: newMsg,
      senderId: userID,
    });
    setNewMessage("");
    setShowEmojiPicker(false);
    scrollToBottom();
  }, [newMessage, userID, userName, selectedCommunity, scrollToBottom]);

  const handleImageUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
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
          setMessages((prev) => [
            ...prev,
            { ...newMsg, imageUrl: reader.result as string },
          ]);
          setCommunities((prev) => {
            const communityIndex = prev.findIndex((c) => c.id === selectedCommunity.id);
            if (communityIndex === -1) return prev;
            const updatedCommunities = [...prev];
            updatedCommunities[communityIndex] = {
              ...updatedCommunities[communityIndex],
              messages: [
                ...updatedCommunities[communityIndex].messages,
                { ...newMsg, imageUrl: reader.result as string },
              ],
              latestMessage: {
                content: "",
                timestamp: newMsg.timestamp,
                imageUrl: reader.result as string,
              },
              unreadCount: 0,
            };
            return [
              updatedCommunities[communityIndex],
              ...updatedCommunities.slice(0, communityIndex),
              ...updatedCommunities.slice(communityIndex + 1),
            ];
          });
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
          console.log("Emitting send_notification for image:", {
            senderId: userID,
            communityId: selectedCommunity.id,
          });
          socketRef.current?.emit("send_notification", {
            communityId: selectedCommunity.id,
            courseTitle: selectedCommunity.course,
            message: { ...newMsg, content: "Sent an image" },
            senderId: userID,
          });
          scrollToBottom();
        };
        reader.readAsDataURL(file);
        event.target.value = "";
      } else {
        console.error("Error uploading image: Missing required data", {
          userID,
          selectedCommunity,
          userName,
        });
        toast.error(
          "Unable to upload image. Please ensure you are logged in and a community is selected."
        );
      }
    },
    [userID, selectedCommunity, userName, scrollToBottom]
  );

  const formatTimestamp = useCallback((timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  }, []);

  const memoizedCommunities = useMemo(() => sortedCommunities, [sortedCommunities]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-96 shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold text-indigo-700">
              Access Required
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center pt-2">
            <Users className="h-16 w-16 text-indigo-500 mx-auto mb-4 opacity-80" />
            <p className="text-slate-600 text-lg">
              Please log in to view your learning communities
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100">
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
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
        .message-bubble {
          transition: all 0.2s ease;
        }
        .message-bubble:hover {
          transform: scale(1.01);
        }
      `}</style>

      <Header />

      <div className="flex flex-1 pt-0 overflow-hidden">
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
            {isLoadingCommunities ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <CommunitySkeleton key={index} />
                ))}
              </div>
            ) : memoizedCommunities.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-indigo-300 mx-auto mb-4" />
                <p className="text-indigo-700 font-medium">No communities yet</p>
                <p className="text-slate-500 text-sm mt-2 px-4">
                  Enroll in courses to join their communities
                </p>
              </div>
            ) : (
              memoizedCommunities.map((community) => (
                <CommunityItem
                  key={community.id}
                  community={community}
                  selectedCommunity={selectedCommunity}
                  handleSelectCommunity={handleSelectCommunity}
                  formatTimestamp={formatTimestamp}
                />
              ))
            )}
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          {memoizedCommunities.length === 0 && !isLoadingCommunities ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <Card className="max-w-lg w-full shadow-lg border-0 bg-white/95 backdrop-blur-sm">
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
              <header className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm">
                <div
                  className="flex items-center space-x-4 cursor-pointer hover:bg-indigo-50 p-2 rounded-md transition-colors"
                  onClick={handleHeaderClick}
                >
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
                    <p className="text-sm text-slate-600">
                      {selectedCommunity?.course || ""}
                    </p>
                  </div>
                </div>
              </header>

              <main className="flex-1 overflow-hidden relative bg-gray-50">
                <div className="absolute inset-0 overflow-y-auto px-4 py-6 custom-scrollbar">
                  <div className="max-w-3xl mx-auto space-y-6">
                    {isLoadingMessages ? (
                      <div className="space-y-6">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <MessageSkeleton
                            key={index}
                            isOwnMessage={index % 2 === 0}
                          />
                        ))}
                      </div>
                    ) : (
                      visibleMessages.map((message, index) => (
                        <MessageItem
                          key={message._id || index}
                          message={message}
                          userName={userName}
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
                        "focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                    <div className="relative flex-1">
                      <button
                        type="button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className={cn(
                          "absolute left-2 top-1/2 -translate-y-1/2 p-2",
                          "text-indigo-700 hover:text-indigo-900",
                          "transition-all duration-200"
                        )}
                        aria-label="Select emoji"
                      >
                        <Smile className="h-5 w-5" />
                      </button>
                      {showEmojiPicker && (
                        <div className="absolute bottom-16 left-0 z-10">
                          <EmojiPicker
                            onEmojiClick={(emojiData: EmojiClickData) => {
                              setNewMessage((prev) => prev + emojiData.emoji);
                              setShowEmojiPicker(false);
                            }}
                          />
                        </div>
                      )}
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                        placeholder="Type your message..."
                        className={cn(
                          "w-full pl-12 pr-4 py-3 rounded-full",
                          "bg-indigo-50 border border-indigo-200",
                          "focus:ring-2 focus:ring-indigo-500 focus:outline-none",
                          "placeholder-gray-400 text-gray-800 transition-all duration-200"
                        )}
                      />
                    </div>
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
          {isStudentsModalOpen && (
            <StudentsModal
              students={students}
              onClose={() => setIsStudentsModalOpen(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default React.memo(CommunityChat);
