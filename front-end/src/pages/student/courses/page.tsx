
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Search,
  BookOpen,
  Loader,
  GraduationCap,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { courseService, type Course, type CourseFilterOptions } from "@/services/courseServices/courseService";
import Header from "../components/header";
import debounce from "lodash.debounce";

const CATEGORIES = [
  "Programming",
  "Web Development",
  "Mobile Development",
  "Data Science",
  "Machine Learning",
  "Artificial Intelligence",
  "DevOps",
  "Cloud Computing",
  "Cybersecurity",
  "Blockchain",
  "Game Development",
  "Design",
  "Business",
  "Marketing",
  "Finance",
  "Health & Fitness",
  "Music",
  "Photography",
  "Other",
];

const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];

const AllCoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCourses, setTotalCourses] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1500]);
  const [sortOption, setSortOption] = useState<string>("popular");

  const coursesPerPage = 9;

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const filterOptions: CourseFilterOptions = {
        page: currentPage,
        limit: coursesPerPage,
        search: searchQuery.trim(),
        category: selectedCategories.length > 0 ? selectedCategories.map(c => c.trim()).join(",") : undefined,
        difficulty: selectedDifficulties.length > 0 ? selectedDifficulties.map(d => d.trim()).join(",") : undefined,
        minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
        maxPrice: priceRange[1] < 1500 ? priceRange[1] : undefined,
        sort: sortOption,
      };

      const params = new URLSearchParams();
      Object.entries(filterOptions).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });

      console.log("Fetching courses with filter options:", filterOptions);
      console.log("Query parameters:", params.toString());
      const response = await courseService.getAllCourse(params);
      console.log("API Response:", response);

      if (!response?.courses?.courses || typeof response.courses.total !== "number") {
        throw new Error("Invalid API response structure");
      }

      setCourses(response.courses.courses);
      setTotalCourses(response.courses.total);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Failed to load courses. Please try again.");
      setCourses([]);
      setTotalCourses(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, selectedCategories, selectedDifficulties, priceRange, sortOption]);

  // Trigger fetchCourses when selectedCategories or selectedDifficulties change
  useEffect(() => {
    setCurrentPage(1);
    fetchCourses();
  }, [selectedCategories, selectedDifficulties, fetchCourses]);

  // Initial fetch and other filter changes
  useEffect(() => {
    fetchCourses();
  }, [currentPage, searchQuery, priceRange, sortOption, fetchCourses]);

  const debouncedSearch = debounce(() => {
    setCurrentPage(1);
    fetchCourses();
  }, 500);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    debouncedSearch();
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) => {
      const newCategories = prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category];
      console.log("Updated categories:", newCategories);
      return newCategories;
    });
  };

  const handleDifficultyChange = (difficulty: string) => {
    setSelectedDifficulties((prev) => {
      const newDifficulties = prev.includes(difficulty)
        ? prev.filter((d) => d !== difficulty)
        : [...prev, difficulty];
      console.log("Updated difficulties:", newDifficulties);
      return newDifficulties;
    });
  };

  const handlePriceChange = (value: number[]) => {
    setPriceRange([value[0], value[1]]);
  };

  const handlePriceChangeEnd = () => {
    setCurrentPage(1);
    fetchCourses();
  };

  const handleSortChange = (value: string) => {
    setSortOption(value);
    setCurrentPage(1);
    fetchCourses();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleViewCourse = (courseId: string) => {
    navigate(`/student/courses/${courseId}`);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setSelectedDifficulties([]);
    setPriceRange([0, 1500]);
    setSortOption("popular");
    setCurrentPage(1);
    fetchCourses();
  };

  const totalPages = Math.ceil(totalCourses / coursesPerPage);

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

  return (
    <div className="min-h-screen bg-white dark:bg-gray-800">
      <Header />
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-600 dark:text-gray-300">
            Explore Courses
          </h1>
          <p className="text-gray-600 dark:text-gray-300">Discover courses to enhance your skills and advance your career</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className={`${filtersOpen ? "block" : "hidden"} md:block w-full md:w-64 shrink-0`}>
            <Card className="border-gray-200 dark:border-gray-700 shadow-sm sticky top-24">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-600 dark:text-gray-300">Filters</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 p-0 h-auto"
                    onClick={clearFilters}
                  >
                    Clear All
                  </Button>
                </div>

                <Accordion type="multiple" className="w-full" defaultValue={["categories", "difficulty", "price"]}>
                  <AccordionItem value="categories">
                    <AccordionTrigger className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 py-2">
                      Categories
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                        {CATEGORIES.map((category) => (
                          <div key={category} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`category-${category}`}
                              checked={selectedCategories.includes(category)}
                              onChange={() => handleCategoryChange(category)}
                              className="rounded border-gray-300 dark:border-gray-700 text-blue-600 dark:text-blue-400 focus:ring-blue-500"
                            />
                            <label
                              htmlFor={`category-${category}`}
                              className="ml-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer"
                            >
                              {category}
                            </label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="difficulty">
                    <AccordionTrigger className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 py-2">
                      Difficulty
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        {DIFFICULTIES.map((difficulty) => (
                          <div key={difficulty} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`difficulty-${difficulty}`}
                              checked={selectedDifficulties.includes(difficulty)}
                              onChange={() => handleDifficultyChange(difficulty)}
                              className="rounded border-gray-300 dark:border-gray-700 text-blue-600 dark:text-blue-400 focus:ring-blue-500"
                            />
                            <label
                              htmlFor={`difficulty-${difficulty}`}
                              className="ml-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer"
                            >
                              {difficulty}
                            </label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="price">
                    <AccordionTrigger className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 py-2">
                      Price Range
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 px-1">
                        <Slider
                          defaultValue={[0, 1500]}
                          value={priceRange}
                          min={0}
                          max={1500}
                          step={50}
                          onValueChange={handlePriceChange}
                          onValueCommit={handlePriceChangeEnd}
                          className="mt-6"
                        />
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-300">₹{priceRange[0]}</span>
                          <span className="text-sm text-gray-600 dark:text-gray-300">₹{priceRange[1]}</span>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </div>

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-600 dark:text-blue-400" />
                <Input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10 border-gray-200 dark:border-gray-700 focus:border-blue-400 dark:focus:border-blue-400 focus:ring-blue-400"
                />
              </div>
              <Select value={sortOption} onValueChange={handleSortChange}>
                <SelectTrigger className="w-full sm:w-[180px] border-gray-200 dark:border-gray-700">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="mb-4 text-sm text-gray-600 dark:text-gray-300">
              {loading ? (
                <div className="flex items-center">
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Loading courses...
                </div>
              ) : (
                <div>
                  Showing {courses.length} of {totalCourses} courses
                  {(selectedCategories.length > 0 ||
                    selectedDifficulties.length > 0 ||
                    priceRange[0] > 0 ||
                    priceRange[1] < 1500 ||
                    searchQuery.length > 0) && <span> (filtered)</span>}
                </div>
              )}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      <div className="flex items-center mb-4">
                        <Skeleton className="h-4 w-32 mr-2" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-px w-full mb-3" />
                      <Skeleton className="h-9 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : courses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <BookOpen className="h-16 w-16 text-blue-600 dark:text-blue-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">No courses found</h3>
                <p className="text-gray-600 dark:text-gray-300 max-w-md mb-6">
                  We couldn't find any courses matching your criteria. Try adjusting your filters or search query.
                </p>
                <Button
                  variant="outline"
                  className="border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <Card
                    key={course._id}
                    className="border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group cursor-pointer"
                    onClick={() => handleViewCourse(course._id)}
                  >
                    <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-700">
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail || "/placeholder.svg"}
                          alt={course.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "/placeholder.svg?height=192&width=384&text=Course";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                          <BookOpen className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent h-16"></div>
                    </div>
                    <CardContent className="p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <Badge className={`${getDifficultyColor(course.difficulty)}`}>{course.difficulty}</Badge>
                        <span className="font-bold text-gray-600 dark:text-gray-300">₹{course.price.toFixed(2)}</span>
                      </div>
                      <h3 className="font-semibold text-gray-600 dark:text-gray-300 text-lg mb-1 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">{course.tagline}</p>

                      <div className="flex flex-wrap items-center text-xs text-gray-600 dark:text-gray-300 mb-4 gap-x-3 gap-y-1">
                        <div className="flex items-center">
                          <GraduationCap className="h-3.5 w-3.5 mr-1 text-blue-600 dark:text-blue-400" />
                          <span>{course.tutorName || "Instructor"}</span>
                        </div>
                        <div className="flex items-center">
                          <Star className="h-3.5 w-3.5 mr-1 fill-yellow-400 text-yellow-400" />
                          <span>4.8</span>
                        </div>
                      </div>

                      <Separator className="my-3 bg-gray-200 dark:bg-gray-700" />

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleViewCourse(course._id);
                        }}
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!loading && totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Previous
                  </Button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (page) =>
                        page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)
                    )
                    .map((page, index, array) => (
                      <React.Fragment key={page}>
                        {index > 0 && array[index - 1] !== page - 1 && <span className="text-gray-600 dark:text-gray-300">...</span>}
                        <Button
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className={
                            currentPage === page
                              ? "bg-blue-600 text-white hover:bg-blue-700"
                              : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          }
                        >
                          {page}
                        </Button>
                      </React.Fragment>
                    ))}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllCoursesPage;
