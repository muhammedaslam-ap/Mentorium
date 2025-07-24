// src/api/authAxiosInstance.ts
import axios from 'axios';
import { store } from '../redux/store';
import { removeUser } from '../redux/slice/userSlice';
import { removeTutor } from '../redux/slice/tutorSlice'; // Import tutorSlice action
import { toast } from 'sonner';

export const authAxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_AUTH_BASEURL || 'http://localhost:3000/api',
  withCredentials: true,
});

let isRefreshing = false;

authAxiosInstance.interceptors.request.use((config) => {
  console.log('API Request:', {
    url: config.url,
    method: config.method,
    headers: config.headers,
    params: config.params,
    data: config.data,
  });
  return config;
});

authAxiosInstance.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  async (error) => {
    console.error('API Error:', {
      message: error.message,
      config: error.config,
      response: error.response,
    });

    const originalRequest = error.config;

    // Determine user type based on localStorage
    const userDatas = localStorage.getItem('userDatas');
    const tutorDatas = localStorage.getItem('tutorDatas');
    const isUser = !!userDatas;
    const isTutor = !!tutorDatas;

    // Handle network errors
    if (!error.response && error.request) {
      toast.error('Network error: Unable to connect to the server');
      return Promise.reject(new Error('Network error: Unable to connect to the server'));
    }

    // Handle 401 Unauthorized
    if (
      error.response?.status === 401 &&
      error.response.data.message === 'Unauthorized access.' &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshResponse = await authAxiosInstance.post('/auth/refresh-token');
          const { token } = refreshResponse.data;
          authAxiosInstance.defaults.headers['Authorization'] = `Bearer ${token}`;
          isRefreshing = false;
          return authAxiosInstance(originalRequest);
        } catch (refreshError) {
          isRefreshing = false;
          if (isUser) {
            store.dispatch(removeUser());
            localStorage.removeItem('userDatas');
          } else if (isTutor) {
            store.dispatch(removeTutor());
            localStorage.removeItem('tutorDatas');
          }
          localStorage.removeItem('clientSession'); // Clear session if present
          window.location.href = '/auth';
          toast.info('Please login again');
          return Promise.reject(refreshError);
        }
      }
    }else if(
       error.response?.status === 403 &&
      error.response.data.message ===  "Your account has been blocked." &&
      !originalRequest._retry
    ){
      if (isUser) {
        localStorage.removeItem('userDatas');
      } else if (isTutor) {
        localStorage.removeItem('tutorDatas');
      }
    }

    // Handle 403 Token Expired
    if (
      error.response?.status === 403 &&
      error.response.data.message === 'Token Expired' &&
      !originalRequest._retry
    ) {
      // Clear appropriate slice and localStorage based on user type
      if (isUser) {
        store.dispatch(removeUser());
        localStorage.removeItem('userDatas');
      } else if (isTutor) {
        store.dispatch(removeTutor());
        localStorage.removeItem('tutorDatas');
      }
      localStorage.removeItem('clientSession');
      window.location.href = '/auth';
      toast.info('Please login again');
      return Promise.reject(error);
    }

    // Handle 403 Account Blocked
    if (
      error.response?.status === 403 &&
      error.response.data.message === 'Access denied: Your account has been blocked' &&
      !originalRequest._retry
    ) {
      // Clear appropriate slice and localStorage based on user type
      if (isUser) {
        store.dispatch(removeUser());
        localStorage.removeItem('userDatas');
      } else if (isTutor) {
        store.dispatch(removeTutor());
        localStorage.removeItem('tutorDatas');
      }
      localStorage.removeItem('clientSession');
      window.location.href = '/auth';
      toast.info('Please login again');
      return Promise.reject(error);
    }

    // Handle other errors
    const message = error.response?.data?.message || 'An unexpected error occurred';
    toast.error(message);
    return Promise.reject(new Error(message));
  }
);