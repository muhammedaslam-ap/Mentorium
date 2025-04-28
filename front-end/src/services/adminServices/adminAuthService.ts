import { authAdminAxiosInstance } from "@/api/authAdminInstance";
import { LoginFormData } from "@/validation";

export const adminService = {
  async loginAdmin(data: LoginFormData) {
    try {
      const response = await authAdminAxiosInstance.post("/auth/admin/login", {
        ...data,
        role: "admin",
      });
      console.log(response)

      return response;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  async logoutAdmin() {
    try {
      const response = await authAdminAxiosInstance.post("/admin/logout");
      localStorage.removeItem('adminDatas');
      return response;
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  },
};
