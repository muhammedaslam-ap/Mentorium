"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import {
  BookOpen,
  Star,
  Users,
  Clock,
  MapPin,
  Mail,
  Phone,
  Calendar,
  ChevronRight,
  Share2,
  MessageSquare,
  ArrowLeft,
  GraduationCap,
  Languages,
  Globe,
  Briefcase,
  Award,
  Heart,
  CheckCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { authAxiosInstance } from "@/api/authAxiosInstance"

interface TutorProfile {
  _id: string
  tutorId: string
  name: string
  email: string
  phone?: string
  bio?: string
  specialization?: string
  experience?: number
  education?: string
  location?: string
  profilePicture?: string
  rating?: number
  totalStudents?: number
  totalCourses?: number
  joinedDate?: string
  languages?: string[]
  socialLinks?: {
    linkedin?: string
    website?: string
  }
}

interface Course {
  _id: string
  title: string
  description?: string
  price: number
  thumbnail?: string
  difficulty: string
  category: string
  duration?: number
  studentsEnrolled?: number
  rating?: number
  reviewCount?: number
  createdAt: string
  isPublished?: boolean
}

interface ApiResponse {
  success: boolean
  message?: string
  courses: Course[]
  tutorProfile: TutorProfile
}

const TutorProfileSkeleton = () => (
  <div className="animate-pulse space-y-8">
    <div className="h-48 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 rounded-2xl"></div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
          ))}
        </div>
      </div>
      <div className="space-y-6">
        <div className="h-80 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
        <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
      </div>
    </div>
  </div>
)

