import { toast } from "sonner";
import { authAxiosInstance } from "../../api/authAxiosInstance";
import { AxiosError } from "axios";

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
    isAccepted?: boolean | null; // Maps to approvalStatus
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
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage = error?.response?.data?.message || "Unable to create profile";
        toast.error(errorMessage);
        throw error;
      }
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
      const errorMessage = error?.response?.data?.message || "Unable to fetch profile";
      toast.error(errorMessage);
      throw error;
    }
  }


  async fetchNotification() {
    try {
      const response = await authAxiosInstance.get("/tutors/notifications");
      return response;
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      toast.error("Could not load notifications");
    }
  }

  async markNotifiactionAsRead(notificationId: string) {
    try {
      await authAxiosInstance.put(
        `/tutors/notifications/${notificationId}/read`
      );
    } catch (error) {
      console.log(error);
    }
  }

  async markAllNotificationAsRead() {
    try {
      await authAxiosInstance.put("/tutors/notifications/read-all");
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      toast.error("Failed to update notifications");
    }
  }

  async getTutorProfile(tutorId: string): Promise<ProfileResponse> {
    try {
      const response = await authAxiosInstance.get(`/admin/tutor/${tutorId}/profile`);
      console.log(`Tutor profile fetch response for tutorId ${tutorId}:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`Failed to fetch tutor profile for tutorId ${tutorId}:`, error);
      const errorMessage = error?.response?.data?.message || "Unable to fetch tutor profile";
      toast.error(errorMessage);
      throw error;
    }
  }

  async updateProfile(profileData: Partial<ProfileData>, file?: File | null) {
    try {
      const formData = new FormData();
      if (profileData.name) formData.append("name", profileData.name);
      if (profileData.specialization) formData.append("specialization", profileData.specialization);
      if (profileData.phone) formData.append("phone", profileData.phone);
      if (profileData.bio) formData.append("bio", profileData.bio);
      if (file) formData.append("verificationDoc", file);

      console.log(
        "FormData contents for profile update:",
        Array.from(formData.entries()).map(([key, value]) =>
          typeof value === "object" ? `${key}: ${(value as File).name}` : `${key}: ${value}`
        )
      );

      const response = await authAxiosInstance.put("/tutor/editProfile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60000,
      });
      console.log("Profile update response:", response.data);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage = error?.response?.data?.message || "Unable to update profile";
        toast.error(errorMessage);
        throw error;
      }
      throw error;
    }
  }

  async getDocumentPresignedUrl(tutorId?: string): Promise<string> {
    try {
      const endpoint = tutorId ? `/admin/tutor/${tutorId}/document` : "/tutor/document";
      const response = await authAxiosInstance.get(endpoint);
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
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage = error?.response?.data?.message || "Unable to logout";
        toast.error(errorMessage);
        throw error;
      }
      throw error;
    }
  }
}

export const tutorService = new TutorService();