import axios from 'axios';
import { authAxiosInstance } from '@/api/authAxiosInstance';

export interface IRegisterUserData {
  name: string;
  email: string;
  password: string;
  role: string; 
}

export const userAuthService =  {

  async registerUser(data: IRegisterUserData) {
    try {
      const response = await authAxiosInstance.post("/auth/register/user", {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to register user');
      }
      throw new Error('Unexpected error during registration');
    }
  },

  async logoutUser() {
    try {
      const response = await authAxiosInstance.post("/auth/logout");
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to logout');
      }
      throw new Error('Unexpected error during logout');
    }
  },

  async verifyPassword(password: string) {
    try {
      const response = await authAxiosInstance.post("/verify-password", {
        password,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Password verification failed');
      }
      throw new Error('Unexpected error during password verification');
    }
  }

};
