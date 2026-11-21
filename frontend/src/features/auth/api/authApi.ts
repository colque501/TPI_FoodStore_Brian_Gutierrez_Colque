import { api } from "@/shared/api/axiosInstance";
import { UserRegisterInput, UserLoginInput } from "../types";
import { UserSession } from "@/store/authStore";

export const authApi = {
  login: async (credentials: UserLoginInput): Promise<{ message: string }> => {
    const formData = new URLSearchParams();
    formData.append("username", credentials.username);
    formData.append("password", credentials.password);

    const res = await api.post<{ message: string }>("/auth/token", formData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return res.data;
  },

  register: async (data: UserRegisterInput): Promise<UserSession> => {
    const res = await api.post<UserSession>("/auth/register", data);
    return res.data;
  },

  getMe: async (): Promise<UserSession> => {
    const res = await api.get<UserSession>("/auth/me");
    return res.data;
  },
};