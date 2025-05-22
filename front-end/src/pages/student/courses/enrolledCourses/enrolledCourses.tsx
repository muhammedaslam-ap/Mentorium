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
  BarChart4,
  Award,
  Shield,
  Zap,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
type ViewType = "grid" | "list";

const EnrolledCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [sort, setSort] = useState<SortType>("progress-desc");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>("all");
  const [viewType, setViewType] = useState<ViewType>("grid");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sidebarOpen] = useState(true);
  const [previewCourse, setPreviewCourse] = useState<Course | null>(null);
  const [popularCategories, setPopularCategories] = useState<{category: string, count: number}[]>([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    coursesInProgress: 0,
    completedCourses: 0,
    totalHoursLearned: 0,
  });
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
        
        // Calculate learning stats
        const inProgress = coursesWithProgress.filter((c) => c.progress && c.progress < 100 && c.progress > 0).length;
        const completed = coursesWithProgress.filter((c) => c.progress === 100).length;
        const totalHours = coursesWithProgress.reduce((acc, curr) => {
          const hours = parseInt(curr.timeSpent?.split(' ')[0] || '0');
          return acc + hours;
        }, 0);
        
        setStats({
          totalCourses: coursesWithProgress.length,
          coursesInProgress: inProgress,
          completedCourses: completed,
          totalHoursLearned: totalHours,
        });
        
        // Extract popular categories
        const categoryCount: Record<string, number> = {};
        coursesWithProgress.forEach(course => {
          if (course.category) {
            categoryCount[course.category] = (categoryCount[course.category] || 0) + 1;
          }
        });
        
        const topCategories = Object.entries(categoryCount)
          .map(([category, count]) => ({ category, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 3);
          
        setPopularCategories(topCategories);
        
        console.log(
          "Thumbnail URLs:",
          coursesWithProgress.map((course: Course) => ({ id: course._id, thumbnail: course.thumbnail }))
        );
      } else {
        setCourses([]);
        setTotalPages(1);
        setStats({
          totalCourses: 0,
          coursesInProgress: 0,
          completedCourses: 0,
          totalHoursLearned: 0,
        });
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
        return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-100";
      case "intermediate":
        return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-100";
      case "advanced":
        return "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900 dark:text-purple-100";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-200";
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
        icon: <Play className="h-4 w-4 mr-2" />,
      };
    } else if (course.progress === 100) {
      return {
        action: () => handleNavigateToCourse(course._id),
        text: "Review Course",
        icon: <CheckCircle className="h-4 w-4 mr-2" />,
      };
    } else {
      return {
        action: () =>
          course.nextLessonId
            ? handleNavigateToLesson(course._id, course.nextLessonId)
            : handleNavigateToCourse(course._id),
        text: "Continue Learning",
        icon: <Play className="h-4 w-4 mr-2" />,
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

  const renderGridCourseCard = (course: Course) => {
    const { action, text, icon } = getButtonActionAndText(course);
    const progressColor = getProgressColor(course.progress);

    return (
      <Card
        key={course._id}
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-lg hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full"
      >
        <div className="relative">
          <div 
            className="h-48 overflow-hidden cursor-pointer group"
            onClick={() => handleNavigateToCourse(course._id)}
          >
            <img
              src={course.thumbnail || "/placeholder.svg?height=192&width=384&text=Course"}
              alt={course.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.svg?height=192&width=384&text=Course";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          
          {/* Status badge */}
          {course.progress === 100 ? (
            <Badge className="absolute top-3 right-3 bg-green-500 text-white border-0">
              <CheckCircle className="h-3 w-3 mr-1" />
              Completed
            </Badge>
          ) : course.progress && course.progress > 0 ? (
            <Badge className="absolute top-3 right-3 bg-blue-500 text-white border-0">
              In Progress
            </Badge>
          ) : (
            <Badge className="absolute top-3 right-3 bg-violet-500 text-white border-0">
              Not Started
            </Badge>
          )}
          
          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0">
            <Progress
              value={course.progress || 0}
              className="h-1.5 rounded-none"
              indicatorClassName={progressColor}
            />
          </div>
        </div>
        
        <CardContent className="p-5 flex-grow">
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge className={`${getDifficultyColor(course.difficulty)}`}>
              {course.difficulty}
            </Badge>
            <Badge variant="outline" className="bg-transparent border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-300">
              {course.category}
            </Badge>
          </div>
          
          <h3 
            className="font-semibold text-gray-800 dark:text-white text-lg mb-2 line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
            onClick={() => handleNavigateToCourse(course._id)}
          >
            {course.title}
          </h3>
          
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
            <GraduationCap className="h-4 w-4 mr-1.5 text-blue-600 dark:text-blue-400" />
            <span>{course.tutorName || "Instructor"}</span>
          </div>
          
          <div className="mb-3 grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <Star className="h-4 w-4 mr-1.5 fill-yellow-400 text-yellow-400" />
              <span>{course.rating} rating</span>
            </div>
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <Clock className="h-4 w-4 mr-1.5 text-blue-600 dark:text-blue-400" />
              <span>{course.duration}</span>
            </div>
          </div>
          
          {/* Progress details */}
          <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md border border-gray-200 dark:border-gray-700 mb-4">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-1.5">
              <span>Progress</span>
              <span className="font-medium">{course.progress || 0}%</span>
            </div>
            <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex justify-between">
                <span>Lessons</span>
                <span>
                  {course.lessonsCompleted || 0}/{course.totalLessons || 0}
                </span>
              </div>
              {course.lastAccessed && (
                <div className="flex justify-between">
                  <span>Last accessed</span>
                  <span>{formatDate(course.lastAccessed)}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="p-5 pt-0 flex gap-2">
          <Button
            className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
            onClick={action}
          >
            {icon}
            {text}
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className="border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setPreviewCourse(course)}
          >
            <Info className="h-4 w-4" />
          </Button>
          
          {course.progress === 100 && course.certificateAvailable && (
            <Button
              variant="outline"
              size="icon"
              className="border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => downloadCertificate(course._id, course.title)}
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  };
  
  const renderListCourseCard = (course: Course) => {
    const { action, text, icon } = getButtonActionAndText(course);
    const progressColor = getProgressColor(course.progress);
    
    return (
      <Card
        key={course._id}
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row">
          <div className="sm:w-56 h-40 sm:h-auto relative">
            <div 
              className="h-full cursor-pointer"
              onClick={() => handleNavigateToCourse(course._id)}
            >
              <img
                src={course.thumbnail || "/placeholder.svg?height=224&width=224&text=Course"}
                alt={course.title}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.svg?height=224&width=224&text=Course";
                }}
              />
            </div>
            
            {/* Status badge */}
            {course.progress === 100 ? (
              <Badge className="absolute top-3 right-3 bg-green-500 text-white border-0">
                <CheckCircle className="h-3 w-3 mr-1" />
                Completed
              </Badge>
            ) : course.progress && course.progress > 0 ? (
              <Badge className="absolute top-3 right-3 bg-blue-500 text-white border-0">
                In Progress
              </Badge>
            ) : (
              <Badge className="absolute top-3 right-3 bg-violet-500 text-white border-0">
                Not Started
              </Badge>
            )}
            
            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 right-0">
              <Progress
                value={course.progress || 0}
                className="h-1.5 rounded-none"
                indicatorClassName={progressColor}
              />
            </div>
          </div>
          
          <div className="flex-1 p-5">
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge className={`${getDifficultyColor(course.difficulty)}`}>
                {course.difficulty}
              </Badge>
              <Badge variant="outline" className="bg-transparent border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-300">
                {course.category}
              </Badge>
            </div>
            
            <h3 
              className="font-semibold text-gray-800 dark:text-white text-lg mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
              onClick={() => handleNavigateToCourse(course._id)}
            >
              {course.title}
            </h3>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
              <div className="flex items-center">
                <GraduationCap className="h-4 w-4 mr-1.5 text-blue-600 dark:text-blue-400" />
                <span>{course.tutorName || "Instructor"}</span>
              </div>
              <div className="flex items-center">
                <Star className="h-4 w-4 mr-1.5 fill-yellow-400 text-yellow-400" />
                <span>{course.rating} rating</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1.5 text-blue-600 dark:text-blue-400" />
                <span>{course.duration}</span>
              </div>
              {course.lastAccessed && (
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1.5 text-blue-600 dark:text-blue-400" />
                  <span>Last accessed: {formatDate(course.lastAccessed)}</span>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Progress details */}
              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-1.5">
                  <span>Progress</span>
                  <span className="font-medium">{course.progress || 0}%</span>
                </div>
                <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
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
                </div>
              </div>
              
              {/* Estimated completion */}
              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md border border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">Course details</p>
                <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex justify-between">
                    <span>Est. completion</span>
                    <span>{course.estimatedCompletionTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Enrolled on</span>
                    <span>{formatDate(course.enrollmentDate || "")}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button
                className="bg-blue-600 text-white hover:bg-blue-700"
                onClick={action}
              >
                {icon}
                {text}
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                className="border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setPreviewCourse(course)}
              >
                <Info className="h-4 w-4" />
              </Button>
              
              {course.progress === 100 && course.certificateAvailable && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        className="border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => downloadCertificate(course._id, course.title)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Certificate
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Download completion certificate</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="flex">
        <Sidebar sidebarOpen={sidebarOpen} />
        <div className={`flex-1 ${sidebarOpen ? "md:ml-64" : ""}`}>
          <div className="container mx-auto max-w-7xl p-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">My Learning Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-300">
                Track your progress and continue learning with your enrolled courses
              </p>
            </div>
            
            {/* Dashboard overview */}
            <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-800/40 border-blue-200 dark:border-blue-800 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">TOTAL COURSES</h3>
                    <div className="bg-blue-200 dark:bg-blue-700 rounded-full p-2">
                      <BookOpen className="h-5 w-5 text-blue-800 dark:text-blue-200" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-blue-800 dark:text-blue-200">{stats.totalCourses}</div>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">Courses enrolled</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/40 dark:to-green-800/40 border-green-200 dark:border-green-800 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-green-800 dark:text-green-200">COMPLETED</h3>
                    <div className="bg-green-200 dark:bg-green-700 rounded-full p-2">
                      <CheckCircle className="h-5 w-5 text-green-800 dark:text-green-200" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-green-800 dark:text-green-200">{stats.completedCourses}</div>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">Courses completed</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/40 dark:to-amber-800/40 border-amber-200 dark:border-amber-800 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">IN PROGRESS</h3>
                    <div className="bg-amber-200 dark:bg-amber-700 rounded-full p-2">
                      <Play className="h-5 w-5 text-amber-800 dark:text-amber-200" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-amber-800 dark:text-amber-200">{stats.coursesInProgress}</div>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">Active courses</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/40 dark:to-purple-800/40 border-purple-200 dark:border-purple-800 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-purple-800 dark:text-purple-200">LEARNING TIME</h3>
                    <div className="bg-purple-200 dark:bg-purple-700 rounded-full p-2">
                      <Clock className="h-5 w-5 text-purple-800 dark:text-purple-200" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-purple-800 dark:text-purple-200">{stats.totalHoursLearned}</div>
                  <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">Hours spent learning</p>
                </CardContent>
              </Card>
            </div>
            
            {/* Search and filters bar */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                  <Input
                    placeholder="Search your courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[150px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
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
                    <SelectTrigger className="w-[150px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Difficulties</SelectItem>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={sort} onValueChange={(value) => setSort(value as SortType)}>
                    <SelectTrigger className="w-[180px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
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
              </div>
            </div>
            
            {/* Tabs section */}
            <Tabs defaultValue="all" className="mb-6" onValueChange={(value) => handleFilterChange(value as FilterType)}>
              <div className="flex items-center justify-between mb-4">
                <TabsList className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1">
                  <TabsTrigger 
                    value="all" 
                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                  >
                    All Courses
                  </TabsTrigger>
                  <TabsTrigger 
                    value="in-progress" 
                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                  >
                    In Progress
                  </TabsTrigger>
                  <TabsTrigger 
                    value="completed" 
                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                  >
                    Completed
                  </TabsTrigger>
                </TabsList>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className={`border-gray-200 dark:border-gray-700 ${
                      viewType === "grid" ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : ""
                    }`}
                    onClick={() => setViewType("grid")}
                  >
                    <BarChart4 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`border-gray-200 dark:border-gray-700 ${
                      viewType === "list" ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : ""
                    }`}
                    onClick={() => setViewType("list")}
                  >
                    <BookOpen className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <TabsContent value="all">
                {loading ? (
                  <div className={`grid ${viewType === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
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
                            <Skeleton className="h-9 w-9" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : courses.length === 0 ? (
                  <EmptyStateMessage 
                    title="No Courses Found"
                    description="You haven't enrolled in any courses yet. Explore our catalog to start your learning journey!"
                    buttonText="Browse Courses"
                    buttonAction={() => navigate("/student/courses")}
                  />
                ) : filteredCourses.length === 0 ? (
                  <EmptyStateMessage 
                    title="No Matching Courses"
                    description="No courses match your current filters. Try adjusting your search or filters."
                    buttonText="Reset Filters"
                    buttonAction={() => {
                      setSearchTerm("");
                      setFilter("all");
                      setCategoryFilter("all");
                      setDifficultyFilter("all");
                      setSort("progress-desc");
                    }}
                  />
                ) : (
                  <>
                    <div className={`grid ${viewType === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
                      {filteredCourses.map((course) => (
                        viewType === 'grid' ? renderGridCourseCard(course) : renderListCourseCard(course)
                      ))}
                    </div>
                    
                    {totalPages > 1 && (
                      <div className="flex justify-center mt-8 gap-2">
                        <Button
                          variant="outline"
                          disabled={page === 1}
                          onClick={() => setPage((prev) => prev - 1)}
                          className="border-gray-200 dark:border-gray-700"
                        >
                          Previous
                        </Button>
                        <span className="flex items-center text-gray-600 dark:text-gray-300 px-4">
                          Page {page} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          disabled={page === totalPages}
                          onClick={() => setPage((prev) => prev + 1)}
                          className="border-gray-200 dark:border-gray-700"
                        >
                          Next
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>
              
              <TabsContent value="in-progress">
                {/* Same content structure as "all" tab, but filtered for in-progress courses */}
                {loading ? (
                  <div className={`grid ${viewType === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
                    {Array.from({ length: 3 }).map((_, index) => (
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
                            <Skeleton className="h-9 w-9" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : filteredCourses.length === 0 ? (
                  <EmptyStateMessage 
                    title="No Courses In Progress"
                    description="You don't have any courses in progress. Start learning or browse for new courses!"
                    buttonText="Browse Courses"
                    buttonAction={() => navigate("/student/courses")}
                  />
                ) : (
                  <div className={`grid ${viewType === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
                    {filteredCourses.map((course) => (
                      viewType === 'grid' ? renderGridCourseCard(course) : renderListCourseCard(course)
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="completed">
                {/* Same content structure as "all" tab, but filtered for completed courses */}
                {loading ? (
                  <div className={`grid ${viewType === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
                    {Array.from({ length: 3 }).map((_, index) => (
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
                            <Skeleton className="h-9 w-9" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : filteredCourses.length === 0 ? (
                  <EmptyStateMessage 
                    title="No Completed Courses"
                    description="You haven't completed any courses yet. Keep learning to earn your certificates!"
                    buttonText="View In Progress"
                    buttonAction={() => handleFilterChange("in-progress")}
                  />
                ) : (
                  <div className={`grid ${viewType === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
                    {filteredCourses.map((course) => (
                      viewType === 'grid' ? renderGridCourseCard(course) : renderListCourseCard(course)
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
            
            {/* Quick stats and achievements section at the bottom */}
            {!loading && courses.length > 0 && (
              <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Popular categories */}
                <Card className="shadow-sm border-gray-200 dark:border-gray-700">
                  <CardHeader className="pb-2">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Your Top Categories</h3>
                  </CardHeader>
                  <CardContent>
                    {popularCategories.length > 0 ? (
                      <div className="space-y-3">
                        {popularCategories.map((category, idx) => (
                          <div key={idx} className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className={`w-2 h-2 rounded-full ${
                                idx === 0 ? 'bg-blue-500' : idx === 1 ? 'bg-green-500' : 'bg-amber-500'
                              } mr-2`}></div>
                              <span className="text-gray-600 dark:text-gray-300">{category.category}</span>
                            </div>
                            <Badge variant="outline" className="border-gray-200 dark:border-gray-700">
                              {category.count} {category.count === 1 ? 'course' : 'courses'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-sm">No category data available yet.</p>
                    )}
                  </CardContent>
                </Card>
                
                {/* Achievements & badges */}
                <Card className="shadow-sm border-gray-200 dark:border-gray-700">
                  <CardHeader className="pb-2">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Achievements</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="flex flex-col items-center">
                        <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-full mb-2">
                          <Award className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-300 text-center">First Course</span>
                      </div>
                      
                      {stats.completedCourses > 0 && (
                        <div className="flex flex-col items-center">
                          <div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-full mb-2">
                            <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                          <span className="text-xs text-gray-600 dark:text-gray-300 text-center">Course Master</span>
                        </div>
                      )}
                      
                      {stats.totalHoursLearned >= 10 && (
                        <div className="flex flex-col items-center">
                          <div className="bg-amber-100 dark:bg-amber-900/50 p-3 rounded-full mb-2">
                            <Zap className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                          </div>
                          <span className="text-xs text-gray-600 dark:text-gray-300 text-center">Fast Learner</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Recommendations */}
                <Card className="shadow-sm border-gray-200 dark:border-gray-700">
                  <CardHeader className="pb-2">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Next Steps</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stats.coursesInProgress > 0 ? (
                        <div className="flex items-start gap-3">
                          <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-full mt-0.5">
                            <Play className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Continue Learning</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">You have {stats.coursesInProgress} courses in progress</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-3">
                          <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-full mt-0.5">
                            <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Start Learning</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Begin your learning journey</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-start gap-3">
                        <div className="bg-amber-100 dark:bg-amber-900/50 p-2 rounded-full mt-0.5">
                          <GraduationCap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Explore New Skills</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Discover courses to expand your expertise</p>
                        </div>
                      </div>
                      
                      {stats.completedCourses > 0 && (
                        <div className="flex items-start gap-3">
                          <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-full mt-0.5">
                            <Download className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Get Your Certificates</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Download certificates for {stats.completedCourses} completed courses</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Course Preview Modal */}
      {previewCourse && (
        <Dialog open={!!previewCourse} onOpenChange={() => setPreviewCourse(null)}>
          <DialogContent className="max-w-3xl p-0 overflow-hidden">
            <div className="relative h-48 bg-gradient-to-r from-blue-600 to-blue-800">
              <img
                src={previewCourse.thumbnail || "/placeholder.svg?height=300&width=600&text=Course"}
                alt={previewCourse.title}
                className="w-full h-full object-cover opacity-50"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.svg?height=300&width=600&text=Course";
                }}
              />
              <div className="absolute inset-0 bg-black/30"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <Badge className={`mb-2 ${getDifficultyColor(previewCourse.difficulty)}`}>
                  {previewCourse.difficulty}
                </Badge>
                <h2 className="text-2xl font-bold">{previewCourse.title}</h2>
                {previewCourse.tagline && (
                  <p className="text-white/90 mt-1">{previewCourse.tagline}</p>
                )}
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600 dark:text-gray-300 mb-4">
                <div className="flex items-center">
                  <GraduationCap className="h-4 w-4 mr-1.5 text-blue-600 dark:text-blue-400" />
                  <span>{previewCourse.tutorName || "Instructor"}</span>
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-1.5 fill-yellow-400 text-yellow-400" />
                  <span>{previewCourse.rating} rating</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1.5 text-blue-600 dark:text-blue-400" />
                  <span>{previewCourse.duration}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1.5 text-blue-600 dark:text-blue-400" />
                  <span>Enrolled: {formatDate(previewCourse.enrollmentDate || "")}</span>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">About This Course</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {previewCourse.about}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md border border-gray-200 dark:border-gray-700">
                  <h4 className="font-medium text-gray-800 dark:text-white mb-3">Progress Details</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-300">Overall Progress</span>
                        <span className="font-medium text-gray-800 dark:text-white">{previewCourse.progress}%</span>
                      </div>
                      <Progress
                        value={previewCourse.progress || 0}
                        className="h-2"
                        indicatorClassName={getProgressColor(previewCourse.progress)}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Lessons Completed:</span>
                        <div className="font-medium text-gray-800 dark:text-white">
                          {previewCourse.lessonsCompleted}/{previewCourse.totalLessons}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Chapters:</span>
                        <div className="font-medium text-gray-800 dark:text-white">
                          {previewCourse.chaptersCompleted}/{previewCourse.totalChapters}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Quizzes:</span>
                        <div className="font-medium text-gray-800 dark:text-white">
                          {previewCourse.quizzesCompleted}/{previewCourse.totalQuizzes}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Time Spent:</span>
                        <div className="font-medium text-gray-800 dark:text-white">{previewCourse.timeSpent}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md border border-gray-200 dark:border-gray-700">
                  <h4 className="font-medium text-gray-800 dark:text-white mb-3">Course Details</h4>
                  <div className="grid grid-cols-2 gap-y-3 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Category:</span>
                      <div className="font-medium text-gray-800 dark:text-white">{previewCourse.category}</div>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Difficulty:</span>
                      <div className="font-medium text-gray-800 dark:text-white">{previewCourse.difficulty}</div>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Est. Completion:</span>
                      <div className="font-medium text-gray-800 dark:text-white">{previewCourse.estimatedCompletionTime}</div>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Last Accessed:</span>
                      <div className="font-medium text-gray-800 dark:text-white">
                        {previewCourse.lastAccessed ? formatDate(previewCourse.lastAccessed) : 'Never'}
                      </div>
                    </div>
                  </div>
                  
                  {previewCourse.tags && previewCourse.tags.length > 0 && (
                    <div className="mt-4">
                      <span className="text-gray-500 dark:text-gray-400 text-sm">Tags:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {previewCourse.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => {
                    setPreviewCourse(null);
                    handleNavigateToCourse(previewCourse._id);
                  }}
                >
                  Go to Course
                </Button>
                
                {previewCourse.progress === 100 && previewCourse.certificateAvailable && (
                  <Button
                    variant="outline"
                    className="border-green-200 text-green-600 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-900/20"
                    onClick={() => downloadCertificate(previewCourse._id, previewCourse.title)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Certificate
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

// Empty state component for reuse
const EmptyStateMessage = ({ 
  title, 
  description, 
  buttonText, 
  buttonAction 
}: { 
  title: string; 
  description: string; 
  buttonText: string; 
  buttonAction: () => void;
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-12 text-center">
      <div className="flex flex-col items-center">
        <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-6 mb-6">
          <BookOpen className="h-12 w-12 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-300 max-w-md mb-6">
          {description}
        </p>
        <Button
          onClick={buttonAction}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
};

export default EnrolledCourses;