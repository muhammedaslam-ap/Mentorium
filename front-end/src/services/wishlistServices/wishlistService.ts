import { authAxiosInstance } from "@/api/authAxiosInstance"
import { toast } from "sonner"
import { AxiosError } from "axios"
import type { Course } from "@/services/courseServices/courseService"

export interface WishlistResponse {
  success: boolean
  message: string
  courses: Course[]
}

export const wishlistService = {

  async getWishlist(page = 1, limit = 10): Promise<Course[]> {
    try {
      const response = await authAxiosInstance.get("/wishlist", {
            params: { page: Number(page), limit: Number(limit) },
          });
          console.log("getWishlist Response:", response.data);
          const courses = response.data.courses || [];
          if (courses.length === 0) {
            toast.info("Your wishlist is empty");
          }
          return courses;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Failed to fetch wishlist:", error)
        const message =
          error.response?.data?.message ||
          (error.request ? "Network error: Unable to connect to the server" : "Failed to load wishlist")
        toast.error(message)
        throw new Error(message)
      } else {
        console.error("Unexpected error:", error)
        toast.error("An unexpected error occurred")
        throw error
      }
    }
  },


  async addToWishlist(courseId: string): Promise<WishlistResponse> {
    try {
      const response = await authAxiosInstance.post(`/wishlist/${courseId}`)
      console.log("addToWishlist Response:", response.data)
      toast.success("Course added to wishlist")
      return response.data
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Failed to add to wishlist:", error)
        const message =
          error.response?.data?.message ||
          (error.request ? "Network error: Unable to connect to the server" : "Failed to add to wishlist")
        toast.error(message)
        throw new Error(message)
      } else {
        console.error("Unexpected error:", error)
        toast.error("An unexpected error occurred")
        throw error
      }
    }
  },


  async removeFromWishlist(courseId: string): Promise<WishlistResponse> {
    try {
      const response = await authAxiosInstance.delete(`/wishlist/${courseId}`)
      console.log("removeFromWishlist Response:", response.data)
      toast.success("Course removed from wishlist")
      return response.data
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Failed to remove from wishlist:", error)
        const message =
          error.response?.data?.message ||
          (error.request ? "Network error: Unable to connect to the server" : "Failed to remove from wishlist")
        toast.error(message)
        throw new Error(message)
      } else {
        console.error("Unexpected error:", error)
        toast.error("An unexpected error occurred")
        throw error
      }
    }
  },


  async isInWishlist(courseId: string): Promise<boolean> {
    try {
      const wishlist = await this.getWishlist()
      return wishlist.some((course) => course._id === courseId)
    } catch (error) {
      console.error("Error checking wishlist status:", error)
      return false
    }
  },
}
