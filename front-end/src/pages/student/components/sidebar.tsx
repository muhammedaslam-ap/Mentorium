"use client"

import { Button } from "@/components/ui/button"
import { User, BookOpen, Heart, Settings, LogOut, MessageCircle, BookOpenCheck, History, ListOrdered, Package } from 'lucide-react'
import { useNavigate, useLocation } from "react-router-dom"
import { useDispatch } from "react-redux"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { studentService } from "@/services/studentServices/studentServices"
import { removeUser } from "@/redux/slice/userSlice"

export function Sidebar({ sidebarOpen }) {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(true)

  const fetchStudentProfile = async () => {
    try {
      // const response = await studentService.studentDetails()
      setLoading(false)
    } catch (error) {
      console.error("Failed to fetch student profile:", error)
      toast.error("Failed to load profile data")
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudentProfile()
  }, [])

  const navItems = [
    { icon: <User className="h-4 w-4" />, name: "Profile", path: "/student/profile", disabled: false },
    {
      icon: <BookOpenCheck className="h-4 w-4" />,
      name: "My Learning",
      path: "/student/enrolled",
      disabled: false,
    },
    { icon: <Heart className="h-4 w-4" />, name: "Wishlist", path: "/student/wishlist", disabled: false },
    { icon: <MessageCircle className="h-4 w-4" />, name: "Community Chat", path: "/community", disabled: false },
    { icon: <Package className="h-4 w-4" />, name: "Purchase-History", path: "/student/purchase-History", disabled: false },


    // { icon: <Settings className="h-4 w-4" />, name: "Settings", path: "/student/settings", disabled: false },
  ]

  const handleLogout = async () => {
    try {
      const response = await studentService.logoutStudent()
      toast.success(response?.message || "Logged out successfully")
      localStorage.removeItem("userData")
      dispatch(removeUser())
      navigate("/auth")
    } catch (error) {
      console.error("Logout failed:", error)
      toast.error("Failed to logout")
    }
  }

  const bottomItems = [
    { icon: <LogOut className="h-4 w-4" />, name: "Logout", path: "/auth", disabled: false, action: handleLogout },
  ]

  const handleNavigation = (path: string, action?: () => void) => {
    if (action) {
      action()
    } else {
      navigate(path)
    }
  }

  if (loading) {
    return (
      <aside
        className={`${
          sidebarOpen ? "block" : "hidden"
        } fixed inset-y-0 left-0 top-16 z-30 w-64 shrink-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 pt-4 md:block`}
      >
        <div className="flex h-full flex-col justify-center items-center">
          <div className="h-8 w-8 rounded-full border-4 border-blue-200 border-t-blue-500 dark:border-t-blue-400 animate-spin"></div>
          <p className="mt-2 text-blue-600 dark:text-blue-400 font-medium">Loading...</p>
        </div>
      </aside>
    )
  }

  return (
    <aside
      className={`${
        sidebarOpen ? "block" : "hidden"
      } fixed inset-y-0 left-0 top-16 z-30 w-64 shrink-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 pt-4 md:block shadow-sm`}
    >
      <div className="flex h-full flex-col">
        <div className="px-4 py-2">
          <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-300">MENU</h2>
        </div>
        <nav className="mt-2 grid gap-1 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Button
                key={item.name}
                variant="ghost"
                className={`justify-start transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400"
                } ${item.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={() => handleNavigation(item.path)}
                disabled={item.disabled}
                title={item.disabled ? "This feature is not available yet" : undefined}
              >
                <span className={`${isActive ? "text-white" : "text-gray-600 dark:text-gray-300"}`}>{item.icon}</span>
                <span className="ml-2 font-medium">{item.name}</span>
                {isActive && <div className="ml-auto h-2 w-2 rounded-full bg-white animate-pulse"></div>}
              </Button>
            )
          })}
        </nav>
        <div className="mt-auto border-t border-gray-200 dark:border-gray-700 px-4 py-4">
          {bottomItems.map((item) => (
            <Button
              key={item.name}
              variant="ghost"
              className="w-full justify-start text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
              onClick={() => handleNavigation(item.path, item.action)}
              disabled={item.disabled}
            >
              {item.icon}
              <span className="ml-2 font-medium">{item.name}</span>
            </Button>
          ))}
        </div>
      </div>
    </aside>
  )
}

export default Sidebar