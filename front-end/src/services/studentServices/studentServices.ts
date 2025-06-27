import { authAxiosInstance } from "@/api/authAxiosInstance"
import { toast } from "sonner"


export interface StudentProfile {
  education?: string
  aboutMe?: string
  interests?: string
}

export interface ProfileResponse {
  success?: boolean
  profile?: StudentProfile | null
  message?: string
}


export const studentService = {
  async getProfile(): Promise<ProfileResponse> {
    try {
      const response = await authAxiosInstance.get("/student/profile");
      console.log("getProfile response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("getProfile error:", error.response?.data || error.message);
      toast.info(error.response?.data?.message || error.message || "Unable to fetch profile");
      return { success: false, profile: null, message: error?.response?.data?.message || "Unable to fetch profile" };
    }
  },

  async createProfile(profileData: StudentProfile) {
    try {
      console.log("createProfile request:", profileData);
      const response = await authAxiosInstance.post("/student/profile", profileData);
      console.log("createProfile response:", response.data);
      toast.success("Profile created successfully"); // Ensure success toast is triggered
      return response.data;
    } catch (error: any) {
      console.error("createProfile error:", error.response?.data || error.message);
      toast.error(error?.response?.data?.message || "Unable to create profile");
      throw error;
    }
  },

  async updateProfile(profileData: StudentProfile) {
    try {
      console.log("updateProfile request:", profileData);
      const response = await authAxiosInstance.put("/student/editProfile", profileData);
      console.log("updateProfile response:", response.data);
      toast.success("Profile updated successfully");
      return response.data;
    } catch (error: any) {
      console.error("updateProfile error:", error.response?.data || error.message);
      toast.error(error?.response?.data?.message || "Unable to update profile");
      throw error;
    }
  },

  async logoutStudent() {
    try {
      const response = await authAxiosInstance.post("/auth/logout");
      toast.success("Logged out successfully");
      return response.data;
    } catch (error: any) {
      console.error("Logout failed:", error);
      const errorMessage = error?.response?.data?.message || "Failed to sign out";
      toast.error(errorMessage);
      throw error;
    }
  },

  async studentDetails() {
    try {
      const response = await authAxiosInstance.get("/student/details");
      console.log("studentDetails response:------------------->", response.data);
      return response.data;
    } catch (error: any) {
      console.error("studentDetails error:", error);
      return null;
    }
  },
};