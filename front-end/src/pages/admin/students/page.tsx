"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom";
import { BarChart3, Users, GraduationCap, LogOut, Menu, Search, Ban, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { adminService } from "@/services/adminServices/adminAuthService"
import { studentService } from "@/services/adminServices/userService"
import { useNavigate } from "react-router-dom";
import { toast } from "sonner"

// Define the Student interface based on the API response
interface Student {
  _id: string
  name: string
  email: string
  isBlocked: boolean
  createdAt: string
}

interface PaginationInfo {
  totalPages: number
  currentPage: number
  totalStudents: number
}

export default function StudentsManagement() {
  const router = useNavigate()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [pagination, setPagination] = useState<PaginationInfo>({
    totalPages: 1,
    currentPage: 1,
    totalStudents: 0,
  })
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const fetchStudents = async () => {
    setLoading(true)
    try {
      const data = await studentService.userList(pagination.currentPage, rowsPerPage, searchQuery)
      setStudents(data.data || [])
      setPagination({
        totalPages: data.totalPages || 1,
        currentPage: data.currentPage || 1,
        totalStudents: data.totalStudents || 0,
      })
    } catch (error) {
      console.error("Failed to fetch students:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(()=>{
    console.log(students)
  },[students])

  useEffect(() => {
    fetchStudents()
  }, [pagination.currentPage, rowsPerPage, searchQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPagination((prev) => ({ ...prev, currentPage: 1 })) // Reset to first page on new search
    fetchStudents()
  }

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: newPage }))
    }
  }

  const handleLogout = async () => {
    try {
      await adminService.logoutAdmin()
      toast.success("Logged out successfully")
      router("/admin/login")
    } catch (error) {
        console.log(error);
      toast.error("Failed to logout")
    }
  }

  const handleBlockStudent = async (studentId: string, currentBlockedStatus: boolean) => {
    try {
      await studentService.blockUser(studentId, !currentBlockedStatus)
      // Update the local state to reflect the change
      setStudents(
        students.map((student) =>
          student._id === studentId ? { ...student, isBlocked: !currentBlockedStatus } : student,
        ),
      )
    } catch (error) {
      console.error("Failed to update student status:", error)
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
                <Button variant="ghost" className="w-full justify-start hover:bg-violet-100 hover:text-violet-700">
                  <BarChart3 className="mr-2 h-4 w-4 text-violet-600" />
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
                <Button
                  variant="ghost"
                  className="w-full justify-start bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Students
                </Button>
              </Link>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 ${isSidebarOpen ? "md:ml-64" : ""} p-4 md:p-8`}>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-violet-900">Student Management</h1>
            <p className="text-violet-600">View and manage all students</p>
          </div>

          {/* Search and Filters */}
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
              <Input
                type="search"
                placeholder="Search students..."
                className="border-violet-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit" className="bg-violet-600 hover:bg-violet-700">
                <Search className="h-4 w-4" />
              </Button>
            </form>
            <div className="flex items-center gap-2">
              <select
                className="rounded-md border border-violet-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(Number(e.target.value))}
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
          </div>

          {/* Students Table */}
          <div className="rounded-lg border border-violet-100 bg-white shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-violet-50 to-purple-50">
                  <TableHead className="text-violet-900">Name</TableHead>
                  <TableHead className="text-violet-900">Email</TableHead>
                  <TableHead className="text-violet-900">Status</TableHead>
                  <TableHead className="text-violet-900">Joined</TableHead>
                  <TableHead className="text-violet-900">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <div className="flex justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600"></div>
                      </div>
                      <p className="mt-2 text-violet-600">Loading students...</p>
                    </TableCell>
                  </TableRow>
                ) : students.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-violet-600">
                      No students found
                    </TableCell>
                  </TableRow>
                ) : (
                  students.map((student) => (
                    <TableRow key={student._id} className="hover:bg-violet-50">
                      <TableCell className="font-medium text-violet-900">{student.name}</TableCell>
                      <TableCell className="text-violet-700">{student.email}</TableCell>
                      <TableCell>
                        {student.isBlocked ? (
                          <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                            Blocked
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                            Active
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-violet-600">
                        {new Date(student.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          className={`h-8 ${
                            student.isBlocked
                              ? "border-green-200 bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700"
                              : "border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                          }`}
                          onClick={() => handleBlockStudent(student._id, student.isBlocked)}
                        >
                          {student.isBlocked ? (
                            <>
                              <CheckCircle className="mr-1 h-3.5 w-3.5" />
                              Unblock
                            </>
                          ) : (
                            <>
                              <Ban className="mr-1 h-3.5 w-3.5" />
                              Block
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-violet-100 bg-gradient-to-r from-violet-50 to-purple-50 px-4 py-3">
              <div className="text-sm text-violet-600">
                Showing {students.length} of {pagination.totalStudents} students
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="border-violet-200 text-violet-700 hover:bg-violet-100"
                >
                  Previous
                </Button>
                <div className="flex h-8 items-center justify-center rounded-md border border-violet-200 bg-white px-3 text-sm">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="border-violet-200 text-violet-700 hover:bg-violet-100"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
