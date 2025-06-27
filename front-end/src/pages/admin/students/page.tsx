import type React from "react"
import { useState, useEffect } from "react"
import { Search, Ban, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { studentService } from "@/services/adminServices/userService"
import { AdminLayout } from "../componets/AdminLayout"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog"
import { AlertDialogHeader } from "@/components/ui/alert-dialog"

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
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [pagination, setPagination] = useState<PaginationInfo>({
    totalPages: 1,
    currentPage: 1,
    totalStudents: 0,
  })
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false)
  const [blockStudentId, setBlockStudentId] = useState<string | null>(null)
  const [blockAction, setBlockAction] = useState<boolean | null>(null)

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

  useEffect(() => {
    fetchStudents()
  }, [pagination.currentPage, rowsPerPage, searchQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPagination((prev) => ({ ...prev, currentPage: 1 }))
    fetchStudents()
  }

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: newPage }))
    }
  }

  const handleBlockStudent = async (studentId: string, currentBlockedStatus: boolean) => {
    try {
      await studentService.blockUser(studentId, !currentBlockedStatus)
      setStudents(
        students.map((student) =>
          student._id === studentId ? { ...student, isBlocked: !currentBlockedStatus } : student,
        ),
      )
    } catch (error) {
      console.error("Failed to update student status:", error)
    }
  }

  const openBlockDialog = (studentId: string, currentBlockedStatus: boolean) => {
    setBlockStudentId(studentId)
    setBlockAction(!currentBlockedStatus)
    setIsBlockDialogOpen(true)
  }

  const confirmBlockStudent = async () => {
    if (blockStudentId && blockAction !== null) {
      await handleBlockStudent(blockStudentId, !blockAction)
      setIsBlockDialogOpen(false)
    }
  }

  return (
    <AdminLayout>
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
              <TableHead className="text-violet-900">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <div className="flex justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600"></div>
                  </div>
                  <p className="mt-2 text-violet-600">Loading students...</p>
                </TableCell>
              </TableRow>
            ) : students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-violet-600">
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
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      className={`h-8 ${
                        student.isBlocked
                          ? "border-green-200 bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700"
                          : "border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                      }`}
                      onClick={() => openBlockDialog(student._id, student.isBlocked)}
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

      {/* Block Dialog */}
      <Dialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <DialogTitle className="text-violet-900">
              {blockAction === false ? "Block Student" : "Unblock Student"}
            </DialogTitle>
            <DialogDescription className="text-violet-600">
              Are you sure you want to {blockAction === false ? "block" : "unblock"} this student? This action cannot be undone.
            </DialogDescription>
          </AlertDialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsBlockDialogOpen(false)}
              className="border-violet-200 text-violet-700 hover:bg-violet-100"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmBlockStudent}
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}