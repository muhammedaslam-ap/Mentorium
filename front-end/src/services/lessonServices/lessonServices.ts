import { authAxiosInstance } from "@/api/authAxiosInstance";
import { AxiosError } from "axios";
import { toast } from "sonner";

export interface Lesson {
  _id: string;
  title: string;
  courseId: string;
  description: string;
  file: string;
  duration?: number;
  order?: number;
  createdAt?: string;
}

export const lessonService = {
  async addLesson(courseId: string, formData: FormData) {
    try {
      const url = `/tutor/courses/${courseId}/lessons`;
      console.log(`Sending POST request to: ${url}`);
      const response = await authAxiosInstance.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 120000, // 2 minutes for video upload
      });
      console.log("addLesson Response:", response.data);
      toast.success("Lesson added successfully");
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage = error?.response?.data?.message || "Failed to add lesson";
        console.error("Error adding lesson:", errorMessage, error);
        toast.error(errorMessage);
        throw error;
      }
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred");
      throw error;
    }
  },

  async getLesson(lessonId: string) {
    try {
      const response = await authAxiosInstance.get(`/tutor/lessons/${lessonId}`);
      console.log("getLesson Response:", response.data);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage = error?.response?.data?.message || "Failed to fetch lesson";
        console.error("Error fetching lesson:", errorMessage, error);
        toast.error(errorMessage);
        throw error;
      }
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred");
      throw error;
    }
  },

  async getLessonsByCourse(courseId: string) {
    try {
      const response = await authAxiosInstance.get(`/tutor/courses/${courseId}/lessons`);
      console.log("getLessonsByCourse Response:----------------->", response.data);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage = error?.response?.data?.message || "Failed to fetch lessons";
        console.error("Error fetching lessons:", errorMessage, error);
        toast.error(errorMessage);
        throw error;
      }
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred");
      throw error;
    }
  },

  async updateLesson(lessonId: string, formData: FormData) {
    try {
      const response = await authAxiosInstance.put(`/tutor/lessons/${lessonId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 120000, // 2 minutes for video upload
      });
      console.log("updateLesson Response:", response.data);
      toast.success("Lesson updated successfully");
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage = error?.response?.data?.message || "Failed to update lesson";
        console.error("Error updating lesson:", errorMessage, error);
        toast.error(errorMessage);
        throw error;
      }
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred");
      throw error;
    }
  },

  async deleteLesson(lessonId: string) {
    try {
      const response = await authAxiosInstance.delete(`/tutor/lessons/${lessonId}`);
      console.log("deleteLesson Response:", response.data);
      toast.success("Lesson deleted successfully");
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage = error?.response?.data?.message || "Failed to delete lesson";
        console.error("Error deleting lesson:", errorMessage, error);
        toast.error(errorMessage);
        throw error;
      }
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred");
      throw error;
    }
  },
};