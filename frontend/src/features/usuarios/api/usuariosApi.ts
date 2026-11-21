import { api } from "@/shared/api/axiosInstance";
import { UserSession } from "@/store/authStore";

export const usuariosApi = {
  getAll: async (): Promise<UserSession[]> => {
    const res = await api.get<UserSession[]>("/admin/usuarios");
    return res.data;
  },

  activar: async (userId: number): Promise<UserSession> => {
    const res = await api.post<UserSession>(`/admin/usuarios/${userId}/activar`);
    return res.data;
  },

  desactivar: async (userId: number): Promise<UserSession> => {
    const res = await api.post<UserSession>(`/admin/usuarios/${userId}/desactivar`);
    return res.data;
  },
};