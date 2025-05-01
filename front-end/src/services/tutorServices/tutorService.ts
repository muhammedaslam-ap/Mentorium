import { toast } from "sonner";
import { authAxiosInstance } from "../../api/authAxiosInstance";

interface ProfileData {
  name: string;
  specialization: string;
  phone: string;
  bio?: string;
}

interface ProfileResponse {
  profile?: {
    name?: string | null;
    specialization?: string | null;
    phone?: string | null;
    bio?: string | null;
    isAccepted?: boolean | null;
    rejectionReason?: string | null;
    verificationDocUrl?: string | null;
  } | null;
}

export class TutorService {
  async createProfile(profileData: ProfileData, file: File | null) {
    try {
      const formData = new FormData();
      formData.append("name", profileData.name);
      formData.append("specialization", profileData.specialization);
      formData.append("phone", profileData.phone);
      if (profileData.bio) {
        formData.append("bio", profileData.bio);
      }
      if (file) {
        formData.append("verificationDoc", file);
      }

      console.log(
        "FormData contents for profile creation:",
        Array.from(formData.entries()).map(([key, value]) =>
          typeof value === "object" ? `${key}: ${(value as File).name}` : `${key}: ${value}`
        )
      );

      const response = await authAxiosInstance.post("/tutor/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60000,
      });
      console.log("Profile creation response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Failed to create profile:", error);
      const errorMessage = error?.response?.data?.message || "Unable to create profile";
      toast.error(errorMessage);
      throw error;
    }
  }

  async getProfile(): Promise<ProfileResponse> {
    try {
      const response = await authAxiosInstance.get("/tutor/profile");
      console.log("Profile fetch response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Failed to fetch profile:", error);
      throw error;
    }
  }

  async updateProfile(profileData: Partial<ProfileData>) {
    try {
      const response = await authAxiosInstance.put("/tutor/editProfile", profileData);
      console.log("Profile update response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      const errorMessage = error?.response?.data?.message || "Unable to update profile";
      toast.error(errorMessage);
      throw error;
    }
  }

  async getDocumentPresignedUrl(): Promise<string> {
    try {
      const response = await authAxiosInstance.get("/tutor/document");
      console.log("Pre-signed URL response:", response.data);
      return response.data.url;
    } catch (error: any) {
      console.error("Failed to fetch pre-signed URL:", error);
      const errorMessage = error?.response?.data?.message || "Unable to fetch document URL";
      toast.error(errorMessage);
      throw error;
    }
  }


  async logoutTutor() {
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
  }
}

export const tutorService = new TutorService();