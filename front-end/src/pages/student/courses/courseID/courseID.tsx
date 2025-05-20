import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  BookOpen,
  User,
  Clock,
  Star,
  Calendar,
  Award,
  FileText,
  Download,
  ArrowLeft,
  Loader,
  PlayCircle,
  Share2,
  HelpCircle,
  CheckSquare,
  MessageSquare,
  Heart,
  Lock,
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { courseService } from "@/services/courseServices/courseService";
import { lessonService } from "@/services/lessonServices/lessonServices";
import { wishlistService } from "@/services/wishlistServices/wishlistService";
import { enrollmentService } from "@/services/purchaseServices/enrollmentService";
import Header from "../../components/header";
import { authAxiosInstance } from "@/api/authAxiosInstance";

interface Tutor {
  _id?: string;
  name: string;
  phone?: string;
  specialization?: string;
  bio?: string;
}

interface Course {
  _id: string;
  title: string;
  tagline?: string;
  price: number;
  thumbnail?: string;
  about: string;
  difficulty: string;
  category: string;
  tutorName?: string;
  tutor?: Tutor;
  tutorId?: string;
  createdAt?: string;
  ratings?: number;
  reviewCount?: number;
}

interface Lesson {
  _id: string;
  title: string;
  description?: string;
  courseId: string;
  order: number;
  duration: number;
  file?: string;
}

