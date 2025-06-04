import { authAxiosInstance } from '@/api/authAxiosInstance';
import { AxiosError } from 'axios';
import { toast } from 'sonner';

export const paymentService = {
  async enroll(
    courseId: string,
    paymentIntentId: string,
    amount: number,
    isStripe: boolean
  ): Promise<void> {
    if (!courseId || !paymentIntentId || !amount) {
      throw new Error('Missing required fields');
    }
    try {
      const response = await authAxiosInstance.post('/payment/enrollment', {
        courseId,
        paymentIntentId,
        amount,
        isStripe,
      });
        toast.success(`course enrolled successfully`)

      if (!response.data.success) {
        throw new Error('Enrollment failed');
      }
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
};