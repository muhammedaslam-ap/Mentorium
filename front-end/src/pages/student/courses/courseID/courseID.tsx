
import type React from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { courseService } from "@/services/courseServices/courseService";
import { lessonService } from "@/services/lessonServices/lessonServices";
import Header from "../../components/header";
import { Progress } from "@radix-ui/react-progress";

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

const CourseDetails: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  console.log("Course ID from URL:", courseId);
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [isVideoModalVisible, setIsVideoModalVisible] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string>("");

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
      fetchLessons();
    }
  }, [courseId]);

  const fetchCourseDetails = async () => {
    setLoading(true);
    try {
      const response = await courseService.getCourseDetailsInStudentSide(courseId!);
      console.log("course details in student side----", response);
      const courseData = response.course || response;
      if (courseData && courseData._id) {
        setCourse({
          ...courseData,
          tutorName: courseData.tutor?.name || courseData.tutorName,
        });
      } else {
        toast.error("Course not found");
        navigate("/student/courses");
      }
    } catch (error) {
      console.error("Error fetching course details:", error);
      toast.error("Failed to load course details");
      navigate("/student/courses");
    } finally {
      setLoading(false);
    }
  };

  const fetchLessons = async () => {
    setLoadingLessons(true);
    try {
      const response = await lessonService.getLessonsByCourse(courseId!);
      console.log("lessons in student side", response);
      if (response.lessons) {
        setLessons(response.lessons);
      }
    } catch (error) {
      console.error("Error fetching lessons:", error);
    } finally {
      setLoadingLessons(false);
    }
  };

  const showVideoModal = (url: string) => {
    setVideoUrl(url);
    setIsVideoModalVisible(true);
  };

  const handleVideoModalCancel = () => {
    setIsVideoModalVisible(false);
    setVideoUrl("");
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
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-800 border-green-200";
      case "Intermediate":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Advanced":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-violet-50">
        <Header />
            <div className="container mx-auto max-w-6xl p-6">
              <div className="flex justify-start mb-6">
                <Skeleton className="h-10 w-24" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <div className="mb-6">
                    <Skeleton className="h-6 w-24 mb-3" />
                    <Skeleton className="h-10 w-3/4 mb-2" />
                    <Skeleton className="h-6 w-1/2 mb-4" />
                    <div className="flex flex-wrap gap-4 mb-6">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-5 w-32" />
                    </div>
                  </div>
                  <div className="mb-8 lg:hidden">
                    <Skeleton className="h-48 w-full mb-4" />
                    <Skeleton className="h-10 w-full mb-4" />
                    <div className="space-y-3">
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-5 w-full" />
                    </div>
                  </div>
                  <div className="mb-8">
                    <Skeleton className="h-10 w-full mb-4" />
                    <Skeleton className="h-64 w-full" />
                  </div>
                </div>
                <div className="hidden lg:block">
                  <Skeleton className="h-48 w-full mb-4" />
                  <Skeleton className="h-10 w-full mb-4" />
                  <div className="space-y-3">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-violet-50">
        <Header />
            <div className="container mx-auto max-w-6xl p-6">
              <div className="flex justify-center items-center h-[60vh]">
                <div className="text-center">
                  <BookOpen className="h-16 w-16 text-violet-300 mx-auto mb-4" />
                  <h2 className="text-2xl font-semibold text-violet-800 mb-2">Course Not Found</h2>
                  <p className="text-violet-600 mb-6">
                    The course you're looking for doesn't exist or has been removed.
                  </p>
                  <Button
                    onClick={() => navigate("/student/courses")}
                    className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                  >
                    Browse Courses
                  </Button>
                </div>
              </div>
            </div>
          </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-violet-50">
      <Header />
          <div className="container mx-auto max-w-6xl p-6">
            <Button
              variant="ghost"
              className="mb-6 text-violet-600 hover:text-violet-800 hover:bg-violet-100 -ml-2"
              onClick={() => navigate("/student/courses")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge className={`${getDifficultyColor(course.difficulty)}`}>{course.difficulty}</Badge>
                    <Badge variant="outline" className="border-violet-200 text-violet-700">
                      {course.category}
                    </Badge>
                  </div>
                  <h1 className="text-3xl font-bold text-violet-900 mb-2">{course.title}</h1>
                  <p className="text-lg text-violet-700 mb-4">{course.tagline}</p>
                  <div className="flex flex-wrap items-center text-sm text-violet-600 gap-4 mb-4">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1.5" />
                      <span>{course.tutor?.name || course.tutorName || "Instructor"}</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-1.5 fill-yellow-400 text-yellow-400" />
                      <span>4.8 (42 reviews)</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1.5" />
                      <span>{getTotalDuration()} total length</span>
                    </div>
                    {course.createdAt && (
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1.5" />
                        <span>Last updated: {new Date(course.createdAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mb-8 lg:hidden">
                  <Card className="border-violet-100 shadow-sm overflow-hidden">
                    <div className="h-48 bg-violet-50">
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail || "/placeholder.svg"}
                          alt={course.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder.svg?height=192&width=384&text=Course";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="h-16 w-16 text-violet-300" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-2xl font-bold text-violet-900">${course.price.toFixed(2)}</div>
                      </div>
                      <div className="mt-4 space-y-3 text-sm">
                        <div className="flex items-center text-violet-700">
                          <Award className="h-4 w-4 mr-2 text-violet-500" />
                          <span>Full lifetime access</span>
                        </div>
                        <div className="flex items-center text-violet-700">
                          <Clock className="h-4 w-4 mr-2 text-violet-500" />
                          <span>{getTotalDuration()} of content</span>
                        </div>
                        <div className="flex items-center text-violet-700">
                          <FileText className="h-4 w-4 mr-2 text-violet-500" />
                          <span>{lessons.length} lessons</span>
                        </div>
                        <div className="flex items-center text-violet-700">
                          <Download className="h-4 w-4 mr-2 text-violet-500" />
                          <span>Downloadable resources</span>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-1 text-violet-600 hover:text-violet-800 hover:bg-violet-100"
                        >
                          <Share2 className="h-4 w-4 mr-1" />
                          Share
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-1 text-violet-600 hover:text-violet-800 hover:bg-violet-100"
                        >
                          <HelpCircle className="h-4 w-4 mr-1" />
                          Help
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <Tabs defaultValue="about" className="mb-8">
                  <TabsList className="bg-violet-100 text-violet-700">
                    <TabsTrigger
                      value="about"
                      className="data-[state=active]:bg-violet-600 data-[state=active]:text-white"
                    >
                      About
                    </TabsTrigger>
                    <TabsTrigger
                      value="curriculum"
                      className="data-[state=active]:bg-violet-600 data-[state=active]:text-white"
                    >
                      Curriculum
                    </TabsTrigger>
                    <TabsTrigger
                      value="instructor"
                      className="data-[state=active]:bg-violet-600 data-[state=active]:text-white"
                    >
                      Instructor
                    </TabsTrigger>
                    <TabsTrigger
                      value="reviews"
                      className="data-[state=active]:bg-violet-600 data-[state=active]:text-white"
                    >
                      Reviews
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="about" className="mt-4">
                    <Card className="border-violet-100">
                      <CardContent className="p-6">
                        <h3 className="text-xl font-semibold text-violet-900 mb-4">About This Course</h3>
                        <div className="prose prose-violet max-w-none">
                          <p className="text-violet-700 whitespace-pre-line">{course.about}</p>
                        </div>
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-violet-50 p-4 rounded-lg border border-violet-100">
                            <h4 className="font-medium text-violet-800 mb-2">What you'll learn</h4>
                            <ul className="space-y-2">
                              <li className="flex items-start">
                                <CheckSquare className="h-5 w-5 text-violet-500 mr-2 flex-shrink-0 mt-0.5" />
                                <span className="text-violet-700">Master the fundamentals and advanced concepts</span>
                              </li>
                              <li className="flex items-start">
                                <CheckSquare className="h-5 w-5 text-violet-500 mr-2 flex-shrink-0 mt-0.5" />
                                <span className="text-violet-700">Build real-world projects for your portfolio</span>
                              </li>
                              <li className="flex items-start">
                                <CheckSquare className="h-5 w-5 text-violet-500 mr-2 flex-shrink-0 mt-0.5" />
                                <span className="text-violet-700">Gain practical skills that employers value</span>
                              </li>
                              <li className="flex items-start">
                                <CheckSquare className="h-5 w-5 text-violet-500 mr-2 flex-shrink-0 mt-0.5" />
                                <span className="text-violet-700">Learn industry best practices and standards</span>
                              </li>
                            </ul>
                          </div>
                          <div className="bg-violet-50 p-4 rounded-lg border border-violet-100">
                            <h4 className="font-medium text-violet-800 mb-2">Requirements</h4>
                            <ul className="space-y-2">
                              <li className="flex items-start">
                                <CheckSquare className="h-5 w-5 text-violet-500 mr-2 flex-shrink-0 mt-0.5" />
                                <span className="text-violet-700">Basic understanding of the subject</span>
                              </li>
                              <li className="flex items-start">
                                <CheckSquare className="h-5 w-5 text-violet-500 mr-2 flex-shrink-0 mt-0.5" />
                                <span className="text-violet-700">Computer with internet connection</span>
                              </li>
                              <li className="flex items-start">
                                <CheckSquare className="h-5 w-5 text-violet-500 mr-2 flex-shrink-0 mt-0.5" />
                                <span className="text-violet-700">Dedication and willingness to learn</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="curriculum" className="mt-4">
                    <Card className="border-violet-100">
                      <CardContent className="p-6">
                        <h3 className="text-xl font-semibold text-violet-900 mb-4">Course Curriculum</h3>
                        <div className="flex items-center justify-between mb-4">
                          <div className="text-sm text-violet-600">
                            <span className="font-medium">{lessons.length} lessons</span>
                            <span className="mx-2">•</span>
                            <span>{getTotalDuration()} total length</span>
                          </div>
                        </div>
                        {loadingLessons ? (
                          <div className="flex justify-center py-8">
                            <Loader className="h-8 w-8 text-violet-500 animate-spin" />
                          </div>
                        ) : lessons.length === 0 ? (
                          <div className="text-center py-8">
                            <BookOpen className="h-12 w-12 text-violet-300 mx-auto mb-3" />
                            <p className="text-violet-600">No lessons available for this course yet.</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {lessons.map((lesson, index) => (
                              <div
                                key={lesson._id}
                                className="flex items-center p-3 border rounded-lg transition-colors border-violet-100 hover:bg-violet-50"
                              >
                                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-violet-100 text-violet-700 mr-3">
                                  <span className="font-medium">{index + 1}</span>
                                </div>
                                <div className="flex-grow">
                                  <h4 className="font-medium text-violet-800">{lesson.title}</h4>
                                  <p className="text-xs text-violet-500">
                                    {lesson.description && lesson.description.substring(0, 60)}
                                    {lesson.description && lesson.description.length > 60 ? "..." : ""}
                                    {lesson.duration && ` • ${formatDuration(lesson.duration)}`}
                                  </p>
                                </div>
                                <div className="flex-shrink-0">
                                  {lesson.file ? (
                                    <Button
                                      size="sm"
                                      className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                                      onClick={() => showVideoModal(lesson.file!)}
                                    >
                                      <PlayCircle className="h-4 w-4 mr-1" />
                                      Watch Lesson
                                    </Button>
                                  ) : (
                                    <p className="text-violet-600 text-sm">No video available</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="instructor" className="mt-4">
                    <Card className="border-violet-100">
                      <CardContent className="p-6">
                        <h3 className="text-xl font-semibold text-violet-900 mb-4">About the Instructor</h3>
                        {course?.tutor ? (
                          <>
                            <div className="flex items-start mb-4">
                              <Avatar className="h-16 w-16 mr-4">
                                <AvatarImage
                                  src="/placeholder.svg?height=64&width=64"
                                  alt={course.tutor.name}
                                />
                                <AvatarFallback className="bg-violet-100 text-violet-700">
                                  {course.tutor.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-semibold text-violet-800">{course.tutor.name}</h4>
                                <p className="text-sm text-violet-600">
                                  {course.tutor.specialization || "Expert Educator"}
                                </p>
                              </div>
                            </div>
                            <div className="space-y-2 mb-4">
                              <p className="text-violet-700">
                                <strong>Bio:</strong> {course.tutor.bio?.replace(/\r\n/g, " ") || "No bio available."}
                              </p>
                              {course.tutor.phone && (
                                <p className="text-violet-700">
                                  <strong>Contact:</strong> {course.tutor.phone}
                                </p>
                              )}
                            </div>
                          </>
                        ) : (
                          <p className="text-violet-600">Instructor information not available.</p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="reviews" className="mt-4">
                    <Card className="border-violet-100">
                      <CardContent className="p-6">
                        <h3 className="text-xl font-semibold text-violet-900 mb-4">Student Reviews</h3>
                        <div className="flex flex-col md:flex-row gap-6 mb-6">
                          <div className="md:w-1/3 bg-violet-50 p-4 rounded-lg border border-violet-100 text-center">
                            <div className="text-4xl font-bold text-violet-900 mb-2">4.8</div>
                            <div className="flex justify-center mb-2">
                              <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                              <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                              <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                              <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                              <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                            </div>
                            <div className="text-sm text-violet-600">Course Rating</div>
                            <div className="mt-2 text-violet-700">42 Reviews</div>
                          </div>
                          <div className="md:w-2/3">
                            <div className="space-y-2">
                              <div className="flex items-center">
                                <div className="w-24 text-sm text-violet-700">5 stars</div>
                                <div className="flex-1 mx-2">
                                  <Progress value={85} className="h-2 bg-violet-200" />
                                </div>
                                <div className="w-10 text-sm text-violet-700 text-right">85%</div>
                              </div>
                              <div className="flex items-center">
                                <div className="w-24 text-sm text-violet-700">4 stars</div>
                                <div className="flex-1 mx-2">
                                  <Progress value={10} className="h-2 bg-violet-200" />
                                </div>
                                <div className="w-10 text-sm text-violet-700 text-right">10%</div>
                              </div>
                              <div className="flex items-center">
                                <div className="w-24 text-sm text-violet-700">3 stars</div>
                                <div className="flex-1 mx-2">
                                  <Progress value={3} className="h-2 bg-violet-200" />
                                </div>
                                <div className="w-10 text-sm text-violet-700 text-right">3%</div>
                              </div>
                              <div className="flex items-center">
                                <div className="w-24 text-sm text-violet-700">2 stars</div>
                                <div className="flex-1 mx-2">
                                  <Progress value={1} className="h-2 bg-violet-200" />
                                </div>
                                <div className="w-10 text-sm text-violet-700 text-right">1%</div>
                              </div>
                              <div className="flex items-center">
                                <div className="w-24 text-sm text-violet-700">1 star</div>
                                <div className="flex-1 mx-2">
                                  <Progress value={1} className="h-2 bg-violet-200" />
                                </div>
                                <div className="w-10 text-sm text-violet-700 text-right">1%</div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <Separator className="my-6 bg-violet-100" />
                        <div className="space-y-6">
                          <div className="border-b border-violet-100 pb-6">
                            <div className="flex items-center mb-2">
                              <Avatar className="h-10 w-10 mr-3">
                                <AvatarFallback className="bg-violet-100 text-violet-700">JD</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium text-violet-800">John Doe</div>
                                <div className="text-xs text-violet-500">2 weeks ago</div>
                              </div>
                            </div>
                            <div className="flex mb-2">
                              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            </div>
                            <p className="text-violet-700">
                              This course exceeded my expectations! The instructor explains complex concepts in a way
                              that's easy to understand, and the practical exercises really helped solidify my learning.
                            </p>
                          </div>
                          <div className="border-b border-violet-100 pb-6">
                            <div className="flex items-center mb-2">
                              <Avatar className="h-10 w-10 mr-3">
                                <AvatarFallback className="bg-violet-100 text-violet-700">JS</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium text-violet-800">Jane Smith</div>
                                <div className="text-xs text-violet-500">1 month ago</div>
                              </div>
                            </div>
                            <div className="flex mb-2">
                              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                              <Star className="h-4 w-4 text-gray-300" />
                            </div>
                            <p className="text-violet-700">
                              Great course with lots of valuable information. I would have liked more practical
                              examples, but overall I learned a lot and would recommend it to others.
                            </p>
                          </div>
                          <div>
                            <div className="flex items-center mb-2">
                              <Avatar className="h-10 w-10 mr-3">
                                <AvatarFallback className="bg-violet-100 text-violet-700">RJ</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium text-violet-800">Robert Johnson</div>
                                <div className="text-xs text-violet-500">2 months ago</div>
                              </div>
                            </div>
                            <div className="flex mb-2">
                              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            </div>
                            <p className="text-violet-700">
                              I've taken many online courses, and this is definitely one of the best. The content is
                              well-structured, and the instructor is clearly knowledgeable and passionate about the
                              subject.
                            </p>
                          </div>
                        </div>
                        <div className="mt-6 text-center">
                          <Button variant="outline" className="border-violet-200 text-violet-700 hover:bg-violet-100">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            View All Reviews
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
              <div className="hidden lg:block">
                <div className="sticky top-24">
                  <Card className="border-violet-100 shadow-sm overflow-hidden">
                    <div className="h-48 bg-violet-50">
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail || "/placeholder.svg"}
                          alt={course.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder.svg?height=192&width=384&text=Course";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="h-16 w-16 text-violet-300" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-2xl font-bold text-violet-900">${course.price.toFixed(2)}</div>
                      </div>
                      <div className="mt-4 space-y-3 text-sm">
                        <div className="flex items-center text-violet-700">
                          <Award className="h-4 w-4 mr-2 text-violet-500" />
                          <span>Full lifetime access</span>
                        </div>
                        <div className="flex items-center text-violet-700">
                          <Clock className="h-4 w-4 mr-2 text-violet-500" />
                          <span>{getTotalDuration()} of content</span>
                        </div>
                        <div className="flex items-center text-violet-700">
                          <FileText className="h-4 w-4 mr-2 text-violet-500" />
                          <span>{lessons.length} lessons</span>
                        </div>
                        <div className="flex items-center text-violet-700">
                          <Download className="h-4 w-4 mr-2 text-violet-500" />
                          <span>Downloadable resources</span>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-1 text-violet-600 hover:text-violet-800 hover:bg-violet-100"
                        >
                          <Share2 className="h-4 w-4 mr-1" />
                          Share
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-1 text-violet-600 hover:text-violet-800 hover:bg-violet-100"
                        >
                          <HelpCircle className="h-4 w-4 mr-1" />
                          Help
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
      <Dialog open={isVideoModalVisible} onOpenChange={setIsVideoModalVisible}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Lesson Video</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <video
            controls
            src={videoUrl}
            className="w-full h-auto"
            onError={(e) => {
              console.error("Video playback error:", e);
              toast.error("Failed to load video");
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseDetails;
