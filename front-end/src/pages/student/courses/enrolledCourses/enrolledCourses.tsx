import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { BookOpen, Star, GraduationCap } from "lucide-react";
import { authAxiosInstance } from "@/api/authAxiosInstance";
import Header from "../../components/header";
import Sidebar from "../../components/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

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
  thumbnail?: string;
  difficulty: string;
  category: string;
  tutorName?: string;
  tutor?: Tutor;
  tutorId?: string;
  ratings?: number;
  reviewCount?: number;
}

const CourseCard = React.memo(
  ({
    course,
    onNavigate,
    getDifficultyColor,
  }: {
    course: Course;
    onNavigate: (courseId: string) => void;
    getDifficultyColor: (difficulty: string) => string;
  }) => {
    return (
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-lg hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full">
        <div className="relative">
          <div
            className="h-48 overflow-hidden cursor-pointer group"
            onClick={() => onNavigate(course._id)}
          >
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                console.warn(`Thumbnail load failed for course ${course._id}: ${course.thumbnail}`);
                (e.target as HTMLImageElement).src =
                  "/placeholder.svg?height=192&width=384&text=Course";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        </div>

        <CardContent className="p-5 flex-grow">
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge className={getDifficultyColor(course.difficulty)}>
              {course.difficulty}
            </Badge>
            <Badge
              variant="outline"
              className="border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-300"
            >
              {course.category}
            </Badge>
          </div>

          <h3
            className="font-semibold text-gray-800 dark:text-white text-lg mb-2 line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
            onClick={() => onNavigate(course._id)}
          >
            {course.title}
          </h3>

          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-3">
            <GraduationCap className="h-4 w-4 mr-1.5 text-blue-600 dark:text-blue-400" />
            <span>{course.tutorName}</span>
          </div>

          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <Star className="h-4 w-4 mr-1.5 fill-yellow-400 text-yellow-400" />
            <span>{course.ratings} rating</span>
          </div>
        </CardContent>

        <CardFooter className="p-5 pt-0">
          <Button
            className="w-full bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => onNavigate(course._id)}
          >
            View Course
          </Button>
        </CardFooter>
      </Card>
    );
  }
);

const LazyCourseCard = React.lazy(() =>
  Promise.resolve({ default: CourseCard })
);

const EnrolledCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 9;
  const maxRetries = 3;

  const fetchEnrolledCourses = useCallback(
    async (retryCount = 0) => {
      setLoading(true);
      try {
        console.log(`Fetching enrolled courses: page=${page}, limit=${limit}`);
        const response = await authAxiosInstance.get(
          `/purchase/enrolledCourses?page=${page}&limit=${limit}`
        );
        console.log("Enrolled courses response:", JSON.stringify(response.data, null, 2));

        if (response.data && Array.isArray(response.data.courses)) {
          const coursesData = response.data.courses.map((course: any) => ({
            _id: course._id || "",
            title: course.title || "Untitled Course",
            thumbnail: course.thumbnail || "/placeholder.svg?height=192&width=384&text=Course",
            difficulty: course.difficulty || "Beginner",
            category: course.category || "General",
            tutorName: course.tutor?.name || course.tutorName || "Instructor",
            tutor: course.tutor,
            tutorId: course.tutorId,
            ratings: course.ratings ?? 4.8,
            reviewCount: course.reviewCount ?? 42,
          }));

          setCourses(coursesData);
          setTotalPages(Math.ceil(response.data.total / limit));

          console.log(
            "Processed courses:",
            coursesData.map((course: Course) => ({
              id: course._id,
              title: course.title,
              thumbnail: course.thumbnail,
            }))
          );
        } else {
          setCourses([]);
          setTotalPages(1);
          toast.info("No enrolled courses found.");
        }
      } catch (error: any) {
        console.error(`Error fetching enrolled courses (attempt ${retryCount + 1}):`, error);
        if (retryCount < maxRetries - 1) {
          const delay = Math.pow(2, retryCount) * 1000;
          console.log(`Retrying after ${delay}ms...`);
          setTimeout(() => fetchEnrolledCourses(retryCount + 1), delay);
        } else {
          let errorMessage = "Failed to load your enrolled courses.";
          if (error.response?.status === 404) {
            errorMessage = "No enrolled courses found.";
          } else if (error.response?.status === 401) {
            errorMessage = "Please log in to view your courses.";
          }
          toast.error(errorMessage);
          setCourses([]);
          setTotalPages(1);
        }
      } finally {
        setLoading(false);
      }
    },
    [page]
  );

  useEffect(() => {
    fetchEnrolledCourses();
  }, [fetchEnrolledCourses]);

  const handleNavigateToCourse = useCallback(
    (courseId: string) => {
      if (!courseId) {
        console.error("handleNavigateToCourse: courseId is undefined");
        toast.error("Invalid course ID");
        return;
      }
      try {
        console.log("Navigating to course:", courseId);
        navigate(`/student/courses/${courseId}`);
      } catch (error) {
        console.error("Navigation error in handleNavigateToCourse:", error);
        toast.error("Failed to navigate to course");
        try {
          navigate("/student/courses");
        } catch (fallbackError) {
          console.error("Fallback navigation error:", fallbackError);
          toast.error("Navigation failed");
        }
      }
    },
    [navigate]
  );

  const getDifficultyColor = useCallback((difficulty: string) => {
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
  }, []);

  const memoizedCourses = useMemo(() => courses, [courses]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="flex">
        <Sidebar sidebarOpen={true} />
        <div className="flex-1 md:ml-64">
          <div className="container mx-auto max-w-6xl px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
              My Enrolled Courses
            </h1>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Card
                    key={index}
                    className="border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
                  >
                    <Skeleton className="h-48 w-full" />
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-5 w-16" />
                      </div>
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full mb-3" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <Skeleton className="h-9 w-full" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : memoizedCourses.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-12 text-center">
                <BookOpen className="mb-4 h-20 w-20 text-gray-300 dark:text-gray-600" />
                <h3 className="mb-2 text-2xl font-bold text-gray-800 dark:text-gray-100">
                  No Enrolled Courses
                </h3>
                <p className="mb-6 text-gray-600 dark:text-gray-300">
                  You haven't enrolled in any courses yet. Explore our catalog to start learning!
                </p>
                <Button
                  onClick={() => {
                    try {
                      navigate("/student/courses");
                    } catch (error) {
                      console.error("Navigation error in EmptyStateMessage:", error);
                      toast.error("Failed to navigate to courses");
                    }
                  }}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  Browse Courses
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Suspense
                    fallback={Array.from({ length: memoizedCourses.length }).map((_, index) => (
                      <Card
                        key={index}
                        className="border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
                      >
                        <Skeleton className="h-48 w-full" />
                        <CardContent className="p-4">
                          <Skeleton className="h-6 w-3/4 mb-2" />
                          <Skeleton className="h-4 w-full mb-3" />
                          <Skeleton className="h-4 w-1/2" />
                        </CardContent>
                        <CardFooter className="p-4 pt-0">
                          <Skeleton className="h-9 w-full" />
                        </CardFooter>
                      </Card>
                    ))}
                  >
                    {memoizedCourses.map((course) => (
                      <LazyCourseCard
                        key={course._id}
                        course={course}
                        onNavigate={handleNavigateToCourse}
                        getDifficultyColor={getDifficultyColor}
                      />
                    ))}
                  </Suspense>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(EnrolledCourses);
