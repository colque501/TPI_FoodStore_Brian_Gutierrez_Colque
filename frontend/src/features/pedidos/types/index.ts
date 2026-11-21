export interface DetallePedido {
  id: number;
  producto_id: number;
  cantidad: number;
  nombre_producto: string;
  precio_unitario: number;
  subtotal: number;
}

export type EstadoPedido = "PENDIENTE" | "EN_PREPARACION" | "ENTREGADO" | "CANCELADO";

export interface Pedido {
  id: number;
  usuario_id: number;
  estado: EstadoPedido;
  forma_pago: "EFECTIVO" | "TRANSFERENCIA";
  direccion_entrega: string;
  notas?: string;
  total: number;
  created_at: string;
  updated_at: string;
  items: DetallePedido[];
}

export interface PedidosPaginados {
  total: number;
  items: Pedido[];
}

export interface PedidoCreateInput {
  items: { producto_id: number; cantidad: number }[];
  forma_pago: "EFECTIVO" | "TRANSFERENCIA";
  direccion_entrega: string;
  notas?: string;
}

export interface ResumenPedidos {
  pendientes: number;
  en_preparacion: number;
  entregados: number;
  cancelados: number;
  pedidos_hoy: number;
  ingresos_entregados: number;
}