const CourseCard = ({ course, onViewCourse }: { course: Course; onViewCourse: (courseId: string) => void }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case "beginner":
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
      case "intermediate":
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
      case "advanced":
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
    }
  }

  return (
    <Card
      className={`group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-white dark:bg-gray-900 ${
        isHovered ? "ring-2 ring-black/10 dark:ring-white/10" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        {course.thumbnail ? (
          <img
            src={course.thumbnail || "/placeholder.svg"}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=180&width=320&text=Course"
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
            <BookOpen className="h-12 w-12 text-gray-500 dark:text-gray-400" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <Button
          variant="ghost"
          size="icon"
          className={`absolute top-3 right-3 bg-white/90 hover:bg-white text-gray-600 hover:text-red-500 transition-all duration-300 ${
            isFavorited ? "text-red-500" : ""
          }`}
          onClick={(e) => {
            e.stopPropagation()
            setIsFavorited(!isFavorited)
          }}
        >
          <Heart className={`h-4 w-4 ${isFavorited ? "fill-current" : ""}`} />
        </Button>
        <Badge className={`absolute top-3 left-3 ${getDifficultyColor(course.difficulty)} font-medium`}>
          {course.difficulty}
        </Badge>
      </div>

      <CardContent className="p-6 space-y-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-2 group-hover:text-black dark:group-hover:text-gray-200 transition-colors">
              {course.title}
            </h3>
            <Badge
              variant="outline"
              className="text-xs shrink-0 border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
            >
              {course.category}
            </Badge>
          </div>

          {course.description && (
            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 leading-relaxed">
              {course.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            {course.rating && (
              <div className="flex items-center gap-1.5">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < Math.floor(course.rating!)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300 dark:text-gray-600"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-medium text-gray-900 dark:text-white">{course.rating.toFixed(1)}</span>
                {course.reviewCount && <span className="text-gray-500 dark:text-gray-400">({course.reviewCount})</span>}
              </div>
            )}
          </div>

          {course.studentsEnrolled && (
            <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
              <Users className="h-4 w-4" />
              <span className="font-medium">{course.studentsEnrolled.toLocaleString()}</span>
            </div>
          )}
        </div>

        <Separator className="my-4" />

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">₹{course.price.toLocaleString()}</span>
            {course.price > 1000 && (
              <div className="text-xs text-gray-500 dark:text-gray-400">or ₹{Math.round(course.price / 12)}/month</div>
            )}
          </div>

          <Button
            onClick={() => onViewCourse(course._id)}
            className="bg-black hover:bg-gray-800 text-white dark:bg-white dark:hover:bg-gray-200 dark:text-black shadow-lg hover:shadow-xl transition-all duration-300 group/btn"
            size="sm"
          >
            View Course
            <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover/btn:translate-x-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

const StatCard = ({
  icon: Icon,
  value,
  label,
}: {
  icon: any
  value: string | number
  label: string
}) => {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white dark:bg-gray-900">
      <CardContent className="p-6 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
          <Icon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
        </div>
        <div className="space-y-1">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {typeof value === "number" ? value.toLocaleString() : value}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">{label}</div>
        </div>
      </CardContent>
    </Card>
  )
}

const TutorProfile = () => {
  const { tutorId } = useParams<{ tutorId: string }>()
  const navigate = useNavigate()
  const [tutorData, setTutorData] = useState<{ tutorProfile: TutorProfile; courses: Course[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    const fetchTutorProfile = async () => {
      if (!tutorId) {
        toast.error("Invalid tutor ID")
        navigate("/student/courses")
        return
      }

      try {
        setLoading(true)
        const response = await authAxiosInstance.get<ApiResponse>(`/tutor/tutor/${tutorId}`)
        console.log("Tutor profile response:", response.data)

        if (response.data.success) {
          setTutorData({
            tutorProfile: response.data.tutorProfile,
            courses: response.data.courses,
          })
        } else {
          throw new Error(response.data.message || "Failed to load tutor profile")
        }
      } catch (error: any) {
        console.error("Error fetching tutor profile:", error.response?.data || error.message)
        toast.error(error.response?.data?.message || error.message || "Failed to load tutor profile")
        navigate("/student/courses")
      } finally {
        setLoading(false)
      }
    }

    fetchTutorProfile()
  }, [tutorId, navigate])

  const handleViewCourse = (courseId: string) => {
    navigate(`/student/courses/${courseId}`)
  }

  const handleContactTutor = () => {
    if (tutorData?.tutorProfile) {
      navigate(`/student/chat/${tutorId}`, {
        state: {
          tutorName: tutorData.tutorProfile.name,
          tutorId: tutorId,
        },
      })
    }
  }

  const handleShareProfile = () => {
    if (navigator.share) {
      navigator.share({
        title: `${tutorData?.tutorProfile.name} - Tutor Profile`,
        text: `Check out the courses by ${tutorData?.tutorProfile.name}`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success("Profile link copied to clipboard!")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-950 dark:to-black">
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <TutorProfileSkeleton />
        </div>
      </div>
    )
  }

  if (!tutorData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-950 dark:to-black">
        <div className="container mx-auto max-w-7xl px-4 py-12">
          <div className="text-center space-y-8 max-w-md mx-auto">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto">
              <Users className="h-12 w-12 text-gray-400 dark:text-gray-500" />
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Tutor Not Found</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                The tutor profile you're looking for doesn't exist or has been removed.
              </p>
            </div>
            <Button
              onClick={() => navigate("/student/courses")}
              className="bg-black hover:bg-gray-800 text-white dark:bg-white dark:hover:bg-gray-200 dark:text-black shadow-lg hover:shadow-xl transition-all duration-300"
              size="lg"
            >
              Browse Courses
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const { tutorProfile, courses } = tutorData
  const publishedCourses = courses.filter((course) => course.isPublished !== false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-950 dark:to-black">
      {/* Enhanced Navigation Header */}
      <div className="bg-white/80 dark:bg-black/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-800/50 sticky top-0 z-50">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="flex items-center justify-between h-16">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="font-medium">Back</span>
            </Button>
            {/* <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleShareProfile}
                size="sm"
                className="border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button
                onClick={handleContactTutor}
                size="sm"
                className="bg-black hover:bg-gray-800 text-white dark:bg-white dark:hover:bg-gray-200 dark:text-black shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact
              </Button>
            </div> */}
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Enhanced Hero Section */}
        <Card className="border-0 shadow-2xl mb-8 overflow-hidden bg-white dark:bg-gray-900">
          <div className="bg-gradient-to-r from-gay-900 via-white to-white-800 white:from-white light:via-white-300 light:to-white h-24"></div>
          <CardContent className="p-8 -mt-16 relative">
            <div className="flex flex-col md:flex-row items-start gap-8">
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-white dark:border-gray-900 shadow-xl">
                  <AvatarImage src={tutorProfile.profilePicture || "/placeholder.svg"} alt={tutorProfile.name} />
                  <AvatarFallback className="text-3xl bg-gradient-to-br from-gray-800 to-black dark:from-gray-700 dark:to-gray-900 text-white font-bold">
                    {tutorProfile.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {tutorProfile.rating && tutorProfile.rating >= 4.5 && (
                  <div className="absolute -bottom-2 -right-2 bg-black text-white dark:bg-white dark:text-black rounded-full p-2 shadow-lg">
                    <Award className="h-4 w-4" />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                      {tutorProfile.name}
                    </h1>
                    {tutorProfile.rating && tutorProfile.rating >= 4.8 && (
                      <Badge className="bg-black text-white dark:bg-white dark:text-black border-0">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        Top Rated
                      </Badge>
                    )}
                  </div>

                  {tutorProfile.specialization && (
                    <p className="text-xl text-gray-700 dark:text-gray-300 font-semibold">
                      {tutorProfile.specialization}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-6 text-gray-600 dark:text-gray-400">
                  {tutorProfile.rating && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(tutorProfile.rating!)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300 dark:text-gray-600"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-bold text-gray-900 dark:text-white">{tutorProfile.rating.toFixed(1)}</span>
                    </div>
                  )}

                  {tutorProfile.totalStudents && (
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                      <span className="font-semibold">{tutorProfile.totalStudents.toLocaleString()} Students</span>
                    </div>
                  )}

                  {publishedCourses.length > 0 && (
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                      <span className="font-semibold">{publishedCourses.length} Courses</span>
                    </div>
                  )}

                  {tutorProfile.experience && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                      <span className="font-semibold">{tutorProfile.experience} Years Experience</span>
                    </div>
                  )}
                </div>

                {tutorProfile.bio && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">{tutorProfile.bio}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-md grid-cols-3 bg-white dark:bg-gray-900 rounded-xl p-1 shadow-lg border border-gray-200 dark:border-gray-800">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black rounded-lg font-medium transition-all duration-300"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="courses"
                className="data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black rounded-lg font-medium transition-all duration-300"
              >
                Courses ({publishedCourses.length})
              </TabsTrigger>
              <TabsTrigger
                value="about"
                className="data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black rounded-lg font-medium transition-all duration-300"
              >
                About
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {tutorProfile.rating && (
                <StatCard icon={Star} value={tutorProfile.rating.toFixed(1)} label="Average Rating" />
              )}
              {tutorProfile.experience && (
                <StatCard icon={Clock} value={tutorProfile.experience} label="Years Experience" />
              )}
              {tutorProfile.languages?.length && (
                <StatCard icon={Languages} value={tutorProfile.languages.length} label="Languages" />
              )}
              {publishedCourses.length > 0 && (
                <StatCard icon={BookOpen} value={publishedCourses.length} label="Courses" />
              )}
            </div>

            {/* Featured Courses */}
            {publishedCourses.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Featured Courses</h2>
                    <p className="text-gray-600 dark:text-gray-400">Discover the most popular courses by this tutor</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("courses")}
                    className="border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-600 transition-all duration-300"
                  >
                    View All Courses
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {publishedCourses.slice(0, 3).map((course) => (
                    <CourseCard key={course._id} course={course} onViewCourse={handleViewCourse} />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="courses" className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                All Courses ({publishedCourses.length})
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Explore all the courses offered by {tutorProfile.name}. Each course is designed to help you master new
                skills.
              </p>
            </div>

            {publishedCourses.length === 0 ? (
              <Card className="border-0 shadow-lg bg-white dark:bg-gray-900">
                <CardContent className="p-12 text-center space-y-6">
                  <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto">
                    <BookOpen className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">No Courses Available</h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                      This tutor has not published any courses yet. Check back later for new content!
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {publishedCourses.map((course) => (
                  <CourseCard key={course._id} course={course} onViewCourse={handleViewCourse} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="about" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <Card className="border-0 shadow-lg bg-white dark:bg-gray-900">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                        <GraduationCap className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                      </div>
                      About {tutorProfile.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {tutorProfile.bio && (
                      <div className="prose prose-gray dark:prose-invert max-w-none">
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">{tutorProfile.bio}</p>
                      </div>
                    )}

                    {tutorProfile.education && (
                      <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                        <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                          <GraduationCap className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                          Education Background
                        </h4>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{tutorProfile.education}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                {/* Contact Information */}
                <Card className="border-0 shadow-lg bg-white dark:bg-gray-900">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Mail className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                        <Mail className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Email</div>
                        <div className="font-medium text-gray-900 dark:text-white">{tutorProfile.email}</div>
                      </div>
                    </div>

                    {tutorProfile.phone && (
                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                          <Phone className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Phone</div>
                          <div className="font-medium text-gray-900 dark:text-white">{tutorProfile.phone}</div>
                        </div>
                      </div>
                    )}

                    {tutorProfile.location && (
                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                          <MapPin className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Location</div>
                          <div className="font-medium text-gray-900 dark:text-white">{tutorProfile.location}</div>
                        </div>
                      </div>
                    )}

                    {tutorProfile.joinedDate && (
                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Member Since</div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {new Date(tutorProfile.joinedDate).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Languages */}
                {tutorProfile.languages?.length && (
                  <Card className="border-0 shadow-lg bg-white dark:bg-gray-900">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Languages className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                        Languages
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-3">
                        {tutorProfile.languages.map((language, index) => (
                          <Badge
                            key={index}
                            className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 border-0 px-3 py-1.5 font-medium"
                          >
                            <CheckCircle className="h-3 w-3 mr-1.5" />
                            {language}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Social Links */}
                {tutorProfile.socialLinks && (
                  <Card className="border-0 shadow-lg bg-white dark:bg-gray-900">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Globe className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                        Connect
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {tutorProfile.socialLinks.website && (
                        <a
                          href={tutorProfile.socialLinks.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 group"
                        >
                          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Globe className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">Website</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Visit my website</div>
                          </div>
                        </a>
                      )}

                      {tutorProfile.socialLinks.linkedin && (
                        <a
                          href={tutorProfile.socialLinks.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 group"
                        >
                          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Briefcase className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">LinkedIn</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Professional profile</div>
                          </div>
                        </a>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default TutorProfile
