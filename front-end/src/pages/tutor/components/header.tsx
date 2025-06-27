import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { MessageSquare, ChevronDown, BookOpen, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { removeTutor } from "@/redux/slice/tutorSlice";
import { toast } from "sonner";
import { authAxiosInstance } from "@/api/authAxiosInstance";
import { io, Socket } from "socket.io-client";
import { cn } from "@/lib/utils";
import { useInView } from "react-intersection-observer";

interface Notification {
  _id: string;
  message: string;
  read: boolean;
  createdAt: string;
  type?: string;
  courseId?: string;
  studentId?: string;
  tutorId?: string;
  courseTitle?: string;
  senderId?: string;
}

interface TutorState {
  name: string;
  email: string;
  _id: string;
  isAccepted: boolean;
}

export function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state: any) => state?.tutor?.tutorDatas);
  const [isAccepted, setIsAccepted] = useState<boolean | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [visibleNotifications, setVisibleNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef<Socket | null>(null);
  const { ref: loadMoreRef, inView } = useInView();
  const notificationsPerPage = 10;

  useEffect(() => {
    if (user) {
      setIsAccepted(user.isAccepted);
    }
  }, [user]);

  useEffect(() => {
    if (inView && visibleNotifications.length < notifications.length) {
      setVisibleNotifications((prev) => notifications.slice(0, prev.length + notificationsPerPage));
    }
  }, [inView, notifications]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        console.log("Fetching notifications for tutor:", user?._id);
        const response = await authAxiosInstance.get("/tutor/notifications");
        console.log("fetchNotifications response:", response.data);
        const fetchedNotifications = Array.isArray(response?.data.notifications)
          ? response.data.notifications
          : [response?.data.notifications].filter(Boolean);
        setNotifications(fetchedNotifications);
        setUnreadCount(fetchedNotifications.filter((n: Notification) => !n.read).length);
      } catch (error: any) {
        console.error("Failed to fetch notifications:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          config: error.config,
          code: error.code,
        });
        toast.error("Could not load notifications. Real-time notifications will still appear.");
      }
    };
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    if (user?._id) {
      socketRef.current = io(import.meta.env.VITE_AUTH_BASEURL || "http://localhost:3000", {
        reconnection: true,
      });

      socketRef.current.on("connect", () => {
        console.log("Socket connected:", socketRef.current?.id);
        socketRef.current?.emit("join_user", user._id);
      });

      socketRef.current.on("notification", (notification: Notification) => {
        console.log("Received notification:", notification);
        if (notification.senderId !== user._id) {
          setNotifications((prev) => [notification, ...prev]);
          setUnreadCount((prev) => prev + 1);
        }
      });

      socketRef.current.on("receive_notification", (notification: Notification) => {
        console.log("Received community notification:", notification);
        if (notification.senderId !== user._id) {
          setNotifications((prev) => [notification, ...prev]);
          setUnreadCount((prev) => prev + 1);
        }
      });

      socketRef.current.on("notification_read", ({ notificationId }: { notificationId: string }) => {
        console.log("Notification read:", notificationId);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      });

      socketRef.current.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
      });

      return () => {
        socketRef.current?.off("connect");
        socketRef.current?.off("notification");
        socketRef.current?.off("receive_notification");
        socketRef.current?.off("notification_read");
        socketRef.current?.off("connect_error");
        socketRef.current?.disconnect();
      };
    }
  }, [user?._id]);

  const clearAllNotifications = useCallback(async () => {
    try {
      const userId = user?.id || user?._id;
      if (!userId) {
        toast.error("User ID not found");
        return;
      }
      await authAxiosInstance.delete(`/notification/clear/${userId}`);
      setNotifications([]);
      setVisibleNotifications([]);
      setUnreadCount(0);
      toast.success("All notifications cleared");
    } catch (error) {
      console.error("Failed to clear notifications:", error);
      toast.error("Failed to clear notifications");
    }
  }, [user]);

  useEffect(() => {
    if (isAccepted === false) {
      toast.info("Please complete your profile verification to access all features.", {
        action: {
          label: "Update Profile",
          onClick: () => navigate("/tutor/profile"),
        },
        duration: 10000,
        closeButton: true,
      });
    }
  }, [isAccepted, navigate]);

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      console.log(`Marking notification ${notificationId} as read`);
      await authAxiosInstance.put(`/tutor/notifications/${notificationId}/read`);
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification._id === notificationId ? { ...notification, read: true } : notification
        )
      );
      setUnreadCount((prevCount) => Math.max(0, prevCount - 1));
      socketRef.current?.emit("mark_private_message_notification_as_read", { notificationId });
    } catch (error: any) {
      console.error("Failed to mark notification as read:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config,
        code: error.code,
      });
      toast.error("Failed to mark notification as read");
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      console.log("Marking all notifications as read");
      await authAxiosInstance.put("/tutor/notifications/read-all");
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
      toast.success("All notifications marked as read");
      notifications
        .filter((n) => n.courseId)
        .forEach((n) => {
          socketRef.current?.emit("mark_private_message_notification_as_read", { notificationId: n._id });
        });
    } catch (error: any) {
      console.error("Failed to mark all notifications as read:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config,
        code: error.code,
      });
      toast.error("Failed to update notifications");
    }
  };

  const handleSignOut = async () => {
    try {
      localStorage.removeItem("tutorDatas");
      dispatch(removeTutor());
      const response = await authAxiosInstance.post("/auth/logout");
      toast.success(response?.data.message);
      navigate("/auth");
    } catch (error: any) {
      console.error("Failed to sign out:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast.error("Failed to sign out");
    }
  };

  const handleMyAccount = () => {
    navigate("/tutor/profile");
  };

  const myWallet = () => {
    navigate("/tutor/wallet");
  };

  const MyChat = () => {
    navigate("/tutor/chat");
  };
  
  const Dashboard = () => {
    navigate("/tutor/home");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-xl shadow-lg shadow-slate-200/20">
      <style>{`
        @keyframes notification-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200px 0; }
          100% { background-position: calc(200px + 100%) 0; }
        }
        .notification-pulse { animation: notification-pulse 2s infinite; }
        .slide-down { animation: slide-down 0.3s ease-out; }
        .shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          background-size: 200px 100%;
          animation: shimmer 2s infinite;
        }
      `}</style>
      <div className="container mx-auto flex h-20 items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <BookOpen className="h-8 w-8 text-indigo-600" />
              <div className="absolute inset-0 h-8 w-8 bg-indigo-600/20 rounded-full blur-lg animate-pulse"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                Mentorium
              </span>
              <span className="text-xs text-slate-500 font-medium tracking-wide">DASHBOARD</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            onClick={MyChat}
            variant="ghost"
            size="icon"
            className="relative h-11 w-11 rounded-full bg-gradient-to-br from-slate-50 to-slate-100 hover:from-indigo-50 hover:to-purple-50 border border-slate-200 hover:border-indigo-300 transition-all duration-300 shadow-sm hover:shadow-md group"
          >
            <MessageSquare className="h-5 w-5 text-slate-600 group-hover:text-indigo-600 transition-colors duration-300" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-11 w-11 rounded-full bg-gradient-to-br from-slate-50 to-slate-100 hover:from-indigo-50 hover:to-purple-50 border border-slate-200 hover:border-indigo-300 transition-all duration-300 shadow-sm hover:shadow-md group"
              >
                <Bell className="h-5 w-5 text-slate-600 group-hover:text-indigo-600 transition-colors duration-300" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-6 w-6 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg notification-pulse border-2 border-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-80 border-slate-200 bg-white/95 backdrop-blur-xl shadow-xl rounded-2xl p-2 slide-down"
              style={{ backdropFilter: 'blur(16px)' }}
            >
              <DropdownMenuLabel className="text-slate-800 font-semibold text-base px-3 py-2">
                <div className="flex items-center justify-between">
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
              
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="h-16 w-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mb-3">
                    <Bell className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500 font-medium">No notifications yet</p>
                  <p className="text-slate-400 text-sm mt-1">You're all caught up!</p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  {unreadCount > 0 && (
                    <DropdownMenuItem>
                      <div
                        onClick={markAllNotificationsAsRead}
                        className="mx-2 mb-2 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 text-indigo-700 font-medium cursor-pointer transition-all duration-200 border border-indigo-200"
                      >
                        <div className="h-2 w-2 bg-indigo-500 rounded-full"></div>
                        Mark all as read
                      </div>
                      <div className="h-2 w-2 bg-indigo-500 rounded-full"></div>
                      <button
                        onClick={clearAllNotifications}
                        className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
                      >
                        Clear all
                      </button>
                    </DropdownMenuItem>
                  )}
                  
                  {notifications.map((notification, index) => (
                    <DropdownMenuItem
                      key={notification._id}
                      onClick={() => markNotificationAsRead(notification._id)}
                      className={cn(
                        "mx-2 mb-2 rounded-lg cursor-pointer transition-all duration-200 p-3",
                        !notification.read
                          ? "bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-l-4 border-l-blue-500 shadow-sm"
                          : "bg-slate-50 hover:bg-slate-100 border border-slate-200",
                        notification.type === "chat_message" && notification.courseId
                          ? !notification.read
                            ? "from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border-l-purple-500"
                            : "bg-slate-50"
                          : ""
                      )}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "flex-shrink-0 h-3 w-3 rounded-full mt-1.5",
                          !notification.read 
                            ? "bg-gradient-to-r from-blue-500 to-indigo-500 shadow-sm" 
                            : "bg-slate-300"
                        )}></div>
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "text-sm leading-relaxed",
                            !notification.read 
                              ? "text-slate-800 font-medium" 
                              : "text-slate-600"
                          )}>
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                              {new Date(notification.createdAt).toLocaleString()}
                            </span>
                            {!notification.read && (
                              <span className="text-xs text-blue-600 font-medium">NEW</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-3 px-4 py-2 h-11 rounded-full bg-gradient-to-br from-slate-50 to-slate-100 hover:from-indigo-50 hover:to-purple-50 border border-slate-200 hover:border-indigo-300 transition-all duration-300 shadow-sm hover:shadow-md group"
              >
                <Avatar className="h-9 w-9 border-2 border-slate-300 group-hover:border-indigo-400 transition-colors duration-300">
                  <AvatarImage src="/placeholder.svg?height=36&width=36&text=T" alt="@tutor" />
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-sm">
                    {user?.username?.charAt(0).toUpperCase() || user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden flex-col items-start text-sm lg:flex">
                  <span className="font-semibold text-slate-800 group-hover:text-indigo-700 transition-colors duration-300">
                    {user?.username || user?.name}
                  </span>
                  <span className="text-xs text-slate-500 font-medium tracking-wide">
                    INSTRUCTOR
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-500 group-hover:text-indigo-600 transition-colors duration-300" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-56 border-slate-200 bg-white/95 backdrop-blur-xl shadow-xl rounded-2xl p-2 slide-down"
              style={{ backdropFilter: 'blur(16px)' }}
            >
              <DropdownMenuLabel className="text-slate-800 font-semibold px-3 py-2">
                My Account
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
              <DropdownMenuItem
                onClick={handleMyAccount}
                className="mx-2 mb-1 rounded-lg hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-700 cursor-pointer transition-all duration-200 font-medium"
              >
                My Profile 
              </DropdownMenuItem>
              <DropdownMenuItem onClick={Dashboard} className="mx-2 mb-1 rounded-lg hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-700 cursor-pointer transition-all duration-200 font-medium">
                Earnings & Analytics
              </DropdownMenuItem>
              <DropdownMenuItem onClick={myWallet} className="mx-2 mb-1 rounded-lg hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-700 cursor-pointer transition-all duration-200 font-medium">
                Wallet
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gradient-to-r from-transparent via-slate-200 to-transparent my-2" />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="mx-2 rounded-lg text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-700 cursor-pointer transition-all duration-200 font-medium"
              >
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export default Header;