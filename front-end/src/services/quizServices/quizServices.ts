import { authAxiosInstance } from "@/api/authAxiosInstance"
import { toast } from "sonner"
import { AxiosError } from "axios"

export interface QuizOption {
  text: string
}

export interface Quiz {
  _id: string
  lesson_id: string
  question: string
  options: string[]
  answer: string
  createdAt?: string
  updatedAt?: string
}

export interface QuizInput {
  lesson_id: string
  question: string
  options: string[]
  answer: string
}

export interface QuizResponse {
  success: boolean
  message: string
  quiz: Quiz
}

export interface QuizzesResponse {
  success: boolean
  message: string
  quiz: Quiz[]
}

export const quizService = {
  /**
   * Add a new quiz to a lesson
   */
  async addQuiz(lessonId: string, quizData: Omit<QuizInput, "lesson_id">): Promise<QuizResponse> {
    try {
      const data = {
        ...quizData,
        lesson_id: lessonId,
      }
      
      console.log("addQuiz request:", data)
      const response = await authAxiosInstance.post(`/quiz/lesson/${lessonId}/quiz`, data)
      console.log("addQuiz response:", response.data)
      toast.success("Quiz added successfully")
      return response.data
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Failed to add quiz:", error)
        const message =
          error.response?.data?.message ||
          (error.request ? "Network error: Unable to connect to the server" : "Failed to add quiz")
        toast.error(message)
        throw new Error(message)
      } else {
        console.error("Unexpected error:", error)
        toast.error("An unexpected error occurred")
        throw error
      }
    }
  },

  /**
   * Get a quiz by ID
   */
  async getQuizById(quizId: string): Promise<QuizResponse> {
    try {
      const response = await authAxiosInstance.get(`/quiz/lesson/${quizId}`)
      console.log("getQuizById response:", response.data)
      return response.data
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Failed to fetch quiz:", error)
        const message =
          error.response?.data?.message ||
          (error.request ? "Network error: Unable to connect to the server" : "Failed to fetch quiz")
        toast.error(message)
        throw new Error(message)
      } else {
        console.error("Unexpected error:", error)
        toast.error("An unexpected error occurred")
        throw error
      }
    }
  },

  /**
   * Get quizzes for a lesson
   */
  async getQuizzesByLessonId(lessonId: string): Promise<QuizzesResponse> {
    try {
      const response = await authAxiosInstance.get(`/quiz/lesson/${lessonId}/quizId`)
      console.log("getQuizzesByLessonId response:", response.data)
      return response.data
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Failed to fetch quizzes:", error)
        const message =
          error.response?.data?.message ||
          (error.request ? "Network error: Unable to connect to the server" : "Failed to fetch quizzes")
        toast.error(message)
        throw new Error(message)
      } else {
        console.error("Unexpected error:", error)
        toast.error("An unexpected error occurred")
        throw error
      }
    }
  },

  /**
   * Update a quiz
   */
  async updateQuiz(quizId: string, quizData: Partial<QuizInput>): Promise<QuizResponse> {
    try {
      console.log("updateQuiz request:", quizData)
      const response = await authAxiosInstance.put(`/quiz/quiz/${quizId}`, quizData)
      console.log("updateQuiz response:", response.data)
      toast.success("Quiz updated successfully")
      return response.data
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Failed to update quiz:", error)
        const message =
          error.response?.data?.message ||
          (error.request ? "Network error: Unable to connect to the server" : "Failed to update quiz")
        toast.error(message)
        throw new Error(message)
      } else {
        console.error("Unexpected error:", error)
        toast.error("An unexpected error occurred")
        throw error
      }
    }
  },

  /**
   * Delete a quiz
   */
  async deleteQuiz(quizId: string): Promise<void> {
    try {
      const response = await authAxiosInstance.delete(`/quiz/quiz/${quizId}`)
      console.log("deleteQuiz response:", response.data)
      toast.success("Quiz deleted successfully")
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Failed to delete quiz:", error)
        const message =
          error.response?.data?.message ||
          (error.request ? "Network error: Unable to connect to the server" : "Failed to delete quiz")
        toast.error(message)
        throw new Error(message)
      } else {
        console.error("Unexpected error:", error)
        toast.error("An unexpected error occurred")
        throw error
      }
    }
  },
}
