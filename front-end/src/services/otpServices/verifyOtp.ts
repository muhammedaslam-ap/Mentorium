import { authAxiosInstance } from '@/api/authAxiosInstance';


export const verifyOtp = async(email:string,otp:string) => {
  const response = await authAxiosInstance.post('/otp/verifyOtp', { email, otp });
  console.log(response.data)
  return response.data;
};