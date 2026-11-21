import { api } from "@/shared/api/axiosInstance";
import { Categoria } from "@/features/productos/types";

export interface CategoriaInput {
  nombre: string;
  descripcion?: string;
}

export const categoriasApi = {
  getAll: async (): Promise<Categoria[]> => {
    const res = await api.get<Categoria[]>("/categorias");
    return res.data;
  },

  create: async (data: CategoriaInput): Promise<Categoria> => {
    const res = await api.post<Categoria>("/categorias", data);
    return res.data;
  },

  update: async (id: number, data: CategoriaInput): Promise<Categoria> => {
    const res = await api.put<Categoria>(`/categorias/${id}`, data);
    return res.data;
  },

  deleteLogico: async (id: number): Promise<void> => {
    await api.delete(`/categorias/${id}`);
  },
};