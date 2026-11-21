import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { usuariosApi } from "../api/usuariosApi";
import { UserSession, useAuthStore } from "@/store/authStore";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { Skeleton } from "@/shared/components/Skeleton";
import { EstadoError } from "@/shared/components/EstadoError";

const columnHelper = createColumnHelper<UserSession>();

export const AdminUsuariosPage = () => {
  const queryClient = useQueryClient();
  const usuarioActual = useAuthStore((s) => s.usuario);

  const { data: usuarios, isLoading, isError, refetch } = useQuery({
    queryKey: ["usuarios-admin"],
    queryFn: usuariosApi.getAll,
  });

  const activarMutation = useMutation({
    mutationFn: usuariosApi.activar,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["usuarios-admin"] }),
  });

  const desactivarMutation = useMutation({
    mutationFn: usuariosApi.desactivar,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["usuarios-admin"] }),
  });

  const columns = [
    columnHelper.accessor("id", { header: "ID" }),
    columnHelper.accessor("username", {
      header: "Usuario",
      cell: (info) => <span className="font-bold">{info.getValue()}</span>,
    }),
    columnHelper.accessor("full_name", { header: "Nombre Completo" }),
    columnHelper.accessor("email", { header: "Email" }),
    columnHelper.accessor("role", {
      header: "Rol",
      cell: (info) => (
        <span
          className={`px-2 py-0.5 rounded text-xs font-semibold ${
            info.getValue() === "admin"
              ? "bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300"
              : "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300"
          }`}
        >
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("disabled", {
      header: "Estado",
      cell: (info) => (
        <span
          className={`px-2 py-0.5 rounded text-xs font-semibold ${
            info.getValue()
              ? "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
              : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
          }`}
        >
          {info.getValue() ? "Desactivado" : "Activo"}
        </span>
      ),
    }),
    columnHelper.display({
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => {
        const u = row.original;
        const esMismoAdmin = u.id === usuarioActual?.id;

        if (esMismoAdmin) {
          return <span className="text-xs text-slate-400 italic">Sesión actual</span>;
        }

        return (
          <div>
            {u.disabled ? (
              <Button
                size="sm"
                variant="outline"
                loading={activarMutation.isPending}
                onClick={() => activarMutation.mutate(u.id)}
              >
                Activar
              </Button>
            ) : (
              <Button
                size="sm"
                variant="danger"
                loading={desactivarMutation.isPending}
                onClick={() => desactivarMutation.mutate(u.id)}
              >
                Desactivar
              </Button>
            )}
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: usuarios || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Gestión de Usuarios</h1>
        <p className="text-sm text-slate-500">Control de acceso y roles de usuarios</p>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : isError ? (
        <EstadoError onRetry={() => refetch()} />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-800 text-xs uppercase font-bold text-slate-700 dark:text-slate-300">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-6 py-3">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
};