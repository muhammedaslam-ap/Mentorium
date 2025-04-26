import { authAxiosInstance } from '@/api/authAxiosInstance';
import { RegisterFormData } from '@/validation';

export const sendOtp = async (data: RegisterFormData) => {
  const response = await authAxiosInstance.post('/otp/sendOtp', data);
  return response.data;
};

export const updatePassword = async (newPassword: string, email: string, otp?: string) => {
  const payload = otp ? { email, newPassword, otp } : { email, newPassword };
  const response = await authAxiosInstance.post("/auth/reset-password", payload);
  return response.data;
};
