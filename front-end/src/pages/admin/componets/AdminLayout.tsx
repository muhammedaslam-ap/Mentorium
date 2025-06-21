import { useState } from "react"
import { AdminHeader } from "./AdminHeader"
import { AdminSidebar } from "./AdminSidebar"

interface AdminLayoutProps {
  children: React.ReactNode
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-violet-50">
      <AdminHeader isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />
      
      <div className="flex">
        <AdminSidebar isSidebarOpen={isSidebarOpen} />
        
        <main className={`flex-1 ${isSidebarOpen ? "md:ml-64" : ""} p-4 md:p-8`}>
          {children}
        </main>
      </div>
    </div>
  )
}