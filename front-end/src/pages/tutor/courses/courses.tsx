"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import {
  PlusOutlined,
  SearchOutlined,
  DeleteOutlined,
  EditOutlined,
  BookOutlined,
  LoadingOutlined,
  VideoCameraOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons"
import { Button, Input, Menu, Tag, Spin, Modal, Pagination } from "antd"
import { Card, CardContent } from "@/components/ui/card"
import { courseService } from "@/services/courseServices/courseService"
import { lessonService } from "@/services/lessonServices/lessonServices"
import Sidebar from "../components/sideBar"
import Header from "../components/header"
import { AxiosError } from "axios"
import debounce from "lodash.debounce"

interface Course {
  _id: string
  title: string
  tagline: string
  category: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  price: number
  about: string
  thumbnail: string
  enrollments?: number
  createdAt?: string
}

interface SortOption {
  key: "createdAt" | "price" | "enrollments"
  order: "asc" | "desc"
}

const TutorCourses: React.FC = () => {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCourses, setTotalCourses] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortOption, setSortOption] = useState<SortOption>({ key: "createdAt", order: "desc" })
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [lessonCounts, setLessonCounts] = useState<Record<string, number>>({})
  const [loadingLessonCounts, setLoadingLessonCounts] = useState(false)
  const coursesPerPage = 6

  const fetchCourses = async () => {
    setLoading(true)
    try {
      const response = await courseService.getSpecificTutorCourse(currentPage, coursesPerPage, searchQuery)
      console.log("fetchCourses Response:---------------------------", response)
      if (response && response.data) {
        setCourses(response.data.courses || [])
        setTotalCourses(response.data.totalCourses || 0)
        setTotalPages(Math.ceil((response.data.totalCourses || 0) / coursesPerPage))
        fetchLessonCounts(response.data.courses)
      } else {
        toast.error("No course data returned")
      }
    } catch (error) {
      console.error("Error fetching courses:", error)
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || "Failed to load courses")
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchLessonCounts = async (courses: Course[]) => {
    if (!courses || courses.length === 0) return

    setLoadingLessonCounts(true)
    const counts: Record<string, number> = {}

    try {
      const countPromises = courses.map(async (course) => {
        try {
          const response = await lessonService.getLessonsByCourse(course._id)
          console.log(`Lesson count response for course ${course._id}:`, Array.isArray(response?.lessons) ? response.lessons.length: 0)
          const lessonCount =  Array.isArray(response?.lessons) ? response.lessons.length: 0
          counts[course._id] = lessonCount
        } catch (error) {
          console.error(`Error fetching lessons for course ${course._id}:`, error)
          counts[course._id] = 0
        }
      })

      await Promise.all(countPromises)
      setLessonCounts(counts)
    } catch (error) {
      console.error("Error fetching lesson counts:", error)
      toast.error("Failed to fetch lesson counts")
    } finally {
      setLoadingLessonCounts(false)
    }
  }

  const debouncedFetchCourses = useCallback(
    debounce(() => {
      setCurrentPage(1)
      fetchCourses()
    }, 300),
    [searchQuery, sortOption],
  )

  useEffect(() => {
    fetchCourses()
  }, [currentPage, sortOption])

  useEffect(() => {
    debouncedFetchCourses()
    return () => debouncedFetchCourses.cancel()
  }, [searchQuery, debouncedFetchCourses])

  const showDeleteModal = (courseId: string) => {
    console.log("Delete button clicked for course:", courseId)
    setCourseToDelete(courseId)
    setIsModalVisible(true)
  }

  const handleDeleteConfirm = async () => {
    if (!courseToDelete) return
    try {
      setDeleting(true)
      await courseService.deleteCourse(courseToDelete)
      toast.success("Course deleted successfully")
      fetchCourses()
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Error deleting course:", error)
        toast.error(error.response?.data?.message || "Failed to delete course")
      }
    } finally {
      setDeleting(false)
      setIsModalVisible(false)
      setCourseToDelete(null)
    }
  }

  const handleDeleteCancel = () => {
    console.log("Deletion cancelled")
    setIsModalVisible(false)
    setCourseToDelete(null)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchCourses()
  }

  const handleSortSelect = ({ key }: { key: string }) => {
    let newSortOption: SortOption
    switch (key) {
      case "newest":
        newSortOption = { key: "createdAt", order: "desc" }
        break
      case "oldest":
        newSortOption = { key: "createdAt", order: "asc" }
        break
      case "price-low":
        newSortOption = { key: "price", order: "asc" }
        break
      case "price-high":
        newSortOption = { key: "price", order: "desc" }
        break
      case "enrollments":
        newSortOption = { key: "enrollments", order: "desc" }
        break
      default:
        newSortOption = { key: "createdAt", order: "desc" }
    }
    setSortOption(newSortOption)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "green"
      case "Intermediate":
        return "blue"
      case "Advanced":
        return "purple"
      default:
        return "default"
    }
  }

  const navigateToLessons = (courseId: string, courseTitle: string) => {
    navigate(`/tutor/courses/${courseId}/lessons?title=${encodeURIComponent(courseTitle)}`)
  }

  const navigateToAddLesson = (courseId: string, courseTitle: string) => {
    navigate(`/tutor/courses/${courseId}/lessons/add?title=${encodeURIComponent(courseTitle)}`)
  }

  const sortMenu = (
    <Menu onClick={handleSortSelect}>
      <Menu.Item
        key="newest"
        className={sortOption.key === "createdAt" && sortOption.order === "desc" ? "ant-menu-item-selected" : ""}
      >
        Newest First
      </Menu.Item>
      <Menu.Item
        key="oldest"
        className={sortOption.key === "createdAt" && sortOption.order === "asc" ? "ant-menu-item-selected" : ""}
      >
        Oldest First
      </Menu.Item>
      <Menu.Item
        key="price-low"
        className={sortOption.key === "price" && sortOption.order === "asc" ? "ant-menu-item-selected" : ""}
      >
        Price: Low to High
      </Menu.Item>
      <Menu.Item
        key="price-high"
        className={sortOption.key === "price" && sortOption.order === "desc" ? "ant-menu-item-selected" : ""}
      >
        Price: High to Low
      </Menu.Item>
      <Menu.Item
        key="enrollments"
        className={sortOption.key === "enrollments" && sortOption.order === "desc" ? "ant-menu-item-selected" : ""}
      >
        Enrollments: High to Low
      </Menu.Item>
    </Menu>
  )

  return (
    <div className="flex min-h-screen bg-white dark:bg-gray-800">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header />

        {/* Main Content Area */}
        <main className={`flex-1 p-8 ${sidebarOpen ? "md:ml-64" : "md:ml-16"} transition-all duration-300`}>
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Courses</h1>
                <p className="text-gray-600 dark:text-gray-300">Manage your course offerings</p>
              </div>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate("/tutor/courses/add")}
                className="bg-blue-600 hover:bg-blue-700 text-white border-none"
              >
                Add New Course
              </Button>
            </div>

            <div className="flex justify-between items-center mb-6">
              <form
                onSubmit={handleSearchSubmit}
                className="flex max-w-md items-center gap-2"
              >
                <Input
                  placeholder="Search by title, tagline, or category..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  prefix={<SearchOutlined className="text-gray-500 dark:text-gray-400" />}
                  allowClear
                  className="border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SearchOutlined />}
                  loading={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white border-none"
                >
                  Search
                </Button>
              </form>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="border-gray-200 dark:border-gray-700 shadow-sm">
                    <Spin indicator={<LoadingOutlined className="text-blue-600 dark:text-blue-400" style={{ fontSize: 24 }} spin />} />
                  </Card>
                ))}
              </div>
            ) : courses.length === 0 ? (
              <Card className="text-center p-8 border-gray-200 dark:border-gray-700 shadow-sm">
                <BookOutlined className="text-blue-600 dark:text-blue-400 text-4xl mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">No courses found</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {searchQuery ? "No courses match your search." : "You haven't created any courses yet."}
                </p>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => navigate("/tutor/courses/add")}
                  className="bg-blue-600 hover:bg-blue-700 text-white border-none"
                >
                  Create Your First Course
                </Button>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((course) => (
                    <Card
                      key={course._id}
                      className="border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow rounded-lg overflow-hidden"
                    >
                      <div className="h-48 overflow-hidden bg-gray-100 dark:bg-gray-700 relative">
                        {course.thumbnail ? (
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-full h-full object-cover"
                            onError={() => console.error("Failed to load thumbnail:", course.thumbnail)}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <BookOutlined className="text-gray-400 dark:text-gray-500 text-4xl" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2 bg-gray-900/70 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                          <VideoCameraOutlined />
                          {loadingLessonCounts ? (
                            <Spin size="small" />
                          ) : (
                            <>
                              {lessonCounts[course._id] || 0} {lessonCounts[course._id] === 1 ? "Lesson" : "Lessons"}
                            </>
                          )}
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 truncate">
                          {course.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                          {course.tagline}
                        </p>
                        <div className="flex justify-between items-center mb-4">
                          <Tag color={getDifficultyColor(course.difficulty)}>{course.difficulty}</Tag>
                          <span className="font-semibold text-blue-600 dark:text-blue-400">
                            ₹{course.price.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-xs">
                          {course.enrollments || 0} {course.enrollments === 1 ? "student" : "students"} enrolled
                        </p>
                      </CardContent>
                      <CardContent className="p-4 border-t border-gray-200 dark:border-gray-700 flex flex-col gap-2">
                        <div className="flex gap-2">
                          <Button
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => showDeleteModal(course._id)}
                            className="flex-1 border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/50"
                          >
                            Delete
                          </Button>
                          <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={() => navigate(`/tutor/courses/edit/${course._id}`)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white border-none"
                          >
                            Edit
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            icon={<PlusOutlined />}
                            onClick={() => navigateToAddLesson(course._id, course.title)}
                            className="flex-1 border-green-500 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/50"
                          >
                            Add Lesson
                          </Button>
                          <Button
                            icon={<PlayCircleOutlined />}
                            onClick={() => navigateToLessons(course._id, course.title)}
                            className="flex-1 border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/50"
                            disabled={!lessonCounts[course._id]}
                          >
                            View Lessons
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-8 text-center">
                    <Pagination
                      current={currentPage}
                      total={totalCourses}
                      pageSize={coursesPerPage}
                      onChange={handlePageChange}
                      showSizeChanger={false}
                      className="ant-pagination-item-active:bg-blue-600 ant-pagination-item-active:border-blue-600"
                    />
                  </div>
                )}
              </>
            )}

            <Modal
              title="Confirm Delete"
              open={isModalVisible}
              onOk={handleDeleteConfirm}
              onCancel={handleDeleteCancel}
              confirmLoading={deleting}
              okText="Delete"
              okButtonProps={{ danger: true }}
              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <p className="text-gray-600 dark:text-gray-300">Are you sure you want to delete this course?</p>
            </Modal>
          </div>
        </main>
      </div>
    </div>
  )
}

class TutorCoursesErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center p-8 bg-white dark:bg-gray-800">
          <h1 className="text-2xl font-semibold text-red-500">Something went wrong</h1>
          <p className="text-gray-600 dark:text-gray-300">Please try refreshing the page or contact support.</p>
        </div>
      )
    }
    return this.props.children
  }
}

export default function TutorCoursesPage() {
  return (
    <TutorCoursesErrorBoundary>
      <TutorCourses />
    </TutorCoursesErrorBoundary>
  )
}