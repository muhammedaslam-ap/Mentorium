import { authAxiosInstance } from '@/api/authAxiosInstance';
import { AxiosError } from 'axios';
import { toast } from 'sonner';

interface EnrollmentStatusResponse {
  success: boolean;
  data?: { isEnrolled: boolean };
  isEnrolled?: boolean;
  message?: string;
}



export const enrollmentService = {
  async checkEnrollmentStatus(courseId: string): Promise<EnrollmentStatusResponse> {
    if (!courseId) {
      throw new Error('Course ID is required');
    }

    try {
      const response = await authAxiosInstance.get(`/purchase/enrollments/${courseId}`);
      console.log("Enrollment API response:--------------------------------------------->", response.data);

      const data = response.data as EnrollmentStatusResponse;
      if (!data.success) {
        throw new Error(data.message || "Failed to check enrollment status");
      }

      return data;
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

}
  
};