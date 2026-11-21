import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pedidosApi } from "../api/pedidosApi";
import { BadgeEstado } from "@/shared/ui/BadgeEstado";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Skeleton } from "@/shared/components/Skeleton";
import { EstadoVacio } from "@/shared/components/EstadoVacio";
import { EstadoError } from "@/shared/components/EstadoError";

export const MisPedidosPage = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["mis-pedidos"],
    queryFn: () => pedidosApi.getPedidos(),
  });

  const cancelarMutation = useMutation({
    mutationFn: pedidosApi.cancelarPedidoPropio,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mis-pedidos"] });
      queryClient.invalidateQueries({ queryKey: ["productos"] });
    },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Mis Pedidos</h1>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : isError ? (
        <EstadoError onRetry={() => refetch()} />
      ) : data?.items.length === 0 ? (
        <EstadoVacio
          titulo="Aún no realizaste ningún pedido"
          mensaje="Elegí delicias en el catálogo para hacer tu primer pedido."
        />
      ) : (
        <div className="space-y-4">
          {data?.items.map((pedido) => (
            <Card key={pedido.id} className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-black text-lg">Pedido #{pedido.id}</span>
                    <BadgeEstado estado={pedido.estado} />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Fecha: {new Date(pedido.created_at).toLocaleDateString("es-AR")} - Pago: {pedido.forma_pago}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Total</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white">
                    ${pedido.total.toLocaleString("es-AR")}
                  </span>
                </div>
              </div>

              {/* Detalle de ítems */}
              <div className="py-4 space-y-2">
                {pedido.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm text-slate-600 dark:text-slate-300">
                    <span>
                      {item.cantidad}x {item.nombre_producto}
                    </span>
                    <span className="font-semibold">${item.subtotal.toLocaleString("es-AR")}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  📍 Entrega en: <strong className="text-slate-700 dark:text-slate-300">{pedido.direccion_entrega}</strong>
                </span>

                {pedido.estado === "PENDIENTE" && (
                  <Button
                    variant="danger"
                    size="sm"
                    loading={cancelarMutation.isPending}
                    onClick={() => cancelarMutation.mutate(pedido.id)}
                  >
                    Cancelar Pedido
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};