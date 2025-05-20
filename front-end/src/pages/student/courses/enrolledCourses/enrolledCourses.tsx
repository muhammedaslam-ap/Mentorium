"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  BookOpen,
  Search,
  Play,
  CheckCircle,
  Filter,
  Star,
  GraduationCap,
  Clock,
  Calendar,
  Tag,
  Info,
  Download,
} from "lucide-react";
import { authAxiosInstance } from "@/api/authAxiosInstance";
import Header from "../../components/header";
import Sidebar from "../../components/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,

} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Course {
  _id: string;
  title: string;
  tagline?: string;
  thumbnail: string;
  difficulty: string;
  category: string;
  tutorName?: string;
  price: number;
  about: string;
  enrollments?: number;
  createdAt?: string;
  progress?: number;
  lastAccessed?: string;
  lessonsCompleted?: number;
  totalLessons?: number;
  nextLessonTitle?: string;
  nextLessonId?: string;
  nextLessonThumbnail?: string;
  rating?: number;
  duration?: string; // e.g., "12 hours"
  estimatedCompletionTime?: string; // e.g., "2 weeks"
  enrollmentDate?: string;
  tags?: string[];
  chaptersCompleted?: number;
  totalChapters?: number;
  quizzesCompleted?: number;
  totalQuizzes?: number;
  timeSpent?: string; // e.g., "5 hours"
  certificateAvailable?: boolean;
}

type FilterType = "all" | "in-progress" | "completed";
type SortType = "progress-desc" | "progress-asc" | "rating-desc" | "last-accessed" | "price-desc" | "price-asc";
type DifficultyFilter = "all" | "beginner" | "intermediate" | "advanced";

const EnrolledCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [sort, setSort] = useState<SortType>("progress-desc");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sidebarOpen] = useState(true);
  const [previewCourse, setPreviewCourse] = useState<Course | null>(null);
  const limit = 9; // Courses per page

  useEffect(() => {
    fetchEnrolledCourses();
  }, [page]);

  const fetchEnrolledCourses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await authAxiosInstance.get(`/purchase/enrolledCourses?page=${page}&limit=${limit}`);
      console.log("Enrolled courses response:", JSON.stringify(response.data, null, 2));
      if (response.data && Array.isArray(response.data.courses)) {
        const coursesWithProgress = response.data.courses.map((course: any) => ({
          ...course,
          progress: course.progress ?? Math.floor(Math.random() * 100),
          lastAccessed:
            course.lastAccessed ??
            new Date(Date.now() - Math.floor(Math.random() * 10) * 86400000).toISOString(),
          lessonsCompleted: course.lessonsCompleted ?? Math.floor(Math.random() * 10),
          totalLessons: course.totalLessons ?? 10 + Math.floor(Math.random() * 20),
          nextLessonTitle: course.nextLessonTitle ?? "Introduction to the Course",
          rating: course.rating ?? (3.5 + Math.random() * 1.5).toFixed(1),
          duration: course.duration ?? `${Math.floor(5 + Math.random() * 20)} hours`,
          estimatedCompletionTime: course.estimatedCompletionTime ?? `${Math.floor(1 + Math.random() * 4)} weeks`,
          enrollmentDate: course.enrollmentDate ?? new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000).toISOString(),
          tags: course.tags ?? ["Learning", "Online"],
          chaptersCompleted: course.chaptersCompleted ?? Math.floor(Math.random() * 5),
          totalChapters: course.totalChapters ?? 5 + Math.floor(Math.random() * 5),
          quizzesCompleted: course.quizzesCompleted ?? Math.floor(Math.random() * 3),
          totalQuizzes: course.totalQuizzes ?? 3 + Math.floor(Math.random() * 3),
          timeSpent: course.timeSpent ?? `${Math.floor(1 + Math.random() * 10)} hours`,
          certificateAvailable: course.certificateAvailable ?? (course.progress === 100),
        }));
        setCourses(coursesWithProgress);
        setTotalPages(Math.ceil(response.data.total / limit));
        console.log(
          "Thumbnail URLs:",
          coursesWithProgress.map((course: Course) => ({ id: course._id, thumbnail: course.thumbnail }))
        );
      } else {
        setCourses([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
      toast.error("Failed to load your enrolled courses. Retrying...");
      setTimeout(fetchEnrolledCourses, 3000); // Retry after 3 seconds
    } finally {
      setLoading(false);
    }
  }, [page]);

  const handleNavigateToCourse = (courseId: string) => {
    navigate(`/student/courses/${courseId}`);
  };

  const handleNavigateToLesson = (courseId: string, lessonId: string) => {
    navigate(`/student/courses/${courseId}/lessons/${lessonId}`);
  };

  const downloadCertificate = (courseId: string, courseTitle: string) => {
    toast.success(`Downloading certificate for ${courseTitle}`);
    // Simulate certificate download (replace with actual API call)
    console.log(`Downloading certificate for course ${courseId}`);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(dateString));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-800 border-green-200";
      case "intermediate":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "advanced":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getProgressColor = (progress = 0) => {
    if (progress >= 75) return "bg-green-500";
    if (progress >= 25) return "bg-blue-500";
    return "bg-violet-500";
  };

  const categories = useMemo(() => {
    const uniqueCategories = new Set(courses.map((course) => course.category));
    return ["all", ...Array.from(uniqueCategories)];
  }, [courses]);

  const filteredCourses = useMemo(() => {
    let filtered = courses;

    // Search filter
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (course) =>
          course.title?.toLowerCase().includes(searchTermLower) ||
          course.category?.toLowerCase().includes(searchTermLower) ||
          course.tutorName?.toLowerCase().includes(searchTermLower) ||
          course.tags?.some((tag) => tag.toLowerCase().includes(searchTermLower))
      );
    }

    // Progress filter
    if (filter === "in-progress") {
      filtered = filtered.filter((course) => course.progress && course.progress < 100 && course.progress > 0);
    } else if (filter === "completed") {
      filtered = filtered.filter((course) => course.progress === 100);
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((course) => course.category.toLowerCase() === categoryFilter.toLowerCase());
    }

    // Difficulty filter
    if (difficultyFilter !== "all") {
      filtered = filtered.filter((course) => course.difficulty.toLowerCase() === difficultyFilter);
    }

    // Sorting
    filtered = filtered.sort((a, b) => {
      switch (sort) {
        case "progress-desc":
          return (b.progress || 0) - (a.progress || 0);
        case "progress-asc":
          return (a.progress || 0) - (b.progress || 0);
        case "rating-desc":
          return (b.rating || 0) - (a.rating || 0);
        case "last-accessed":
          return new Date(b.lastAccessed || "").getTime() - new Date(a.lastAccessed || "").getTime();
        case "price-desc":
          return b.price - a.price;
        case "price-asc":
          return a.price - b.price;
        default:
          return 0;
      }
    });

    return filtered;
  }, [courses, searchTerm, filter, categoryFilter, difficultyFilter, sort]);

  const getButtonActionAndText = (course: Course) => {
    if (course.progress === 0) {
      return {
        action: () => handleNavigateToCourse(course._id),
        text: "Start Learning",
      };
    } else if (course.progress === 100) {
      return {
        action: () => handleNavigateToCourse(course._id),
        text: "Review Course",
      };
    } else {
      return {
        action: () =>
          course.nextLessonId
            ? handleNavigateToLesson(course._id, course.nextLessonId)
            : handleNavigateToCourse(course._id),
        text: "Continue Learning",
      };
    }
  };

  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
    setPage(1); // Reset to first page
    if (newFilter === "in-progress") {
      const inProgress = courses.filter((c) => c.progress && c.progress < 100 && c.progress > 0);
      if (inProgress.length === 0) {
        toast.info("No courses in progress");
      }
    } else if (newFilter === "completed") {
      const completed = courses.filter((c) => c.progress === 100);
      if (completed.length === 0) {
        toast.info("No completed courses yet");
      }
    }
  };

  const renderCourseCard = (course: Course) => {
    const { action, text } = getButtonActionAndText(course);

    return (
      <Card
        key={course._id}
        className="border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col"
        aria-labelledby={`course-title-${course._id}`}
      >
        <CardHeader className="p-0 relative">
          <div className="h-48 overflow-hidden bg-gray-100 dark:bg-gray-700">
            <div
              className="w-full h-full cursor-pointer"
              onClick={() => handleNavigateToCourse(course._id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && handleNavigateToCourse(course._id)}
            >
              <img
                src={course.thumbnail || "/placeholder.svg?height=192&width=384&text=Course"}
                alt={course.title}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                loading="lazy"
                onError={(e) => {
                  console.log(`Failed to load thumbnail for course ${course._id}: ${course.thumbnail}`);
                  (e.target as HTMLImageElement).src = "/placeholder.svg?height=192&width=384&text=Course";
                }}
              />
            </div>

            {/* Progress indicator */}
            {course.progress !== undefined && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white px-4 py-2">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span>{course.progress}%</span>
                </div>
                <Progress
                  value={course.progress}
                  className="h-1.5 bg-gray-600"
                  indicatorClassName={getProgressColor(course.progress)}
                />
              </div>
            )}

            {/* Status badge */}
            {course.progress === 100 ? (
              <Badge className="absolute top-2 right-2 bg-green-500 text-white">
                <CheckCircle className="h-3 w-3 mr-1" />
                Completed
              </Badge>
            ) : course.progress && course.progress > 0 ? (
              <Badge className="absolute top-2 right-2 bg-blue-500 text-white">In Progress</Badge>
            ) : (
              <Badge className="absolute top-2 right-2 bg-violet-500 text-white">Not Started</Badge>
            )}

            {/* Play button overlay */}
            {course.progress && course.progress > 0 && course.progress < 100 && course.nextLessonId && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNavigateToLesson(course._id, course.nextLessonId!);
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && handleNavigateToLesson(course._id, course.nextLessonId!)}
                    >
                      <div className="bg-blue-600 rounded-full p-3 transform hover:scale-110 transition-transform">
                        <Play className="h-8 w-8 text-white" fill="white" />
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Resume {course.nextLessonTitle}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-4 flex-1">
          <div className="flex items-center justify-between mb-2">
            <Badge className={`${getDifficultyColor(course.difficulty)}`}>{course.difficulty}</Badge>
            <Badge variant="outline" className="border-gray-200 dark:border-gray-700">
              {course.category}
            </Badge>
          </div>

          <h3
            id={`course-title-${course._id}`}
            className="font-semibold text-gray-600 dark:text-gray-300 text-lg mb-1 line-clamp-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
            onClick={() => handleNavigateToCourse(course._id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && handleNavigateToCourse(course._id)}
          >
            {course.title}
          </h3>

          {course.tagline && (
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">{course.tagline}</p>
          )}

          <div className="flex flex-wrap items-center text-xs text-gray-600 dark:text-gray-300 mb-4 gap-x-4 gap-y-2">
            {course.tutorName && (
              <div className="flex items-center">
                <GraduationCap className="h-3.5 w-3.5 mr-1 text-blue-600 dark:text-blue-400" />
                <span>{course.tutorName}</span>
              </div>
            )}
            {course.rating && (
              <div className="flex items-center">
                <Star className="h-3.5 w-3.5 mr-1 fill-yellow-400 text-yellow-400" />
                <span>{course.rating}</span>
              </div>
            )}
            {course.duration && (
              <div className="flex items-center">
                <Clock className="h-3.5 w-3.5 mr-1 text-blue-600 dark:text-blue-400" />
                <span>{course.duration}</span>
              </div>
            )}
            {course.enrollmentDate && (
              <div className="flex items-center">
                <Calendar className="h-3.5 w-3.5 mr-1 text-blue-600 dark:text-blue-400" />
                <span>Enrolled: {formatDate(course.enrollmentDate)}</span>
              </div>
            )}
          </div>

          {/* Progress details */}
          <div className="mb-4 bg-gray-50 dark:bg-gray-700 p-3 rounded-md border border-gray-200 dark:border-gray-600">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">PROGRESS DETAILS</p>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex justify-between">
                <span>Lessons</span>
                <span>
                  {course.lessonsCompleted || 0}/{course.totalLessons || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Chapters</span>
                <span>
                  {course.chaptersCompleted || 0}/{course.totalChapters || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Quizzes</span>
                <span>
                  {course.quizzesCompleted || 0}/{course.totalQuizzes || 0}
                </span>
              </div>
              {course.timeSpent && (
                <div className="flex justify-between">
                  <span>Time Spent</span>
                  <span>{course.timeSpent}</span>
                </div>
              )}
            </div>
          </div>

          {/* Next lesson section */}
          {course.progress && course.progress > 0 && course.progress < 100 && course.nextLessonTitle && (
            <div className="mb-4 bg-gray-50 dark:bg-gray-700 p-3 rounded-md border border-gray-200 dark:border-gray-600">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">CONTINUE WITH</p>
              <div
                className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 p-2 rounded-md transition-colors"
                onClick={() =>
                  course.nextLessonId && handleNavigateToLesson(course._id, course.nextLessonId)
                }
                role="button"
                tabIndex={0}
                onKeyDown={(e) =>
                  e.key === "Enter" && course.nextLessonId && handleNavigateToLesson(course._id, course.nextLessonId)
                }
              >
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded overflow-hidden flex-shrink-0">
                  {course.nextLessonThumbnail ? (
                    <img
                      src={course.nextLessonThumbnail}
                      alt="Lesson thumbnail"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.svg?height=48&width=48&text=Lesson";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300 truncate">
                    {course.nextLessonTitle}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Resume where you left off</p>
                </div>
                <Play className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              </div>
            </div>
          )}

          {/* Tags */}
          {course.tags && course.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {course.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>

        <CardFooter className="p-4 pt-0 flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                  onClick={action}
                  aria-label={text}
                >
                  {text}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{text} for {course.title}</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setPreviewCourse(course)}
                  aria-label={`View details for ${course.title}`}
                >
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>View course details</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {course.progress === 100 && course.certificateAvailable && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => downloadCertificate(course._id, course.title)}
                    aria-label={`Download certificate for ${course.title}`}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Download certificate</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-800">
      <Header />
      <div className="flex">
        <Sidebar sidebarOpen={sidebarOpen} />
        <div className={`flex-1 ${sidebarOpen ? "md:ml-64" : ""}`}>
          <div className="container mx-auto max-w-7xl p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-600 dark:text-gray-300">My Learning Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  Track and continue your learning journey with your enrolled courses
                </p>
              </div>
              <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600 dark:text-blue-400 h-4 w-4" />
                  <Input
                    placeholder="Search courses, tags, or instructors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-blue-500"
                    aria-label="Search courses"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category === "all" ? "All Categories" : category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Difficulties</SelectItem>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="md:hidden">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleFilterChange("all")}>All Courses</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleFilterChange("in-progress")}>In Progress</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleFilterChange("completed")}>Completed</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-6 items-center justify-between">
              <div className="flex gap-3">
                <Button
                  variant={filter === "all" ? "default" : "outline"}
                  className={
                    filter === "all"
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300"
                  }
                  onClick={() => handleFilterChange("all")}
                >
                  All Courses
                </Button>
                <Button
                  variant={filter === "in-progress" ? "default" : "outline"}
                  className={
                    filter === "in-progress"
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300"
                  }
                  onClick={() => handleFilterChange("in-progress")}
                >
                  In Progress
                </Button>
                <Button
                  variant={filter === "completed" ? "default" : "outline"}
                  className={
                    filter === "completed"
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300"
                  }
                  onClick={() => handleFilterChange("completed")}
                >
                  Completed
                </Button>
              </div>
              <Select value={sort} onValueChange={(value) => setSort(value as SortType)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="progress-desc">Progress (High to Low)</SelectItem>
                  <SelectItem value="progress-asc">Progress (Low to High)</SelectItem>
                  <SelectItem value="rating-desc">Rating (High to Low)</SelectItem>
                  <SelectItem value="last-accessed">Last Accessed</SelectItem>
                  <SelectItem value="price-desc">Price (High to Low)</SelectItem>
                  <SelectItem value="price-asc">Price (Low to High)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-5 w-16" />
                      </div>
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-5/6 mb-3" />
                      <div className="space-y-2 mb-4">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-px w-full mb-3" />
                      <div className="flex gap-2">
                        <Skeleton className="h-9 flex-1" />
                        <Skeleton className="h-9 w-16" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : courses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <BookOpen className="h-16 w-16 text-blue-600 dark:text-blue-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">No Courses Found</h3>
                <p className="text-gray-600 dark:text-gray-300 max-w-md mb-6">
                  You haven't enrolled in any courses yet. Explore our catalog to start your learning journey!
                </p>
                <Button
                  onClick={() => navigate("/student/courses")}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  Browse Courses
                </Button>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Search className="h-16 w-16 text-blue-600 dark:text-blue-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">No Matching Courses</h3>
                <p className="text-gray-600 dark:text-gray-300 max-w-md mb-6">
                  No courses match your current filters. Try adjusting your search or filters.
                </p>
                <Button
                  onClick={() => {
                    setSearchTerm("");
                    setFilter("all");
                    setCategoryFilter("all");
                    setDifficultyFilter("all");
                    setSort("progress-desc");
                    setPage(1);
                  }}
                  variant="outline"
                  className="border-gray-200 dark:border-gray-700"
                >
                  Reset All Filters
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCourses.map((course) => renderCourseCard(course))}
                </div>
                {totalPages > 1 && (
                  <div className="flex justify-center mt-6 gap-2">
                    <Button
                      variant="outline"
                      disabled={page === 1}
                      onClick={() => setPage((prev) => prev - 1)}
                      aria-label="Previous page"
                    >
                      Previous
                    </Button>
                    <span className="text-gray-600 dark:text-gray-300 self-center">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      disabled={page === totalPages}
                      onClick={() => setPage((prev) => prev + 1)}
                      aria-label="Next page"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Course Preview Modal */}
      {previewCourse && (
        <Dialog open={!!previewCourse} onOpenChange={() => setPreviewCourse(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{previewCourse.title}</DialogTitle>
              <DialogDescription>{previewCourse.tagline}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <img
                src={previewCourse.thumbnail || "/placeholder.svg?height=300&width=600&text=Course"}
                alt={previewCourse.title}
                className="w-full h-48 object-cover rounded-md"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.svg?height=300&width=600&text=Course";
                }}
              />
              <p className="text-gray-600 dark:text-gray-300">{previewCourse.about}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Instructor:</span> {previewCourse.tutorName || "Unknown"}
                </div>
                <div>
                  <span className="font-medium">Category:</span> {previewCourse.category}
                </div>
                <div>
                  <span className="font-medium">Difficulty:</span> {previewCourse.difficulty}
                </div>
                <div>
                  <span className="font-medium">Duration:</span> {previewCourse.duration || "N/A"}
                </div>
                <div>
                  <span className="font-medium">Rating:</span> {previewCourse.rating || "N/A"}
                </div>
                <div>
                  <span className="font-medium">Enrolled:</span> {formatDate(previewCourse.enrollmentDate || "")}
                </div>
              </div>
              <Button
                className="w-full bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => handleNavigateToCourse(previewCourse._id)}
              >
                Go to Course
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default EnrolledCourses;