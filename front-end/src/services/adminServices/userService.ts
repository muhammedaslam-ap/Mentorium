import { authAdminAxiosInstance } from "@/api/authAdminInstance";
import { AxiosError } from "axios";
import { toast } from "sonner"; 

export const studentService = {
  async userList(currentPage: number, rowsPerPage: number, searchQuery: string) {
    try {
      const { data } = await authAdminAxiosInstance.get("/admin/usersList", {
        params: {
          page: currentPage,
          pageSize: rowsPerPage, 
          search: searchQuery,
          role: "student",
        },
      });
      return data; 
    } catch (error ) {
        const axiosError = error as AxiosError<{ message: string }>;
      console.error(axiosError);
      toast.error(axiosError?.response?.data?.message || "Failed to fetch tutor list");
      throw error;
    }
  },

  async blockUser(userId: string, newBlocked: boolean) {
    try {
      await authAdminAxiosInstance.patch(`/admin/${userId}/status`, {
        status: newBlocked,
      });
      toast.success(newBlocked ? "Tutor blocked successfully" : "Tutor unblocked successfully");
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      console.error(error);
      toast.error(axiosError?.response?.data?.message || "Failed to update tutor status");
      throw error;
    }
  },
};
