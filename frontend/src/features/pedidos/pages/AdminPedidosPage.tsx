import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pedidosApi } from "../api/pedidosApi";
import { EstadoPedido } from "../types";
import { BadgeEstado } from "@/shared/ui/BadgeEstado";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { Skeleton } from "@/shared/components/Skeleton";
import { EstadoError } from "@/shared/components/EstadoError";

export const AdminPedidosPage = () => {
  const queryClient = useQueryClient();
  const [filtroEstado, setFiltroEstado] = useState<string>("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["pedidos-admin", filtroEstado],
    queryFn: () => pedidosApi.getPedidos({ limit: 100, estado: filtroEstado || undefined }),
  });

  const cambiarEstadoMutation = useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) =>
      pedidosApi.cambiarEstadoAdmin(id, estado),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pedidos-admin"] });
      queryClient.invalidateQueries({ queryKey: ["resumen-negocio"] });
      queryClient.invalidateQueries({ queryKey: ["productos-admin"] });
    },
  });

  const estadosFiltro = ["", "PENDIENTE", "EN_PREPARACION", "ENTREGADO", "CANCELADO"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Gestión de Pedidos</h1>
          <p className="text-sm text-slate-500">Supervisá y avanzá los pedidos de los clientes</p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {estadosFiltro.map((est) => (
            <button
              key={est}
              onClick={() => setFiltroEstado(est)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                filtroEstado === est
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              {est || "Todos"}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : isError ? (
        <EstadoError onRetry={() => refetch()} />
      ) : (
        <div className="space-y-4">
          {data?.items.map((pedido) => (
            <Card key={pedido.id} className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-black text-lg">Pedido #{pedido.id}</span>
                  <BadgeEstado estado={pedido.estado} />
                  <span className="text-xs text-slate-400">
                    Cliente ID: {pedido.usuario_id} - Pago: <strong>{pedido.forma_pago}</strong>
                  </span>
                </div>

                <span className="text-lg font-black text-slate-900 dark:text-white">
                  ${pedido.total.toLocaleString("es-AR")}
                </span>
              </div>

              {/* Items del pedido */}
              <div className="py-3 text-sm space-y-1">
                {pedido.items.map((it) => (
                  <div key={it.id} className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>
                      {it.cantidad}x {it.nombre_producto}
                    </span>
                    <span>${it.subtotal.toLocaleString("es-AR")}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-slate-500">
                  <p>📍 {pedido.direccion_entrega}</p>
                  {pedido.notas && <p className="italic mt-0.5">Nota: "{pedido.notas}"</p>}
                </div>

                {/* Botones de Máquina de Estados */}
                <div className="flex items-center gap-2">
                  {pedido.estado === "PENDIENTE" && (
                    <>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() =>
                          cambiarEstadoMutation.mutate({ id: pedido.id, estado: "EN_PREPARACION" })
                        }
                      >
                        Pasar a Preparación 👨‍🍳
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() =>
                          cambiarEstadoMutation.mutate({ id: pedido.id, estado: "CANCELADO" })
                        }
                      >
                        Cancelar
                      </Button>
                    </>
                  )}

                  {pedido.estado === "EN_PREPARACION" && (
                    <>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() =>
                          cambiarEstadoMutation.mutate({ id: pedido.id, estado: "ENTREGADO" })
                        }
                      >
                        Marcar Entregado 🛵
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() =>
                          cambiarEstadoMutation.mutate({ id: pedido.id, estado: "CANCELADO" })
                        }
                      >
                        Cancelar
                      </Button>
                    </>
                  )}

                  {(pedido.estado === "ENTREGADO" || pedido.estado === "CANCELADO") && (
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Estado Terminal
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};