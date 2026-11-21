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
import { adminProductosApi, ProductoInput } from "../api/adminProductosApi";
import { productosApi } from "../api/productosApi";
import { Producto } from "../types";
import { handleApiError } from "@/shared/api/handleApiError";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { Modal } from "@/shared/ui/Modal";
import { Card } from "@/shared/ui/Card";
import { Skeleton } from "@/shared/components/Skeleton";
import { EstadoError } from "@/shared/components/EstadoError";

const columnHelper = createColumnHelper<Producto>();

export const AdminProductosPage = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [productoEdit, setProductoEdit] = useState<Producto | null>(null);
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null);

  const { data: productosData, isLoading, isError, refetch } = useQuery({
    queryKey: ["productos-admin"],
    queryFn: adminProductosApi.getAll,
  });

  const { data: categorias } = useQuery({
    queryKey: ["categorias"],
    queryFn: productosApi.getCategorias,
  });

  const createMutation = useMutation({
    mutationFn: adminProductosApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productos-admin"] });
      queryClient.invalidateQueries({ queryKey: ["productos"] });
      setModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ProductoInput> }) =>
      adminProductosApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productos-admin"] });
      queryClient.invalidateQueries({ queryKey: ["productos"] });
      setModalOpen(false);
    },
  });

  const stockMutation = useMutation({
    mutationFn: ({ id, stock, disponible }: { id: number; stock: number; disponible: boolean }) =>
      adminProductosApi.updateStock(id, { stock, disponible }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productos-admin"] });
      queryClient.invalidateQueries({ queryKey: ["productos"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: adminProductosApi.deleteLogico,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productos-admin"] });
      queryClient.invalidateQueries({ queryKey: ["productos"] });
    },
  });

  const form = useForm({
    defaultValues: {
      nombre: productoEdit?.nombre || "",
      categoria_id: productoEdit?.categoria_id || categorias?.[0]?.id || 1,
      precio_base: productoEdit?.precio_base || 0,
      stock: productoEdit?.stock || 0,
      descripcion: productoEdit?.descripcion || "",
      imagen_url: productoEdit?.imagen_url || "",
      disponible: productoEdit?.disponible ?? true,
    },
    onSubmit: async ({ value }) => {
      setErrorGlobal(null);
      try {
        if (productoEdit) {
          await updateMutation.mutateAsync({
            id: productoEdit.id,
            data: {
              ...value,
              precio_base: Number(value.precio_base),
              stock: Number(value.stock),
              categoria_id: Number(value.categoria_id),
            },
          });
        } else {
          await createMutation.mutateAsync({
            ...value,
            precio_base: Number(value.precio_base),
            stock: Number(value.stock),
            categoria_id: Number(value.categoria_id),
          });
        }
      } catch (err) {
        setErrorGlobal(handleApiError(err));
      }
    },
  });

  const openModal = (prod?: Producto) => {
    setErrorGlobal(null);
    if (prod) {
      setProductoEdit(prod);
      form.setFieldValue("nombre", prod.nombre);
      form.setFieldValue("categoria_id", prod.categoria_id);
      form.setFieldValue("precio_base", prod.precio_base);
      form.setFieldValue("stock", prod.stock);
      form.setFieldValue("descripcion", prod.descripcion || "");
      form.setFieldValue("imagen_url", prod.imagen_url || "");
      form.setFieldValue("disponible", prod.disponible);
    } else {
      setProductoEdit(null);
      form.reset();
      if (categorias?.[0]) form.setFieldValue("categoria_id", categorias[0].id);
    }
    setModalOpen(true);
  };

  const columns = [
    columnHelper.accessor("id", { header: "ID" }),
    columnHelper.accessor("nombre", {
      header: "Producto",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          {row.original.imagen_url && (
            <img
              src={row.original.imagen_url}
              alt=""
              className="w-10 h-10 rounded-md object-cover"
            />
          )}
          <div>
            <p className="font-bold text-slate-900 dark:text-white">{row.original.nombre}</p>
            <p className="text-[11px] text-slate-400">{row.original.categoria?.nombre}</p>
          </div>
        </div>
      ),
    }),
    columnHelper.accessor("precio_base", {
      header: "Precio",
      cell: (info) => (
        <span className="font-semibold">${info.getValue().toLocaleString("es-AR")}</span>
      ),
    }),
    columnHelper.accessor("stock", {
      header: "Stock",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            min="0"
            defaultValue={row.original.stock}
            className="w-16 px-2 py-1 text-xs border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-900 text-center"
            onBlur={(e) => {
              const nuevoStock = parseInt(e.target.value, 10);
              if (!isNaN(nuevoStock) && nuevoStock !== row.original.stock) {
                stockMutation.mutate({
                  id: row.original.id,
                  stock: nuevoStock,
                  disponible: row.original.disponible,
                });
              }
            }}
          />
        </div>
      ),
    }),
    columnHelper.accessor("disponible", {
      header: "Disponible",
      cell: ({ row }) => (
        <button
          onClick={() =>
            stockMutation.mutate({
              id: row.original.id,
              stock: row.original.stock,
              disponible: !row.original.disponible,
            })
          }
          className={`px-2 py-1 rounded text-[11px] font-bold cursor-pointer transition ${
            row.original.disponible
              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
              : "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
          }`}
        >
          {row.original.disponible ? "Disponible" : "Pausado"}
        </button>
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
              if (confirm(`¿Dar de baja el producto "${row.original.nombre}"?`)) {
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
    data: productosData?.items || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Gestión de Productos</h1>
          <p className="text-sm text-slate-500">Control de inventario, precios y disponibilidad</p>
        </div>
        <Button variant="primary" onClick={() => openModal()}>
          + Nuevo Producto
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

      {/* Modal Crear / Editar Producto */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={productoEdit ? "Editar Producto" : "Nuevo Producto"}
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
              onChange: ({ value }) => (!value.trim() ? "El nombre es obligatorio" : undefined),
            }}
          >
            {(field) => (
              <Input
                label="Nombre"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                error={field.state.meta.errors?.[0]}
                placeholder="ej: Hamburguesa Veggie"
              />
            )}
          </form.Field>

          <form.Field name="categoria_id">
            {(field) => (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Categoría
                </label>
                <select
                  value={field.state.value}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                >
                  {categorias?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </form.Field>

          <div className="grid grid-cols-2 gap-4">
            <form.Field
              name="precio_base"
              validators={{
                onChange: ({ value }) => (Number(value) < 0 ? "Precio no válido" : undefined),
              }}
            >
              {(field) => (
                <Input
                  type="number"
                  step="0.01"
                  label="Precio ($)"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                  error={field.state.meta.errors?.[0]}
                />
              )}
            </form.Field>

            <form.Field
              name="stock"
              validators={{
                onChange: ({ value }) => (Number(value) < 0 ? "Stock no válido" : undefined),
              }}
            >
              {(field) => (
                <Input
                  type="number"
                  label="Stock Inicial"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                  error={field.state.meta.errors?.[0]}
                />
              )}
            </form.Field>
          </div>

          <form.Field name="imagen_url">
            {(field) => (
              <Input
                label="URL de Imagen (Unsplash, etc.)"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="https://images.unsplash.com/..."
              />
            )}
          </form.Field>

          <form.Field name="descripcion">
            {(field) => (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Descripción
                </label>
                <textarea
                  rows={2}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
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