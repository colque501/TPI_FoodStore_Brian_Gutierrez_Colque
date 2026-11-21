import axios from "axios";
import { useAuthStore } from "@/store/authStore";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const detail = error.response?.data?.detail;
    const isAuthRoute =
      error.config?.url?.includes("/auth/token") ||
      error.config?.url?.includes("/auth/me");

    if (
      (status === 401 && !isAuthRoute) ||
      (status === 400 && detail === "Cuenta de usuario desactivada")
    ) {
      useAuthStore.getState().logoutClientOnly();
    }

    return Promise.reject(error);
  }
);