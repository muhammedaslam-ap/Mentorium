import { Button } from "@/components/ui/button"
import { BarChart3, GraduationCap, Users, Wallet } from "lucide-react"
import { Link, useLocation } from "react-router-dom"

interface AdminSidebarProps {
  isSidebarOpen: boolean
}

export const AdminSidebar = ({ isSidebarOpen }: AdminSidebarProps) => {
  const location = useLocation()
  const currentPath = location.pathname

  const isActive = (path: string) => currentPath === path

  const getButtonClasses = (path: string) => {
    if (isActive(path)) {
      return "w-full justify-start bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700"
    }
    return "w-full justify-start hover:bg-violet-100 hover:text-violet-700"
  }

  return (
    <aside
      className={`${
        isSidebarOpen ? "block" : "hidden"
      } fixed inset-y-0 left-0 top-16 z-30 w-64 shrink-0 border-r border-violet-100 bg-gradient-to-b from-violet-50 to-white pt-4 md:block shadow-sm`}
    >
      <div className="flex h-full flex-col">
        <div className="px-4 py-2">
          <h2 className="text-sm font-semibold text-violet-800">MENU</h2>
        </div>
        <nav className="mt-2 grid gap-1 px-2">
          <Link to="/admin/dashboard">
            <Button variant="ghost" className={getButtonClasses("/admin/dashboard")}>
              <BarChart3 className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Link to="/admin/tutors">
            <Button variant="ghost" className={getButtonClasses("/admin/tutors")}>
              <GraduationCap className="mr-2 h-4 w-4" />
              Tutors
            </Button>
          </Link>
          <Link to="/admin/students">
            <Button variant="ghost" className={getButtonClasses("/admin/students")}>
              <Users className="mr-2 h-4 w-4" />
              Students
            </Button>
          </Link>
          <Link to="/admin/wallet">
            <Button variant="ghost" className={getButtonClasses("/admin/wallet")}>
              <Wallet className="mr-2 h-4 w-4" />
              Wallet
            </Button>
          </Link>
        </nav>
      </div>
    </aside>
  )
}