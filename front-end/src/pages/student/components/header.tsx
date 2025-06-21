import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { removeUser } from "@/redux/slice/userSlice";
import { toast } from "sonner";
import { io, Socket } from "socket.io-client";
import { BookOpen, Heart, LogOut, Menu, Search, User, X, Bell } from "lucide-react";
import { userAuthService } from "@/services/userServices/authServices";
import { authAxiosInstance } from "@/api/authAxiosInstance";
import { useInView } from "react-intersection-observer";
import { cn } from "@/lib/utils";

interface User {
  name: string;
  email: string;
  id?: string;
  _id?: string;
  username?: string;
}

interface Notification {
  _id: string;
  userId: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
  communityId?: string;
  courseTitle?: string;
  senderId?: string;
  courseId?: string;
  studentId?: string;
  tutorId?: string;
}

const NotificationSkeleton = () => (
  <div className="animate-pulse p-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
    <div className="flex items-start gap-3">
      <div className="h-3 w-3 bg-gray-200 dark:bg-gray-700 rounded-full mt-1.5"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    </div>
  </div>
);

const NotificationItem = React.memo(
  ({ notification, markNotificationAsRead }: { notification: Notification; markNotificationAsRead: (id: string) => void }) => {
    const isPrivateMessage = notification.type === "chat_message" && notification.courseId;
    return (
      <div
        onClick={() => markNotificationAsRead(notification._id)}
        className={cn(
          "group cursor-pointer p-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-all duration-200",
          !notification.read
            ? isPrivateMessage
              ? "bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-800/40 dark:hover:to-pink-800/40 border-l-4 border-l-purple-500"
              : "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-800/40 dark:hover:to-indigo-800/40 border-l-4 border-l-blue-500"
            : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
        )}
      >
        <div className="flex items-start gap-3">
          <div className={cn(
            "flex-shrink-0 h-3 w-3 rounded-full mt-1.5 transition-colors",
            !notification.read 
              ? isPrivateMessage
                ? "bg-gradient-to-r from-purple-500 to-pink-500 shadow-sm"
                : "bg-gradient-to-r from-blue-500 to-indigo-500 shadow-sm"
              : "bg-gray-300 dark:bg-gray-600"
          )}></div>
          <div className="flex-1 min-w-0">
            <p className={cn(
              "text-sm leading-relaxed",
              !notification.read 
                ? "text-gray-900 dark:text-gray-100 font-medium" 
                : "text-gray-600 dark:text-gray-400"
            )}>
              {notification.message}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                {new Date(notification.createdAt).toLocaleString()}
              </span>
              {!notification.read && (
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">NEW</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

const ProfileMenu = React.memo(
  ({ profileMenuItems, setProfileMenuOpen }: { profileMenuItems: { label: string; icon: React.FC<any>; onClick: () => void }[]; setProfileMenuOpen: (open: boolean) => void }) => (
    <div className="absolute right-0 mt-3 w-56 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-gray-200/80 dark:border-gray-700/80 rounded-2xl shadow-xl ring-1 ring-black/5 dark:ring-white/10 animate-fade-in">
      <div className="p-2">
        {profileMenuItems.map((item, index) => (
          <button
            key={item.label}
            onClick={() => {
              item.onClick();
              setProfileMenuOpen(false);
            }}
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2.5 text-left rounded-lg transition-all duration-200 font-medium",
              index === profileMenuItems.length - 1
                ? "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                : "text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
);

const NavLinks = React.memo(
  ({ navLinks, setMobileMenuOpen, isMobile }: { navLinks: { to: string; label: string }[]; setMobileMenuOpen?: (open: boolean) => void; isMobile: boolean }) => (
    <>
      {navLinks.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          onClick={() => setMobileMenuOpen && setMobileMenuOpen(false)}
          className={`transition-colors duration-200 ${isMobile 
            ? "text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400" 
            : "text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-blue-600 after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left"
          }`}
        >
          {link.label}
        </Link>
      ))}
    </>
  )
);

const Header: React.FC = () => {
  // ... keep existing code (all state declarations and hooks)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);
  const [studentName, setStudentName] = useState<string>("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [visibleNotifications, setVisibleNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state?.user?.userDatas);
  const socketRef = useRef<Socket | null>(null);
  const { ref: loadMoreRef, inView } = useInView();

  const notificationsPerPage = 10;

  // ... keep existing code (all useEffect hooks and functions)
  useEffect(() => {
    setVisibleNotifications(notifications.slice(0, notificationsPerPage));
  }, [notifications]);

  useEffect(() => {
    if (inView && visibleNotifications.length < notifications.length) {
      setVisibleNotifications((prev) => notifications.slice(0, prev.length + notificationsPerPage));
    }
  }, [inView, notifications]);

  const fetchNotifications = useCallback(async () => {
    setIsLoadingNotifications(true);
    try {
      const response = await authAxiosInstance.get("/tutor/notifications");
      const fetchedNotifications = Array.isArray(response.data.notifications) ? response.data.notifications : [];
      setNotifications(fetchedNotifications);
      setUnreadCount(fetchedNotifications.filter((n: Notification) => !n.read).length);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      toast.error("Could not load notifications");
    } finally {
      setIsLoadingNotifications(false);
    }
  }, []);

  const markNotificationAsRead = useCallback(
    async (notificationId: string) => {
      console.log("Marking notification as read:", notificationId);
      const notification = notifications.find((n) => n._id === notificationId);
      if (!notification) {
        console.warn("Notification not found:", notificationId);
        return;
      }

      try {
        await authAxiosInstance.put(`/tutor/notifications/${notificationId}/read`);
        setNotifications((prev) => prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n)));
        setUnreadCount((prev) => Math.max(0, prev - 1));
        if (notification.courseId && notification.studentId && notification.tutorId) {
          socketRef.current?.emit("mark_private_message_notification_as_read", {
            notificationId,
            courseId: notification.courseId,
            studentId: notification.studentId,
            tutorId: notification.tutorId,
          });
          console.log("Emitted mark_private_message_notification_as_read for:", notificationId);
        }
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
        toast.error("Failed to mark notification as read");
      }
    },
    [notifications]
  );

  const markAllNotificationsAsRead = useCallback(async () => {
    try {
      await authAxiosInstance.put("/tutor/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
      notifications
        .filter((n) => n.courseId && n.studentId && n.tutorId)
        .forEach((n) => {
          socketRef.current?.emit("mark_private_message_notification_as_read", {
            notificationId: n._id,
            courseId: n.courseId,
            studentId: n.studentId,
            tutorId: n.tutorId,
          });
        });
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      toast.error("Failed to update notifications");
    }
  }, [notifications]);

  const handleLogout = useCallback(async () => {
    try {
      await userAuthService.logoutUser();
      dispatch(removeUser());
      localStorage.removeItem("userDatas");
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  }, [dispatch, navigate]);

  useEffect(() => {
    if (user) {
      setStudentName(user.username || "Student");
      socketRef.current = io(import.meta.env.VITE_AUTH_BASEURL, {
        reconnection: true,
      });

      socketRef.current.on("connect", () => {
        console.log("Socket.IO connected in Header:", socketRef.current?.id);
        socketRef.current?.emit("join_user", user.id || user._id);
      });

      socketRef.current.on("notification", (notification: Notification) => {
        console.log("Received notification:", notification);
        if (notification.senderId !== (user.id || user._id)) {
          setNotifications((prev) => [notification, ...prev]);
          setUnreadCount((prev) => prev + 1);
        }
      });

      socketRef.current.on("receive_notification", (notification: Notification) => {
        console.log("Received community notification:", notification);
        if (notification.senderId !== (user.id || user._id)) {
          setNotifications((prev) => [notification, ...prev]);
          setUnreadCount((prev) => prev + 1);
        }
      });

      socketRef.current.on("notification_read", ({ notificationId }: { notificationId: string }) => {
        console.log("Notification read:", notificationId);
        setNotifications((prev) => prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n)));
        setUnreadCount((prev) => Math.max(0, prev - 1));
      });

      socketRef.current.on("connect_error", (error) => {
        console.error("Socket.IO connection error in Header:", error);
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
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user, fetchNotifications]);

  const navLinks = useMemo(
    () => [
      { to: "/", label: "Home" },
      { to: "/student/courses", label: "Courses" },
      { to: "/paths", label: "Learning Paths" },
      { to: "/community", label: "Community" },
      { to: "/about", label: "About" },
    ],
    []
  );

  const profileMenuItems = useMemo(
    () => [
      { label: "Profile", icon: User, onClick: () => navigate("/student/profile") },
      { label: "Wishlist", icon: Heart, onClick: () => navigate("/student/wishlist") },
      { label: "Sign out", icon: LogOut, onClick: handleLogout },
    ],
    [navigate, handleLogout]
  );

  const memoizedNotifications = useMemo(() => notifications, [notifications]);
  const memoizedUnreadCount = useMemo(() => memoizedNotifications.filter((n) => !n.read).length, [memoizedNotifications]);

  const firstLetter = studentName ? studentName.charAt(0).toUpperCase() : "S";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200/80 dark:border-gray-700/80 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl shadow-lg shadow-gray-200/20 dark:shadow-gray-900/20">
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes notification-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes shimmer {
          0% { background-position: -200px 0; }
          100% { background-position: calc(200px + 100%) 0; }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        .notification-pulse { animation: notification-pulse 2s infinite; }
        .shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          background-size: 200px 100%;
          animation: shimmer 2s infinite;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.15); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0, 0, 0, 0.25); }
      `}</style>

      <div className="container mx-auto flex items-center justify-between h-20 px-4 md:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="relative">
            <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <div className="absolute inset-0 h-8 w-8 bg-blue-600/20 rounded-full blur-lg animate-pulse"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Mentorium
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wide">LEARN & GROW</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <NavLinks navLinks={navLinks} isMobile={false} />
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden md:block relative">
            <input
              type="text"
              placeholder="Search courses..."
              className="w-48 lg:w-64 pl-10 pr-4 py-2.5 bg-gray-100/80 dark:bg-gray-700/80 border border-gray-300/60 dark:border-gray-600/60 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 backdrop-blur-sm"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>

          <div className="relative">
            <button
              onClick={() => setNotificationMenuOpen(!notificationMenuOpen)}
              className="relative h-11 w-11 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 shadow-sm hover:shadow-md group"
            >
              <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 mx-auto" />
              {memoizedUnreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-6 w-6 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg notification-pulse border-2 border-white dark:border-gray-800">
                  {memoizedUnreadCount > 99 ? "99+" : memoizedUnreadCount}
                </span>
              )}
            </button>
            {notificationMenuOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-gray-200/80 dark:border-gray-700/80 rounded-2xl shadow-xl ring-1 ring-black/5 dark:ring-white/10 max-h-96 overflow-hidden animate-fade-in">
                <div className="p-4 border-b border-gray-200/80 dark:border-gray-700/80">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      Notifications
                    </h3>
                    {memoizedUnreadCount > 0 && (
                      <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                        {memoizedUnreadCount} new
                      </span>
                    )}
                  </div>
                  {memoizedUnreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto custom-scrollbar">
                  {isLoadingNotifications ? (
                    <div className="space-y-0">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <NotificationSkeleton key={index} />
                      ))}
                    </div>
                  ) : memoizedNotifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="h-16 w-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mb-3">
                        <Bell className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 font-medium">No notifications yet</p>
                      <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">You're all caught up!</p>
                    </div>
                  ) : (
                    <>
                      {visibleNotifications.map((notification) => (
                        <NotificationItem
                          key={notification._id}
                          notification={notification}
                          markNotificationAsRead={markNotificationAsRead}
                        />
                      ))}
                      {visibleNotifications.length < memoizedNotifications.length && (
                        <div ref={loadMoreRef} className="h-10" />
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-3 px-4 py-2 h-11 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 shadow-sm hover:shadow-md group"
              >
                <div className="w-9 h-9 rounded-full border-2 border-blue-600 dark:border-blue-400 bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-lg font-bold group-hover:border-blue-700 dark:group-hover:border-blue-300 transition-colors duration-300">
                  {firstLetter}
                </div>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                    {studentName || "Student"}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wide">
                    STUDENT
                  </span>
                </div>
              </button>
              {profileMenuOpen && (
                <ProfileMenu profileMenuItems={profileMenuItems} setProfileMenuOpen={setProfileMenuOpen} />
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Link 
                to="/auth" 
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Log in
              </Link>
              <Link 
                to="/auth" 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200"
              >
                Sign up
              </Link>
            </div>
          )}

          <button
            className="md:hidden h-11 w-11 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 shadow-sm hover:shadow-md group"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6 text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 mx-auto" />
          </button>
        </div>
      </div>

      {/* Mobile Menu - keeping existing functionality */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 dark:bg-black/75 md:hidden animate-fade-in">
          <div className="fixed right-0 top-0 h-full w-4/5 max-w-sm bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl shadow-2xl transform transition-transform duration-300 border-l border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center gap-3">
                <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Mentorium</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
            <div className="p-6">
              <div className="relative mb-6">
                <input
                  type="text"
                  placeholder="Search courses..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-100/80 dark:bg-gray-700/80 border border-gray-300/60 dark:border-gray-600/60 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-600 dark:text-gray-400" />
              </div>
              <nav className="flex flex-col gap-4 text-base text-gray-600 dark:text-gray-300">
                <NavLinks navLinks={navLinks} setMobileMenuOpen={setMobileMenuOpen} isMobile={true} />
                <button
                  onClick={() => {
                    setNotificationMenuOpen(!notificationMenuOpen);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 text-base text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <Bell className="h-5 w-5" />
                  Notifications
                  {memoizedUnreadCount > 0 && (
                    <span className="h-5 w-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {memoizedUnreadCount}
                    </span>
                  )}
                </button>
              </nav>
              <div className="mt-6 flex flex-col gap-3">
                <Link
                  to="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-3 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-center"
                >
                  Log in
                </Link>
                <Link
                  to="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-colors text-center"
                >
                  Sign up
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Notification Menu - keeping existing functionality */}
      {notificationMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 dark:bg-black/75 md:hidden">
          <div className="fixed right-0 top-0 h-full w-4/5 max-w-sm bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl shadow-2xl transform transition-transform duration-300 border-l border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50">
              <span className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Notifications</span>
              <button
                onClick={() => setNotificationMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
            <div className="p-6">
              {isLoadingNotifications ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <NotificationSkeleton key={index} />
                  ))}
                </div>
              ) : memoizedNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Bell className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No notifications</p>
                </div>
              ) : (
                <>
                  {memoizedUnreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="w-full text-left text-sm text-blue-600 dark:text-blue-400 hover:underline mb-4 font-medium"
                    >
                      Mark all as read
                    </button>
                  )}
                  <div className="max-h-80 overflow-y-auto custom-scrollbar -mx-6">
                    {visibleNotifications.map((notification) => (
                      <NotificationItem
                        key={notification._id}
                        notification={notification}
                        markNotificationAsRead={markNotificationAsRead}
                      />
                    ))}
                    {visibleNotifications.length < memoizedNotifications.length && (
                      <div ref={loadMoreRef} className="h-10" />
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default React.memo(Header);