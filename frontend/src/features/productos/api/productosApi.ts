import { api } from "@/shared/api/axiosInstance";
import { Producto, ProductosPaginados, FiltrosProductos, Categoria } from "../types";

export const productosApi = {
  getProductos: async (filtros: FiltrosProductos): Promise<ProductosPaginados> => {
    const res = await api.get<ProductosPaginados>("/productos", { params: filtros });
    return res.data;
  },

  getCategorias: async (): Promise<Categoria[]> => {
    const res = await api.get<Categoria[]>("/categorias");
    return res.data;
  },

  getProducto: async (id: number): Promise<Producto> => {
    const res = await api.get<Producto>(`/productos/${id}`);
    return res.data;
  },
};