import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { useForm } from "@tanstack/react-form";
import { categoriasApi, CategoriaInput } from "../api/categoriasApi";
import { Categoria } from "@/features/productos/types";
import { handleApiError } from "@/shared/api/handleApiError";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { Modal } from "@/shared/ui/Modal";
import { Card } from "@/shared/ui/Card";
import { Skeleton } from "@/shared/components/Skeleton";
import { EstadoError } from "@/shared/components/EstadoError";

const columnHelper = createColumnHelper<Categoria>();

export const AdminCategoriasPage = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [categoriaEdit, setCategoriaEdit] = useState<Categoria | null>(null);
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null);

  const { data: categorias, isLoading, isError, refetch } = useQuery({
    queryKey: ["categorias-admin"],
    queryFn: categoriasApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: categoriasApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias-admin"] });
      queryClient.invalidateQueries({ queryKey: ["categorias"] });
      setModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CategoriaInput }) =>
      categoriasApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias-admin"] });
      queryClient.invalidateQueries({ queryKey: ["categorias"] });
      setModalOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: categoriasApi.deleteLogico,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias-admin"] });
      queryClient.invalidateQueries({ queryKey: ["categorias"] });
    },
  });

  const form = useForm({
    defaultValues: {
      nombre: categoriaEdit?.nombre || "",
      descripcion: categoriaEdit?.descripcion || "",
    },
    onSubmit: async ({ value }) => {
      setErrorGlobal(null);
      try {
        if (categoriaEdit) {
          await updateMutation.mutateAsync({ id: categoriaEdit.id, data: value });
        } else {
          await createMutation.mutateAsync(value);
        }
      } catch (err) {
        setErrorGlobal(handleApiError(err));
      }
    },
  });

  const openModal = (cat?: Categoria) => {
    setErrorGlobal(null);
    if (cat) {
      setCategoriaEdit(cat);
      form.setFieldValue("nombre", cat.nombre);
      form.setFieldValue("descripcion", cat.descripcion || "");
    } else {
      setCategoriaEdit(null);
      form.reset();
    }
    setModalOpen(true);
  };

  const columns = [
    columnHelper.accessor("id", {
      header: "ID",
      cell: (info) => <span className="font-semibold">{info.getValue()}</span>,
    }),
    columnHelper.accessor("nombre", {
      header: "Nombre",
      cell: (info) => <span className="font-bold">{info.getValue()}</span>,
    }),
    columnHelper.accessor("descripcion", {
      header: "Descripción",
      cell: (info) => (
        <span className="text-slate-500 text-xs">{info.getValue() || "Sin descripción"}</span>
      ),
    }),
    columnHelper.display({
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => openModal(row.original)}>
            Editar
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => {
              if (confirm(`¿Dar de baja la categoría "${row.original.nombre}"?`)) {
                deleteMutation.mutate(row.original.id);
              }
            }}
          >
            Baja
          </Button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: categorias || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Gestión de Categorías</h1>
          <p className="text-sm text-slate-500">Administrá las categorías del catálogo</p>
        </div>
        <Button variant="primary" onClick={() => openModal()}>
          + Nueva Categoría
        </Button>
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

      {/* Modal Crear / Editar */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={categoriaEdit ? "Editar Categoría" : "Nueva Categoría"}
      >
        {errorGlobal && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs rounded-lg border border-red-200 dark:border-red-900">
            {errorGlobal}
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field
            name="nombre"
            validators={{
              onChange: ({ value }) =>
                value.length < 2 || value.length > 100
                  ? "El nombre debe tener entre 2 y 100 caracteres"
                  : undefined,
            }}
          >
            {(field) => (
              <Input
                label="Nombre"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                error={field.state.meta.errors?.[0]}
                placeholder="ej: Empanadas"
              />
            )}
          </form.Field>

          <form.Field name="descripcion">
            {(field) => (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Descripción (opcional)
                </label>
                <textarea
                  rows={3}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Breve descripción de la categoría..."
                />
              </div>
            )}
          </form.Field>

          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={createMutation.isPending || updateMutation.isPending}
            >
              Guardar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};