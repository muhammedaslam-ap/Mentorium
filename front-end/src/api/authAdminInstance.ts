import { removeAdmin } from "../redux/slice/adminSlice";
import { store } from "../redux/store";
import axios from "axios";
import { toast } from "sonner";

export const authAdminAxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_AUTH_BASEURL,
  withCredentials: true,
});

let isRefreshing = false;

authAdminAxiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      error.response.data.message == "Unauthorized access." &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          await authAdminAxiosInstance.post("/auth/refresh-token");
          isRefreshing = false;

          return authAdminAxiosInstance(originalRequest);
        } catch (refreshError) {
          isRefreshing = false;
          store.dispatch(removeAdmin());

          localStorage.removeItem("adminDatas");
          window.location.href = "/admin/login";
          toast.info("Please login again");
          return Promise.reject(refreshError);
        }
      }
    }

    if (
      error.response.status === 403 &&
      error.response.data.message === "Token Expired" &&
      !originalRequest._retry
    ) {
      store.dispatch(removeAdmin());
      localStorage.removeItem("clientSession");
      window.location.href = "/admin/login";
      toast.info("Please login again");
      return Promise.reject(error);
    }

    if (
      error.response.status === 403 &&
      error.response.data.message ===
        "Access denied: Your account has been blocked" &&
      !originalRequest._retry
    ) {
      store.dispatch(removeAdmin());
      localStorage.removeItem("clientSession");
      window.location.href = "/admin/login";
      toast.info("Please login again");
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);
