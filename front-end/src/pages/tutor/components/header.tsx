"use client";

import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { MessageSquare, ChevronDown, BookOpen, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { removeTutor } from "@/redux/slice/tutorSlice";
import { toast } from "sonner";
import { tutorService } from "@/services/tutorServices/tutorService";

interface Notification {
  _id: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [isAccepted, setIsAccepted] = useState<boolean | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await tutorService.tutorDetails();
        setUser({ name: response?.data.tutor.name, email: response?.data.tutor.email });
        setIsAccepted(response?.data.tutor.isAccepted);
      } catch (error) {
        console.error("Failed to fetch user details:", error);
        toast.error("Failed to load user data");
      }
    }
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await tutorService.fetchNotification();
        const fetchedNotifications = Array.isArray(response?.data.notifications)
          ? response.data.notifications
          : [response?.data.notifications].filter(Boolean);
        setNotifications(fetchedNotifications);
        setUnreadCount(fetchedNotifications.filter((n: Notification) => !n.read).length);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
        toast.error("Could not load notifications");
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

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
      await tutorService.markNotifiactionAsRead(notificationId);
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification._id === notificationId ? { ...notification, read: true } : notification
        )
      );
      setUnreadCount((prevCount) => Math.max(0, prevCount - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await tutorService.markAllNotificationAsRead();
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      toast.error("Failed to update notifications");
    }
  };

  const handleSignOut = async () => {
    localStorage.removeItem("tutorDatas");
    dispatch(removeTutor());
    navigate("/auth");
    const response = await tutorService.logoutTutor();
    toast.success(response?.data.message);
  };

  const handleMyAccount = () => {
    navigate("/tutor/profile");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-gradient-to-r from-violet-50 to-purple-50 shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between space-x-4 sm:space-x-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-violet-600" />
            <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              TutorDashboard
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="relative rounded-full border-violet-200 bg-white hover:bg-violet-100 hover:text-violet-700 transition-all duration-200"
          >
            <MessageSquare className="h-4 w-4 text-violet-600" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="relative rounded-full border-violet-200 bg-white hover:bg-violet-100 hover:text-violet-700 transition-all duration-200"
              >
                <Bell className="h-4 w-4 text-violet-600" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 border-violet-200 bg-white shadow-lg rounded-xl p-1">
              <DropdownMenuLabel className="text-violet-800">Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-violet-100" />
              {notifications.length === 0 ? (
                <DropdownMenuItem className="text-sm text-gray-500">No notifications</DropdownMenuItem>
              ) : (
                <>
                  <DropdownMenuItem
                    onClick={markAllNotificationsAsRead}
                    className="rounded-md hover:bg-violet-50 hover:text-violet-700 cursor-pointer transition-colors"
                  >
                    Mark all as read
                  </DropdownMenuItem>
                  {notifications.map((notification) => (
                    <DropdownMenuItem
                      key={notification._id}
                      onClick={() => markNotificationAsRead(notification._id)}
                      className={`rounded-md ${
                        notification.read
                          ? "text-gray-500"
                          : "text-gray-700"
                      } hover:bg-violet-50 hover:text-violet-700 cursor-pointer transition-colors`}
                    >
                      <div>
                        <p>{notification.message}</p>
                        <span className="text-xs text-gray-400">
                          {new Date(notification.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-white border border-violet-200 hover:bg-violet-100 hover:border-violet-300 transition-all duration-200"
              >
                <Avatar className="h-8 w-8 border-2 border-violet-300">
                  <AvatarImage src="/placeholder.svg?height=32&width=32&text=T" alt="@tutor" />
                  <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                    {user?.name?.charAt(0) || "T"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden flex-col items-start text-sm md:flex">
                  <span className="font-medium text-violet-900">{user?.name || "Tutor"}</span>
                  <span className="text-xs text-violet-600">Tutor</span>
                </div>
                <ChevronDown className="h-4 w-4 text-violet-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 border-violet-200 bg-white shadow-lg rounded-xl p-1">
              <DropdownMenuLabel className="text-violet-800">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-violet-100" />
              <DropdownMenuItem
                onClick={handleMyAccount}
                className="rounded-md hover:bg-violet-50 hover:text-violet-700 cursor-pointer transition-colors"
              >
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-md hover:bg-violet-50 hover:text-violet-700 cursor-pointer transition-colors">
                Earnings
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-md hover:bg-violet-50 hover:text-violet-700 cursor-pointer transition-colors">
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-violet-100" />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="rounded-md text-rose-600 hover:bg-rose-50 hover:text-rose-700 cursor-pointer transition-colors"
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export default Header;