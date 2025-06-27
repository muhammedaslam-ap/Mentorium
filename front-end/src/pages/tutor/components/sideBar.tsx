"use client"

import { Button } from "@/components/ui/button"
import { User, Users, DollarSign, Book, ClipboardList, MessageSquare, LogOut, LayoutDashboard, Wallet, PhoneCall } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import { useDispatch } from "react-redux"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { tutorService } from "@/services/tutorServices/tutorService"
import { removeUser } from "@/redux/slice/userSlice"

export function Sidebar({ sidebarOpen } : {sidebarOpen : boolean}) {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const [isAccepted, setIsAccepted] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchTutorProfile = async () => {
    // try {
    //   const response = await tutorService.tutorDetails()
    //   setIsAccepted(response.data.tutor.isAccepted)
    //   setLoading(false)
    // } catch (error) {
    //   console.error("Failed to fetch tutor profile:", error)
    //   toast.error("Failed to load profile data")
    //   setLoading(false)
    // }
  }

  useEffect(() => {
    // fetchTutorProfile()
    setLoading(false)
  }, [])

  const navItems = [
    { icon: <LayoutDashboard className="h-4 w-4" />, name: "Dashboard", path: "/tutor/home", disabled: false },
    { icon: <User className="h-4 w-4" />, name: "Profile", path: "/tutor/profile", disabled: isAccepted === false },
    // { icon: <Users className="h-4 w-4" />, name: "Students", path: "/tutor/students", disabled: isAccepted === false },
    // {
    //   icon: <DollarSign className="h-4 w-4" />,
    //   name: "Revenue",
    //   path: "/tutor/revenue",
    //   disabled: isAccepted === false,
    // },
    { icon: <Book className="h-4 w-4" />, name: "Courses", path: "/tutor/courses", disabled: isAccepted === false },
    { icon: <Wallet className="h-4 w-4" />, name: "Wallet", path: "/tutor/wallet", disabled: isAccepted === false },
    { icon: <MessageSquare className="h-4 w-4" />, name: "Chat", path: "/tutor/chat", disabled: isAccepted === false },
    { icon: <PhoneCall className="h-4 w-4" />, name: "Call History", path: "/tutor/callHistory", disabled: isAccepted === false },

  ]

  const handleLogout = async () => {
    try {
      const response = await tutorService.logoutTutor()
      toast.success(response?.data.message)
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
        } fixed inset-y-0 left-0 top-16 z-30 w-64 shrink-0 border-r border-violet-100 bg-gradient-to-b from-violet-50 to-white pt-4 md:block`}
      >
        <div className="flex h-full flex-col justify-center items-center">
          <div className="h-8 w-8 rounded-full border-4 border-violet-200 border-t-violet-500 animate-spin"></div>
          <p className="mt-2 text-violet-500 font-medium">Loading...</p>
        </div>
      </aside>
    )
  }

  return (
    <aside
      className={`${
        sidebarOpen ? "block" : "hidden"
      } fixed inset-y-0 left-0 top-16 z-30 w-64 shrink-0 border-r border-violet-100 bg-gradient-to-b from-violet-50 to-white pt-4 md:block shadow-sm`}
    >
      <div className="flex h-full flex-col">
        <div className="px-4 py-2">
          <h2 className="text-sm font-semibold text-violet-800">MENU</h2>
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
                    ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700"
                    : "hover:bg-violet-100 hover:text-violet-700"
                } ${item.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={() => handleNavigation(item.path)}
                disabled={item.disabled}
                title={item.disabled ? "This feature is available only after acceptance" : undefined}
              >
                <span className={`${isActive ? "text-white" : "text-violet-600"}`}>{item.icon}</span>
                <span className="ml-2 font-medium">{item.name}</span>
                {isActive && <div className="ml-auto h-2 w-2 rounded-full bg-white animate-pulse"></div>}
              </Button>
            )
          })}
        </nav>
        <div className="mt-auto border-t border-violet-100 px-4 py-4">
          {bottomItems.map((item) => (
            <Button
              key={item.name}
              variant="ghost"
              className="w-full justify-start text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-all duration-200"
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
