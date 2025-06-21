import { Button } from "@/components/ui/button"
import { BarChart3, LogOut, Menu } from "lucide-react"
import { adminService } from "@/services/adminServices/adminAuthService"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"

interface AdminHeaderProps {
  isSidebarOpen: boolean
  onToggleSidebar: () => void
}

export const AdminHeader = ({ isSidebarOpen, onToggleSidebar }: AdminHeaderProps) => {
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await adminService.logoutAdmin()
      toast.success("Logged out successfully")
      navigate("/admin/login")
    } catch (error) {
      console.error("Failed to logout:", error)
      toast.error("Failed to logout")
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-violet-100 bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-violet-600"
            onClick={onToggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-violet-700 to-purple-700 bg-clip-text text-transparent">
              Admin Portal
            </span>
          </div>
        </div>

        <Button
          variant="ghost"
          className="flex items-center gap-2 text-rose-500 hover:bg-rose-50 hover:text-rose-700"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden md:inline">Logout</span>
        </Button>
      </div>
    </header>
  )
}