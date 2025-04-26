
import { useState } from "react"
import { Link } from "react-router-dom";
import { BarChart3, Users, GraduationCap, LogOut, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { adminService } from "@/services/adminServices/adminAuthService"
import { useNavigate } from "react-router-dom";
import { toast } from "sonner"

export default function AdminDashboard() {
  const router = useNavigate()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const handleLogout = async () => {
    try {
      await adminService.logoutAdmin()
      toast.success("Logged out successfully")
      router("/admin/login")
    } catch (error) {
      console.log(error)
      toast.error("Failed to logout")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-violet-50">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-violet-100 bg-white shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-violet-600"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
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

      <div className="flex">
        {/* Sidebar */}
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
                <Button
                  variant="ghost"
                  className="w-full justify-start bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700"
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <Link to="/admin/tutors">
                <Button variant="ghost" className="w-full justify-start hover:bg-violet-100 hover:text-violet-700">
                  <GraduationCap className="mr-2 h-4 w-4 text-violet-600" />
                  Tutors
                </Button>
              </Link>
              <Link to="/admin/students">
                <Button variant="ghost" className="w-full justify-start hover:bg-violet-100 hover:text-violet-700">
                  <Users className="mr-2 h-4 w-4 text-violet-600" />
                  Students
                </Button>
              </Link>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 ${isSidebarOpen ? "md:ml-64" : ""} p-4 md:p-8`}>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-violet-900">Dashboard</h1>
            <p className="text-violet-600">Welcome to the admin dashboard</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-violet-100 shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="border-b border-violet-100 bg-gradient-to-r from-violet-50 to-purple-50">
                <CardTitle className="text-violet-800">Total Tutors</CardTitle>
                <CardDescription className="text-violet-600">Overview of registered tutors</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-violet-900">124</p>
                    <p className="text-sm text-violet-600">+12% from last month</p>
                  </div>
                  <div className="rounded-full bg-gradient-to-r from-violet-500 to-purple-600 p-3 text-white">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                  <div className="rounded-lg bg-violet-50 p-2">
                    <p className="text-sm font-medium text-violet-600">Active</p>
                    <p className="text-xl font-bold text-violet-900">98</p>
                  </div>
                  <div className="rounded-lg bg-violet-50 p-2">
                    <p className="text-sm font-medium text-violet-600">Pending</p>
                    <p className="text-xl font-bold text-violet-900">26</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-violet-100 shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="border-b border-violet-100 bg-gradient-to-r from-violet-50 to-purple-50">
                <CardTitle className="text-violet-800">Total Students</CardTitle>
                <CardDescription className="text-violet-600">Overview of registered students</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-violet-900">1,568</p>
                    <p className="text-sm text-violet-600">+8% from last month</p>
                  </div>
                  <div className="rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-600 p-3 text-white">
                    <Users className="h-6 w-6" />
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                  <div className="rounded-lg bg-violet-50 p-2">
                    <p className="text-sm font-medium text-violet-600">Active</p>
                    <p className="text-xl font-bold text-violet-900">1,492</p>
                  </div>
                  <div className="rounded-lg bg-violet-50 p-2">
                    <p className="text-sm font-medium text-violet-600">Blocked</p>
                    <p className="text-xl font-bold text-violet-900">76</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-violet-100 shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="border-b border-violet-100 bg-gradient-to-r from-violet-50 to-purple-50">
                <CardTitle className="text-violet-800">Recent Activity</CardTitle>
                <CardDescription className="text-violet-600">Latest admin actions</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-green-100 p-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-violet-900">Tutor Approved</p>
                      <p className="text-xs text-violet-600">John Doe was approved as a tutor</p>
                      <p className="text-xs text-violet-500">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-red-100 p-2">
                      <div className="h-2 w-2 rounded-full bg-red-500"></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-violet-900">Student Blocked</p>
                      <p className="text-xs text-violet-600">Jane Smith was blocked</p>
                      <p className="text-xs text-violet-500">5 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-amber-100 p-2">
                      <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-violet-900">Tutor Rejected</p>
                      <p className="text-xs text-violet-600">Mike Johnson was rejected</p>
                      <p className="text-xs text-violet-500">Yesterday</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <Card className="border-violet-100 shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="border-b border-violet-100 bg-gradient-to-r from-violet-50 to-purple-50">
                <CardTitle className="text-violet-800">Pending Approvals</CardTitle>
                <CardDescription className="text-violet-600">Tutors waiting for approval</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <Link to="/admin/tutors" className="block">
                    <Button className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">
                      View All Pending Tutors
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="border-violet-100 shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="border-b border-violet-100 bg-gradient-to-r from-violet-50 to-purple-50">
                <CardTitle className="text-violet-800">Quick Actions</CardTitle>
                <CardDescription className="text-violet-600">Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <Link to="/admin/tutors">
                    <Button
                      variant="outline"
                      className="w-full border-violet-200 text-violet-700 hover:bg-violet-100 hover:text-violet-800"
                    >
                      Manage Tutors
                    </Button>
                  </Link>
                  <Link to="/admin/students">
                    <Button
                      variant="outline"
                      className="w-full border-violet-200 text-violet-700 hover:bg-violet-100 hover:text-violet-800"
                    >
                      Manage Students
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
