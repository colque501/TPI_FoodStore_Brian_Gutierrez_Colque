import { api } from "@/shared/api/axiosInstance";
import { Producto, ProductosPaginados } from "../types";

export interface ProductoInput {
  categoria_id: number;
  nombre: string;
  descripcion?: string;
  precio_base: number;
  imagen_url?: string;
  stock: number;
  disponible: boolean;
}

export interface ProductoStockInput {
  stock: number;
  disponible: boolean;
}

export const adminProductosApi = {
  getAll: async (): Promise<ProductosPaginados> => {
    // Para el panel administrativo se solicita limit=100
    const res = await api.get<ProductosPaginados>("/productos", { params: { limit: 100 } });
    return res.data;
  },

  create: async (data: ProductoInput): Promise<Producto> => {
    const res = await api.post<Producto>("/productos", data);
    return res.data;
  },

  update: async (id: number, data: Partial<ProductoInput>): Promise<Producto> => {
    const res = await api.put<Producto>(`/productos/${id}`, data);
    return res.data;
  },

  updateStock: async (id: number, data: ProductoStockInput): Promise<Producto> => {
    const res = await api.patch<Producto>(`/productos/${id}/stock`, data);
    return res.data;
  },

  deleteLogico: async (id: number): Promise<void> => {
    await api.delete(`/productos/${id}`);
  },
};