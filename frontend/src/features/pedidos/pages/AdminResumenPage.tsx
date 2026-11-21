import { useQuery } from "@tanstack/react-query";
import { pedidosApi } from "../api/pedidosApi";
import { Card } from "@/shared/ui/Card";
import { Skeleton } from "@/shared/components/Skeleton";
import { EstadoError } from "@/shared/components/EstadoError";

export const AdminResumenPage = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["resumen-negocio"],
    queryFn: pedidosApi.getResumen,
    refetchInterval: 10000, // Actualización automática cada 10s
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Resumen del Negocio</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return <EstadoError onRetry={() => refetch()} />;
  }

  const metricas = [
    {
      titulo: "Pedidos Hoy",
      valor: data.pedidos_hoy,
      sub: "Registrados desde las 00:00",
      color: "border-blue-500",
    },
    {
      titulo: "Pendientes",
      valor: data.pendientes,
      sub: "Requieren preparación",
      color: "border-amber-500",
    },
    {
      titulo: "En Preparación",
      valor: data.en_preparacion,
      sub: "En cocina o despacho",
      color: "border-indigo-500",
    },
    {
      titulo: "Entregados",
      valor: data.entregados,
      sub: "Completados con éxito",
      color: "border-emerald-500",
    },
    {
      titulo: "Cancelados",
      valor: data.cancelados,
      sub: "Con stock restituido",
      color: "border-rose-500",
    },
    {
      titulo: "Ingresos (Entregados)",
      valor: `$${data.ingresos_entregados.toLocaleString("es-AR")}`,
      sub: "Total facturado efectivamente",
      color: "border-emerald-600 bg-emerald-50/30 dark:bg-emerald-950/20",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Panel de Control</h1>
        <p className="text-sm text-slate-500">Métricas y rendimiento operativo de Food Store</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {metricas.map((m, idx) => (
          <Card key={idx} className={`p-6 border-l-4 ${m.color}`}>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              {m.titulo}
            </span>
            <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">
              {m.valor}
            </div>
            <span className="text-xs text-slate-400 mt-1 block">{m.sub}</span>
          </Card>
        ))}
      </div>
    </div>
  );
};