const CourseDetails = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [isVideoModalVisible, setIsVideoModalVisible] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [inWishlist, setInWishlist] = useState(false);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loadingEnrollment, setLoadingEnrollment] = useState(false);

  useEffect(() => {
    if (!courseId) {
      toast.error("Invalid course ID");
      navigate("/student/courses");
      return;
    }
    
    fetchCourseDetails();
    fetchLessons();
    checkWishlistStatus();
    checkEnrollmentStatus();
  }, [courseId, navigate]);

  const fetchCourseDetails = async () => {
    setLoading(true);
    try {
      const response = await courseService.getCourseDetailsInStudentSide(courseId!);
      const courseData = response.course || response;
      if (courseData && courseData._id) {
        setCourse({
          ...courseData,
          tutorName: courseData.tutor?.name || courseData.tutorName || "Instructor",
          ratings: courseData.ratings || 4.8,
          reviewCount: courseData.reviewCount || 42,
        });
      } else {
        toast.error("Course not found");
        navigate("/student/courses");
      }
    } catch (error: any) {
      console.error("Error fetching course details:", error);
      toast.error(error.message || "Failed to load course details");
      navigate("/student/courses");
    } finally {
      setLoading(false);
    }
  };

  const fetchLessons = async () => {
    setLoadingLessons(true);
    try {
      const response = await lessonService.getLessonsByCourse(courseId!);
      if (response.lessons) {
        setLessons(response.lessons);
      }
    } catch (error: any) {
      console.error("Error fetching lessons:", error);
      toast.error(error.message || "Failed to load lesson details");
    } finally {
      setLoadingLessons(false);
    }
  };

  const checkWishlistStatus = async () => {
    setLoadingWishlist(true);
    try {
      const isInWishlist = await wishlistService.isInWishlist(courseId!);
      setInWishlist(isInWishlist);
    } catch (error: any) {
      console.error("Error checking wishlist status:", error);
    } finally {
      setLoadingWishlist(false);
    }
  };

  const checkEnrollmentStatus = async () => {
    setLoadingEnrollment(true);
    try {
      const enrolled = await authAxiosInstance.get(`/purchase/enrollments/${courseId}`);
      console.log("hhhhhhhhyhhhhhh------------------------>",enrolled.data.data.isEnrolled)
      setIsEnrolled(enrolled.data.data.isEnrolled);
    } catch (error: any) {
      console.error("Failed to check enrollment status:", error);
    } finally {
      setLoadingEnrollment(false);
    }
  };

  const handleToggleWishlist = async () => {
    setLoadingWishlist(true);
    try {
      if (inWishlist) {
        await wishlistService.removeFromWishlist(courseId!);
        setInWishlist(false);
        toast.success("Removed from wishlist");
      } else {
        await wishlistService.addToWishlist(courseId!);
        setInWishlist(true);
        toast.success("Added to wishlist");
      }
    } catch (error: any) {
      console.error("Error toggling wishlist:", error);
      toast.error("Failed to update wishlist");
    } finally {
      setLoadingWishlist(false);
    }
  };

  const showVideoModal = (url: string) => {
    setVideoUrl(url);
    setIsVideoModalVisible(true);
  };

  const handleEnrollNow = () => {
    navigate(`/student/checkout/${courseId}`);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  const getTotalDuration = () => {
    if (!lessons.length) return "0m";
    const totalSeconds = lessons.reduce((total, lesson) => {
      return total + (lesson.duration || 0);
    }, 0);
    return formatDuration(totalSeconds);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      case "intermediate":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
      case "advanced":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="container mx-auto max-w-6xl px-4 py-8">
          <div className="flex items-center justify-center h-[60vh]">
            <Loader className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="container mx-auto max-w-6xl px-4 py-12">
          <div className="flex flex-col items-center justify-center text-center">
            <BookOpen className="mb-4 h-20 w-20 text-gray-300 dark:text-gray-600" />
            <h2 className="mb-2 text-2xl font-bold text-gray-800 dark:text-gray-100">Course Not Found</h2>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              The course you're looking for doesn't exist or has been removed.
            </p>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => navigate("/student/courses")}
            >
              Browse Courses
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6 flex items-center text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
          onClick={() => navigate("/student/courses")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Courses
        </Button>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <div className="flex flex-wrap gap-2 mb-3">
                {course.difficulty && (
                  <Badge className={`${getDifficultyColor(course.difficulty)}`}>
                    {course.difficulty}
                  </Badge>
                )}
                {course.category && (
                  <Badge variant="outline" className="border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-300">
                    {course.category}
                  </Badge>
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{course.title}</h1>
              {course.tagline && (
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">{course.tagline}</p>
              )}
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center">
                  <User className="mr-1.5 h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>{course.tutor?.name || course.tutorName}</span>
                </div>
                <div className="flex items-center">
                  <Star className="mr-1.5 h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{course.ratings} ({course.reviewCount} reviews)</span>
                </div>
                <div className="flex items-center">
                  <Clock className="mr-1.5 h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>{getTotalDuration()} total length</span>
                </div>
                {course.createdAt && (
                  <div className="flex items-center">
                    <Calendar className="mr-1.5 h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>Last updated: {new Date(course.createdAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {/* Enrollment Status Indicator */}
              <div className="mt-4 rounded-md border p-3 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                {loadingEnrollment ? (
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    <span>Checking enrollment status...</span>
                  </div>
                ) : isEnrolled ? (
                  <div className="flex items-center text-green-600 dark:text-green-400">
                    <CheckCircle className="mr-2 h-5 w-5" />
                    <span className="font-medium">You are enrolled in this course! Access all lessons below.</span>
                  </div>
                ) : (
                  <div className="flex items-center text-amber-600 dark:text-amber-400">
                    <Lock className="mr-2 h-5 w-5" />
                    <span className="font-medium">Enroll now to access all lessons and course materials.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Course thumbnail for mobile */}
            <div className="mb-8 lg:hidden">
              <Card className="overflow-hidden">
                <div className="aspect-video bg-gray-100 dark:bg-gray-700">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail || "/placeholder.svg"}
                      alt={course.title}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.svg?height=192&width=384&text=Course";
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <BookOpen className="h-16 w-16 text-blue-600 dark:text-blue-400" />
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-2xl font-bold text-gray-800 dark:text-white">₹{course.price.toFixed(2)}</div>
                    <Button
                      variant="outline"
                      className={`${
                        inWishlist
                          ? "text-rose-600 hover:text-rose-700"
                          : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                      }`}
                      onClick={handleToggleWishlist}
                      disabled={loadingWishlist}
                    >
                      {loadingWishlist ? (
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Heart className={`mr-2 h-4 w-4 ${inWishlist ? "fill-current" : ""}`} />
                      )}
                      {inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                    </Button>
                  </div>
                  
                  {!isEnrolled && (
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={handleEnrollNow}
                    >
                      Enroll Now
                    </Button>
                  )}
                  
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <Award className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span>Full lifetime access</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <Clock className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span>{getTotalDuration()} of content</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <FileText className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span>{lessons.length} lessons</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <Download className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span>Downloadable resources</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs for course content */}
            <Tabs defaultValue="about" className="mb-8">
              <TabsList className="bg-gray-100 dark:bg-gray-800 w-full h-auto flex flex-wrap">
                <TabsTrigger 
                  value="about" 
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  About
                </TabsTrigger>
                <TabsTrigger
                  value="curriculum"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  Curriculum
                </TabsTrigger>
                <TabsTrigger
                  value="instructor"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  Instructor
                </TabsTrigger>
                <TabsTrigger
                  value="reviews"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  Reviews
                </TabsTrigger>
              </TabsList>
              
              {/* About Tab */}
              <TabsContent value="about" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">About This Course</h3>
                    <div className="prose max-w-none">
                      <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">{course.about}</p>
                    </div>
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h4 className="font-medium text-gray-800 dark:text-white mb-4">What you'll learn</h4>
                        <ul className="space-y-3">
                          <li className="flex items-start">
                            <CheckSquare className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-600 dark:text-gray-300">Master the fundamentals and advanced concepts</span>
                          </li>
                          <li className="flex items-start">
                            <CheckSquare className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-600 dark:text-gray-300">Build real-world projects for your portfolio</span>
                          </li>
                          <li className="flex items-start">
                            <CheckSquare className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-600 dark:text-gray-300">Gain practical skills that employers value</span>
                          </li>
                          <li className="flex items-start">
                            <CheckSquare className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-600 dark:text-gray-300">Learn industry best practices and standards</span>
                          </li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <h4 className="font-medium text-gray-800 dark:text-white mb-4">Requirements</h4>
                        <ul className="space-y-3">
                          <li className="flex items-start">
                            <CheckSquare className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-600 dark:text-gray-300">Basic understanding of the subject</span>
                          </li>
                          <li className="flex items-start">
                            <CheckSquare className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-600 dark:text-gray-300">Computer with internet connection</span>
                          </li>
                          <li className="flex items-start">
                            <CheckSquare className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-600 dark:text-gray-300">Dedication and willingness to learn</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Curriculum Tab */}
              <TabsContent value="curriculum" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Course Curriculum</h3>
                    <div className="flex items-center justify-between mb-6">
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-medium">{lessons.length} lessons</span>
                        <span className="mx-2">•</span>
                        <span>{getTotalDuration()} total length</span>
                      </div>
                    </div>
                    {loadingLessons ? (
                      <div className="flex justify-center py-8">
                        <Loader className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-spin" />
                      </div>
                    ) : lessons.length === 0 ? (
                      <div className="text-center py-8">
                        <BookOpen className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
                        <p className="text-gray-600 dark:text-gray-300">No lessons available for this course yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {lessons.map((lesson, index) => (
                          <div
                            key={lesson._id}
                            className="flex items-center p-4 border rounded-lg transition-colors border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 mr-4">
                              <span className="font-medium">{lesson.order || index + 1}</span>
                            </div>
                            <div className="flex-grow">
                              <h4 className="font-medium text-gray-800 dark:text-white">{lesson.title}</h4>
                              {lesson.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                  {lesson.description.length > 100 
                                    ? `${lesson.description.substring(0, 100)}...` 
                                    : lesson.description}
                                </p>
                              )}
                              {lesson.duration > 0 && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  <Clock className="inline h-3 w-3 mr-1" />
                                  {formatDuration(lesson.duration)}
                                </div>
                              )}
                            </div>
                            <div className="flex-shrink-0 ml-4">
                              {lesson.file ? (
                                // Allow access to first video if not enrolled, otherwise check enrollment
                                (isEnrolled || index === 0) ? (
                                  <Button
                                    size="sm"
                                    className="bg-blue-600 text-white hover:bg-blue-700"
                                    onClick={() => showVideoModal(lesson.file!)}
                                  >
                                    <PlayCircle className="h-4 w-4 mr-2" />
                                    Watch
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-amber-200 text-amber-600 dark:border-amber-800 dark:text-amber-400"
                                    onClick={handleEnrollNow}
                                  >
                                    <Lock className="h-4 w-4 mr-2" />
                                    Premium
                                  </Button>
                                )
                              ) : (
                                <span className="text-gray-500 dark:text-gray-400 text-sm">No video</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Instructor Tab */}
              <TabsContent value="instructor" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">About the Instructor</h3>
                    {course?.tutor ? (
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-shrink-0 text-center md:text-left">
                          <Avatar className="h-24 w-24 mx-auto md:mx-0">
                            <AvatarImage src="/placeholder.svg?height=96&width=96" alt={course.tutor.name} />
                            <AvatarFallback className="text-2xl bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
                              {course.tutor.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <h4 className="font-semibold text-gray-800 dark:text-white mt-3">{course.tutor.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {course.tutor.specialization || "Expert Educator"}
                          </p>
                        </div>
                        
                        <div className="flex-grow space-y-4">
                          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                            <h5 className="font-medium text-gray-800 dark:text-white mb-2">Biography</h5>
                            <p className="text-gray-600 dark:text-gray-300">
                              {course.tutor.bio || "No biography available for this instructor."}
                            </p>
                          </div>
                          
                          {course.tutor.phone && (
                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                              <h5 className="font-medium text-gray-800 dark:text-white mb-2">Contact Information</h5>
                              <p className="text-gray-600 dark:text-gray-300">
                                <span className="font-medium">Phone:</span> {course.tutor.phone}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 dark:text-gray-300">Instructor information not available.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Reviews Tab */}
              <TabsContent value="reviews" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Student Reviews</h3>
                    <div className="flex flex-col md:flex-row gap-8 mb-8">
                      <div className="md:w-1/3 bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                        <div className="text-5xl font-bold text-gray-800 dark:text-white mb-3">{course.ratings || 4.8}</div>
                        <div className="flex justify-center mb-3">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star} 
                              className="h-6 w-6 text-yellow-400 fill-yellow-400" 
                            />
                          ))}
                        </div>
                        <div className="text-gray-600 dark:text-gray-300">{course.reviewCount || 42} Reviews</div>
                      </div>
                      
                      <div className="md:w-2/3">
                        <div className="space-y-3">
                          <div className="flex items-center">
                            <div className="w-16 text-sm text-gray-600 dark:text-gray-300">5 stars</div>
                            <div className="flex-1 mx-2">
                              <Progress value={85} className="h-2 bg-gray-200 dark:bg-gray-700" />
                            </div>
                            <div className="w-10 text-sm text-gray-600 dark:text-gray-300 text-right">85%</div>
                          </div>
                          <div className="flex items-center">
                            <div className="w-16 text-sm text-gray-600 dark:text-gray-300">4 stars</div>
                            <div className="flex-1 mx-2">
                              <Progress value={10} className="h-2 bg-gray-200 dark:bg-gray-700" />
                            </div>
                            <div className="w-10 text-sm text-gray-600 dark:text-gray-300 text-right">10%</div>
                          </div>
                          <div className="flex items-center">
                            <div className="w-16 text-sm text-gray-600 dark:text-gray-300">3 stars</div>
                            <div className="flex-1 mx-2">
                              <Progress value={3} className="h-2 bg-gray-200 dark:bg-gray-700" />
                            </div>
                            <div className="w-10 text-sm text-gray-600 dark:text-gray-300 text-right">3%</div>
                          </div>
                          <div className="flex items-center">
                            <div className="w-16 text-sm text-gray-600 dark:text-gray-300">2 stars</div>
                            <div className="flex-1 mx-2">
                              <Progress value={1} className="h-2 bg-gray-200 dark:bg-gray-700" />
                            </div>
                            <div className="w-10 text-sm text-gray-600 dark:text-gray-300 text-right">1%</div>
                          </div>
                          <div className="flex items-center">
                            <div className="w-16 text-sm text-gray-600 dark:text-gray-300">1 star</div>
                            <div className="flex-1 mx-2">
                              <Progress value={1} className="h-2 bg-gray-200 dark:bg-gray-700" />
                            </div>
                            <div className="w-10 text-sm text-gray-600 dark:text-gray-300 text-right">1%</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Separator className="my-6" />
                    
                    <div className="space-y-6">
                      {/* Sample review 1 */}
                      <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                        <div className="flex items-center mb-3">
                          <Avatar className="h-10 w-10 mr-3">
                            <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">JD</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-gray-800 dark:text-white">John Doe</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">2 weeks ago</div>
                          </div>
                        </div>
                        <div className="flex mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star} 
                              className="h-4 w-4 text-yellow-400 fill-yellow-400" 
                            />
                          ))}
                        </div>
                        <p className="text-gray-600 dark:text-gray-300">
                          This course exceeded my expectations! The instructor explains complex concepts in a way that's
                          easy to understand, and the practical exercises really helped solidify my learning.
                        </p>
                      </div>
                      
                      {/* Sample review 2 */}
                      <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                        <div className="flex items-center mb-3">
                          <Avatar className="h-10 w-10 mr-3">
                            <AvatarFallback className="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400">JS</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-gray-800 dark:text-white">Jane Smith</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">1 month ago</div>
                          </div>
                        </div>
                        <div className="flex mb-2">
                          {[1, 2, 3, 4].map((star) => (
                            <Star 
                              key={star} 
                              className="h-4 w-4 text-yellow-400 fill-yellow-400" 
                            />
                          ))}
                          <Star className="h-4 w-4 text-gray-300" />
                        </div>
                        <p className="text-gray-600 dark:text-gray-300">
                          Great course with lots of valuable information. I would have liked more practical examples,
                          but overall I learned a lot and would recommend it to others.
                        </p>
                      </div>
                      
                      {/* Sample review 3 */}
                      <div>
                        <div className="flex items-center mb-3">
                          <Avatar className="h-10 w-10 mr-3">
                            <AvatarFallback className="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400">RJ</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-gray-800 dark:text-white">Robert Johnson</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">2 months ago</div>
                          </div>
                        </div>
                        <div className="flex mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star} 
                              className="h-4 w-4 text-yellow-400 fill-yellow-400" 
                            />
                          ))}
                        </div>
                        <p className="text-gray-600 dark:text-gray-300">
                          I've taken many online courses, and this is definitely one of the best. The content is
                          well-structured, and the instructor is clearly knowledgeable and passionate about the subject.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <Card className="overflow-hidden shadow-lg border-gray-200 dark:border-gray-700">
                <div className="aspect-video bg-gray-100 dark:bg-gray-700">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail || "/placeholder.svg"}
                      alt={course.title}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.svg?height=192&width=384&text=Course";
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <BookOpen className="h-16 w-16 text-blue-600 dark:text-blue-400" />
                    </div>
                  )}
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="text-3xl font-bold text-gray-800 dark:text-white">₹{course.price.toFixed(2)}</div>
                  </div>
                  
                  {!isEnrolled ? (
                    <Button
                      className="w-full mb-4 bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={handleEnrollNow}
                      disabled={loadingEnrollment}
                      size="lg"
                    >
                      {loadingEnrollment ? (
                        <>
                          <Loader className="mr-2 h-4 w-4 animate-spin" />
                          Checking enrollment...
                        </>
                      ) : (
                        "Enroll Now"
                      )}
                    </Button>
                  ) : (
                    <Button
                      className="w-full mb-4 bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => navigate(`/student/courses/${courseId}`)}
                      size="lg"
                    >
                      {/* <PlayCircle className="mr-2 h-5 w-5" /> */}
                      Continue Learning
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    className={`w-full mb-6 ${
                      inWishlist
                        ? "border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-400 dark:hover:bg-rose-900/20"
                        : "border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-300"
                    }`}
                    onClick={handleToggleWishlist}
                    disabled={loadingWishlist}
                  >
                    {loadingWishlist ? (
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Heart className={`mr-2 h-4 w-4 ${inWishlist ? "fill-current" : ""}`} />
                    )}
                    {inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                  </Button>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-800 dark:text-white">This course includes:</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <Award className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span>Full lifetime access</span>
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <Clock className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span>{getTotalDuration()} of content</span>
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <FileText className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span>{lessons.length} lessons</span>
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <Download className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span>Downloadable resources</span>
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <MessageSquare className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span>Community support</span>
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <CheckCircle className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span>Certificate of completion</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      <HelpCircle className="mr-2 h-4 w-4" />
                      Help
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      {/* Video Modal */}
      <Dialog open={isVideoModalVisible} onOpenChange={setIsVideoModalVisible}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Lesson Video</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <div className="aspect-video bg-black rounded-md overflow-hidden">
            <video
              controls
              src={videoUrl}
              className="w-full h-full"
              onError={(e) => {
                console.error("Video playback error:", e);
                toast.error("Failed to load video");
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseDetails;