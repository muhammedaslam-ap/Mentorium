"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { BookOpen, Heart, Loader, Search, X, User, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { wishlistService } from "@/services/wishlistServices/wishlistService"
import { enrollmentService } from "@/services/purchaseServices/enrollmentService"
import type { Course } from "@/services/courseServices/courseService"
import Header from "../components/header"
import Sidebar from "../components/sidebar"

const WishlistPage = () => {
  const navigate = useNavigate()
  const [sidebarOpen] = useState(true)
  const [wishlist, setWishlist] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [removingCourseId, setRemovingCourseId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [itemsPerPage] = useState(9)

  useEffect(() => {
    fetchWishlist()
  }, [currentPage])

  const fetchWishlist = async (page: number = currentPage) => {
    setLoading(true)
    try {
      const data = await wishlistService.getWishlist(page, itemsPerPage)
      // Filter out enrolled courses
      const filteredWishlist = await Promise.all(
        data.map(async (course) => {
          try {
            const response = await enrollmentService.checkEnrollmentStatus(course._id)
            return response.isEnrolled ? null : course
          } catch (error) {
            console.error(`Error checking enrollment for course ${course._id}:`, error)
            return course // Keep course if enrollment check fails to avoid data loss
          }
        })
      )
      const validWishlist = filteredWishlist.filter((course): course is Course => course !== null)
      setWishlist(validWishlist)
      setTotalPages(Math.max(1, Math.ceil(validWishlist.length / itemsPerPage)))
    } catch (error) {
      console.error("Error fetching wishlist:", error)
      toast.error("Failed to load wishlist. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleAddToWishlist = async (courseId: string) => {
    try {
      const response = await enrollmentService.checkEnrollmentStatus(courseId)
      if (response.isEnrolled) {
        toast.error("You are already enrolled in this course and cannot add it to your wishlist.")
        return false
      }
      await wishlistService.addToWishlist(courseId)
      toast.success("Course added to wishlist!")
      await fetchWishlist() // Refresh wishlist to ensure consistency
      return true
    } catch (error) {
      console.error("Error adding to wishlist:", error)
      toast.error("Failed to add course to wishlist. Please try again.")
      return false
    }
  }

  const handleRemoveFromWishlist = async (courseId: string) => {
    setRemovingCourseId(courseId)
    try {
      await wishlistService.removeFromWishlist(courseId)
      setWishlist(wishlist.filter((course) => course._id !== courseId))
      toast.success("Course removed from wishlist.")
    } catch (error) {
      console.error("Error removing from wishlist:", error)
      toast.error("Failed to remove course from wishlist. Please try again.")
    } finally {
      setRemovingCourseId(null)
    }
  }

  const handleViewCourse = (courseId: string) => {
    navigate(`/student/courses/${courseId}`)
  }

  const filteredWishlist = wishlist.filter(
    (course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.category && course.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (course.tutorName && course.tutorName.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-800 border-green-200"
      case "Intermediate":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Advanced":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-800">
      <Header />
      <div className="flex">
        <Sidebar sidebarOpen={sidebarOpen} />
        <div className={`flex-1 ${sidebarOpen ? "md:ml-64" : ""}`}>
          <div className="container mx-auto max-w-6xl p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-600 dark:text-gray-300">My Wishlist</h1>
                <p className="text-gray-600 dark:text-gray-300">Courses you've saved for later</p>
              </div>
              <div className="w-full md:w-auto flex gap-2">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600 dark:text-blue-400 h-4 w-4" />
                  <Input
                    placeholder="Search wishlist..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-blue-500"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <Card key={index} className="border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                    <Skeleton className="h-40 w-full" />
                    <CardContent className="p-4">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2 mb-4" />
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-9 w-24" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : wishlist.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Heart className="h-16 w-16 text-gray-300 dark:text-gray-500 mb-4" />
                <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">Your wishlist is empty</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6 text-center max-w-md">
                  Explore our courses and add your favorites to your wishlist for easy access later.
                </p>
                <Button
                  onClick={() => navigate("/student/courses")}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Browse Courses
                </Button>
              </div>
            ) : filteredWishlist.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Search className="h-16 w-16 text-gray-300 dark:text-gray-500 mb-4" />
                <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
                  No matching courses found
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6 text-center max-w-md">
                  We couldn't find any courses matching your search. Try different keywords or clear your search.
                </p>
                <Button
                  onClick={() => setSearchTerm("")}
                  variant="outline"
                  className="border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Clear Search
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                  {filteredWishlist.length} {filteredWishlist.length === 1 ? "course" : "courses"} in your wishlist
                  {searchTerm && ` matching "${searchTerm}"`}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredWishlist.map((course) => (
                    <Card
                      key={course._id}
                      className="border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                    >
                      <div className="relative h-40 bg-gray-100 dark:bg-gray-700">
                        {course.thumbnail ? (
                          <img
                            src={course.thumbnail || "/placeholder.svg"}
                            alt={course.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=160&width=320&text=Course"
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                          </div>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 text-rose-500 hover:text-rose-600"
                          onClick={() => handleRemoveFromWishlist(course._id)}
                          disabled={removingCourseId === course._id}
                        >
                          {removingCourseId === course._id ? (
                            <Loader className="h-5 w-5 animate-spin" />
                          ) : (
                            <Heart className="h-5 w-5 fill-current" />
                          )}
                        </Button>
                      </div>
                      <CardContent className="p-4">
                        <div className="mb-2 flex gap-2">
                          {course.difficulty && (
                            <Badge className={`${getDifficultyColor(course.difficulty)}`}>{course.difficulty}</Badge>
                          )}
                          {course.category && (
                            <Badge
                              variant="outline"
                              className="border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300"
                            >
                              {course.category}
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-gray-600 dark:text-gray-300 mb-1 line-clamp-2">
                          {course.title}
                        </h3>
                        <div className="flex items-center text-xs text-gray-600 dark:text-gray-300 mb-3">
                          <User className="h-3 w-3 mr-1 text-blue-600 dark:text-blue-400" />
                          <span>{course.tutorName || "Instructor"}</span>
                          <span className="mx-2">•</span>
                          <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                          <span>4.8</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="text-lg font-bold text-gray-600 dark:text-gray-300">
                            ₹{course.price.toFixed(2)}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => handleViewCourse(course._id)}
                          >
                            View
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {filteredWishlist.length > 0 && (
                  <div className="flex justify-center mt-8">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (currentPage > 1) {
                            setCurrentPage(currentPage - 1)
                          }
                        }}
                        disabled={currentPage === 1 || loading}
                        className="border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Previous
                      </Button>
                      <div className="flex items-center px-4 text-sm text-gray-600 dark:text-gray-300">
                        Page {currentPage} of {totalPages}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (currentPage < totalPages) {
                            setCurrentPage(currentPage + 1)
                          }
                        }}
                        disabled={currentPage >= totalPages || loading}
                        className="border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default WishlistPage