import { authAxiosInstance } from "@/api/authAxiosInstance";
import axios from "axios";

// --- Type Definitions ---

export interface IUserDetailsResponse {
  users: {
    _id: string;
    username: string;
    email: string;
    role: string;
    avatar?: string;
  };
}

export interface IProfileUpdatePayload {
  name?: string;
  email?: string;
  password?: string;
  avatar?: string;
}

export interface IProfileUpdateResponse {
  message: string;
  updatedUser: {
    _id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
}

// --- API Service ---

export const profileService = {
  // Fetch logged-in user details
  async userDetails(userId :string): Promise<IUserDetailsResponse> {
    try {
      const response = await authAxiosInstance.get(`/auth/me/${userId}`, );
      return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(error.response?.data?.message || 'Failed to fetch user data');
        }
        throw new Error('Unexpected error during fetching data');
      }
  },

  // Update user profile
  async profileUpdate(data: IProfileUpdatePayload): Promise<IProfileUpdateResponse> {
    try {
      const response = await authAxiosInstance.post("/users/profileUpdate", data);
      return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(error.response?.data?.message || 'Failed to fetch user data');
        }
        throw new Error('Unexpected error during fetching data');
      }
  },
};
