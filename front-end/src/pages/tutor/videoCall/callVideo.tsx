"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useSelector } from "react-redux"
import { authAxiosInstance } from "../../../api/authAxiosInstance"
import { Phone, BookOpen, Calendar, Clock, AlertCircle, GraduationCap } from "lucide-react"
import Header from "../components/header"
import Sidebar from "../components/sideBar"

// Define types for the Redux state and call history data
interface TutorState {
  tutorDatas: {
    id?: string
    _id?: string
    role: string
    name?: string
  }
}

interface CallHistory {
  _id: string
  tutorId: string
  studentId:
    | {
        name: string
      }
    | string
  courseName: string
  startTime: string
}

const TutorCallHistory = () => {
  const { tutorDatas } = useSelector((state: any) => state.tutor as TutorState)
  const [calls, setCalls] = useState<CallHistory[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (tutorDatas.role !== "tutor" || (!tutorDatas.id && !tutorDatas._id)) return

    setLoading(true)
    setError(null)
    authAxiosInstance
      .get("/call-history", {
        params: { userId: tutorDatas.id || tutorDatas._id, limit: 10, page: 1 },
      })
      .then((response) => {
        const data = response.data
        setCalls(
          data.data.map((call: CallHistory) => ({
            ...call,
            studentName: typeof call.studentId === "object" ? call.studentId.name || "Unknown" : "Unknown",
          })),
        )
        setLoading(false)
      })
      .catch((error) => {
        console.error("Failed to fetch tutor call history:", error)
        setError("Failed to load call history")
        setLoading(false)
      })
  }, [tutorDatas.id, tutorDatas._id, tutorDatas.role])

  if (tutorDatas.role !== "tutor") {
    return (
      <>
        <Header />
        <div className="flex h-screen bg-gray-50">
          <Sidebar sidebarOpen={sidebarOpen} />
          <div className={`flex-1 flex flex-col overflow-hidden ${sidebarOpen ? "md:ml-64" : "md:ml-64"}`}>
            <main className="flex-1 overflow-x-hidden overflow-y-auto">
              <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
                    <p className="text-gray-600 text-center">Only tutors can view this page.</p>
                  </CardContent>
                </Card>
              </div>
            </main>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="flex h-screen bg-gray-50">
        <Sidebar sidebarOpen={sidebarOpen} />
        <div className={`flex-1 flex flex-col overflow-hidden ${sidebarOpen ? "md:ml-64" : "md:ml-64"}`}>
          <main className="flex-1 overflow-x-hidden overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-violet-100 rounded-lg">
                    <Phone className="h-6 w-6 text-violet-600" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900">Call History</h1>
                </div>
                <p className="text-gray-600">Track your tutoring sessions and student interactions</p>
              </div>

              {/* Main Content */}
              <Card className="shadow-sm border-0 bg-white">
                <CardHeader className="border-b border-gray-100 bg-gray-50/50">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <Clock className="h-5 w-5 text-violet-600" />
                    Teaching Sessions
                    {calls.length > 0 && (
                      <Badge variant="secondary" className="ml-auto">
                        {calls.length} {calls.length === 1 ? "session" : "sessions"}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-16">
                      <div className="relative">
                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-violet-100 border-t-violet-600"></div>
                      </div>
                      <p className="mt-4 text-sm text-gray-500">Loading your call history...</p>
                    </div>
                  ) : error ? (
                    <div className="flex flex-col items-center justify-center py-16">
                      <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Data</h3>
                      <p className="text-red-600 text-center">{error}</p>
                    </div>
                  ) : (
                    <div className="overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50 hover:bg-gray-50">
                            <TableHead className="font-semibold text-gray-900 py-4">
                              <div className="flex items-center gap-2">
                                <GraduationCap className="h-4 w-4" />
                                Student
                              </div>
                            </TableHead>
                            <TableHead className="font-semibold text-gray-900">
                              <div className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4" />
                                Course
                              </div>
                            </TableHead>
                            <TableHead className="font-semibold text-gray-900">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Date & Time
                              </div>
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {calls.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={3} className="h-32">
                                <div className="flex flex-col items-center justify-center text-center">
                                  <Phone className="h-12 w-12 text-gray-300 mb-4" />
                                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Call History</h3>
                                  <p className="text-gray-500">You haven't conducted any tutoring sessions yet.</p>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : (
                            calls.map((call, index) => (
                              <TableRow
                                key={call._id}
                                className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                              >
                                <TableCell className="py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                                      <GraduationCap className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                      <p className="font-medium text-gray-900">{call.studentName}</p>
                                      <p className="text-sm text-gray-500">Student</p>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="py-4">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                      {call.courseName}
                                    </Badge>
                                  </div>
                                </TableCell>
                                <TableCell className="py-4">
                                  <div className="text-sm">
                                    <p className="font-medium text-gray-900">
                                      {new Date(call.startTime).toLocaleDateString("en-IN", {
                                        timeZone: "Asia/Kolkata",
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                      })}
                                    </p>
                                    <p className="text-gray-500">
                                      {new Date(call.startTime).toLocaleTimeString("en-IN", {
                                        timeZone: "Asia/Kolkata",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </p>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </>
  )
}

export default TutorCallHistory
