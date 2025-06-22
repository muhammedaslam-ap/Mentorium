import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { tutorService } from "@/services/adminServices/tutorService"
import { Search, CheckCircle, XCircle, Ban } from "lucide-react"
import { AdminLayout } from "../componets/AdminLayout"

interface Tutor {
  _id: string
  name: string
  email: string
  isBlocked: boolean
  approvalStatus: string | null
  createdAt: string
}

interface PaginationInfo {
  totalPages: number
  currentPage: number
  totalTutors: number
}

export default function TutorsManagement() {
  const [tutors, setTutors] = useState<Tutor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [pagination, setPagination] = useState<PaginationInfo>({
    totalPages: 1,
    currentPage: 1,
    totalTutors: 0,
  })
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [selectedTutorId, setSelectedTutorId] = useState<string | null>(null)

  const fetchTutors = async () => {
    setLoading(true)
    try {
      const data = await tutorService.userList(pagination.currentPage, rowsPerPage, searchQuery)
      setTutors(data.data || [])
      setPagination({
        totalPages: data.totalPages || 1,
        currentPage: data.currentPage || 1,
        totalTutors: data.totalTutors || 0,
      })
    } catch (error) {
      console.error("Failed to fetch tutors:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTutors()
  }, [pagination.currentPage, rowsPerPage, searchQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPagination((prev) => ({ ...prev, currentPage: 1 }))
    fetchTutors()
  }

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, currentPage: newPage }))
    }
  }

  const handleBlockTutor = async (tutorId: string, currentBlockedStatus: boolean) => {
    try {
      await tutorService.blockTutor(tutorId, !currentBlockedStatus)
      setTutors(tutors.map((tutor) => (tutor._id === tutorId ? { ...tutor, isBlocked: !currentBlockedStatus } : tutor)))
    } catch (error) {
      console.error("Failed to update tutor status:", error)
    }
  }

  const handleApproveTutor = async (tutorId: string) => {
    try {
      await tutorService.tutorApproval(tutorId)
      setTutors(tutors.map((tutor) => (tutor._id === tutorId ? { ...tutor, approvalStatus: 'approved' } : tutor)))
    } catch (error) {
      console.error("Failed to approve tutor:", error)
    }
  }

  const openRejectDialog = (tutorId: string) => {
    setSelectedTutorId(tutorId)
    setRejectionReason("")
    setIsRejectDialogOpen(true)
  }

  const handleRejectTutor = async () => {
    if (!selectedTutorId || !rejectionReason.trim()) {
      return
    }

    try {
      await tutorService.tutorReject(selectedTutorId, rejectionReason)
      setTutors(tutors.map((tutor) => (tutor._id === selectedTutorId ? { ...tutor, approvalStatus: 'rejected' } : tutor)))
      setIsRejectDialogOpen(false)
    } catch (error) {
      console.error("Failed to reject tutor:", error)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-violet-900">Tutor Management</h1>
          <p className="text-violet-600">View and manage all tutors</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
            <Input
              type="search"
              placeholder="Search tutors..."
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

        {/* Tutors Table */}
        <div className="rounded-lg border border-violet-100 bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-violet-50 to-purple-50">
                <TableHead className="text-violet-900">Name</TableHead>
                <TableHead className="text-violet-900">Email</TableHead>
                <TableHead className="text-violet-900">Status</TableHead>
                <TableHead className="text-violet-900">Approve/Reject</TableHead>
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
                    <p className="mt-2 text-violet-600">Loading tutors...</p>
                  </TableCell>
                </TableRow>
              ) : tutors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-violet-600">
                    No tutors found
                  </TableCell>
                </TableRow>
              ) : (
                tutors.map((tutor) => (
                  <TableRow key={tutor._id} className="hover:bg-violet-50">
                    <TableCell className="font-medium text-violet-900">{tutor.name}</TableCell>
                    <TableCell className="text-violet-700">{tutor.email}</TableCell>
                    <TableCell>
                      {tutor.isBlocked ? (
                        <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                          Blocked
                        </Badge>
                      ) : tutor.approvalStatus === 'approved' ? (
                        <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                          Approved
                        </Badge>
                      ) : tutor.approvalStatus === 'rejected' ? (
                        <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                          Rejected
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {tutor.approvalStatus === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 border-green-200 bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700"
                              onClick={() => handleApproveTutor(tutor._id)}
                            >
                              <CheckCircle className="mr-1 h-3.5 w-3.5" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                              onClick={() => openRejectDialog(tutor._id)}
                            >
                              <XCircle className="mr-1 h-3.5 w-3.5" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className={`h-8 ${
                            tutor.isBlocked
                              ? "border-green-200 bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700"
                              : "border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                          }`}
                          onClick={() => handleBlockTutor(tutor._id, tutor.isBlocked)}
                        >
                          {tutor.isBlocked ? (
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
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-violet-100 bg-gradient-to-r from-violet-50 to-purple-50 px-4 py-3">
            <div className="text-sm text-violet-600">
              Showing {tutors.length} of {pagination.totalTutors} tutors
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
      </div>

      {/* Rejection Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-violet-900">Reject Tutor</DialogTitle>
            <DialogDescription className="text-violet-600">
              Please provide a reason for rejecting this tutor. This will be sent to the tutor.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Enter rejection reason..."
              className="border-violet-200 min-h-[100px]"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRejectDialogOpen(false)}
              className="border-violet-200 text-violet-700 hover:bg-violet-100"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRejectTutor}
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}