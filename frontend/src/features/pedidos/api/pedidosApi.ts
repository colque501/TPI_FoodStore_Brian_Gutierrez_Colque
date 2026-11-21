import { api } from "@/shared/api/axiosInstance";
import { Pedido, PedidosPaginados, PedidoCreateInput, ResumenPedidos, EstadoPedido } from "../types";

export const pedidosApi = {
  crearPedido: async (data: PedidoCreateInput): Promise<Pedido> => {
    const res = await api.post<Pedido>("/pedidos", data);
    return res.data;
  },

  getPedidos: async (params?: { skip?: number; limit?: number; estado?: string }): Promise<PedidosPaginados> => {
    const res = await api.get<PedidosPaginados>("/pedidos", { params });
    return res.data;
  },

  getPedido: async (id: number): Promise<Pedido> => {
    const res = await api.get<Pedido>(`/pedidos/${id}`);
    return res.data;
  },

  cancelarPedidoPropio: async (id: number): Promise<Pedido> => {
    const res = await api.patch<Pedido>(`/pedidos/${id}/cancelar`);
    return res.data;
  },

  cambiarEstadoAdmin: async (id: number, estado: EstadoPedido): Promise<Pedido> => {
    const res = await api.patch<Pedido>(`/pedidos/${id}/estado`, { estado });
    return res.data;
  },

  getResumen: async (): Promise<ResumenPedidos> => {
    const res = await api.get<ResumenPedidos>("/pedidos/resumen");
    return res.data;
  },
};