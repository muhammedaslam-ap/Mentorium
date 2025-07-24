import { authAdminAxiosInstance } from "@/api/authAdminInstance";
import { AxiosError } from "axios";
import { toast } from "sonner"; 

export const tutorService = {
  async userList(currentPage: number, rowsPerPage: number, searchQuery: string) {
    try {
      const { data } = await authAdminAxiosInstance.get("/admin/usersList", {
        params: {
          page: currentPage,
          pageSize: rowsPerPage, 
          search: searchQuery,
          role: "tutor",
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

  async blockTutor(tutorId: string, newBlocked: boolean) {
    try {
      await authAdminAxiosInstance.patch(`/admin/${tutorId}/status`, {
        status: newBlocked,
      });
      toast.success(newBlocked ? " blocked successfully" : " unblocked successfully");
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      console.error(error);
      toast.error(axiosError?.response?.data?.message || "Failed to update tutor status");
      throw error;
    }
  },

  async tutorApproval(tutorToApprove: string) {
    try {
      await authAdminAxiosInstance.patch(`/admin/${tutorToApprove}/approve`);
      toast.success("Tutor approved successfully");
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      console.error(error);
      toast.error(axiosError?.response?.data?.message || "Failed to approve tutor");
      throw error;
    }
  },

  async getAdminDocumentPresignedUrl(tutorId: string): Promise<string | null> {
  try {
    const response = await authAdminAxiosInstance.get(`/admin/tutors/${tutorId}/document`);
    console.log("Pre-signed URL response:", response.data);
    return response.data.url;
  } catch (error: any) {
    console.error("Error fetching admin document URL:", error.response?.data || error.message);
    toast.error("Failed to load document URL: " + (error.response?.data?.message || error.message));
    return null;
  }
},

  async tutorReject(tutorToReject: string, rejectionReason: string) {
    try {
      await authAdminAxiosInstance.patch(`/admin/${tutorToReject}/reject`, {
        reason: rejectionReason,
      });
      toast.success("Tutor rejected successfully");
    } catch (error) {
        const axiosError = error as AxiosError<{ message: string }>;
      console.error(error);
      toast.error(axiosError?.response?.data?.message || "Failed to reject tutor");
      throw error;
    }
  },
};
