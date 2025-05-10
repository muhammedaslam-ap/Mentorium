import { authAxiosInstance } from "@/api/authAxiosInstance"
import { AxiosError } from "axios"
import { toast } from "sonner"

export const courseService = {
  async getCourseDetails(courseId: string) {
    try {
      const response = await authAxiosInstance.get(`/courses/${courseId}`)
      console.log("getCourseDetails Response:", response.data)
      const foundCourse = response.data?.course
      if (!foundCourse) {
        throw new Error("Course not found")
      }
      return foundCourse
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Failed to fetch course details:", error)
        const message =
          error.response?.data?.message ||
          (error.request ? "Network error: Unable to connect to the server" : "Failed to load course details")
        toast.error(message)
        return null // Returning null on error
      } else {
        console.error("Unexpected error:", error)
        toast.error("An unexpected error occurred")
        return null
      }
    }
  },

  async getCourseDetailsInStudentSide(courseId: string) {
    try {
      const response = await authAxiosInstance.get(`/student/courses/${courseId}`)
      console.log("getCourseDetailsin user side Response:", response.data)
      const foundCourse = response.data?.course
      if (!foundCourse) {
        throw new Error("Course not found")
      }
      return foundCourse
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Failed to fetch course details:", error)
        const message =
          error.response?.data?.message ||
          (error.request ? "Network error: Unable to connect to the server" : "Failed to load course details")
        toast.error(message)
        return null // Returning null on error
      } else {
        console.error("Unexpected error:", error)
        toast.error("An unexpected error occurred")
        return null
      }
    }
  },

  async getSpecificTutorCourse(page: number, limit: number, search = "") {
    try {
      const { data } = await authAxiosInstance.get("/courses/my-courses", {
        params: { page, limit, search },
      })
      if (!data.success) {
        throw new Error(data.message || "Failed to fetch courses")
      }
      return {
        data: {
          courses: data.courses || [],
          totalCourses: data.totalCourses || 0,
        },
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Failed to fetch tutor courses:", error)
        const status = error.response?.status
        let message = error.response?.data?.message || "Failed to load tutor courses"
        if (status === 401) {
          message = "Please log in to view your courses"
          toast.error(message)
          window.location.href = "/login"
        } else if (status === 403) {
          message = "You do not have permission to view these courses"
          toast.error(message)
        } else {
          message = error.request ? "Network error: Unable to connect to the server" : message
          toast.error(message)
        }
        return { data: { courses: [], totalCourses: 0 } }
      } else {
        console.error("Unexpected error:", error)
        toast.error("An unexpected error occurred")
        return { data: { courses: [], totalCourses: 0 } }
      }
    }
  },

  async deleteCourse(courseToDelete: string) {
    try {
      const response = await authAxiosInstance.delete(`/courses/delete/${courseToDelete}`)
      console.log("deleteCourse Response:", response.data)
      toast.success("Course deleted successfully")
      return response.data
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Failed to delete course:", error)
        const message =
          error.response?.data?.message ||
          (error.request ? "Network error: Unable to connect to the server" : "Failed to delete course")
        toast.error(message)
      } else {
        console.error("Unexpected error:", error)
        toast.error("An unexpected error occurred")
      }
    }
  },

  async getAllCourse(params: URLSearchParams) {
    try {
      const response = await authAxiosInstance.get(`/student/all-courses?${params.toString()}`)
      console.log("getAllCourse Response:", response.data)
      return response.data
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Failed to fetch courses:", error)
        const message =
          error.response?.data?.message ||
          (error.request ? "Network error: Unable to connect to the server" : "Failed to load courses")
        toast.error(message)
        throw new Error(message)
      } else {
        console.error("Unexpected error:", error)
        toast.error("An unexpected error occurred")
        throw error
      }
    }
  },

  async getAllCourses(page: number, limit: number) {
    try {
      const { data } = await authAxiosInstance.get("/student/all-courses", {
        params: { page, limit },
      })
      console.log("getAllCourses Response:", data)
      return data
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Failed to get all courses:", error)
        const message =
          error.response?.data?.message ||
          (error.request ? "Network error: Unable to connect to the server" : "Failed to load courses")
        toast.error(message)
        throw new Error(message)
      } else {
        console.error("Unexpected error:", error)
        toast.error("An unexpected error occurred")
        throw error
      }
    }
  },

  async createCourse(formData: FormData): Promise<void> {
    try {
      const formDataEntries = Array.from(formData.entries())
      console.log("createCourse FormData:", formDataEntries)
      await authAxiosInstance.post("/courses/add", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      toast.success("Course created successfully")
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Failed to create course:", error)
        const message =
          error.response?.data?.message ||
          (error.request ? "Network error: Unable to connect to the server" : "Failed to create course")
        toast.error(message)
      } else {
        console.error("Unexpected error:", error)
        toast.error("An unexpected error occurred")
      }
    }
  },

  async updateCourse(courseId: string, formData: FormData): Promise<void> {
    try {
      const formDataEntries = Array.from(formData.entries())
      console.log("updateCourse FormData:", formDataEntries)
      await authAxiosInstance.put(`/courses/update/${courseId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      toast.success("Course updated successfully")
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Failed to update course:", error)
        const message =
          error.response?.data?.message ||
          (error.request ? "Network error: Unable to connect to the server" : "Failed to update course")
        toast.error(message)
      } else {
        console.error("Unexpected error:", error)
        toast.error("An unexpected error occurred")
      }
    }
  },

  // New methods for lesson management
  async getLessonsByCourse(courseId: string) {
    try {
      const response = await authAxiosInstance.get(`/tutor/courses/${courseId}/lessons`)
      console.log("getLessonsByCourse Response:", response.data)
      return response.data
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Failed to fetch lessons:", error)
        // Don't show toast here as this might be called in the background
        return { data: { lessons: [] } }
      } else {
        console.error("Unexpected error:", error)
        return { data: { lessons: [] } }
      }
    }
  },

  async addLesson(courseId: string, formData: FormData) {
    try {
      const response = await authAxiosInstance.post(`/tutor/courses/${courseId}/lessons`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60000, // 60 seconds for video upload
      })
      console.log("addLesson Response:", response.data)
      toast.success("Lesson added successfully")
      return response.data
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Failed to add lesson:", error)
        const message =
          error.response?.data?.message ||
          (error.request ? "Network error: Unable to connect to the server" : "Failed to add lesson")
        toast.error(message)
        throw error
      } else {
        console.error("Unexpected error:", error)
        toast.error("An unexpected error occurred")
        throw error
      }
    }
  },

  async updateLesson(lessonId: string, formData: FormData) {
    try {
      const response = await authAxiosInstance.put(`/tutor/lessons/${lessonId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60000, // 60 seconds for video upload
      })
      console.log("updateLesson Response:", response.data)
      toast.success("Lesson updated successfully")
      return response.data
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Failed to update lesson:", error)
        const message =
          error.response?.data?.message ||
          (error.request ? "Network error: Unable to connect to the server" : "Failed to update lesson")
        toast.error(message)
        throw error
      } else {
        console.error("Unexpected error:", error)
        toast.error("An unexpected error occurred")
        throw error
      }
    }
  },

  async deleteLesson(lessonId: string) {
    try {
      const response = await authAxiosInstance.delete(`/tutor/lessons/${lessonId}`)
      console.log("deleteLesson Response:", response.data)
      toast.success("Lesson deleted successfully")
      return response.data
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Failed to delete lesson:", error)
        const message =
          error.response?.data?.message ||
          (error.request ? "Network error: Unable to connect to the server" : "Failed to delete lesson")
        toast.error(message)
        throw error
      } else {
        console.error("Unexpected error:", error)
        toast.error("An unexpected error occurred")
        throw error
      }
    }
  },

  async getLesson(lessonId: string) {
    try {
      const response = await authAxiosInstance.get(`/tutor/lessons/${lessonId}`)
      console.log("getLesson Response:", response.data)
      return response.data
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Failed to fetch lesson:", error)
        const message =
          error.response?.data?.message ||
          (error.request ? "Network error: Unable to connect to the server" : "Failed to fetch lesson")
        toast.error(message)
        return null
      } else {
        console.error("Unexpected error:", error)
        toast.error("An unexpected error occurred")
        return null
      }
    }
  },
}
