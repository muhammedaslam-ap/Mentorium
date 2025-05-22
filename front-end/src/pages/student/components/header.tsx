"use client";

import React, { useEffect, useState, useRef } from "react"; // Added useRef
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { removeUser } from "@/redux/slice/userSlice";
import { toast } from "sonner";
import { io, Socket } from "socket.io-client";
import {
  BookOpen,
  Heart,
  LogOut,
  Menu,
  Search,
  User,
  X,
  Bell,
} from "lucide-react";
import { userAuthService } from "@/services/userServices/authServices";
import { authAxiosInstance } from "@/api/authAxiosInstance";

interface User {
  name: string;
  email: string;
  id?: string;
  _id?: string;
  username?: string;
}

interface Notification {
  _id: string;
  message: string;
  read: boolean;
  createdAt: string;
  type: string;
  communityId?: string;
  courseTitle?: string;
  senderId?: string;
}

const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);
  const [studentName, setStudentName] = useState<string>("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user.userDatas) as User | null;
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (user) {
      setStudentName(user.name || "Student");
      socketRef.current = io(import.meta.env.VITE_AUTH_BASEURL, {
        reconnection: true,
      });

      socketRef.current.on("connect", () => {
        console.log("Socket.IO connected in Header:", socketRef.current?.id);
      });

      socketRef.current.on("receive_notification", (notification: Notification) => {
        console.log("Received notification:", notification);
        if (notification.senderId !== (user.id || user._id)) {
          setNotifications((prev) => [
            { ...notification, _id: `temp-${Date.now()}`, read: false },
            ...prev,
          ]);
          setUnreadCount((prev) => prev + 1);
        }
      });

      socketRef.current.on("connect_error", (error) => {
        console.error("Socket.IO connection error in Header:", error);
      });

      return () => {
        socketRef.current?.off("connect");
        socketRef.current?.off("receive_notification");
        socketRef.current?.off("connect_error");
        socketRef.current?.disconnect();
      };
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const response = await authAxiosInstance.get("/tutor/notifications");
      const fetchedNotifications = Array.isArray(response.data.notifications)
        ? response.data.notifications
        : [];

      
      setNotifications(fetchedNotifications);
      console.log('hey helo notification',notifications)
      setUnreadCount(fetchedNotifications.filter((n: Notification) => !n.read).length);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      toast.error("Could not load notifications");
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    if (notificationId.startsWith("temp-")) return;
    try {
      await authAxiosInstance.put(`/tutor/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      toast.error("Failed to mark notification as read");
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await authAxiosInstance.put("/tutor/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      toast.error("Failed to update notifications");
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = async () => {
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
  };

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/student/courses", label: "Courses" },
    { to: "/paths", label: "Learning Paths" },
    { to: "/community", label: "Community" },
    { to: "/about", label: "About" },
  ];

  const profileMenuItems = [
    { label: "Profile", icon: User, onClick: () => navigate("/student/profile") },
    { label: "Wishlist", icon: Heart, onClick: () => navigate("/student/wishlist") },
    { label: "Sign out", icon: LogOut, onClick: handleLogout },
  ];

  const firstLetter = studentName ? studentName.charAt(0).toUpperCase() : "S";

  return (
    <header className="sticky top-0 z-50 w-full bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="container mx-auto flex items-center justify-between h-16 px-4 md:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <span className="text-xl font-bold text-blue-600 dark:text-blue-400">Mentorium</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600 dark:text-gray-300">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden md:block relative">
            <input
              type="text"
              placeholder="Search courses..."
              className="w-48 lg:w-64 pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>

          <div className="relative">
            <button
              onClick={() => setNotificationMenuOpen(!notificationMenuOpen)}
              className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            {notificationMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg animate-fade-in max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-gray-500 dark:text-gray-400 text-sm">No notifications</div>
                ) : (
                  <>
                    <div className="p-2 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">Notifications</span>
                      <button
                        onClick={markAllNotificationsAsRead}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Mark all as read
                      </button>
                    </div>
                    {notifications.map((notification) => (
                      <button
                        key={notification._id}
                        onClick={() => markNotificationAsRead(notification._id)}
                        className={`flex items-start gap-2 w-full px-4 py-2 text-left text-sm ${
                          notification.read
                            ? "text-gray-500 dark:text-gray-400"
                            : "text-gray-600 dark:text-gray-300"
                        } hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-colors`}
                      >
                        <div>
                          <p>{notification.message}</p>
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {new Date(notification.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="w-8 h-8 rounded-full border-2 border-blue-600 dark:border-blue-400 bg-blue-600 dark:bg-blue-400 text-white flex items-center justify-center text-lg font-semibold">
                  {firstLetter}
                </div>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{studentName || "Student"}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{user.email}</span>
                </div>
              </button>
              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg animate-fade-in">
                  {profileMenuItems.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => {
                        item.onClick();
                        setProfileMenuOpen(false);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-left text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/auth"
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-4 py-2 rounded-lg transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/auth"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Sign up
              </Link>
            </div>
          )}

          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-gray-900/50 dark:bg-gray-900/75 md:hidden animate-fade-in">
          <div className="fixed right-0 top-0 h-full w-4/5 max-w-sm bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">Mentorium</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
            <div className="p-4">
              <div className="relative mb-6">
                <input
                  type="text"
                  placeholder="Search courses..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <nav className="flex flex-col gap-4 text-base text-gray-600 dark:text-gray-300">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                <button
                  onClick={() => {
                    setNotificationMenuOpen(!notificationMenuOpen);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 text-base text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <Bell className="h-5 w-5" />
                  Notifications
                  {unreadCount > 0 && (
                    <span className="h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </nav>
              <div className="mt-6 flex flex-col gap-3">
                <Link
                  to="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-center"
                >
                  Log in
                </Link>
                <Link
                  to="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center"
                >
                  Sign up
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {notificationMenuOpen && (
        <div className="fixed inset-0 z-50 bg-gray-900/50 dark:bg-gray-900/75 md:hidden animate-fade-in">
          <div className="fixed right-0 top-0 h-full w-4/5 max-w-sm bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">Notifications</span>
              <button
                onClick={() => setNotificationMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
            <div className="p-4">
              {notifications.length === 0 ? (
                <div className="p-4 text-gray-500 dark:text-gray-400 text-sm">No notifications</div>
              ) : (
                <>
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="w-full text-left text-sm text-blue-600 dark:text-blue-400 hover:underline mb-4"
                  >
                    Mark all as read
                  </button>
                  {notifications.map((notification) => (
                    <button
                      key={notification._id}
                      onClick={() => markNotificationAsRead(notification._id)}
                      className={`flex items-start gap-2 w-full px-4 py-2 text-left text-sm ${
                        notification.read
                          ? "text-gray-500 dark:text-gray-400"
                          : "text-gray-600 dark:text-gray-300"
                      } hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-colors`}
                    >
                      <div>
                        <p>{notification.message}</p>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {new Date(notification.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;