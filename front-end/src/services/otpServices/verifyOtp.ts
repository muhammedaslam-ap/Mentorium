import { authAxiosInstance } from '@/api/authAxiosInstance';


export const verifyOtp = async(email:string,otp:string) => {
  const response = await authAxiosInstance.post('/otp/verifyOtp', { email, otp });
  console.log(response.data)
  return response.data;
};

export const forgot_password_verify_Otp = async(email:string,otp:string) => {
  const response = await authAxiosInstance.post('/auth/verify-otp', { email, otp });
  console.log(response.data)
  return response.data;
};