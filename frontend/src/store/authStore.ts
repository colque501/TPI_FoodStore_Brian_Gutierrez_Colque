import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/shared/api/axiosInstance";

export interface UserSession {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: "user" | "admin";
  disabled: boolean;
  created_at: string;
}

interface AuthState {
  usuario: UserSession | null;
  cargando: boolean;
  login: (usuario: UserSession) => void;
  logout: () => Promise<void>;
  logoutClientOnly: () => void;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,

      login: (usuario) => set({ usuario, cargando: false }),

      logout: async () => {
        try {
          await api.post("/auth/logout");
        } catch {
          // Si falla o ya expiró, limpia localmente igual
        } finally {
          set({ usuario: null, cargando: false });
        }
      },

      logoutClientOnly: () => {
        set({ usuario: null, cargando: false });
      },

      checkSession: async () => {
        set({ cargando: true });
        try {
          const res = await api.get<UserSession>("/auth/me");
          set({ usuario: res.data, cargando: false });
        } catch {
          set({ usuario: null, cargando: false });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ usuario: state.usuario }),
    }
  )
);